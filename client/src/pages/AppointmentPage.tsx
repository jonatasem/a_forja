import { useState, useEffect } from "react";
import { useAppointments } from "../hooks/useAppointment";
import { type AppointmentStatus } from "../services/appointmentService";

export default function AppointmentsPage() {
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | "">("");

  const {
    appointments,
    loading,
    error,
    fetchAppointments,
    cancelAppointment,
  } = useAppointments();

  // Busca inicial e re-busca quando o filtro muda
  useEffect(() => {
    fetchAppointments(selectedStatus ? { status: selectedStatus } : undefined);
  }, [selectedStatus, fetchAppointments]);

  /**
   * Converte a ISO String do campo "date" em Data e Hora legíveis
   */
  function formatDateAndTime(isoString: string) {
    const dateObj = new Date(isoString);

    const date = dateObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const time = dateObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { date, time };
  }

  /**
   * Retorna o badge estilizado de acordo com o status
   */
  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      FINISHED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      CANCELED: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    const labels: Record<string, string> = {
      PENDING: "Pendente",
      CONFIRMED: "Confirmado",
      COMPLETED: "Concluído",
      FINISHED: "Concluído",
      CANCELED: "Cancelado",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
          styles[status] || "bg-slate-800 text-slate-300 border-slate-700"
        }`}
      >
        {labels[status] || status}
      </span>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Cabeçalho e Filtro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">
            Meus Agendamentos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe o histórico e status dos seus atendimentos.
          </p>
        </div>

        {/* Filtro por Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as AppointmentStatus | "")}
          className="rounded-xl bg-[#121215] border border-slate-800 px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">Todos os status</option>
          <option value="PENDING">Pendentes</option>
          <option value="CONFIRMED">Confirmados</option>
          <option value="COMPLETED">Concluídos</option>
          <option value="CANCELED">Cancelados</option>
        </select>
      </div>

      {/* Exibição dos estados */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-sm text-amber-500 animate-pulse font-medium">
            Carregando agendamentos...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-950/40 border border-red-500/20 p-6 text-center">
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchAppointments(selectedStatus ? { status: selectedStatus } : undefined)}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl bg-[#121215] border border-slate-800 p-8 text-center">
          <p className="text-sm text-slate-400">
            Nenhum agendamento encontrado.
          </p>
        </div>
      ) : (
        /* Listagem em Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((item) => {
            const { date, time } = formatDateAndTime(item.date);

            // Suporte a múltiplos serviços
            const servicesList = item.services || [];
            const serviceNames = servicesList.map((s) => s.name).join(", ") || "Sem serviço";
            const totalPrice = servicesList.reduce((acc, s) => acc + Number(s.price || 0), 0);
            const totalDuration = servicesList.reduce((acc, s) => acc + Number(s.duration || 0), 0);

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-[#121215] border border-amber-500/20 p-6 shadow-lg flex flex-col justify-between hover:border-amber-500/40 transition-all space-y-4"
              >
                {/* Nome dos Serviços, Preço e Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {serviceNames}
                    </h3>
                    <p className="text-xs text-amber-500 font-bold mt-0.5">
                      R$ {totalPrice} • {totalDuration} min
                    </p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                {/* Barbeiro e Cliente */}
                <div className="space-y-1.5 border-t border-slate-800/80 pt-3 text-xs">
                  <p className="text-slate-300">
                    <span className="text-slate-500">Barbeiro:</span>{" "}
                    <strong className="text-white">{item.barber?.name || "Não atribuído"}</strong>
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-500">Cliente:</span>{" "}
                    <strong className="text-white">{item.client?.name || "Não identificado"}</strong>
                  </p>
                </div>

                {/* Data, Hora e Ação de Cancelamento */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                  <span className="text-slate-400">📅 {date}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      ⏰ {time}
                    </span>
                    {item.status === "PENDING" && (
                      <button
                        onClick={() => cancelAppointment(item.id)}
                        className="text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded bg-red-500/10 border border-red-500/20 transition-colors"
                        title="Cancelar Agendamento"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}