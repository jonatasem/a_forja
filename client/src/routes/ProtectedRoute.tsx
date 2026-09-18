import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Se não houver usuário logado, redireciona para a página de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, renderiza a tela protegida que ele tentou acessar
  return <>{children}</>;
}
