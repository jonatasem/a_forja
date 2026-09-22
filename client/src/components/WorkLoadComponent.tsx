import { useWorkLoad } from "../hooks/useWorkLoad";

interface WorkLoadComponentProps {
  barberId: string;
  serviceIds: string[];
  onSelectHour?: (hour: string) => void;
  selectedHour?: string;
}

export function WorkLoadComponent({
  barberId,
  serviceIds,
  onSelectHour,
  selectedHour,
}: WorkLoadComponentProps) {
  const { date, hours, loading, handleSearch } = useWorkLoad(
    barberId,
    serviceIds
  );

  return (
    <div className="rounded-2xl bg-[#121215] border border-amber-500/20 p-6 shadow-lg">
      <h3 className="text-lg font-bold font-serif text-white mb-4">
        Consultar Horários Disponíveis
      </h3>

      <div className="mb-4">
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
          Selecione a data:
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={serviceIds.length === 0}
          className="rounded-xl bg-[#09090b] border border-slate-800 px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
        />
        {serviceIds.length === 0 && (
          <p className="text-[11px] text-amber-500/80 mt-1">
            Selecione ao menos um serviço para buscar a data.
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-amber-500 animate-pulse">
          Buscando horários livres...
        </p>
      ) : hours.length === 0 && date ? (
        <p className="text-sm text-slate-400">
          Nenhum horário disponível para esta data.
        </p>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {hours.map((hour) => {
            const isSelected = selectedHour === hour;
            return (
              <button
                key={hour}
                type="button"
                onClick={() => onSelectHour && onSelectHour(hour)}
                className={`rounded-lg py-2 text-xs font-semibold border transition-all ${
                  isSelected
                    ? "bg-amber-600 border-amber-500 text-white shadow-lg"
                    : "bg-[#09090b] border-slate-800 text-amber-500 hover:border-amber-500"
                }`}
              >
                {hour}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}