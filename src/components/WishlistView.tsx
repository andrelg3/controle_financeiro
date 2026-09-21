import React, { useState } from 'react';
import { WishlistItem, WishPriority, WishStatus } from '../types';
import { formatCurrency, getShortMonthLabel } from '../utils/formatters';
import { 
  ShoppingBag, 
  Plus, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Sparkles, 
  Calendar, 
  Edit2, 
  Trash2, 
  ArrowRightCircle,
  Tag
} from 'lucide-react';

interface WishlistViewProps {
  wishlist: WishlistItem[];
  onOpenAddWish: () => void;
  onEditWish: (item: WishlistItem) => void;
  onDeleteWish: (id: string) => void;
  onToggleStatus: (id: string, status: WishStatus) => void;
  onBuyAndLaunchAsBill: (item: WishlistItem) => void;
  activeMonth: string;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlist,
  onOpenAddWish,
  onEditWish,
  onDeleteWish,
  onToggleStatus,
  onBuyAndLaunchAsBill,
  activeMonth,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('todos');

  const filteredItems = wishlist.filter((item) => {
    if (filterPriority === 'todos') return true;
    if (filterPriority === 'comprado') return item.status === 'comprado';
    if (filterPriority === 'pendentes') return item.status !== 'comprado';
    return item.priority === filterPriority;
  });

  const totalPlanned = wishlist
    .filter((i) => i.status !== 'comprado')
    .reduce((acc, curr) => acc + curr.estimatedPrice, 0);

  const urgentTotal = wishlist
    .filter((i) => (i.priority === 'urgente' || i.priority === 'essencial') && i.status !== 'comprado')
    .reduce((acc, curr) => acc + curr.estimatedPrice, 0);

  const getPriorityBadge = (priority: WishPriority) => {
    switch (priority) {
      case 'urgente':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold uppercase flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            Urgente
          </span>
        );
      case 'essencial':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            Essencial
          </span>
        );
      case 'desejo':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-bold uppercase">
            Desejo
          </span>
        );
      case 'planejado':
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-bold uppercase">
            Planejado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Bento Metric Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Total Planejado para Compras
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#111827] mt-1 tracking-tight">
              {formatCurrency(totalPlanned)}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium">
              {wishlist.filter((i) => i.status !== 'comprado').length} itens pendentes de aquisição
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-100 text-gray-800">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#111827] text-white rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Necessidades Urgentes & Essenciais
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-1 tracking-tight">
              {formatCurrency(urgentTotal)}
            </div>
            <div className="text-xs text-gray-300 mt-1 font-medium">
              Itens que afetam o dia a dia e segurança
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/10 text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Wishlist Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Lista de Coisas que Preciso Comprar
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 font-bold">
                {wishlist.length} itens
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Planejamento de compras futuras, bens duráveis, manutenções e desejos com estimativa de custo.
            </p>
          </div>

          <button
            id="btn-add-wish"
            onClick={onOpenAddWish}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#111827] hover:bg-gray-800 text-white font-bold text-xs sm:text-sm transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Item</span>
          </button>
        </div>

        {/* Filters */}
        <div className="py-3 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          {[
            { id: 'todos', label: 'Todos os Itens' },
            { id: 'pendentes', label: 'Pendentes' },
            { id: 'urgente', label: '🚨 Urgentes' },
            { id: 'essencial', label: '⭐ Essenciais' },
            { id: 'desejo', label: '🎁 Desejos' },
            { id: 'comprado', label: 'Já Comprados' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterPriority(chip.id)}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap text-xs font-bold ${
                filterPriority === chip.id
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* List of items */}
        <div className="space-y-2.5 mt-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs font-medium">
              <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              Nenhum item encontrado nesta categoria.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isBought = item.status === 'comprado';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border transition ${
                    isBought 
                      ? 'bg-gray-50 border-gray-200 opacity-75' 
                      : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => onToggleStatus(item.id, isBought ? 'planejado' : 'comprado')}
                      className="mt-0.5 sm:mt-0 transition shrink-0"
                      title={isBought ? 'Marcar como não comprado' : 'Marcar como comprado'}
                    >
                      {isBought ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 hover:text-emerald-500" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={`text-sm font-bold truncate ${
                            isBought ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}
                        >
                          {item.title}
                        </p>
                        {getPriorityBadge(item.priority)}
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-bold uppercase">
                          {item.category}
                        </span>
                        {item.targetMonth && (
                          <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            Previsto: {getShortMonthLabel(item.targetMonth)}
                          </span>
                        )}
                      </div>

                      {item.linkOrNotes && (
                        <p className="text-xs text-gray-500 mt-1 italic font-medium">
                          "{item.linkOrNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-8 sm:pl-0">
                    <span
                      className={`text-sm sm:text-base font-bold font-mono ${
                        isBought ? 'text-gray-400 line-through' : 'text-[#111827]'
                      }`}
                    >
                      {formatCurrency(item.estimatedPrice)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {!isBought && (
                        <button
                          onClick={() => onBuyAndLaunchAsBill(item)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-xs"
                          title="Lançar como boleto/despesa no mês atual"
                        >
                          <ArrowRightCircle className="w-3.5 h-3.5" />
                          <span>Lançar no Mês</span>
                        </button>
                      )}

                      <button
                        onClick={() => onEditWish(item)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteWish(item.id)}
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
