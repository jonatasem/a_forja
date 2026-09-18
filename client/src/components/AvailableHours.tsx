import { useAvailableHours } from "../hooks/useAvailableHours";

// Tipagem da prop recebida pelo componente
interface AvailableHoursProps {
  barberId: string;
  serviceId: string;
}

export function AvailableHours({ barberId, serviceId }: AvailableHoursProps) {

  const { date, hours, loading, handleSearch } = useAvailableHours(barberId, serviceId);

  return (
    <div className="rounded-2xl bg-[#121215] border border-amber-500/20 p-6 shadow-lg">
      <h3 className="text-lg font-bold font-serif text-white mb-4">Consultar Horários</h3>
      
      <div className="mb-4">
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
          Selecione a data:
        </label>
        <input 
          type="date"
          value={date}
          onChange={(e) => handleSearch(e.target.value)}
          className="rounded-xl bg-[#09090b] border border-slate-800 px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
        />
      </div>

      {loading ? (
        <p className="text-sm text-amber-500 animate-pulse">Buscando horários...</p>
      ) : hours.length === 0 && date ? (
        <p className="text-sm text-slate-400">Nenhum horário disponível para esta data.</p>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {hours.map((hour) => (
            <button
              key={hour}
              className="rounded-lg bg-[#09090b] border border-slate-800 py-2 text-xs font-semibold text-amber-500 hover:border-amber-500 transition-all"
            >
              {hour}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}