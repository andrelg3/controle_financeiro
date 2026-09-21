import React, { useState, useEffect } from 'react';
import { Income, IncomeType } from '../types';
import { X, DollarSign, Calendar, Tag } from 'lucide-react';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (income: Partial<Income>) => void;
  editingIncome?: Income | null;
  activeMonth: string;
  userId: string;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingIncome,
  activeMonth,
  userId,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<IncomeType>('fixa');
  const [receiveDay, setReceiveDay] = useState('5');
  const [received, setReceived] = useState(false);

  useEffect(() => {
    if (editingIncome) {
      setDescription(editingIncome.description);
      setAmount(editingIncome.amount.toString());
      setType(editingIncome.type);
      setReceiveDay(editingIncome.receiveDay ? editingIncome.receiveDay.toString() : '5');
      setReceived(editingIncome.received);
    } else {
      setDescription('');
      setAmount('');
      setType('fixa');
      setReceiveDay('5');
      setReceived(false);
    }
  }, [editingIncome, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor, informe um valor válido para a renda.');
      return;
    }
    if (!description.trim()) {
      alert('Por favor, informe a descrição da renda.');
      return;
    }

    onSave({
      id: editingIncome ? editingIncome.id : undefined,
      userId,
      description: description.trim(),
      amount: numAmount,
      type,
      monthYear: editingIncome ? editingIncome.monthYear : activeMonth,
      received,
      receiveDay: receiveDay ? parseInt(receiveDay, 10) : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-md w-full text-gray-900 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gray-100 rounded-2xl text-gray-800">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                {editingIncome ? 'Editar Renda' : 'Nova Renda Mensal'}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Informe os detalhes do provento</p>
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
              Descrição da Renda
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Salário Principal, Bico, Comissões, Freelance"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                Dia do Recebimento
              </label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 5"
                value={receiveDay}
                onChange={(e) => setReceiveDay(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Tipo de Renda
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setType('fixa')}
                className={`px-3.5 py-3 rounded-2xl border text-xs flex items-center justify-center gap-2 transition ${
                  type === 'fixa'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 font-medium'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                Renda Fixa
              </button>

              <button
                type="button"
                onClick={() => setType('variavel')}
                className={`px-3.5 py-3 rounded-2xl border text-xs flex items-center justify-center gap-2 transition ${
                  type === 'variavel'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 font-medium'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                Renda Variável
              </button>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-700 font-medium">
              <input
                type="checkbox"
                checked={received}
                onChange={(e) => setReceived(e.target.checked)}
                className="w-4 h-4 rounded text-gray-900 focus:ring-gray-900/20"
              />
              <span>Já foi creditada / recebida na conta</span>
            </label>
          </div>

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
              {editingIncome ? 'Salvar Alterações' : 'Adicionar Renda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
