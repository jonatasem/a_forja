import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { RegisterModal } from "../components/RegisterModal";
import { ResetPasswordModal } from "../components/ResetPasswordModal";
import logoImg from "../assets/logo.png";

export function LoginPage() {
  const {
    phone,
    setPhone,
    password,
    setPassword,
    loading,
    error,
    handleSubmit
  } = useLogin();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  function handleForgotPassword() {
    setIsResetPasswordOpen(true);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#09090b] p-4 sm:p-6 overflow-hidden">
      
      {/* Efeitos de luz no fundo */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-700/10 blur-3xl pointer-events-none" />

      {/* Card Principal */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#121215] border border-amber-500/20 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 backdrop-blur-md">
        
        {/* COLUNA DA ESQUERDA */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-[#18181c] to-[#0d0d0f] border-r border-amber-500/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-amber-500/5 blur-2xl pointer-events-none" />
          
          <div className="relative z-10 my-auto text-center flex flex-col items-center">
            <img 
              src={logoImg} 
              alt="Corvelloni A Forja" 
              className="w-56 h-auto object-contain drop-shadow-[0_4px_25px_rgba(217,119,6,0.3)] mb-6 transition-transform hover:scale-105" 
            />
            <p className="text-zinc-400 text-sm max-w-xs leading-relaxed font-light">
              Agende seus horários e gerencie seus atendimentos com facilidade e precisão.
            </p>
          </div>

          <div className="relative z-10 text-center border-t border-zinc-800/80 pt-6">
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold">
              Identidade Masculina • A Forja
            </p>
          </div>
        </div>

          {/* Card Mobile */}
        <div className="p-5 sm:p-10 flex flex-col justify-center">
          
          <div className="md:hidden mb-6 flex flex-col items-center text-center">
            <img 
              src={logoImg} 
              alt="Corvelloni A Forja" 
              className="w-30 object-contain drop-shadow-[0_4px_20px_rgba(217,119,6,0.2)]" 
            />
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-bold text-white tracking-wide">Acessar Conta</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Informe suas credenciais para entrar na plataforma
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90 mb-1.5">
                Telefone
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="(00) 00000-0000"
                className="w-full rounded-xl bg-[#09090b] border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-amber-400/80 hover:text-amber-300 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl bg-[#09090b] border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-950/40 hover:from-amber-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Entrando..." : "Acessar Sistema"}
            </button>
          </form>

          <div className="my-4 flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-zinc-800/80" />
            <span className="text-[10px] uppercase text-zinc-500 tracking-wider">ou</span>
            <div className="h-px flex-1 bg-zinc-800/80" />
          </div>

          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="w-full rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs font-bold uppercase tracking-wider text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all"
          >
            Criar nova conta
          </button>

          <div className="mt-8 text-center md:hidden">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
              Corvelloni • A Forja © {new Date().getFullYear()}
            </p>
          </div>

        </div>

      </div>

      {/* Modais */}
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
      />

      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
      />
    </div>
  );
}