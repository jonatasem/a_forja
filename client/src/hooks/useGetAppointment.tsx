import { useState, useEffect, useCallback } from "react";
import {
  appointmentService,
  type Appointment,
  type GetAppointmentsFilters,
} from "../services/getAppointment";

export function useGetAppointments(initialFilters?: GetAppointmentsFilters) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (filters?: GetAppointmentsFilters) => {
    try {
      setLoading(true);
      setError(null);

      const data = await appointmentService.getAppointments(filters || initialFilters);
      setAppointments(data);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
      setError("Não foi possível carregar os agendamentos.");
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await appointmentService.getAppointments(initialFilters);
        if (isMounted) setAppointments(data);
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Não foi possível carregar os agendamentos.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [initialFilters]);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
  };
}
