import { api } from "./api";

export interface Barber {
  id: string;
  name: string;
  role: string;
  status: string;
}

export const barberService = {
  async getActiveBarbers(): Promise<Barber[]> {
    // Faz a requisição GET para o endpoint que retorna os barbeiros
    const response = await api.get("/barbers"); // Ajuste a rota exata conforme configurada no seu Fastify (ex: /barbers)
    return response.data;
  },
};