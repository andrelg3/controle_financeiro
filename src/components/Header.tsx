import React, { useState } from 'react';
import { UserProfile, ActiveTab } from '../types';
import { getMonthLabel, getAdjacentMonth } from '../utils/formatters';
import { 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Wallet, 
  AlertTriangle, 
  ShoppingBag, 
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  users: UserProfile[];
  activeUserId: string;
  onSelectUser: (userId: string) => void;
  onOpenAddUser: () => void;
  activeMonth: string;
  onChangeMonth: (newMonth: string) => void;
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  overdueCount: number;
  onResetData: () => void;
  // Google Sheets props
  googleUser: User | null;
  spreadsheetId: string;
  isSyncing: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTime: string | null;
  onOpenSyncModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  users,
  activeUserId,
  onSelectUser,
  onOpenAddUser,
  activeMonth,
  onChangeMonth,
  activeTab,
  onChangeTab,
  overdueCount,
  onResetData,
  googleUser,
  spreadsheetId,
  isSyncing,
  syncStatus,
  lastSyncTime,
  onOpenSyncModal,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const activeUser = users.find((u) => u.id === activeUserId) || users[0];

  const handlePrevMonth = () => {
    onChangeMonth(getAdjacentMonth(activeMonth, -1));
  };

  const handleNextMonth = () => {
    onChangeMonth(getAdjacentMonth(activeMonth, 1));
  };

  const handleReset = () => {
    onResetData();
    setShowResetConfirm(false);
  };

  const getUserBgColor = (idx: number, id: string) => {
    if (id === 'andre') return 'bg-[#4F46E5] text-white';
    if (id === 'aline') return 'bg-[#EC4899] text-white';
    const colors = ['bg-[#059669] text-white', 'bg-[#D97706] text-white', 'bg-[#0284C7] text-white', 'bg-[#7C3AED] text-white'];
    return colors[idx % colors.length];
  };

  return (
    <header className="bg-white text-[#1A1A1A] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-sm mb-6 transition-all">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Avatar Stack & Profile Selector */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Avatar stack */}
          <div className="flex -space-x-2 items-center">
            {users.slice(0, 3).map((user, idx) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                title={`Alternar para ${user.name}`}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform hover:scale-105 ${getUserBgColor(idx, user.id)} ${
                  user.id === activeUserId ? 'ring-2 ring-indigo-500/40 z-10 scale-105' : 'opacity-90 hover:opacity-100'
                }`}
              >
                {user.avatarLetter || user.name.slice(0, 2).toUpperCase()}
              </button>
            ))}
            <button
              onClick={onOpenAddUser}
              title="Adicionar Novo Usuário"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold transition shadow-xs"
            >
              +
            </button>
          </div>

          <div className="h-7 w-[1px] bg-gray-200 hidden sm:block"></div>

          {/* Active Profile Info */}
          <div className="relative">
            <button
              id="user-menu-button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl transition text-xs sm:text-sm"
            >
              <span className="text-gray-500 font-medium">Perfil:</span>
              <span className="font-bold text-[#111827]">{activeUser?.name}</span>
              <Users className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
            </button>

            {/* Dropdown */}
            {showUserDropdown && (
              <div 
                className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 text-sm"
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  Selecionar Perfil
                </div>
                {users.map((user, idx) => (
                  <button
                    key={user.id}
                    id={`select-user-${user.id}`}
                    onClick={() => {
                      onSelectUser(user.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-gray-50 transition ${
                      user.id === activeUserId ? 'bg-indigo-50/70 font-bold text-indigo-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getUserBgColor(idx, user.id)}`}>
                        {user.avatarLetter || user.name.charAt(0)}
                      </div>
                      <span>{user.name}</span>
                    </div>
                    {user.id === activeUserId && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    id="btn-add-new-user"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenAddUser();
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-indigo-600 hover:bg-indigo-50/50 transition font-semibold text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Outro Usuário</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Bento Month Navigator */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1 sm:gap-2 bg-[#F9FAFB] p-1 rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs">
            <button
              id="btn-prev-month"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white text-gray-500 hover:text-[#111827] rounded-lg transition"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center px-4 sm:px-6">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                {getMonthLabel(activeMonth).split(' ')[0]}
              </span>
              <span className="text-sm font-bold text-[#111827]">
                {getMonthLabel(activeMonth).split(' ')[2] || activeMonth.split('-')[0]}
              </span>
            </div>

            <button
              id="btn-next-month"
              onClick={handleNextMonth}
              className="p-2 hover:bg-white text-gray-500 hover:text-[#111827] rounded-lg transition"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Google Sheets Sync & Quick Actions */}
        <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
          {/* Google Sheets Sync Pill */}
          <button
            id="btn-google-sheets-sync"
            onClick={onOpenSyncModal}
            className={`flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition border shadow-2xs ${
              googleUser
                ? syncStatus === 'error'
                  ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
            }`}
            title="Gerenciar Sincronização com Google Planilhas"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            ) : googleUser ? (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-gray-500" />
            )}
            
            <div className="flex flex-col items-start leading-tight text-left">
              <span className="text-[11px] font-bold">
                {isSyncing
                  ? 'Sincronizando...'
                  : googleUser
                  ? 'Planilha Google Conectada'
                  : 'Conectar Planilha'}
              </span>
              {googleUser && lastSyncTime && (
                <span className="text-[9px] text-gray-500 font-normal hidden lg:inline">
                  Salvo: {lastSyncTime.split(' ')[1] || lastSyncTime}
                </span>
              )}
            </div>

            {googleUser && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            )}
          </button>

          {/* External link to Google Sheets */}
          {googleUser && (
            <a
              href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
              target="_blank"
              rel="noreferrer"
              title="Abrir Planilha no Google Planilhas"
              className="p-2 rounded-xl text-gray-500 hover:text-[#111827] hover:bg-gray-100 border border-gray-200 transition hidden sm:flex items-center justify-center"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            id="btn-reset-data"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition"
            title="Restaurar dados de exemplo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Restaurar</span>
          </button>
        </div>
      </div>

      {/* Bento Tabs Row */}
      <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 sm:gap-2 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/70 w-full sm:w-auto">
          <button
            id="tab-mensal"
            onClick={() => onChangeTab('mensal')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
              activeTab === 'mensal'
                ? 'bg-[#111827] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Controle Mensal</span>
            {overdueCount > 0 && activeMonth !== '2026-08' && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white font-black rounded-full text-[10px]">
                {overdueCount}
              </span>
            )}
          </button>

          <button
            id="tab-dividas"
            onClick={() => onChangeTab('dividas')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
              activeTab === 'dividas'
                ? 'bg-[#111827] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Dívidas a Negociar</span>
          </button>

          <button
            id="tab-compras"
            onClick={() => onChangeTab('compras')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
              activeTab === 'compras'
                ? 'bg-[#111827] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Quero Comprar</span>
          </button>
        </nav>

        <div className="flex items-center gap-2 hidden sm:flex">
          {googleUser ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-xl text-[10px] font-bold text-emerald-800">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Sincronização em Tempo Real Ativa</span>
            </div>
          ) : (
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Modo Bento Ativo</span>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-sm w-full text-gray-800 shadow-2xl">
            <h3 className="text-base font-bold text-[#111827] mb-2">Restaurar Dados de Exemplo?</h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Isso recarregará o cenário padrão com André, Aline, boletos pendentes acumulados e dívidas para demonstração.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-gray-600 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white transition shadow-sm"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

