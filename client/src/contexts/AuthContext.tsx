import { createContext } from "react";
import { type LoginCredentials, type LoginResponse } from "../services/authService";

// Define o formato do que o contexto de autenticação vai disponibilizar para o resto do app.
export interface AuthContextData {
  user: LoginResponse["user"] | null;
  loading: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentials) => Promise<LoginResponse | null>;
  signOut: () => void;
}

// Cria o contexto vazio com base no contrato acima
export const AuthContext = createContext({} as AuthContextData);