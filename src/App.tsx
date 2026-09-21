import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  UserProfile, 
  Income, 
  Bill, 
  Debt, 
  WishlistItem, 
  ActiveTab, 
  DebtStatus, 
  WishStatus 
} from './types';
import { 
  getStoredUsers, 
  saveStoredUsers,
  getStoredActiveUserId,
  saveStoredActiveUserId,
  getStoredActiveMonth,
  saveStoredActiveMonth,
  getStoredIncomes,
  saveStoredIncomes,
  getStoredBills,
  saveStoredBills,
  getStoredDebts,
  saveStoredDebts,
  getStoredWishlist,
  saveStoredWishlist,
  getStoredSpreadsheetId,
  saveStoredSpreadsheetId,
  getStoredLastSync,
  saveStoredLastSync,
  resetAllDataToDefault
} from './utils/storage';
import { 
  initGoogleAuth, 
  signInWithGoogle, 
  signOutGoogle, 
  getGoogleAccessToken 
} from './services/googleAuth';
import { 
  exportToGoogleSheets, 
  importFromGoogleSheets, 
  DEFAULT_SPREADSHEET_ID 
} from './services/googleSheets';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { IncomeSection } from './components/IncomeSection';
import { MonthlyFinanceView } from './components/MonthlyFinanceView';
import { DebtsView } from './components/DebtsView';
import { WishlistView } from './components/WishlistView';
import { IncomeModal } from './components/IncomeModal';
import { BillModal } from './components/BillModal';
import { DebtModal } from './components/DebtModal';
import { WishlistModal } from './components/WishlistModal';
import { AddUserModal } from './components/AddUserModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { getAdjacentMonth } from './utils/formatters';

