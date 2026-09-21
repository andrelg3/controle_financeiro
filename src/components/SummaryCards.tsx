import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  AlertOctagon, 
  DollarSign, 
  Info 
} from 'lucide-react';

interface SummaryCardsProps {
  totalIncome: number;
  fixedIncome: number;
  variableIncome: number;
  totalPaid: number;
  totalMonthPending: number;
  totalPastOverdue: number;
  finalBalance: number;
  isAugustCurrent: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  fixedIncome,
  variableIncome,
  totalPaid,
  totalMonthPending,
  totalPastOverdue,
  finalBalance,
  isAugustCurrent,
}) => {
  const totalCommitted = totalPaid + totalMonthPending + totalPastOverdue;
  const commitmentPercent = totalIncome > 0 ? Math.min(100, Math.round((totalCommitted / totalIncome) * 100)) : 0;
  const isDeficit = finalBalance < 0;

  return (
    <section className="mb-6">
      {/* Alert banner for August status if balance is zero/deficit or unpaid bills exist */}
      {isAugustCurrent && totalPastOverdue === 0 && totalMonthPending > 0 && finalBalance <= 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-xs">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-amber-950">Final de Agosto sem saldo:</span> A renda deste mês foi totalmente comprometida com os pagamentos efetuados. Há boletos que venceram e ainda não foram pagos. Ao avançar para <strong>Setembro</strong>, estas pendências serão automaticamente carregadas para prioridade de quitação.
          </div>
        </div>
      )}

      {totalPastOverdue > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-900 shadow-xs">
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-red-950">Atenção com Boletos Acumulados:</span> Você possui <strong>{formatCurrency(totalPastOverdue)}</strong> em contas não pagas de meses anteriores (Agosto). Elas foram somadas à necessidade financeira deste mês.
          </div>
        </div>
      )}

      {/* Bento Grid Top Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Renda do Mês (Bento Card) */}
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:border-gray-300 transition">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Renda Disponível</span>
              <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              {formatCurrency(totalIncome)}
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-dashed border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Fixa: <strong className="text-gray-800">{formatCurrency(fixedIncome)}</strong></span>
            <span>•</span>
            <span>Var: <strong className="text-gray-800">{formatCurrency(variableIncome)}</strong></span>
          </div>
        </div>

        {/* 2. Total Pago (Bento Card) */}
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:border-gray-300 transition">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gastos Já Pagos</span>
              <span className="p-1.5 rounded-xl bg-sky-50 text-sky-600">
                <CheckCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-700 tracking-tight">
              {formatCurrency(totalPaid)}
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-dashed border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Contas quitadas no período</span>
            <span className="font-bold text-sky-600 text-[11px]">OK</span>
          </div>
        </div>

        {/* 3. Boletos a Pagar (Bento Card) */}
        <div className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between transition ${
          totalPastOverdue > 0 ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200 hover:border-gray-300'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Boletos a Pagar</span>
              <span className={`p-1.5 rounded-xl ${totalPastOverdue > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              {formatCurrency(totalMonthPending + totalPastOverdue)}
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-dashed border-gray-200/80 flex items-center justify-between text-xs text-gray-500">
            <span>Mês: <strong className="text-gray-800">{formatCurrency(totalMonthPending)}</strong></span>
            {totalPastOverdue > 0 ? (
              <span className="font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded text-[10px] uppercase">
                +{formatCurrency(totalPastOverdue)} Atrasado
              </span>
            ) : (
              <span className="text-gray-400 text-[11px]">Em dia</span>
            )}
          </div>
        </div>

        {/* 4. Saldo Previsto (Bento Card) */}
        <div className={`rounded-3xl border p-5 shadow-xs flex flex-col justify-between transition ${
          isDeficit 
            ? 'bg-red-50/40 border-red-200' 
            : finalBalance === 0 
            ? 'bg-amber-50/40 border-amber-200' 
            : 'bg-emerald-50/40 border-emerald-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Restante Previsto</span>
              <span className={`p-1.5 rounded-xl ${
                isDeficit ? 'bg-red-100 text-red-600' : finalBalance === 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isDeficit ? 'text-red-600' : finalBalance === 0 ? 'text-amber-700' : 'text-[#059669]'
            }`}>
              {formatCurrency(finalBalance)}
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-dashed border-gray-200 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Comprometimento:</span>
            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
              commitmentPercent >= 100 ? 'bg-red-100 text-red-700' : commitmentPercent >= 80 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {commitmentPercent}% da renda
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
