import { api } from "./api";

export interface ServiceProps {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  active: boolean;
}

export const getService = {
  async getActiveServices(): Promise<ServiceProps[]> {
    const response = await api.get("/services"); 
    return response.data;
  },
};