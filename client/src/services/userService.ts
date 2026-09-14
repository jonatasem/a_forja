import { useState } from "react";
import axios from "axios";
import {
  authService,
  type LoginCredentials,
  type LoginResponse,
} from "../services/authService";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (
    credentials: LoginCredentials
  ): Promise<LoginResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.login(credentials);

      localStorage.setItem("@aforja:token", data.token);
      localStorage.setItem("@aforja:user", JSON.stringify(data.user));

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

  const logout = () => {
    localStorage.removeItem("@aforja:token");
    localStorage.removeItem("@aforja:user");
  };

  return {
    login,
    logout,
    loading,
    error,
  };
}