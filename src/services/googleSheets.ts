import { UserProfile, Income, Bill, Debt, WishlistItem } from '../types';

export const DEFAULT_SPREADSHEET_ID = '1vRLMrK3jGUtHF0Vn3yXEjXHGBsq_HxBZ-7WqWdiGJHU';

export interface AppFinancialData {
  users: UserProfile[];
  incomes: Income[];
  bills: Bill[];
  debts: Debt[];
  wishlist: WishlistItem[];
  activeMonth?: string;
}

export interface SyncResult {
  success: boolean;
  timestamp: string;
  error?: string;
  itemsCount?: {
    users: number;
    incomes: number;
    bills: number;
    debts: number;
    wishlist: number;
  };
}

const REQUIRED_SHEET_NAMES = ['Resumo', 'Usuarios', 'Rendas', 'Boletos', 'Dividas', 'Lista_Desejos'];

/**
 * Helper to fetch with Google Sheets API
 */
async function sheetsFetch(url: string, token: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson?.error?.message || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(`Erro na API Google Sheets (${response.status}): ${errorDetail}`);
  }

  return response.json();
}

/**
 * Checks spreadsheet structure and creates missing tabs if needed
 */
export async function initializeSpreadsheetTabs(token: string, spreadsheetId: string = DEFAULT_SPREADSHEET_ID) {
  try {
    const meta = await sheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, token);
    const existingTitles: string[] = (meta.sheets || []).map((s: any) => s.properties?.title);

    const missingSheets = REQUIRED_SHEET_NAMES.filter(name => !existingTitles.includes(name));

    if (missingSheets.length > 0) {
      const requests = missingSheets.map(title => ({
        addSheet: {
          properties: {
            title,
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      }));

      await sheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, token, {
        method: 'POST',
        body: JSON.stringify({ requests })
      });
    }

    return true;
  } catch (error) {
    console.error('Falha ao inicializar abas da planilha:', error);
    throw error;
  }
}

/**
 * Exports all local data to the Google Spreadsheet
 */
