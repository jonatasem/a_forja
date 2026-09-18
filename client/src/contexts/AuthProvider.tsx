import { useState, type ReactNode } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import {
  loginService,
  type LoginCredentialsProps,
  type LoginResponseProps,
} from "../services/loginService";

// Tipagem do usuário com base no tipo retornado pelo serviço de login
type UserProps = LoginResponseProps["user"];

/**
 * Responsável por abraçar a aplicação e fornecer os estados de login,
 * o usuário autenticado e as funções de entrada (signIn) e saída (signOut).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  /**
   * Usa a inicialização "lazy" (função dentro do useState).
   * O React executa esse bloco APENAS na primeira renderização da aplicação,
   * buscando o token e os dados do usuário direto do localStorage.
   */
  const [user, setUser] = useState<UserProps | null>(() => {
    const storedUser = localStorage.getItem("@aforja:user");
    const storedToken = localStorage.getItem("@aforja:token");

    // Se houver usuário e token salvos, recupera a sessão mantendo o login ativo
    if (storedUser && storedToken) {
      try {
        return JSON.parse(storedUser);
      } catch {
        // Se o JSON no localStorage estiver corrompido, limpa a sessão por segurança
        return null;
      }
    }
    return null;
  });

  // Estado que indica se a requisição de login está em andamento (útil para desabilitar botões)
  const [loading, setLoading] = useState(false);

  // Estado para armazenar e exibir mensagens de erro do login
  const [error, setError] = useState<string | null>(null);

  /**
   * Função signIn
   * Recebe as credenciais (telefone e senha), faz o envio para a API via loginService,
   * armazena os dados no localStorage e atualiza o estado global.
   */
  async function signIn(credentials: LoginCredentialsProps): Promise<boolean> {
    try {
      setLoading(true);
      setError(null);

      // Dispara a requisição HTTP POST para a rota /login da API
      const data = await loginService.login(credentials);

      // Persiste o Token JWT e o objeto do Usuário no navegador do cliente
      localStorage.setItem("@aforja:token", data.token);
      localStorage.setItem("@aforja:user", JSON.stringify(data.user));

      // Atualiza o estado global de usuário (dispara reatividade nas telas)
      setUser(data.user);

      return true; // Retorna true confirmando sucesso ao hook useLogin
    } catch (err: unknown) {
      let message = "Telefone ou senha inválidos.";

      // Tratamento seguro de erro do Axios sem violar as regras do ESLint
      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.error ||
          err.response?.data?.message ||
          message;
      }

      setError(message);
      return false; // Retorna false informando falha ao hook useLogin
    } finally {
      // Garante que o indicador de carregamento seja desativado ao terminar (sucesso ou falha)
      setLoading(false);
    }
  }

  /**
   * Função signOut
   * Limpa as credenciais salvas no navegador e encerra a sessão do usuário.
   */
  function signOut() {
    // Remove o Token JWT do armazenamento local
    localStorage.removeItem("@aforja:token");
    
    // Remove o registro do Usuário do armazenamento local
    localStorage.removeItem("@aforja:user");
    
    // Define o estado global como null (desloga instantaneamente a aplicação)
    setUser(null);
  }

  /**
   * Retorna o Provider injetando as variáveis e funções no contexto global do React
   */
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user, // Converte a existência do objeto 'user' em booleano (true/false)
        loading,
        error,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}