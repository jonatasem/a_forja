import { api } from "./api";

export interface CreateAppointmentProps {
  barberId: string;
  serviceIds: string[];
  date: string;
}

export const appointmentService = {
  async create(data: CreateAppointmentProps): Promise<void> {
    await api.post("/appointments", data);
  },
};