export default function App() {
  // --- Persistent State ---
  const [users, setUsers] = useState<UserProfile[]>(() => getStoredUsers());
  const [activeUserId, setActiveUserId] = useState<string>(() => getStoredActiveUserId(users));
  const [activeMonth, setActiveMonth] = useState<string>(() => getStoredActiveMonth());
  const [activeTab, setActiveTab] = useState<ActiveTab>('mensal');

  const [incomes, setIncomes] = useState<Income[]>(() => getStoredIncomes());
  const [bills, setBills] = useState<Bill[]>(() => getStoredBills());
  const [debts, setDebts] = useState<Debt[]>(() => getStoredDebts());
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => getStoredWishlist());

  // --- Google Sheets Sync State ---
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => getStoredSpreadsheetId());
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => getStoredLastSync());

  // Ref to track initial load to avoid redundant initial sync
  const hasMountedRef = useRef(false);
  const syncTimeoutRef = useRef<any>(null);

  // --- Modal States ---
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [editingWishlist, setEditingWishlist] = useState<WishlistItem | null>(null);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Initialize Google Auth
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  useEffect(() => {
    saveStoredActiveUserId(activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    saveStoredActiveMonth(activeMonth);
  }, [activeMonth]);

  useEffect(() => {
    saveStoredIncomes(incomes);
  }, [incomes]);

  useEffect(() => {
    saveStoredBills(bills);
  }, [bills]);

  useEffect(() => {
    saveStoredDebts(debts);
  }, [debts]);

  useEffect(() => {
    saveStoredWishlist(wishlist);
  }, [wishlist]);

  useEffect(() => {
    saveStoredSpreadsheetId(spreadsheetId);
  }, [spreadsheetId]);

  // Google Sheets Auto-Sync Engine (Debounced)
  const performSync = useCallback(
    async (token: string, targetSheetId: string) => {
      setIsSyncing(true);
      setSyncStatus('syncing');
      setSyncError(null);

      try {
        const result = await exportToGoogleSheets(
          token,
          {
            users,
            incomes,
            bills,
            debts,
            wishlist,
            activeMonth,
          },
          targetSheetId
        );

        if (result.success) {
          setSyncStatus('success');
          setLastSyncTime(result.timestamp);
          saveStoredLastSync(result.timestamp);
        } else {
          setSyncStatus('error');
          setSyncError(result.error || 'Erro ao sincronizar com Google Planilhas');
        }
      } catch (err: any) {
        setSyncStatus('error');
        setSyncError(err.message || 'Erro inesperado na sincronização');
      } finally {
        setIsSyncing(false);
      }
    },
    [users, incomes, bills, debts, wishlist, activeMonth]
  );

  // Trigger debounced auto-sync on data changes when logged in
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (!googleUser || !googleToken) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      performSync(googleToken, spreadsheetId);
    }, 1200);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [users, incomes, bills, debts, wishlist, googleUser, googleToken, spreadsheetId, performSync]);

  // Manual Google Login
  const handleGoogleSignIn = async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      const res = await signInWithGoogle();
      setGoogleUser(res.user);
      setGoogleToken(res.accessToken);

      // Perform initial push upon connecting
      await performSync(res.accessToken, spreadsheetId);
    } catch (err: any) {
      console.error('Erro no login Google:', err);
      setSyncError(err.message || 'Falha ao conectar com o Google');
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual Google Logout
  const handleGoogleSignOut = async () => {
    try {
      await signOutGoogle();
      setGoogleUser(null);
      setGoogleToken(null);
      setSyncStatus('idle');
    } catch (err: any) {
      console.error('Erro ao desconectar:', err);
    }
  };

  // Manual Export to Sheets
  const handleManualExport = async () => {
    let token = googleToken;
    if (!token) {
      const stored = await getGoogleAccessToken();
      token = stored;
    }
    if (!token) {
      await handleGoogleSignIn();
      return;
    }
    await performSync(token, spreadsheetId);
  };

  // Manual Import from Sheets
  const handleManualImport = async () => {
    let token = googleToken;
    if (!token) {
      const stored = await getGoogleAccessToken();
      token = stored;
    }
    if (!token) {
      await handleGoogleSignIn();
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      const result = await importFromGoogleSheets(token, spreadsheetId);
      if (result.success && result.data) {
        if (result.data.users.length > 0) setUsers(result.data.users);
        setIncomes(result.data.incomes);
        setBills(result.data.bills);
        setDebts(result.data.debts);
        setWishlist(result.data.wishlist);

        const nowStr = new Date().toLocaleString('pt-BR');
        setSyncStatus('success');
        setLastSyncTime(nowStr);
        saveStoredLastSync(nowStr);
      } else {
        setSyncStatus('error');
        setSyncError(result.error || 'Erro ao importar da planilha');
      }
    } catch (err: any) {
      setSyncStatus('error');
      setSyncError(err.message || 'Erro inesperado ao importar');
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Filtered Data for Active User & Active Month ---
  const userIncomes = useMemo(() => {
    return incomes.filter(
      (inc) => inc.userId === activeUserId && inc.monthYear === activeMonth
    );
  }, [incomes, activeUserId, activeMonth]);

  const userCurrentMonthBills = useMemo(() => {
    return bills.filter(
      (b) => b.userId === activeUserId && b.monthYear === activeMonth && b.status !== 'em_divida'
    );
  }, [bills, activeUserId, activeMonth]);

  // Carried over unpaid bills from earlier months
  const userPastOverdueBills = useMemo(() => {
    return bills.filter(
      (b) =>
        b.userId === activeUserId &&
        b.monthYear < activeMonth &&
        b.status === 'pendente'
    );
  }, [bills, activeUserId, activeMonth]);

  const userDebts = useMemo(() => {
    return debts.filter((d) => d.userId === activeUserId);
  }, [debts, activeUserId]);

  const userWishlist = useMemo(() => {
    return wishlist.filter((w) => w.userId === activeUserId);
  }, [wishlist, activeUserId]);

  // --- Financial Aggregations ---
  const fixedIncome = userIncomes
    .filter((i) => i.type === 'fixa')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const variableIncome = userIncomes
    .filter((i) => i.type === 'variavel')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalIncome = fixedIncome + variableIncome;

  const totalPaid = userCurrentMonthBills
    .filter((b) => b.status === 'pago')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalMonthPending = userCurrentMonthBills
    .filter((b) => b.status === 'pendente')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPastOverdue = userPastOverdueBills.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  const finalBalance = totalIncome - totalPaid - totalMonthPending - totalPastOverdue;

  // --- Handlers: Users ---
  const handleSelectUser = (id: string) => {
    setActiveUserId(id);
  };

  const handleAddUser = (newUser: UserProfile) => {
    setUsers((prev) => [...prev, newUser]);
    setActiveUserId(newUser.id);
  };

  // --- Handlers: Incomes ---
  const handleSaveIncome = (incomeData: Partial<Income>) => {
    if (incomeData.id) {
      setIncomes((prev) =>
        prev.map((item) => (item.id === incomeData.id ? ({ ...item, ...incomeData } as Income) : item))
      );
    } else {
      const newIncome: Income = {
        id: `inc-${Date.now()}`,
        userId: activeUserId,
        description: incomeData.description || 'Renda',
        amount: incomeData.amount || 0,
        type: incomeData.type || 'fixa',
        monthYear: incomeData.monthYear || activeMonth,
        received: !!incomeData.received,
        receiveDay: incomeData.receiveDay,
      };
      setIncomes((prev) => [...prev, newIncome]);
    }
  };

  const handleDeleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  const handleToggleIncomeReceived = (id: string) => {
    setIncomes((prev) =>
      prev.map((i) => (i.id === id ? { ...i, received: !i.received } : i))
    );
  };

  // --- Handlers: Bills ---
  const handleSaveBill = (billData: Partial<Bill>, replicateRecurring?: boolean) => {
    if (billData.id) {
      setBills((prev) =>
        prev.map((item) => (item.id === billData.id ? ({ ...item, ...billData } as Bill) : item))
      );
    } else {
      const newBill: Bill = {
        id: `bill-${Date.now()}`,
        userId: activeUserId,
        description: billData.description || 'Boleto',
        amount: billData.amount || 0,
        dueDay: billData.dueDay || 10,
        monthYear: billData.monthYear || activeMonth,
        category: billData.category || 'Outros',
        recurrenceType: billData.recurrenceType || 'recorrente_fixo',
        installmentInfo: billData.installmentInfo,
        status: billData.status || 'pendente',
        paidDate: billData.paidDate,
        notes: billData.notes,
      };

      const newBillsList = [newBill];

      // If user opted to replicate recurring to next month
      if (replicateRecurring && (newBill.recurrenceType === 'recorrente_fixo' || newBill.recurrenceType === 'recorrente_variavel' || newBill.recurrenceType === 'parcelado')) {
        const nextMonth = getAdjacentMonth(activeMonth, 1);
        let nextInstallmentInfo = newBill.installmentInfo;
        if (newBill.recurrenceType === 'parcelado' && newBill.installmentInfo) {
          nextInstallmentInfo = {
            current: Math.min(newBill.installmentInfo.current + 1, newBill.installmentInfo.total),
            total: newBill.installmentInfo.total,
          };
        }
        newBillsList.push({
          ...newBill,
          id: `bill-${Date.now()}-next`,
          monthYear: nextMonth,
          status: 'pendente',
          paidDate: undefined,
          installmentInfo: nextInstallmentInfo,
        });
      }

      setBills((prev) => [...prev, ...newBillsList]);
    }
  };

  const handleDeleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  const handleToggleBillPaid = (id: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const isNowPaid = b.status !== 'pago';
          return {
            ...b,
            status: isNowPaid ? 'pago' : 'pendente',
            paidDate: isNowPaid ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return b;
      })
    );
  };

  const handleMoveBillToDebts = (bill: Bill) => {
    // Create new Debt from overdue bill
    const newDebt: Debt = {
      id: `debt-from-bill-${Date.now()}`,
      userId: bill.userId,
      creditor: bill.description,
      description: `Conta vencida em ${bill.monthYear} (${bill.category})`,
      originalAmount: bill.amount,
      currentAmount: bill.amount,
      initialDueDate: `${bill.monthYear}-${bill.dueDay.toString().padStart(2, '0')}`,
      status: 'pendente_contato',
      priority: 'alta',
      notes: bill.notes || 'Movido dos boletos vencidos para negociação de débitos.',
    };

    setDebts((prev) => [...prev, newDebt]);
    // Mark bill as 'em_divida' so it's archived from active operational view
    setBills((prev) =>
      prev.map((b) => (b.id === bill.id ? { ...b, status: 'em_divida' } : b))
    );
    setActiveTab('dividas');
  };

  // --- Handlers: Debts ---
  const handleSaveDebt = (debtData: Partial<Debt>) => {
    if (debtData.id) {
      setDebts((prev) =>
        prev.map((item) => (item.id === debtData.id ? ({ ...item, ...debtData } as Debt) : item))
      );
    } else {
      const newDebt: Debt = {
        id: `debt-${Date.now()}`,
        userId: activeUserId,
        creditor: debtData.creditor || 'Credor',
        description: debtData.description || '',
        originalAmount: debtData.originalAmount || 0,
        currentAmount: debtData.currentAmount || debtData.originalAmount || 0,
        negotiatedAmount: debtData.negotiatedAmount,
        initialDueDate: debtData.initialDueDate || new Date().toISOString().split('T')[0],
        status: debtData.status || 'pendente_contato',
        priority: debtData.priority || 'media',
        contactInfo: debtData.contactInfo,
        notes: debtData.notes,
      };
      setDebts((prev) => [...prev, newDebt]);
    }
  };

  const handleDeleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateDebtStatus = (id: string, status: DebtStatus) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
  };

  const handleConvertDebtToMonthlyBill = (debt: Debt) => {
    const amountToBill = debt.negotiatedAmount || debt.originalAmount;
    const newBill: Bill = {
      id: `bill-debt-${Date.now()}`,
      userId: activeUserId,
      description: `Acordo: ${debt.creditor}`,
      amount: amountToBill,
      dueDay: 15,
      monthYear: activeMonth,
      category: 'Dívidas',
      recurrenceType: 'unico',
      status: 'pendente',
      notes: `Origem: ${debt.description || 'Dívida negociada'}`,
    };
    setBills((prev) => [...prev, newBill]);
    setActiveTab('mensal');
  };

  // --- Handlers: Wishlist ---
  const handleSaveWishlist = (itemData: Partial<WishlistItem>) => {
    if (itemData.id) {
      setWishlist((prev) =>
        prev.map((item) => (item.id === itemData.id ? ({ ...item, ...itemData } as WishlistItem) : item))
      );
    } else {
      const newItem: WishlistItem = {
        id: `wish-${Date.now()}`,
        userId: activeUserId,
        title: itemData.title || 'Item',
        estimatedPrice: itemData.estimatedPrice || 0,
        category: itemData.category || 'Casa',
        priority: itemData.priority || 'essencial',
        status: itemData.status || 'planejado',
        targetMonth: itemData.targetMonth,
        linkOrNotes: itemData.linkOrNotes,
        createdDate: new Date().toISOString().split('T')[0],
      };
      setWishlist((prev) => [...prev, newItem]);
    }
  };

  const handleDeleteWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((w) => w.id !== id));
  };

  const handleToggleWishlistStatus = (id: string, status: WishStatus) => {
    setWishlist((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status } : w))
    );
  };

  const handleBuyAndLaunchAsBill = (item: WishlistItem) => {
    // 1. Mark wishlist item as bought
    setWishlist((prev) =>
      prev.map((w) => (w.id === item.id ? { ...w, status: 'comprado' } : w))
    );

    // 2. Create bill in active month
    const newBill: Bill = {
      id: `bill-wish-${Date.now()}`,
      userId: activeUserId,
      description: item.title,
      amount: item.estimatedPrice,
      dueDay: new Date().getDate() || 10,
      monthYear: activeMonth,
      category: item.category || 'Outros',
      recurrenceType: 'unico',
      status: 'pago',
      paidDate: new Date().toISOString().split('T')[0],
      notes: `Compra realizada da lista de desejos (${item.priority})`,
    };

    setBills((prev) => [...prev, newBill]);
    setActiveTab('mensal');
  };

  const handleResetData = () => {
    resetAllDataToDefault();
    setUsers(getStoredUsers());
    setActiveUserId('andre');
    setActiveMonth('2026-08');
    setIncomes(getStoredIncomes());
    setBills(getStoredBills());
    setDebts(getStoredDebts());
    setWishlist(getStoredWishlist());
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#111827] flex flex-col font-sans selection:bg-gray-200">
      {/* Top Header & Navigation */}
      <Header
        users={users}
        activeUserId={activeUserId}
        onSelectUser={handleSelectUser}
        onOpenAddUser={() => setIsAddUserModalOpen(true)}
        activeMonth={activeMonth}
        onChangeMonth={setActiveMonth}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        overdueCount={userPastOverdueBills.length}
        onResetData={handleResetData}
        googleUser={googleUser}
        spreadsheetId={spreadsheetId}
        isSyncing={isSyncing}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Quick Summary Cards (Always visible on monthly view) */}
        {activeTab === 'mensal' && (
          <>
            <SummaryCards
              totalIncome={totalIncome}
              fixedIncome={fixedIncome}
              variableIncome={variableIncome}
              totalPaid={totalPaid}
              totalMonthPending={totalMonthPending}
              totalPastOverdue={totalPastOverdue}
              finalBalance={finalBalance}
              isAugustCurrent={activeMonth === '2026-08'}
            />

            {/* Income Sources (Collapsible) */}
            <IncomeSection
              incomes={userIncomes}
              onOpenAddModal={() => {
                setEditingIncome(null);
                setIsIncomeModalOpen(true);
              }}
              onEditIncome={(inc) => {
                setEditingIncome(inc);
                setIsIncomeModalOpen(true);
              }}
              onDeleteIncome={handleDeleteIncome}
              onToggleReceived={handleToggleIncomeReceived}
            />

            {/* Main Monthly Expenses & Bills View */}
            <MonthlyFinanceView
              currentMonthBills={userCurrentMonthBills}
              pastOverdueBills={userPastOverdueBills}
              activeMonth={activeMonth}
              onOpenAddBill={() => {
                setEditingBill(null);
                setIsBillModalOpen(true);
              }}
              onEditBill={(bill) => {
                setEditingBill(bill);
                setIsBillModalOpen(true);
              }}
              onDeleteBill={handleDeleteBill}
              onTogglePaid={handleToggleBillPaid}
              onMoveToDebts={handleMoveBillToDebts}
            />
          </>
        )}

        {/* Tab 2: Debts & Negotiations */}
        {activeTab === 'dividas' && (
          <DebtsView
            debts={userDebts}
            onOpenAddDebt={() => {
              setEditingDebt(null);
              setIsDebtModalOpen(true);
            }}
            onEditDebt={(debt) => {
              setEditingDebt(debt);
              setIsDebtModalOpen(true);
            }}
            onDeleteDebt={handleDeleteDebt}
            onUpdateStatus={handleUpdateDebtStatus}
            onConvertToMonthlyBill={handleConvertDebtToMonthlyBill}
          />
        )}

        {/* Tab 3: Wishlist & Shopping List */}
        {activeTab === 'compras' && (
          <WishlistView
            wishlist={userWishlist}
            onOpenAddWish={() => {
              setEditingWishlist(null);
              setIsWishlistModalOpen(true);
            }}
            onEditWish={(item) => {
              setEditingWishlist(item);
              setIsWishlistModalOpen(true);
            }}
            onDeleteWish={handleDeleteWishlist}
            onToggleStatus={handleToggleWishlistStatus}
            onBuyAndLaunchAsBill={handleBuyAndLaunchAsBill}
            activeMonth={activeMonth}
          />
        )}
      </main>

      {/* Modals */}
      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => {
          setIsIncomeModalOpen(false);
          setEditingIncome(null);
        }}
        onSave={handleSaveIncome}
        editingIncome={editingIncome}
        activeMonth={activeMonth}
        userId={activeUserId}
      />

      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
          setEditingBill(null);
        }}
        onSave={handleSaveBill}
        editingBill={editingBill}
        activeMonth={activeMonth}
        userId={activeUserId}
      />

      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false);
          setEditingDebt(null);
        }}
        onSave={handleSaveDebt}
        editingDebt={editingDebt}
        userId={activeUserId}
      />

      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => {
          setIsWishlistModalOpen(false);
          setEditingWishlist(null);
        }}
        onSave={handleSaveWishlist}
        editingItem={editingWishlist}
        userId={activeUserId}
        activeMonth={activeMonth}
      />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onAddUser={handleAddUser}
      />

      {/* Google Sheets Sync Modal */}
      <GoogleSheetsSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        googleUser={googleUser}
        spreadsheetId={spreadsheetId}
        onUpdateSpreadsheetId={(newId) => setSpreadsheetId(newId)}
        lastSyncTime={lastSyncTime}
        isSyncing={isSyncing}
        syncStatus={syncStatus}
        syncError={syncError}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onExportToSheets={handleManualExport}
        onImportFromSheets={handleManualImport}
        counts={{
          users: users.length,
          incomes: incomes.length,
          bills: bills.length,
          debts: debts.length,
          wishlist: wishlist.length,
        }}
      />
    </div>
  );
}
