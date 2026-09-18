import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

interface CanProps {
  children: ReactNode;
  allowedRoles?: string[];
}

/**
 * Componente de Controle de Acesso Baseado em Cargos (RBAC).
 * Exibe o conteúdo filho apenas se o usuário estiver autenticado
 * e possuir um dos cargos (roles) permitidos.
 */
export function Can({ children, allowedRoles }: CanProps) {
  const { user, isAuthenticated } = useAuth();

  // Se não estiver autenticado, não renderiza nada
  if (!isAuthenticated || !user) {
    return null;
  }

  // Se foram especificadas permissões e o cargo do usuário não está na lista, bloqueia a exibição
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.includes(user.role);

    if (!hasPermission) {
      return null;
    }
  }

  // Se passou pelas validações, exibe o conteúdo
  return <>{children}</>;
}


