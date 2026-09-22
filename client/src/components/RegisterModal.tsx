import { useState } from "react";
import { api } from "../services/api";
import { AxiosError } from "axios";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  function handleClose() {
    setName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setError(null);
    setSuccess(false);
    onClose();
  }

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
        await api.post("/users", {
            name,
            phone,
            email,
            password,
        });

        setSuccess(true);
        } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        setError(
            error.response?.data?.message || "Erro ao cadastrar usuário. Tente novamente."
        );
        } finally {
        setLoading(false);
        }
    }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#121215] border border-amber-500/20 shadow-2xl text-white p-6 sm:p-8 flex flex-col">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <h2 className="text-lg font-serif font-bold tracking-wide text-zinc-100">
            Criar Conta
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Estado de Sucesso */}
        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center text-2xl font-bold mx-auto shadow-lg shadow-emerald-950/20">
              ✓
            </div>
            <h3 className="text-base font-bold text-white">
              Conta criada com sucesso!
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Agora você já pode fazer login utilizando seu telefone e senha.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 px-8 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Ir para o Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90 mb-1.5">
                Nome Completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome"
                className="w-full rounded-xl bg-[#09090b] border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90 mb-1.5">
                Telefone (WhatsApp)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="(00) 00000-0000"
                className="w-full rounded-xl bg-[#09090b] border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90 mb-1.5">
                E-mail (opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full rounded-xl bg-[#09090b] border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500/90 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl bg-[#09090b] border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-900/30 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 transition-all"
              >
                {loading ? "Cadastrando..." : "Confirmar Cadastro"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}