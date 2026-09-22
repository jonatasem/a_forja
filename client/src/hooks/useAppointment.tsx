import { useState, useCallback } from "react";
import axios from "axios";
import {
  appointmentService,
  type Appointment,
  type GetAppointmentsFilters,
  type CreateAppointmentProps,
  type UpdateAppointmentStatusPayload,
} from "../services/appointmentService";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Helper para tratar erros do Axios de forma centralizada.
   */
  const handleError = (err: unknown, defaultMessage: string) => {
    let message = defaultMessage;
    if (axios.isAxiosError(err)) {
      message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        message;
    }
    setError(message);
    setSuccess(false);
    return message;
  };

  /**
   * Reseta os estados de feedback (erro e sucesso).
   */
  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  /**
   * Busca os agendamentos no backend.
   */
  const fetchAppointments = useCallback(
    async (filters?: GetAppointmentsFilters) => {
      try {
        setLoading(true);
        setError(null);

        const data = await appointmentService.getAll(filters);
        setAppointments(data);
        return data;
      } catch (err: unknown) {
        handleError(err, "Não foi possível carregar os agendamentos.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cria um novo agendamento.
   */
  const createAppointment = useCallback(
    async (payload: CreateAppointmentProps): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        await appointmentService.create(payload);

        setSuccess(true);
        return true;
      } catch (err: unknown) {
        handleError(err, "Não foi possível realizar o agendamento.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Atualiza o status de um agendamento.
   */
  const updateAppointmentStatus = useCallback(
    async (payload: UpdateAppointmentStatusPayload): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        const updated = await appointmentService.updateStatus(payload);

        // Atualiza a lista local mantendo o estado sincronizado sem precisar recarregar a API
        setAppointments((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );

        setSuccess(true);
        return true;
      } catch (err: unknown) {
        handleError(err, "Não foi possível atualizar o status do agendamento.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cancela um agendamento existente.
   */
  const cancelAppointment = useCallback(
    async (appointmentId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        await appointmentService.cancel(appointmentId);

        // Remove o agendamento cancelado da lista local
        setAppointments((prev) => prev.filter((item) => item.id !== appointmentId));

        setSuccess(true);
        return true;
      } catch (err: unknown) {
        handleError(err, "Não foi possível cancelar o agendamento.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    appointments,
    loading,
    error,
    success,
    fetchAppointments,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    resetState,
  };
}
