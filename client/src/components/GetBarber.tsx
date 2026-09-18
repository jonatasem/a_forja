import { useBarber } from "../hooks/useBarber";

/**
 * Componente responsável por buscar e exibir os barbeiros cadastrados.
 */
export default function GetBarber() {
  // Consome os estados e métodos expostos pelo hook useBarber
  const { barbers, loading, error, refetch } = useBarber();

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-bold font-serif text-white mb-6">
        Nossa Equipe de Barbeiros
      </h2>

      {/* Estado de Carregamento (Loading) */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-amber-500 animate-pulse font-medium">
            Carregando barbeiros...
          </p>
        </div>
      ) : 

      /* Estado de Erro com opção de tentar novamente (refetch) */
      error ? (
        <div className="rounded-xl bg-red-950/40 border border-red-500/20 p-4 text-center">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      ) : 

      /* 3. Caso não exista nenhum barbeiro cadastrado */
      barbers.length === 0 ? (
        <p className="text-sm text-slate-400">
          Nenhum barbeiro disponível no momento.
        </p>
      ) : (

      /* Lista de Barbeiros */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="rounded-2xl bg-[#121215] border border-amber-500/20 p-5 shadow-md flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {barber.name}
                </h3>
                <p className="text-xs text-amber-500 font-medium tracking-wide uppercase mb-3">
                  {barber.role}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-2">
                <span className="text-xs text-slate-400">Status:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {barber.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}