import { api } from "./api";

export const availableHoursService = {
  async getAvailableHours(
    barberId: string, 
    serviceIds: string[], 
    date: string
  ): Promise<string[]> {
    const response = await api.get("/appointments/available", {
      params: {
        barberId,
        // Envia o array de IDs via parâmetro HTTP (ex: serviceIds=id1&serviceIds=id2)
        serviceIds: serviceIds.join(","), 
        date,
      },
    });

    return response.data;
  },
};