export async function exportToGoogleSheets(
  token: string,
  data: AppFinancialData,
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<SyncResult> {
  try {
    // 1. Ensure all tabs exist
    await initializeSpreadsheetTabs(token, spreadsheetId);

    // 2. Prepare Rows for each sheet
    // Resumo Sheet
    const nowStr = new Date().toLocaleString('pt-BR');
    const totalIncomes = data.incomes.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    const totalBills = data.bills.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
    const totalPaidBills = data.bills.filter(b => b.status === 'pago').reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
    const totalPendingBills = data.bills.filter(b => b.status === 'pendente').reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
    const totalDebts = data.debts.reduce((acc, d) => acc + (Number(d.currentAmount) || 0), 0);
    const totalWishlist = data.wishlist.reduce((acc, w) => acc + (Number(w.estimatedPrice) || 0), 0);

    const resumoValues = [
      ['MÉTRICA / INDICADOR', 'VALOR / QUANTIDADE', 'STATUS / DETALHES'],
      ['Última Sincronização Automática', nowStr, 'Sincronizado via App Controle Financeiro'],
      ['Usuários / Perfis Cadastrados', data.users.length, data.users.map(u => u.name).join(', ')],
      ['Total de Rendas Registradas', totalIncomes, `${data.incomes.length} lançamentos de renda`],
      ['Total de Boletos & Despesas', totalBills, `${data.bills.length} boletos cadastrados`],
      ['Boletos Pagos / Quitado', totalPaidBills, `${data.bills.filter(b => b.status === 'pago').length} quitados`],
      ['Boletos Pendentes a Pagar', totalPendingBills, `${data.bills.filter(b => b.status === 'pendente').length} a vencer/vencidos`],
      ['Total Dívidas em Negociação', totalDebts, `${data.debts.length} dívidas cadastradas`],
      ['Total Lista de Compras Planejadas', totalWishlist, `${data.wishlist.length} itens na lista`],
      ['', '', ''],
      ['INFORMAÇÃO', 'Esta planilha é atualizada em tempo real sempre que você altera dados no app.', '']
    ];

    // Usuarios Sheet
    const usuariosValues = [
      ['ID', 'Nome', 'Cor', 'Letra Avatar', 'Perfil / Função'],
      ...data.users.map(u => [
        u.id,
        u.name,
        u.color,
        u.avatarLetter,
        u.role || 'Membro Familiar'
      ])
    ];

    // Rendas Sheet
    const rendasValues = [
      ['ID', 'ID Usuário', 'Mês/Ano', 'Descrição da Renda', 'Valor (R$)', 'Tipo (fixa/variavel)', 'Dia Recebimento', 'Recebido? (SIM/NÃO)'],
      ...data.incomes.map(i => [
        i.id,
        i.userId,
        i.monthYear,
        i.description,
        i.amount,
        i.type,
        i.receiveDay || '',
        i.received ? 'SIM' : 'NÃO'
      ])
    ];

    // Boletos Sheet
    const boletosValues = [
      ['ID', 'ID Usuário', 'Mês/Ano', 'Descrição do Boleto', 'Valor (R$)', 'Dia Vencimento', 'Categoria', 'Status (pendente/pago/em_divida)', 'Tipo Recorrência', 'Parcela Atual', 'Total Parcelas', 'Mês Origem', 'Data Pagamento', 'Observações'],
      ...data.bills.map(b => [
        b.id,
        b.userId,
        b.monthYear,
        b.description,
        b.amount,
        b.dueDay,
        b.category,
        b.status,
        b.recurrenceType,
        b.installmentInfo?.current || '',
        b.installmentInfo?.total || '',
        b.carriedFromMonth || '',
        b.paidDate || '',
        b.notes || ''
      ])
    ];

    // Dividas Sheet
    const dividasValues = [
      ['ID', 'ID Usuário', 'Credor / Instituição', 'Descrição da Origem', 'Valor Original (R$)', 'Valor Atual c/ Juros (R$)', 'Valor Negociado (R$)', 'Data Vencimento Inicial', 'Status', 'Prioridade', 'Contato Credor', 'Anotações / Estratégia'],
      ...data.debts.map(d => [
        d.id,
        d.userId,
        d.creditor,
        d.description,
        d.originalAmount,
        d.currentAmount,
        d.negotiatedAmount || '',
        d.initialDueDate || '',
        d.status,
        d.priority,
        d.contactInfo || '',
        d.notes || ''
      ])
    ];

    // Lista Desejos Sheet
    const wishlistValues = [
      ['ID', 'ID Usuário', 'Item / O que Comprar', 'Preço Estimado (R$)', 'Categoria', 'Prioridade', 'Status', 'Mês Previsto', 'Link / Detalhes', 'Data Cadastro'],
      ...data.wishlist.map(w => [
        w.id,
        w.userId,
        w.title,
        w.estimatedPrice,
        w.category,
        w.priority,
        w.status,
        w.targetMonth || '',
        w.linkOrNotes || '',
        w.createdDate || ''
      ])
    ];

    // 3. Clear existing ranges to prevent ghost rows
    await sheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, token, {
      method: 'POST',
      body: JSON.stringify({
        ranges: [
          'Resumo!A1:Z100',
          'Usuarios!A1:Z500',
          'Rendas!A1:Z2000',
          'Boletos!A1:Z5000',
          'Dividas!A1:Z1000',
          'Lista_Desejos!A1:Z2000'
        ]
      })
    });

    // 4. Batch update values
    await sheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, token, {
      method: 'POST',
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: 'Resumo!A1', values: resumoValues },
          { range: 'Usuarios!A1', values: usuariosValues },
          { range: 'Rendas!A1', values: rendasValues },
          { range: 'Boletos!A1', values: boletosValues },
          { range: 'Dividas!A1', values: dividasValues },
          { range: 'Lista_Desejos!A1', values: wishlistValues }
        ]
      })
    });

    return {
      success: true,
      timestamp: nowStr,
      itemsCount: {
        users: data.users.length,
        incomes: data.incomes.length,
        bills: data.bills.length,
        debts: data.debts.length,
        wishlist: data.wishlist.length
      }
    };
  } catch (error: any) {
    console.error('Erro ao exportar para o Google Sheets:', error);
    return {
      success: false,
      timestamp: new Date().toLocaleString('pt-BR'),
      error: error.message || 'Erro desconhecido ao exportar para o Google Sheets'
    };
  }
}

/**
 * Imports all data from the Google Spreadsheet into typed app structure
 */
