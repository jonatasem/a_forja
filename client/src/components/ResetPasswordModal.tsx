import React, { useState } from 'react';
import { useResetPassword } from '../hooks/useResetPassword';
import { X, KeyRound, Mail, Lock, ArrowLeft } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    step,
    setStep,
    token,
    loading,
    error,
    successMessage,
    handleForgotPassword,
    handleResetPassword,
    resetState,
  } = useResetPassword();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [inputToken, setInputToken] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    resetState();
    setEmail('');
    setNewPassword('');
    setInputToken('');
    onClose();
  };

  const onRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleForgotPassword({ email });
  };

  const onResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalToken = token || inputToken;

    if (!finalToken) return;

    const isSuccess = await handleResetPassword({
      token: finalToken,
      newPassword,
    });

    if (isSuccess) {
      setTimeout(() => {
        handleClose();
      }, 2000);
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
        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              {step === 'request' ? 'Recuperar Senha' : 'Criar Nova Senha'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {step === 'request'
                ? 'Solicite o token de verificação'
                : 'Insira o token e a sua nova senha'}
            </p>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 text-center font-medium">
            {error}
          </div>
        )}

        {/* Mensagem de Sucesso */}
        {successMessage && (
          <div className="mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-400 text-center font-medium">
            {successMessage}
          </div>
        )}

        {/* ETAPA 1: Solicitar Token */}
        {step === 'request' ? (
          <form onSubmit={onRequestSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90 mb-1.5">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-xl bg-[#09090b] border border-zinc-800 px-4 py-3 pl-10 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

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
                {loading ? 'Enviando...' : 'Gerar Token'}
              </button>
            </div>
          </form>
        ) : (
          /* ETAPA 2: Redefinir Senha */
          <form onSubmit={onResetSubmit} className="space-y-4">
            {!token && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90 mb-1.5">
                  Token de Recuperação
                </label>
                <input
                  type="text"
                  required
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="Cole o token recebido aqui"
                  className="w-full rounded-xl bg-[#09090b] border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90 mb-1.5">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl bg-[#09090b] border border-zinc-800 px-4 py-3 pl-10 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="w-1/3 flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-2/3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-950/40 hover:from-amber-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Redefinindo...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
