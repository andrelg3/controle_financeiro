import React, { useState } from 'react';
import { Income } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Plus, CheckCircle, Circle, Edit2, Trash2, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';

interface IncomeSectionProps {
  incomes: Income[];
  onOpenAddModal: () => void;
  onEditIncome: (income: Income) => void;
  onDeleteIncome: (id: string) => void;
  onToggleReceived: (id: string) => void;
}

export const IncomeSection: React.FC<IncomeSectionProps> = ({
  incomes,
  onOpenAddModal,
  onEditIncome,
  onDeleteIncome,
  onToggleReceived,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const total = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalReceived = incomes
    .filter((inc) => inc.received)
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden mb-6 shadow-xs transition-all">
      {/* Bento Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between bg-white border-b border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-left group"
        >
          <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Fluxo de Renda & Receitas
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                {formatCurrency(total)}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Recebido: <strong className="text-emerald-600">{formatCurrency(totalReceived)}</strong> ({incomes.length} {incomes.length === 1 ? 'fonte' : 'fontes'})
            </p>
          </div>
          <span className="text-gray-400 ml-1">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        <button
          id="btn-add-income"
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-gray-800 text-white text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Renda</span>
        </button>
      </div>

      {/* Income list items */}
      {isExpanded && (
        <div className="p-4 sm:p-5 divide-y divide-gray-100">
          {incomes.length === 0 ? (
            <div className="py-6 text-center text-gray-400 text-xs font-medium">
              Nenhuma renda cadastrada para este mês. Clique em "+ Nova Renda" para adicionar.
            </div>
          ) : (
            incomes.map((inc) => (
              <div
                key={inc.id}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group hover:bg-gray-50/70 rounded-xl px-2 -mx-2 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onToggleReceived(inc.id)}
                    className="text-gray-300 hover:text-emerald-500 transition shrink-0"
                    title={inc.received ? 'Marcar como não recebido' : 'Marcar como recebido'}
                  >
                    {inc.received ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900 truncate">
                        {inc.description}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                          inc.type === 'fixa'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-teal-50 text-teal-700 border border-teal-100'
                        }`}
                      >
                        {inc.type === 'fixa' ? 'Fixa' : 'Variável'}
                      </span>
                      {inc.receiveDay && (
                        <span className="text-[11px] text-gray-400 font-medium">
                          Dia {inc.receiveDay}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-sm sm:text-base font-bold font-mono ${
                      inc.received ? 'text-emerald-600' : 'text-gray-700'
                    }`}
                  >
                    {formatCurrency(inc.amount)}
                  </span>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onEditIncome(inc)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-lg transition"
                      title="Editar renda"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteIncome(inc.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Excluir renda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
