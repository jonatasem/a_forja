import { useLogin } from "../hooks/useLogin";
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

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#09090b] px-4 overflow-hidden">
      
      {/* Efeito de luz sutil no fundo */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-700/10 blur-3xl pointer-events-none" />

      {/* Caixa principal do login */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#121215] p-8 sm:p-10 shadow-2xl border border-amber-500/20 backdrop-blur-md">
        
        {/* Cabeçalho com o Logotipo */}
        <div className="mb-6 flex flex-col items-center text-center">
          <img 
            src={logoImg} 
            alt="Corvelloni A Forja" 
            className="w-44 h-auto object-contain drop-shadow-[0_4px_20px_rgba(217,119,6,0.2)] mb-2" 
          />
          <p className="text-xs text-slate-400 tracking-wide">
            Entre com suas credenciais para acessar sua conta
          </p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 text-center font-medium">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90 mb-2">
              Telefone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="(00) 00000-0000"
              className="w-full rounded-xl bg-[#09090b] border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl bg-[#09090b] border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-900/30 hover:from-amber-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[#121215] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Entrando..." : "Acessar Sistema"}
          </button>
        </form>

        {/* Rodapé discreto */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-slate-600 uppercase tracking-widest">
            Corvelloni • A Forja © {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </div>
  );
}