import React, { useState, useEffect } from 'react';
import { Debt, DebtStatus, DebtPriority } from '../types';
import { X, AlertTriangle, FileText, Phone, DollarSign, CheckCircle } from 'lucide-react';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debt: Partial<Debt>) => void;
  editingDebt?: Debt | null;
  userId: string;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingDebt,
  userId,
}) => {
  const [creditor, setCreditor] = useState('');
  const [description, setDescription] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [negotiatedAmount, setNegotiatedAmount] = useState('');
  const [initialDueDate, setInitialDueDate] = useState('');
  const [status, setStatus] = useState<DebtStatus>('pendente_contato');
  const [priority, setPriority] = useState<DebtPriority>('media');
  const [contactInfo, setContactInfo] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingDebt) {
      setCreditor(editingDebt.creditor);
      setDescription(editingDebt.description);
      setOriginalAmount(editingDebt.originalAmount.toString());
      setCurrentAmount(editingDebt.currentAmount ? editingDebt.currentAmount.toString() : editingDebt.originalAmount.toString());
      setNegotiatedAmount(editingDebt.negotiatedAmount ? editingDebt.negotiatedAmount.toString() : '');
      setInitialDueDate(editingDebt.initialDueDate || '');
      setStatus(editingDebt.status);
      setPriority(editingDebt.priority);
      setContactInfo(editingDebt.contactInfo || '');
      setNotes(editingDebt.notes || '');
    } else {
      setCreditor('');
      setDescription('');
      setOriginalAmount('');
      setCurrentAmount('');
      setNegotiatedAmount('');
      setInitialDueDate('');
      setStatus('pendente_contato');
      setPriority('media');
      setContactInfo('');
      setNotes('');
    }
  }, [editingDebt, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const origNum = parseFloat(originalAmount.replace(',', '.'));
    if (isNaN(origNum) || origNum <= 0) {
      alert('Por favor, informe o valor original da dívida.');
      return;
    }
    if (!creditor.trim()) {
      alert('Por favor, informe o credor ou instituição.');
      return;
    }

    const currNum = currentAmount ? parseFloat(currentAmount.replace(',', '.')) : origNum;
    const negNum = negotiatedAmount ? parseFloat(negotiatedAmount.replace(',', '.')) : undefined;

    onSave({
      id: editingDebt ? editingDebt.id : undefined,
      userId,
      creditor: creditor.trim(),
      description: description.trim(),
      originalAmount: origNum,
      currentAmount: isNaN(currNum) ? origNum : currNum,
      negotiatedAmount: negNum && !isNaN(negNum) ? negNum : undefined,
      initialDueDate: initialDueDate || new Date().toISOString().split('T')[0],
      status,
      priority,
      contactInfo: contactInfo.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-lg w-full text-gray-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                {editingDebt ? 'Editar Dívida / Negociação' : 'Registrar Dívida para Negociar'}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Gerencie credores, propostas e histórico de acordos</p>
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
              Credor / Instituição Financeira
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Banco Santander, Cartão Nubank, Loja de Construção"
              value={creditor}
              onChange={(e) => setCreditor(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Origem / Descrição da Conta Vencida
            </label>
            <input
              type="text"
              placeholder="Ex: Fatura atrasada de 2025, cheque especial, nota promissória"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Valor Original (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:bg-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Valor Atual c/ Juros
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 4850,00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:bg-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
                Valor Negociado / Acordo
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 1800,00"
                value={negotiatedAmount}
                onChange={(e) => setNegotiatedAmount(e.target.value)}
                className="w-full bg-emerald-50 border border-emerald-300 rounded-2xl px-3.5 py-2.5 text-sm text-emerald-950 focus:outline-none focus:border-emerald-600 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Status da Negociação
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DebtStatus)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:bg-white transition font-medium"
              >
                <option value="pendente_contato">Pendente de Contato</option>
                <option value="em_negociacao">Em Negociação / Proposta</option>
                <option value="acordo_fechado">Acordo Fechado</option>
                <option value="quitado">Quitado / Liquidado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Prioridade de Acordo
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as DebtPriority)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:bg-white transition font-medium"
              >
                <option value="alta">Alta (Urgente / Restrição)</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Contato do Credor / Canal de Negociação
            </label>
            <input
              type="text"
              placeholder="Ex: 0800 do banco, WhatsApp do gerente, Serasa Limpa Nome, Protocolo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Estratégia & Anotações
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Propor pagamento à vista com 60% de desconto no 13º salário."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition resize-none font-medium"
            />
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
              {editingDebt ? 'Salvar Alterações' : 'Salvar Dívida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
