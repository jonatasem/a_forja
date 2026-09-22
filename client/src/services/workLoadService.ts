import { api } from "./api";

export const workLoadService = {
  async listWorkLoadService(
    barberId: string,
    serviceIds: string[],
    date: string
  ): Promise<string[]> {
    const response = await api.get<string[]>("/work-load", {
      params: {
        barberId,
        serviceIds: serviceIds.join(","),
        date,
      },
    });

    return response.data;
  },
};