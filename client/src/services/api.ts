import axios from "axios";

// Cria a instância do Axios apontando para o backend
export const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Interceptador: roda antes de QUALQUER requisição sair do navegador
api.interceptors.request.use((config) => {
  // Pega o token salvo no navegador
  const token = localStorage.getItem("@aforja:token");

  // Se o token existir, injeta ele no cabeçalho (Header) da requisição
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});