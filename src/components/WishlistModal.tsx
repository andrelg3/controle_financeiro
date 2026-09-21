import React, { useState, useEffect } from 'react';
import { WishlistItem, WishPriority } from '../types';
import { X, ShoppingBag, Tag, DollarSign, Calendar } from 'lucide-react';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<WishlistItem>) => void;
  editingItem?: WishlistItem | null;
  userId: string;
  activeMonth: string;
}

const CATEGORIES = ['Casa', 'Família', 'Trabalho', 'Transporte', 'Saúde', 'Pessoal', 'Lazer', 'Outros'];

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  userId,
  activeMonth,
}) => {
  const [title, setTitle] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [category, setCategory] = useState('Casa');
  const [priority, setPriority] = useState<WishPriority>('essencial');
  const [targetMonth, setTargetMonth] = useState('');
  const [linkOrNotes, setLinkOrNotes] = useState('');

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setEstimatedPrice(editingItem.estimatedPrice.toString());
      setCategory(editingItem.category);
      setPriority(editingItem.priority);
      setTargetMonth(editingItem.targetMonth || '');
      setLinkOrNotes(editingItem.linkOrNotes || '');
    } else {
      setTitle('');
      setEstimatedPrice('');
      setCategory('Casa');
      setPriority('essencial');
      setTargetMonth(activeMonth);
      setLinkOrNotes('');
    }
  }, [editingItem, isOpen, activeMonth]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(estimatedPrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Por favor, informe o valor estimado do item.');
      return;
    }
    if (!title.trim()) {
      alert('Por favor, informe o nome do item a comprar.');
      return;
    }

    onSave({
      id: editingItem ? editingItem.id : undefined,
      userId,
      title: title.trim(),
      estimatedPrice: priceNum,
      category,
      priority,
      status: editingItem ? editingItem.status : 'planejado',
      targetMonth: targetMonth || activeMonth,
      linkOrNotes: linkOrNotes.trim() || undefined,
      createdDate: editingItem ? editingItem.createdDate : new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-md w-full text-gray-900 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gray-100 rounded-2xl text-gray-800">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                {editingItem ? 'Editar Item' : 'Novo Item para Comprar'}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Planeje despesas e compras futuras com antecedência</p>
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
              O que você precisa comprar?
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Tênis novo para escola, Pneus do carro, Air Fryer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Preço Estimado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white font-mono font-bold"
              />
            </div>

            <div>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as WishPriority)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:bg-white transition font-medium"
              >
                <option value="urgente">🚨 Urgente (Segurança/Necessidade)</option>
                <option value="essencial">⭐ Essencial</option>
                <option value="desejo">🎁 Desejo / Sonho</option>
                <option value="planejado">📅 Planejado Futuro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Mês Previsto (YYYY-MM)
              </label>
              <input
                type="text"
                placeholder="Ex: 2026-09"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Notas, link ou detalhes do orçamento
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Orçamento feito na oficina, link do produto em promoção"
              value={linkOrNotes}
              onChange={(e) => setLinkOrNotes(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition resize-none font-medium"
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
              {editingItem ? 'Salvar Alterações' : 'Adicionar Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
