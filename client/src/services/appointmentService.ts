import { api } from "./api";

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED";

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Appointment {
  id: string;
  date: string;
  status: AppointmentStatus;
  barberId: string;
  clientId: string;
  services: ServiceItem[];
  client: UserSummary;
  barber: UserSummary;
}

export interface GetAppointmentsFilters {
  status?: AppointmentStatus;
  date?: string;
  barberId?: string;
  clientId?: string;
}

export interface CreateAppointmentProps {
  barberId: string;
  serviceIds: string[];
  date: string;
}

export interface UpdateAppointmentStatusPayload {
  appointmentId: string;
  status: "CONFIRMED" | "FINISHED" | "CANCELED";
}

// ---------------------------------------------------------------------------
// SERVICE OBJECT
// ---------------------------------------------------------------------------

export const appointmentService = {
  /**
   * Busca a lista de agendamentos no backend com filtros opcionais.
   */
  async getAll(filters?: GetAppointmentsFilters): Promise<Appointment[]> {
    const { data } = await api.get("/appointments", {
      params: filters,
    });
    return data;
  },

  /**
   * Cria um novo agendamento.
   */
  async create(payload: CreateAppointmentProps): Promise<Appointment> {
    const { data } = await api.post("/appointment", payload);
    return data;
  },

  /**
   * Atualiza o status de um agendamento existente.
   */
  async updateStatus({
    appointmentId,
    status,
  }: UpdateAppointmentStatusPayload): Promise<Appointment> {
    const { data } = await api.patch(`/appointments/${appointmentId}/status`, {
      status,
    });
    return data;
  },

  /**
   * Cancela um agendamento.
   */
  async cancel(appointmentId: string): Promise<void> {
    await api.delete(`/appointments/${appointmentId}`);
  },
};