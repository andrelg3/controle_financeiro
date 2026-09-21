import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  ExternalLink, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  CloudUpload, 
  CloudDownload, 
  LogOut, 
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { User } from 'firebase/auth';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: User | null;
  spreadsheetId: string;
  onUpdateSpreadsheetId: (id: string) => void;
  lastSyncTime: string | null;
  isSyncing: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncError: string | null;
  onGoogleSignIn: () => Promise<void>;
  onGoogleSignOut: () => Promise<void>;
  onExportToSheets: () => Promise<void>;
  onImportFromSheets: () => Promise<void>;
  counts?: {
    users: number;
    incomes: number;
    bills: number;
    debts: number;
    wishlist: number;
  };
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  spreadsheetId,
  onUpdateSpreadsheetId,
  lastSyncTime,
  isSyncing,
  syncStatus,
  syncError,
  onGoogleSignIn,
  onGoogleSignOut,
  onExportToSheets,
  onImportFromSheets,
  counts,
}) => {
  const [editingId, setEditingId] = useState(false);
  const [tempId, setTempId] = useState(spreadsheetId);
  const [confirmImport, setConfirmImport] = useState(false);

  if (!isOpen) return null;

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const handleSaveId = () => {
    if (tempId.trim()) {
      // If user pasted full url, extract ID
      const match = tempId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const cleanId = match ? match[1] : tempId.trim();
      onUpdateSpreadsheetId(cleanId);
      setEditingId(false);
    }
  };

  const handleExecuteImport = async () => {
    setConfirmImport(false);
    await onImportFromSheets();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-lg w-full text-gray-900 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Sincronização Google Planilhas
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Mantenha suas contas e valores seguros na sua conta Google
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          {/* Google Account Status */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Conta Google
            </div>
            {googleUser ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {googleUser.photoURL ? (
                    <img 
                      src={googleUser.photoURL} 
                      alt={googleUser.displayName || 'Google User'} 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full border border-gray-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {googleUser.displayName ? googleUser.displayName.charAt(0).toUpperCase() : 'G'}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      {googleUser.displayName || 'Conta Google Conectada'}
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {googleUser.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onGoogleSignOut}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition flex items-center gap-1.5"
                  title="Desconectar conta Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desconectar</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-gray-600">
                  Faça login com sua conta Google para autorizar o salvamento automático na sua planilha.
                </p>
                <button
                  onClick={onGoogleSignIn}
                  disabled={isSyncing}
                  className="px-4 py-2.5 bg-[#111827] hover:bg-gray-800 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs transition shrink-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Conectar com Google</span>
                </button>
              </div>
            )}
          </div>

          {/* Spreadsheet Target Box */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Planilha Vinculada
              </span>
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline"
              >
                <span>Abrir no Google Planilhas</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {editingId ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempId}
                  onChange={(e) => setTempId(e.target.value)}
                  placeholder="Cole o ID ou URL da planilha"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-gray-900"
                />
                <button
                  onClick={handleSaveId}
                  className="px-3 py-2 bg-[#111827] text-white text-xs font-bold rounded-xl shrink-0"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setEditingId(false)}
                  className="px-2 py-2 text-gray-500 hover:bg-gray-200 text-xs font-bold rounded-xl shrink-0"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
                <div className="overflow-hidden">
                  <div className="text-xs font-mono font-bold text-gray-800 truncate">
                    {spreadsheetId}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Abas: Resumo, Usuarios, Rendas, Boletos, Dividas, Lista_Desejos
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTempId(spreadsheetId);
                    setEditingId(true);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition shrink-0 ml-2"
                  title="Alterar ID da planilha"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Sync Status Banner */}
          <div className="p-4 bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                ) : syncStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : syncStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 text-gray-400" />
                )}
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    {isSyncing
                      ? 'Sincronizando com a planilha...'
                      : syncStatus === 'success'
                      ? 'Planilha Sincronizada com Sucesso'
                      : syncStatus === 'error'
                      ? 'Falha ao Sincronizar'
                      : 'Pronto para Sincronizar'}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {lastSyncTime
                      ? `Última sincronização: ${lastSyncTime}`
                      : 'Nenhuma sincronização realizada nesta sessão'}
                  </div>
                </div>
              </div>
            </div>

            {syncError && (
              <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {syncError}
              </div>
            )}

            {counts && (
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-gray-50 p-2 rounded-xl">
                  <span className="block font-bold text-gray-900">{counts.users}</span>
                  <span className="text-[10px] text-gray-500">Usuários</span>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl">
                  <span className="block font-bold text-gray-900">{counts.incomes}</span>
                  <span className="text-[10px] text-gray-500">Rendas</span>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl">
                  <span className="block font-bold text-gray-900">{counts.bills}</span>
                  <span className="text-[10px] text-gray-500">Boletos</span>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl">
                  <span className="block font-bold text-gray-900">{counts.debts}</span>
                  <span className="text-[10px] text-gray-500">Dívidas</span>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl">
                  <span className="block font-bold text-gray-900">{counts.wishlist}</span>
                  <span className="text-[10px] text-gray-500">Desejos</span>
                </div>
              </div>
            )}
          </div>

          {/* Sync Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={onExportToSheets}
              disabled={isSyncing || !googleUser}
              className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                !googleUser 
                  ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400' 
                  : 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200 text-emerald-950'
              }`}
            >
              <CloudUpload className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider">
                  Enviar para Planilha
                </span>
                <span className="text-[11px] text-gray-600 block mt-0.5">
                  Grava todas as contas e rendas do app na sua planilha Google
                </span>
              </div>
            </button>

            <button
              onClick={() => setConfirmImport(true)}
              disabled={isSyncing || !googleUser}
              className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                !googleUser 
                  ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400' 
                  : 'bg-indigo-50 hover:bg-indigo-100/70 border-indigo-200 text-indigo-950'
              }`}
            >
              <CloudDownload className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider">
                  Carregar da Planilha
                </span>
                <span className="text-[11px] text-gray-600 block mt-0.5">
                  Importa e atualiza os dados do app a partir do Google Sheets
                </span>
              </div>
            </button>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-2.5">
            <div className="p-1 bg-blue-100 text-blue-800 rounded-lg mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
              <strong>Sincronização em tempo real:</strong> Enquanto você estiver conectado, qualquer nova despesa, exclusão ou baixa de pagamento no app será sincronizada diretamente na sua planilha.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2.5 pt-4 mt-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold rounded-2xl bg-[#111827] hover:bg-gray-800 text-white transition shadow-xs"
          >
            Fechar
          </button>
        </div>

        {/* Destructive Action Confirmation Modal for Import */}
        {confirmImport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-60">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-sm w-full text-gray-900 shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <CloudDownload className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  Importar da Planilha Google?
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                Esta ação substituirá os lançamentos atuais do app pelos registros presentes na sua planilha Google. Deseja continuar?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmImport(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExecuteImport}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-xs"
                >
                  Confirmar e Importar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
