import { useState, useMemo, useEffect } from "react";
import { useBarber } from "../hooks/useBarber";
import { useServices } from "../hooks/useServices";
import { useWorkLoad } from "../hooks/useWorkLoad";
import { useAppointments } from "../hooks/useAppointment";
import type { ServiceItem, UserSummary } from "../services/appointmentService";

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
  const { barbers = [] } = useBarber();
  const barbersList = barbers as unknown as UserSummary[];

  const firstBarber = barbersList[0];
  const FIXED_BARBER_ID = barberId || firstBarber?.id || "";

  // Obtém o barbeiro selecionado para apresentar o nome na mensagem
  const selectedBarber = barbersList.find((b) => b.id === FIXED_BARBER_ID);
  const barberName = selectedBarber?.name || "O barbeiro";

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");

  const nextDays = useMemo(() => generateNextDays(30), []);
  const { services = [] } = useServices();
  const servicesList = services as ServiceItem[];

  const { date, hours = [], loading: loadingHours, handleSearch } = useWorkLoad(
    FIXED_BARBER_ID,
    selectedServiceIds
  );

  const { createAppointment, loading, error, success, resetState } = useAppointments();

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

  const selectedServicesList = servicesList.filter((s) =>
    selectedServiceIds.includes(s.id)
  );

  const totalDuration = selectedServicesList.reduce(
    (acc, s) => acc + Number(s.duration || 0),
    0
  );

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#121215] border border-amber-500/20 shadow-2xl text-white flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4">
          <h2 className="text-xl font-serif font-bold tracking-wide text-zinc-100">
            Novo Agendamento
          </h2>
          <button 
            type="button"
            onClick={handleClose} 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            ✕
          </button>
        </div>

        {/* TELA DE SUCESSO REESTRUTURADA */}
        {success ? (
          <div className="p-8 text-center space-y-5 my-auto flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-950/20">
              ✓
            </div>
            <div className="space-y-2 max-w-xs">
              <h3 className="text-lg font-serif font-bold text-white tracking-wide">
                {barberName} foi notificado!
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Aguarde a confirmação via WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-2 px-8 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10"
            >
              Concluir
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            {/* 1. SELEÇÃO DE SERVIÇOS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
                  1. Selecione os Serviços
                </label>
                {selectedServiceIds.length > 0 && (
                  <span className="text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                    {selectedServiceIds.length} selecionado(s)
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {servicesList.map((s) => {
                  const isChecked = selectedServiceIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleService(s.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-amber-500/10 border-amber-500/60 text-white shadow-lg shadow-amber-950/20"
                          : "bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-zinc-100">{s.name}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{s.duration} min</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-amber-400">R$ {s.price}</span>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-amber-500 border-amber-400 text-zinc-950 font-bold text-xs"
                              : "border-zinc-700 bg-zinc-800"
                          }`}
                        >
                          {isChecked && "✓"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. CARROSSEL DE DATAS */}
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-3">
                2. Escolha a Data
              </label>
              {selectedServiceIds.length === 0 ? (
                <p className="text-xs text-zinc-500 italic bg-zinc-900/40 border border-zinc-800/50 p-3 rounded-xl text-center">
                  Selecione ao menos um serviço para visualizar os dias disponíveis.
                </p>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2">
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
                        className={`flex flex-col items-center justify-center min-w-[62px] py-2.5 px-2 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? "bg-amber-500 border-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-500/20"
                            : "bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-amber-500/40 hover:bg-zinc-900"
                        }`}
                      >
                        <span className={`text-[10px] uppercase ${isSelected ? "text-zinc-950 font-semibold" : "text-zinc-400"}`}>
                          {item.weekDayLabel}
                        </span>
                        <span className="text-base font-extrabold my-0.5">{item.dayNum}</span>
                        <span className={`text-[9px] uppercase ${isSelected ? "text-zinc-900 font-semibold" : "text-zinc-500"}`}>
                          {item.monthLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. SELEÇÃO DE HORÁRIO */}
            {date && selectedServiceIds.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-3">
                  3. Selecione o Horário
                </label>
                {loadingHours ? (
                  <div className="flex items-center justify-center py-6">
                    <p className="text-xs text-amber-400 animate-pulse font-medium">Buscando horários disponíveis...</p>
                  </div>
                ) : hours.length === 0 ? (
                  <p className="text-xs text-zinc-400 bg-zinc-900/40 border border-zinc-800/50 p-3 rounded-xl text-center">
                    Nenhum horário disponível para este dia.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2.5 max-h-40 overflow-y-auto pr-1">
                    {hours.map((hour: string) => {
                      const isSelected = selectedTime === hour;
                      return (
                        <button
                          type="button"
                          key={hour}
                          onClick={() => setSelectedTime(hour)}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? "bg-amber-500 border-amber-400 text-zinc-950 shadow-md shadow-amber-500/20"
                              : "bg-zinc-900/60 border-zinc-800/80 text-amber-400 hover:border-amber-500/40 hover:bg-zinc-900"
                          }`}
                        >
                          {hour}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* RODAPÉ E AÇÕES */}
            <div className="border-t border-zinc-800/80 pt-4 mt-6 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-zinc-400 uppercase tracking-wider">Duração total</p>
                <p className="text-sm font-bold text-white">{totalDuration} min</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedTime || selectedServiceIds.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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