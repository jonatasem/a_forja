import { api } from "./api";

// Formato dos dados que chegam para o login
export interface LoginCredentials {
  phone: string;
  password: string;
}

// Formato da resposta que o backend devolve ao logar
export interface LoginResponse {
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
    role: string;
  };
  token: string;
}

// Objeto que dispara as rotas de auth
export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Faz um POST na rota /login enviando telefone e senha
    const response = await api.post("/login", credentials);
    return response.data;
  },
};