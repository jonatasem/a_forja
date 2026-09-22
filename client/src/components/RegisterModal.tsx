import React, { useState } from 'react';
import { useCreateUser } from '../hooks/useCreateService';
import { X } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegisterModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { handleCreateUser, loading, error, resetState } = useCreateUser();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    resetState();
    setFormData({ name: '', phone: '', email: '', password: '' });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = await handleCreateUser(formData);

    if (user) {
      if (onSuccess) onSuccess();
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* Container do Modal */}
      <div className="relative w-full max-w-md rounded-3xl bg-[#121215] border border-amber-500/20 shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Efeito de luz decorativo */}
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        {/* Botão de Fechar */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-wide">Criar Nova Conta</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Preencha os dados abaixo para se cadastrar
          </p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 text-center font-medium">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90 mb-1.5">
              Nome Completo
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Digite seu nome completo"
              className="w-full rounded-xl bg-[#09090b] border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90 mb-1.5">
              Telefone
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              className="w-full rounded-xl bg-[#09090b] border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90 mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              className="w-full rounded-xl bg-[#09090b] border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90 mb-1.5">
              Senha
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              placeholder="Crie uma senha (mín. 6 caracteres)"
              className="w-full rounded-xl bg-[#09090b] border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="w-1/3 rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-950/40 hover:from-amber-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};