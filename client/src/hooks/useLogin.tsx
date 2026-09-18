import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./useAuth";

export function useLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const { signIn, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    const response = await signIn({ phone, password });

    if (response) {
      // Redireciona para o dashboard após o login bem-sucedido
      navigate("/dashboard");
    }
  };

  // Retorna tudo o que a interface visual precisa consumir
  return {
    phone,
    setPhone,
    password,
    setPassword,
    loading,
    error,
    handleSubmit,
  };
}