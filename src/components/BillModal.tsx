import React, { useState, useEffect } from 'react';
import { Bill, BillRecurrenceType } from '../types';
import { X, Receipt, Tag, Calendar, Layers, CheckCircle2 } from 'lucide-react';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: Partial<Bill>, replicateNextMonths?: boolean) => void;
  editingBill?: Bill | null;
  activeMonth: string;
  userId: string;
}

const CATEGORIES = [
  'Moradia',
  'Educação',
  'Serviços',
  'Alimentação',
  'Saúde',
  'Transporte',
  'Casa',
  'Cartão',
  'Trabalho',
  'Lazer',
  'Outros',
];

export const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBill,
  activeMonth,
  userId,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('10');
  const [category, setCategory] = useState('Serviços');
  const [recurrenceType, setRecurrenceType] = useState<BillRecurrenceType>('recorrente_fixo');
  const [currentInstallment, setCurrentInstallment] = useState('1');
  const [totalInstallments, setTotalInstallments] = useState('10');
  const [status, setStatus] = useState<'pendente' | 'pago'>('pendente');
  const [notes, setNotes] = useState('');
  const [replicateRecurring, setReplicateRecurring] = useState(false);

  useEffect(() => {
    if (editingBill) {
      setDescription(editingBill.description);
      setAmount(editingBill.amount.toString());
      setDueDay(editingBill.dueDay.toString());
      setCategory(editingBill.category || 'Serviços');
      setRecurrenceType(editingBill.recurrenceType);
      if (editingBill.installmentInfo) {
        setCurrentInstallment(editingBill.installmentInfo.current.toString());
        setTotalInstallments(editingBill.installmentInfo.total.toString());
      } else {
        setCurrentInstallment('1');
        setTotalInstallments('10');
      }
      setStatus(editingBill.status === 'pago' ? 'pago' : 'pendente');
      setNotes(editingBill.notes || '');
      setReplicateRecurring(false);
    } else {
      setDescription('');
      setAmount('');
      setDueDay('10');
      setCategory('Serviços');
      setRecurrenceType('recorrente_fixo');
      setCurrentInstallment('1');
      setTotalInstallments('10');
      setStatus('pendente');
      setNotes('');
      setReplicateRecurring(true);
    }
  }, [editingBill, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor, informe um valor válido para o boleto.');
      return;
    }
    if (!description.trim()) {
      alert('Por favor, informe a descrição do boleto.');
      return;
    }

    const billData: Partial<Bill> = {
      id: editingBill ? editingBill.id : undefined,
      userId,
      description: description.trim(),
      amount: numAmount,
      dueDay: parseInt(dueDay, 10) || 10,
      monthYear: editingBill ? editingBill.monthYear : activeMonth,
      category,
      recurrenceType,
      status,
      paidDate: status === 'pago' ? (editingBill?.paidDate || new Date().toISOString().split('T')[0]) : undefined,
      notes: notes.trim() || undefined,
    };

    if (recurrenceType === 'parcelado') {
      billData.installmentInfo = {
        current: parseInt(currentInstallment, 10) || 1,
        total: parseInt(totalInstallments, 10) || 1,
      };
    }

    onSave(billData, replicateRecurring && !editingBill);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-lg w-full text-gray-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gray-100 rounded-2xl text-gray-800">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                {editingBill ? 'Editar Boleto / Despesa' : 'Novo Boleto / Despesa Prevista'}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Informe os dados do vencimento e natureza da conta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Descrição do Boleto / Conta
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Escola das Crianças, Conta de Luz (Enel), Crediário Geladeira"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Dia Vencimento
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                placeholder="10"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition font-bold"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:bg-white transition font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo de Recorrência / Natureza do Boleto */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Tipo de Recorrência / Natureza da Conta
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRecurrenceType('recorrente_fixo')}
                className={`p-3 rounded-2xl border text-left transition ${
                  recurrenceType === 'recorrente_fixo'
                    ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Recorrente Fixo</span>
                  {recurrenceType === 'recorrente_fixo' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="text-[11px] text-gray-500 mt-1 font-medium">
                  Valor não muda (ex: Escola, Aluguel, Internet)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRecurrenceType('recorrente_variavel')}
                className={`p-3 rounded-2xl border text-left transition ${
                  recurrenceType === 'recorrente_variavel'
                    ? 'bg-teal-50/80 border-teal-500 text-teal-900 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Recorrente Variável</span>
                  {recurrenceType === 'recorrente_variavel' && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                </div>
                <div className="text-[11px] text-gray-500 mt-1 font-medium">
                  Todo mês, valor oscila (ex: Luz, Água, Cartão)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRecurrenceType('parcelado')}
                className={`p-3 rounded-2xl border text-left transition ${
                  recurrenceType === 'parcelado'
                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Crediário / Parcelado</span>
                  {recurrenceType === 'parcelado' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="text-[11px] text-gray-500 mt-1 font-medium">
                  Compra parcelada com número de parcelas
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRecurrenceType('unico')}
                className={`p-3 rounded-2xl border text-left transition ${
                  recurrenceType === 'unico'
                    ? 'bg-gray-900 border-gray-900 text-white shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Gasto Único / Pontual</span>
                  {recurrenceType === 'unico' && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div className={`text-[11px] mt-1 font-medium ${recurrenceType === 'unico' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Despesa apenas deste mês
                </div>
              </button>
            </div>
          </div>

          {/* Parcelamento inputs if parcelado */}
          {recurrenceType === 'parcelado' && (
            <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-950 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-indigo-600" />
                Informações da Parcela
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-600 font-bold mb-1">
                    Parcela Atual
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentInstallment}
                    onChange={(e) => setCurrentInstallment(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 font-bold mb-1">
                    Total de Parcelas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Status do Pagamento
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStatus('pendente')}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border transition ${
                  status === 'pendente'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                A Pagar / Pendente
              </button>
              <button
                type="button"
                onClick={() => setStatus('pago')}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border transition ${
                  status === 'pago'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Já Pago / Quitado
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Observações (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Código de barras, link do boleto, aviso de desconto"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition font-medium"
            />
          </div>

          {!editingBill && recurrenceType !== 'unico' && (
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-700 pt-1 font-medium">
              <input
                type="checkbox"
                checked={replicateRecurring}
                onChange={(e) => setReplicateRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-gray-900 focus:ring-gray-900/20"
              />
              <span>Criar previsão automática também para o próximo mês (Setembro)</span>
            </label>
          )}

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold rounded-2xl text-gray-600 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold rounded-2xl bg-[#111827] hover:bg-gray-800 text-white transition shadow-xs"
            >
              {editingBill ? 'Salvar Alterações' : 'Salvar Boleto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
