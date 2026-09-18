import { useState, useCallback } from "react";
import axios from "axios";
import { appointmentService, type CreateAppointmentProps } from "../services/appointmentService";

/**
 * Hook customizado para gerenciar a criação e manipulação de agendamentos.
 */
export function useAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Função para realizar a criação de um novo agendamento na API
   */
  const createAppointment = useCallback(async (data: CreateAppointmentProps): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await appointmentService.create(data);

      setSuccess(true);
      return true;
    } catch (err: unknown) {
      let message = "Não foi possível realizar o agendamento. Tente novamente.";

      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.error ||
          err.response?.data?.message ||
          message;
      }

      setError(message);
      setSuccess(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reseta os estados de erro e sucesso da requisição
   */
  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    success,
    createAppointment,
    resetState,
  };
}