export async function importFromGoogleSheets(
  token: string,
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<{ success: boolean; data?: AppFinancialData; error?: string }> {
  try {
    const ranges = [
      'Usuarios!A2:E500',
      'Rendas!A2:H2000',
      'Boletos!A2:N5000',
      'Dividas!A2:L1000',
      'Lista_Desejos!A2:J2000'
    ];

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${ranges.map(r => `ranges=${encodeURIComponent(r)}`).join('&')}`;
    const response = await sheetsFetch(url, token);

    const valueRanges = response.valueRanges || [];
    
    // Parse Usuarios
    const usersRaw = valueRanges[0]?.values || [];
    const users: UserProfile[] = usersRaw.map((row: any[], index: number) => ({
      id: row[0] || `user-${index + 1}`,
      name: row[1] || 'Usuário',
      color: row[2] || 'emerald',
      avatarLetter: row[3] || (row[1] ? row[1][0].toUpperCase() : 'U'),
      role: row[4] || 'Membro Familiar'
    }));

    // Parse Rendas
    const incomesRaw = valueRanges[1]?.values || [];
    const incomes: Income[] = incomesRaw.map((row: any[], index: number) => ({
      id: row[0] || `inc-${index + 1}`,
      userId: row[1] || (users[0]?.id || 'andre'),
      monthYear: row[2] || '2026-08',
      description: row[3] || 'Renda',
      amount: parseFloat(String(row[4]).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0,
      type: (row[5] === 'variavel' ? 'variavel' : 'fixa') as 'fixa' | 'variavel',
      receiveDay: row[6] ? parseInt(row[6], 10) : undefined,
      received: String(row[7]).toUpperCase() === 'SIM' || String(row[7]).toLowerCase() === 'true'
    }));

    // Parse Boletos
    const billsRaw = valueRanges[2]?.values || [];
    const bills: Bill[] = billsRaw.map((row: any[], index: number) => {
      const currentInst = row[9] ? parseInt(row[9], 10) : undefined;
      const totalInst = row[10] ? parseInt(row[10], 10) : undefined;
      return {
        id: row[0] || `bill-${index + 1}`,
        userId: row[1] || (users[0]?.id || 'andre'),
        monthYear: row[2] || '2026-08',
        description: row[3] || 'Boleto',
        amount: parseFloat(String(row[4]).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0,
        dueDay: row[5] ? parseInt(row[5], 10) : 10,
        category: row[6] || 'Outros',
        status: (['pago', 'em_divida'].includes(row[7]) ? row[7] : 'pendente') as 'pendente' | 'pago' | 'em_divida',
        recurrenceType: (['recorrente_fixo', 'recorrente_variavel', 'parcelado', 'unico'].includes(row[8]) 
          ? row[8] 
          : 'unico') as any,
        installmentInfo: (currentInst && totalInst) ? { current: currentInst, total: totalInst } : undefined,
        carriedFromMonth: row[11] || undefined,
        paidDate: row[12] || undefined,
        notes: row[13] || undefined
      };
    });

    // Parse Dividas
    const debtsRaw = valueRanges[3]?.values || [];
    const debts: Debt[] = debtsRaw.map((row: any[], index: number) => ({
      id: row[0] || `debt-${index + 1}`,
      userId: row[1] || (users[0]?.id || 'andre'),
      creditor: row[2] || 'Credor',
      description: row[3] || '',
      originalAmount: parseFloat(String(row[4]).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0,
      currentAmount: parseFloat(String(row[5]).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0,
      negotiatedAmount: row[6] ? parseFloat(String(row[6]).replace(/[^\d.,-]/g, '').replace(',', '.')) : undefined,
      initialDueDate: row[7] || '2026-01-01',
      status: (['em_negociacao', 'acordo_fechado', 'quitado'].includes(row[8]) ? row[8] : 'pendente_contato') as any,
      priority: (['alta', 'media', 'baixa'].includes(row[9]) ? row[9] : 'media') as any,
      contactInfo: row[10] || undefined,
      notes: row[11] || undefined
    }));

    // Parse Wishlist
    const wishlistRaw = valueRanges[4]?.values || [];
    const wishlist: WishlistItem[] = wishlistRaw.map((row: any[], index: number) => ({
      id: row[0] || `wish-${index + 1}`,
      userId: row[1] || (users[0]?.id || 'andre'),
      title: row[2] || 'Item Desejado',
      estimatedPrice: parseFloat(String(row[3]).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0,
      category: row[4] || 'Geral',
      priority: (['urgente', 'essencial', 'desejo', 'planejado'].includes(row[5]) ? row[5] : 'planejado') as any,
      status: (['comprado', 'descartado'].includes(row[6]) ? row[6] : 'planejado') as any,
      targetMonth: row[7] || undefined,
      linkOrNotes: row[8] || undefined,
      createdDate: row[9] || new Date().toISOString().split('T')[0]
    }));

    return {
      success: true,
      data: {
        users: users.length > 0 ? users : [],
        incomes,
        bills,
        debts,
        wishlist
      }
    };
  } catch (error: any) {
    console.error('Erro ao importar do Google Sheets:', error);
    return {
      success: false,
      error: error.message || 'Erro ao ler dados da planilha'
    };
  }
}
