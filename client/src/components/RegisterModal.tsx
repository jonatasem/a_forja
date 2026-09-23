import React, { useState } from 'react';
import { useCreateUser } from '../hooks/useCreateUser';
import { X } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;       // Controla se o modal deve ser exibido
  onClose: () => void;   // Callback executado ao fechar o modal
  onSuccess?: () => void;// Callback opcional após criação com sucesso
}

export const RegisterModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Desestrutura do hook as funções e estados necessários
  const { handleCreateUser, loading, error, resetState } = useCreateUser();

  // Estado local para controle dos campos do formulário
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  // Se o modal estiver fechado, não renderiza nada na árvore de componentes
  if (!isOpen) return null;

  /**
   * Atualiza dinamicamente a chave do estado correspondente ao campo alterado
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Reseta os campos e erros, e aciona a propriedade onClose
   */
  const handleClose = () => {
    resetState();
    setFormData({ name: '', phone: '', email: '', password: '' });
    onClose();
  };

  /**
   * Submete o formulário, aciona a API e gerencia o encerramento do modal
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Chama o hook para enviar os dados à rota POST /user
    const user = await handleCreateUser(formData);

    // Se o retorno for um objeto válido (sucesso), executa callbacks de finalização
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

        {/* Exibição condicional de mensagem de erro retornado pela API */}
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
