import { useState, useMemo, useEffect } from "react";
import { useBarber } from "../hooks/useBarber";
import { useServices } from "../hooks/useServices";
import { useAvailableHours } from "../hooks/useAvailableHours";
import { useAppointment } from "../hooks/useAppointment";

interface NewAppointmentProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  barberId?: string;
}

function generateNextDays(daysCount = 21) {
  const days = [];
  const today = new Date();
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const dayNum = String(d.getDate()).padStart(2, "0");

    days.push({
      isoDate: `${year}-${month}-${dayNum}`,
      dayNum,
      weekDayLabel: weekDays[d.getDay()],
      monthLabel: months[d.getMonth()],
    });
  }
  return days;
}

export function NewAppointment({ isOpen, onClose, onSuccess, barberId }: NewAppointmentProps) {
  const { barbers } = useBarber();
  const FIXED_BARBER_ID = barberId || barbers[0]?.id || "";

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");

  const nextDays = useMemo(() => generateNextDays(30), []);
  const { services } = useServices();

  // Passa o array completo selectedServiceIds em vez de apenas o primeiro ID
  const { date, hours, loading: loadingHours, handleSearch } = useAvailableHours(
    FIXED_BARBER_ID,
    selectedServiceIds
  );

  const { createAppointment, loading, error, success, resetState } = useAppointment();

  // Recarrega os horários disponíveis sempre que a lista de serviços alterar e já houver uma data selecionada
  useEffect(() => {
    if (date && selectedServiceIds.length > 0) {
      handleSearch(date);
    }
  }, [selectedServiceIds, date, handleSearch]);

  if (!isOpen) return null;

  function handleClose() {
    resetState();
    setSelectedServiceIds([]);
    setSelectedTime("");
    onClose();
  }

  function toggleService(id: string) {
    setSelectedTime("");
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  const selectedServicesList = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalDuration = selectedServicesList.reduce((acc, s) => acc + Number(s.duration), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!FIXED_BARBER_ID || selectedServiceIds.length === 0 || !date || !selectedTime) {
      return;
    }

    const fullDateTime = `${date}T${selectedTime}:00`;

    const isSuccess = await createAppointment({
      barberId: FIXED_BARBER_ID,
      serviceIds: selectedServiceIds,
      date: fullDateTime,
    });

    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#121215] border border-amber-500/20 p-6 shadow-2xl text-white max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h2 className="text-xl font-serif font-bold tracking-wide">Novo Agendamento</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-white text-lg font-bold">
            ✕
          </button>
        </div>

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-sm font-semibold space-y-4 my-auto">
            <p>Agendamento realizado com sucesso!</p>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 pr-1 scrollbar-thin">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* SELEÇÃO DE SERVIÇOS */}
            <div>
              <label className="block text-xs uppercase text-slate-400 tracking-wider mb-2">
                1. Selecione os Serviços ({selectedServiceIds.length})
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {services.map((s) => {
                  const isChecked = selectedServiceIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleService(s.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-amber-600/10 border-amber-500 text-white"
                          : "bg-[#09090b] border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">{s.name}</p>
                        <p className="text-[11px] text-slate-400">{s.duration} min</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-amber-500">R$ {s.price}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARROSSEL DE DATAS */}
            <div>
              <label className="block text-xs uppercase text-slate-400 tracking-wider mb-2">
                2. Escolha a Data
              </label>
              {selectedServiceIds.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Selecione ao menos um serviço para ver as datas.
                </p>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {nextDays.map((item) => {
                    const isSelected = date === item.isoDate;
                    return (
                      <button
                        type="button"
                        key={item.isoDate}
                        onClick={() => {
                          setSelectedTime("");
                          handleSearch(item.isoDate);
                        }}
                        className={`flex flex-col items-center justify-center min-w-[65px] py-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/30 scale-105"
                            : "bg-[#09090b] border-slate-800 text-slate-300 hover:border-amber-500/50"
                        }`}
                      >
                        <span className="text-[10px] capitalize opacity-80">{item.weekDayLabel}</span>
                        <span className="text-sm font-bold my-0.5">{item.dayNum}</span>
                        <span className="text-[9px] opacity-70">{item.monthLabel}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SELEÇÃO DE HORÁRIO */}
            {date && selectedServiceIds.length > 0 && (
              <div>
                <label className="block text-xs uppercase text-slate-400 tracking-wider mb-2">
                  3. Selecione o Horário
                </label>
                {loadingHours ? (
                  <p className="text-xs text-amber-500 animate-pulse py-2">Buscando horários...</p>
                ) : hours.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">Nenhum horário livre para este dia.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                    {hours.map((hour) => (
                      <button
                        type="button"
                        key={hour}
                        onClick={() => setSelectedTime(hour)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          selectedTime === hour
                            ? "bg-amber-600 border-amber-500 text-white"
                            : "bg-[#09090b] border-slate-800 text-amber-500 hover:border-amber-500"
                        }`}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* RODAPÉ E AÇÕES */}
            <div className="border-t border-slate-800 pt-4 mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Tempo total: <strong className="text-white">{totalDuration} min</strong>
                </span>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedTime || selectedServiceIds.length === 0}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-900/30 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50"
                >
                  {loading ? "Agendando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}