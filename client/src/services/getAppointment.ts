import { api } from "./api";

// Tipagem dos filtros aceitos pela query do Fastify
export interface GetAppointmentsFilters {
  status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED";
  date?: string;
  barberId?: string;
  clientId?: string;
}

// Tipagem do retorno do backend
export interface Appointment {
  id: string;
  date: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED";
  barberId: string;
  clientId: string;
  serviceId: string;
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  barber: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export const appointmentService = {
  /**
   * Busca a lista de agendamentos no backend.
   */
  async getAppointments(filters?: GetAppointmentsFilters): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>("/appointments", {
      params: filters,
    });

    return response.data;
  },
};
