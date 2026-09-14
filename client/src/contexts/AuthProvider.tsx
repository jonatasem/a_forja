import { useState, type ReactNode } from "react";
import { authService, type LoginCredentials, type LoginResponse } from "../services/authService";
import { AuthContext } from "./AuthContext";
import axios from "axios";

export function AuthProvider({ children }: { children: ReactNode }) {
  // Ao abrir o app, tenta ler direto do localStorage para ver se já estava logado
  const [user, setUser] = useState<LoginResponse["user"] | null>(() => {
    const storedUser = localStorage.getItem("@aforja:user");
    const storedToken = localStorage.getItem("@aforja:token");

    if (storedUser && storedToken) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null; // Se corromper o JSON, limpa o estado
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FUNÇÃO DE ENTRADA (LOGIN)
  const signIn = async (credentials: LoginCredentials): Promise<LoginResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.login(credentials);

      localStorage.setItem("@aforja:token", data.token);
      localStorage.setItem("@aforja:user", JSON.stringify(data.user));

      setUser(data.user);
      return data;
    } catch (err: unknown) {
      const backendMessage =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Erro ao efetuar login.";

      setError(backendMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÃO DE SAÍDA (LOGOUT)
  const signOut = () => {
    localStorage.removeItem("@aforja:token");
    localStorage.removeItem("@aforja:user");
    setUser(null);
  };

  // DISPONIBILIZA OS DADOS PARA TODOS OS FILHOS DA ÁRVORE DO REACT
  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
