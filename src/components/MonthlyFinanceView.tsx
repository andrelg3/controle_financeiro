import React, { useState } from 'react';
import { Bill, Income, Debt } from '../types';
import { formatCurrency, getMonthLabel, getShortMonthLabel } from '../utils/formatters';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Layers, 
  Edit2, 
  Trash2, 
  ArrowRightCircle, 
  Filter, 
  Clock, 
  Calendar,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface MonthlyFinanceViewProps {
  currentMonthBills: Bill[];
  pastOverdueBills: Bill[];
  activeMonth: string;
  onOpenAddBill: () => void;
  onEditBill: (bill: Bill) => void;
  onDeleteBill: (id: string) => void;
  onTogglePaid: (id: string) => void;
  onMoveToDebts: (bill: Bill) => void;
}

export const MonthlyFinanceView: React.FC<MonthlyFinanceViewProps> = ({
  currentMonthBills,
  pastOverdueBills,
  activeMonth,
  onOpenAddBill,
  onEditBill,
  onDeleteBill,
  onTogglePaid,
  onMoveToDebts,
}) => {
  const [filterType, setFilterType] = useState<string>('todos');

  // Filter current month bills
  const filteredCurrentBills = currentMonthBills.filter((bill) => {
    if (filterType === 'todos') return true;
    if (filterType === 'pendentes') return bill.status === 'pendente';
    if (filterType === 'pagos') return bill.status === 'pago';
    if (filterType === 'fixos') return bill.recurrenceType === 'recorrente_fixo';
    if (filterType === 'variaveis') return bill.recurrenceType === 'recorrente_variavel';
    if (filterType === 'parcelados') return bill.recurrenceType === 'parcelado';
    return true;
  });

  const totalPastOverdue = pastOverdueBills.reduce((acc, curr) => acc + curr.amount, 0);

  const getRecurrenceBadge = (bill: Bill) => {
    switch (bill.recurrenceType) {
      case 'recorrente_fixo':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 font-bold uppercase">
            Fixo
          </span>
        );
      case 'recorrente_variavel':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100 font-bold uppercase">
            Variável
          </span>
        );
      case 'parcelado':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold uppercase flex items-center gap-1">
            <Layers className="w-2.5 h-2.5" />
            {bill.installmentInfo
              ? `Parc. ${bill.installmentInfo.current}/${bill.installmentInfo.total}`
              : 'Crediário'}
          </span>
        );
      case 'unico':
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200 font-bold uppercase">
            Pontual
          </span>
        );
    }
  };

  const getStatusDot = (bill: Bill, isOverdue = false) => {
    if (isOverdue) return 'bg-red-500';
    if (bill.status === 'pago') return 'bg-emerald-500';
    if (bill.recurrenceType === 'recorrente_fixo') return 'bg-blue-500';
    if (bill.recurrenceType === 'recorrente_variavel') return 'bg-teal-500';
    if (bill.recurrenceType === 'parcelado') return 'bg-indigo-500';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* ⚠️ SECTION 1: BOLETOS ATRASADOS / PENDENTES DE MESES ANTERIORES */}
      {pastOverdueBills.length > 0 && (
        <div className="bg-red-50/40 border-2 border-red-200 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-red-200/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-red-700 uppercase tracking-widest">
                    Boletos Pendentes de Meses Anteriores
                  </h2>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">
                    {pastOverdueBills.length} Atrasado{pastOverdueBills.length > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-red-900/80 mt-0.5 font-medium">
                  Contas vencidas em Agosto trazidas automaticamente para quitação prioritária em {getMonthLabel(activeMonth)}.
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Total Acumulado</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-red-600">
                {formatCurrency(totalPastOverdue)}
              </span>
            </div>
          </div>

          {/* List of overdue carried over bills */}
          <div className="space-y-2.5 mt-4">
            {pastOverdueBills.map((bill) => (
              <div
                key={bill.id}
                className="p-3.5 bg-red-50 border border-red-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:border-red-300"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-1.5 sm:mt-0"></div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-red-950 truncate">
                        {bill.description}
                      </p>
                      {getRecurrenceBadge(bill)}
                      <span className="text-[10px] text-red-600 uppercase font-bold bg-red-100/90 px-2 py-0.5 rounded">
                        Vencimento: {bill.dueDay}/{bill.monthYear.split('-')[1]} • ATRASADO
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-red-800/80 mt-1 flex-wrap font-medium">
                      <span>Categoria: {bill.category}</span>
                      {bill.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-red-700">"{bill.notes}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-5 sm:pl-0">
                  <span className="text-sm sm:text-base font-bold font-mono text-red-900">
                    {formatCurrency(bill.amount)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onTogglePaid(bill.id)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                      title="Quitar agora"
                    >
                      Pagar
                    </button>
                    <button
                      onClick={() => onMoveToDebts(bill)}
                      className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 transition flex items-center gap-1"
                      title="Mover para aba de Dívidas a Negociar"
                    >
                      <ArrowRightCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Negociar</span>
                    </button>
                    <button
                      onClick={() => onEditBill(bill)}
                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg transition"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteBill(bill.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📅 SECTION 2: GASTOS PREVISTOS E BOLETOS DO MÊS */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs">
        {/* Header with Title & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Boletos de {getMonthLabel(activeMonth)} & Despesas Previstas
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Controle de despesas fixas, variáveis, crediários e pagamentos pontuais.
            </p>
          </div>

          <button
            id="btn-add-bill"
            onClick={onOpenAddBill}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#111827] hover:bg-gray-800 text-white text-xs sm:text-sm font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Boleto / Gasto</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="py-3 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            Filtro:
          </span>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'pendentes', label: 'A Pagar' },
            { id: 'pagos', label: 'Já Pagos' },
            { id: 'fixos', label: 'Recorrente Fixo' },
            { id: 'variaveis', label: 'Recorrente Variável' },
            { id: 'parcelados', label: 'Crediários' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterType(chip.id)}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap text-xs font-bold ${
                filterType === chip.id
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Current month bills list */}
        <div className="space-y-2.5 mt-2">
          {filteredCurrentBills.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs font-medium">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              Nenhum boleto encontrado com o filtro selecionado para {getMonthLabel(activeMonth)}.
            </div>
          ) : (
            filteredCurrentBills.map((bill) => {
              const isPaid = bill.status === 'pago';

              return (
                <div
                  key={bill.id}
                  className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition rounded-2xl border ${
                    isPaid 
                      ? 'bg-gray-50/70 border-gray-200/80 opacity-75' 
                      : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => onTogglePaid(bill.id)}
                      className="mt-0.5 sm:mt-0 transition shrink-0"
                      title={isPaid ? 'Marcar como pendente' : 'Marcar como pago'}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 hover:text-emerald-500" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className={`w-2 h-2 rounded-full ${getStatusDot(bill)}`}></div>
                        <p
                          className={`text-sm font-bold truncate ${
                            isPaid ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}
                        >
                          {bill.description}
                        </p>
                        {getRecurrenceBadge(bill)}
                        {isPaid ? (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                            PAGO {bill.paidDate ? `• ${bill.paidDate}` : ''}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold uppercase">
                            VENCIMENTO: {bill.dueDay.toString().padStart(2, '0')}/{bill.monthYear.split('-')[1]}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap font-medium">
                        <span>Categoria: {bill.category}</span>
                        {bill.notes && (
                          <>
                            <span>•</span>
                            <span className="text-gray-400 italic">"{bill.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-8 sm:pl-0">
                    <span
                      className={`text-sm sm:text-base font-bold font-mono ${
                        isPaid ? 'text-gray-400' : 'text-[#111827]'
                      }`}
                    >
                      {formatCurrency(bill.amount)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onTogglePaid(bill.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                          isPaid
                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {isPaid ? 'Desfazer' : 'Pagar'}
                      </button>

                      {!isPaid && (
                        <button
                          onClick={() => onMoveToDebts(bill)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Mover para Dívidas a Negociar"
                        >
                          <ArrowRightCircle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => onEditBill(bill)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteBill(bill.id)}
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
