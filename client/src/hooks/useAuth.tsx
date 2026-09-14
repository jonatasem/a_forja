import { useContext } from "react";
import { AuthContext, type AuthContextData } from "../contexts/AuthContext";

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  // Trava de segurança caso usem o hook fora do AuthProvider
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}