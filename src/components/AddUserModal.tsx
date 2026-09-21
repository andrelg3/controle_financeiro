import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, UserPlus, Sparkles } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: UserProfile) => void;
}

const AVATAR_COLORS = [
  'emerald',
  'indigo',
  'purple',
  'sky',
  'rose',
  'amber',
  'teal',
  'blue',
];

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onAddUser,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('indigo');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome do usuário.');
      return;
    }

    const newUser: UserProfile = {
      id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString().slice(-4),
      name: name.trim(),
      color,
      avatarLetter: name.trim().charAt(0).toUpperCase(),
      role: 'Usuário',
    };

    onAddUser(newUser);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-sm w-full text-gray-900 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gray-100 rounded-2xl text-gray-800">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Novo Usuário
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Adicione um perfil familiar</p>
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
              Nome do Usuário / Familiar
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Carlos, Maria, João"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition"
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
              Criar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
