import { useServices } from "../hooks/useServices";

/**
 * Componente/Página responsável por listar os serviços oferecidos pela barbearia.
 */
export function GetServices() {
  const { services, loading, error, refetch } = useServices();

  /**
   * Função auxiliar para formatar o valor em Reais (R$)
   */
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-bold font-serif text-white mb-6">
        Nossos Serviços
      </h2>

      {/* 1. Estado de Carregamento */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-amber-500 animate-pulse font-medium">
            Carregando serviços...
          </p>
        </div>
      ) : 

      /* 2. Estado de Erro */
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

      /* 3. Caso não haja serviços cadastrados */
      services.length === 0 ? (
        <p className="text-sm text-slate-400">
          Nenhum serviço disponível no momento.
        </p>
      ) : (

      /* 4. Lista de Serviços */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl bg-[#121215] border border-amber-500/20 p-5 shadow-md flex flex-col justify-between hover:border-amber-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">
                    {service.name}
                  </h3>
                  <span className="text-base font-extrabold text-amber-500">
                    {formatCurrency(service.price)}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                  {service.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-auto">
                <span className="text-xs text-slate-400">Duração estimada:</span>
                <span className="text-xs font-semibold text-slate-200">
                  {service.duration} min
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}