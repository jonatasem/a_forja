import { useState } from "react";
import { useGetAppointments } from "../hooks/useGetAppointment";

// Tipo estrito com os status aceitos pela API do backend
type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED";

export default function AppointmentsPage() {
  // Estado tipado para aceitar apenas os status válidos ou string vazia
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | "">("");

  // Busca os agendamentos passando o filtro sem usar 'any'
  const { appointments, loading, error, refetch } = useGetAppointments(
    selectedStatus ? { status: selectedStatus } : undefined
  );

  /**
   * Converte a ISO String do campo "date" (DateTime do Prisma) em Data e Hora legíveis
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
   * Retorna o badge estilizado de acordo com o status do agendamento
   */
  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      CANCELED: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    const labels: Record<string, string> = {
      PENDING: "Pendente",
      CONFIRMED: "Confirmado",
      COMPLETED: "Concluído",
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

        {/* Filtro por Status tipado sem violação do ESLint */}
        <select
          value={selectedStatus}
          onChange={(e) => {
            const status = e.target.value as AppointmentStatus | "";
            setSelectedStatus(status);
            refetch(status ? { status } : {});
          }}
          className="rounded-xl bg-[#121215] border border-slate-800 px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">Todos os status</option>
          <option value="PENDING">Pendentes</option>
          <option value="CONFIRMED">Confirmados</option>
          <option value="COMPLETED">Concluídos</option>
          <option value="CANCELED">Cancelados</option>
        </select>
      </div>

      {/* Exibição dos estados: Loading, Erro, Lista Vazia ou Cards */}
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
            onClick={() => refetch()}
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
        /* Listagem em Grid Reativo */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((item) => {
            const { date, time } = formatDateAndTime(item.date);

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-[#121215] border border-amber-500/20 p-6 shadow-lg flex flex-col justify-between hover:border-amber-500/40 transition-all space-y-4"
              >
                {/* Nome do Serviço, Preço e Badge de Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {item.service?.name}
                    </h3>
                    <p className="text-xs text-amber-500 font-bold mt-0.5">
                      R$ {item.service?.price} • {item.service?.duration} min
                    </p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                {/* Dados das relações: Barbeiro e Cliente */}
                <div className="space-y-1.5 border-t border-slate-800/80 pt-3 text-xs">
                  <p className="text-slate-300">
                    <span className="text-slate-500">Barbeiro:</span>{" "}
                    <strong className="text-white">{item.barber?.name}</strong>
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-500">Cliente:</span>{" "}
                    <strong className="text-white">{item.client?.name}</strong>
                  </p>
                </div>

                {/* Data e Hora formatadas */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                  <span className="text-slate-400">📅 {date}</span>
                  <span className="font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    ⏰ {time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}