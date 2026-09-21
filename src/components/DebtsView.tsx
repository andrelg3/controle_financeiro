import React, { useState } from 'react';
import { Debt, DebtStatus } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  AlertTriangle, 
  Plus, 
  Handshake, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Edit2, 
  Trash2, 
  TrendingDown, 
  ArrowUpRight,
  ShieldAlert,
  CreditCard
} from 'lucide-react';

interface DebtsViewProps {
  debts: Debt[];
  onOpenAddDebt: () => void;
  onEditDebt: (debt: Debt) => void;
  onDeleteDebt: (id: string) => void;
  onUpdateStatus: (id: string, status: DebtStatus) => void;
  onConvertToMonthlyBill: (debt: Debt) => void;
}

export const DebtsView: React.FC<DebtsViewProps> = ({
  debts,
  onOpenAddDebt,
  onEditDebt,
  onDeleteDebt,
  onUpdateStatus,
  onConvertToMonthlyBill,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const filteredDebts = debts.filter((d) => {
    if (filterStatus === 'todos') return true;
    return d.status === filterStatus;
  });

  const totalOriginal = debts.reduce((acc, curr) => acc + curr.originalAmount, 0);
  const totalCurrent = debts.reduce((acc, curr) => acc + (curr.currentAmount || curr.originalAmount), 0);
  const totalNegotiated = debts
    .filter((d) => d.negotiatedAmount)
    .reduce((acc, curr) => acc + (curr.negotiatedAmount || 0), 0);
  
  const totalSavings = debts.reduce((acc, curr) => {
    if (curr.negotiatedAmount) {
      return acc + (curr.currentAmount - curr.negotiatedAmount);
    }
    return acc;
  }, 0);

  const getStatusBadge = (status: DebtStatus) => {
    switch (status) {
      case 'pendente_contato':
        return (
          <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 font-bold uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pendente Contato
          </span>
        );
      case 'em_negociacao':
        return (
          <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold uppercase flex items-center gap-1">
            <Handshake className="w-3 h-3" />
            Em Negociação
          </span>
        );
      case 'acordo_fechado':
        return (
          <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Acordo Fechado
          </span>
        );
      case 'quitado':
        return (
          <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 font-bold uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Quitada
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'alta':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold uppercase tracking-wider">
            Prioridade Alta
          </span>
        );
      case 'media':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold uppercase">
            Prioridade Média
          </span>
        );
      case 'baixa':
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 font-bold uppercase">
            Prioridade Baixa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Bento Debts Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento Dark Card: Total Atual com Juros */}
        <div className="bg-[#111827] text-white rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dívidas Vencidas</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-red-400 tracking-tight">
              {formatCurrency(totalCurrent)}
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-white/10 text-xs text-gray-300 flex justify-between">
            <span>Base Original:</span>
            <strong className="text-gray-200 font-mono">{formatCurrency(totalOriginal)}</strong>
          </div>
        </div>

        {/* Bento Card: Acordos Fechados */}
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor Acordado</span>
              <Handshake className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 tracking-tight">
              {formatCurrency(totalNegotiated)}
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-dashed border-gray-100 text-xs text-gray-500">
            Valores com propostas aprovadas
          </div>
        </div>

        {/* Bento Card: Desconto Conquistado */}
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Desconto Obtido</span>
              <TrendingDown className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-teal-600 tracking-tight">
              {formatCurrency(totalSavings)}
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-dashed border-gray-100 text-xs text-gray-500">
            Economia em feirões e acordos
          </div>
        </div>

        {/* Bento Card: Ação Rápida */}
        <div className="bg-amber-50 rounded-3xl border border-amber-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block mb-2">Estratégia</span>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              Priorize renegociação de dívidas de alta urgência e feche parcelas que caibam no orçamento mensal.
            </p>
          </div>
          <button
            onClick={onOpenAddDebt}
            className="w-full mt-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-xs"
          >
            + Nova Negociação
          </button>
        </div>
      </div>

      {/* Main Debts Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Lista de Dívidas & Credores
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 font-bold">
                {debts.length} {debts.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Contas antigas que já venceram, saíram do fluxo diário e exigem proposta de acordo, feirões limpa nome ou quitação parcelada.
            </p>
          </div>

          <button
            id="btn-add-debt"
            onClick={onOpenAddDebt}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs sm:text-sm transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Dívida</span>
          </button>
        </div>

        {/* Filters */}
        <div className="py-3 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          {[
            { id: 'todos', label: 'Todas as Dívidas' },
            { id: 'pendente_contato', label: 'Pendente Contato' },
            { id: 'em_negociacao', label: 'Em Negociação' },
            { id: 'acordo_fechado', label: 'Acordo Fechado' },
            { id: 'quitado', label: 'Quitadas' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterStatus(chip.id)}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap text-xs font-bold ${
                filterStatus === chip.id
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* List of debts */}
        <div className="space-y-3 mt-2">
          {filteredDebts.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs font-medium">
              <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              Nenhuma dívida cadastrada nesta categoria.
            </div>
          ) : (
            filteredDebts.map((debt) => {
              const isSettled = debt.status === 'quitado';

              return (
                <div
                  key={debt.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col gap-3.5 ${
                    isSettled 
                      ? 'bg-gray-50 border-gray-200 opacity-70' 
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-gray-900">
                          {debt.creditor}
                        </span>
                        {getStatusBadge(debt.status)}
                        {getPriorityBadge(debt.priority)}
                      </div>

                      {debt.description && (
                        <p className="text-xs text-gray-600 mt-1 font-medium">
                          {debt.description}
                        </p>
                      )}

                      {debt.contactInfo && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 font-medium">
                          <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{debt.contactInfo}</span>
                        </div>
                      )}
                    </div>

                    {/* Financial Numbers */}
                    <div className="text-left sm:text-right shrink-0 bg-gray-50 p-2.5 sm:p-0 sm:bg-transparent rounded-xl">
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                        <span className="text-[11px] text-gray-400 font-medium">
                          Original: <span className="font-mono text-gray-600">{formatCurrency(debt.originalAmount)}</span>
                        </span>
                        <div className="text-base font-black font-mono text-red-600">
                          Cobrado: {formatCurrency(debt.currentAmount || debt.originalAmount)}
                        </div>
                        {debt.negotiatedAmount && (
                          <div className="text-xs font-bold font-mono text-emerald-600 flex items-center gap-1">
                            <span>Acordo:</span> {formatCurrency(debt.negotiatedAmount)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes / Strategy Box */}
                  {debt.notes && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-700 leading-relaxed font-medium">
                      <strong className="text-gray-900">Estratégia: </strong>
                      {debt.notes}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => onUpdateStatus(debt.id, debt.status === 'quitado' ? 'em_negociacao' : 'quitado')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                          debt.status === 'quitado'
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        }`}
                      >
                        {debt.status === 'quitado' ? 'Reabrir Dívida' : 'Marcar como Quitado'}
                      </button>

                      {debt.status !== 'quitado' && (
                        <button
                          onClick={() => onConvertToMonthlyBill(debt)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-xs"
                          title="Adicionar parcela ou valor como boleto a pagar no mês atual"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Lançar como Boleto no Mês</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditDebt(debt)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDebt(debt.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
