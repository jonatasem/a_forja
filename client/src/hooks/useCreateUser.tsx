import { useState } from 'react';
import { AxiosError } from 'axios';
import {
  userService,
  type CreateUserRequest,
  type CreateUserResponse,
} from '../services/userService';

// Tipagem flexível para cobrir os formatos do seu backend Fastify/Zod
interface BackendErrorResponse {
  error?: string;
  message?: string;
  details?: Record<string, string[]>;
}

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreateUserResponse | null>(null);

  const handleCreateUser = async (data: CreateUserRequest) => {
    setLoading(true);
    setError(null);

    try {
      const user = await userService.createUser(data);
      setCreatedUser(user);
      return user;
    } catch (err) {
      const apiError = err as AxiosError<BackendErrorResponse>;
      const responseData = apiError.response?.data;

      // 1. Tenta pegar a propriedade 'error' (usada no seu backend)
      // 2. Tenta 'message'
      // 3. Se for erro de validação com 'details', pega a primeira mensagem de detalhe
      let errorMessage = responseData?.error || responseData?.message;

      if (!errorMessage && responseData?.details) {
        const firstField = Object.keys(responseData.details)[0];
        if (firstField && responseData.details[firstField]?.[0]) {
          errorMessage = responseData.details[firstField][0];
        }
      }

      // Se nenhum campo existir no JSON, cai na mensagem genérica
      setError(errorMessage || 'Erro ao cadastrar usuário.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
    setCreatedUser(null);
  };

  return {
    handleCreateUser,
    loading,
    error,
    createdUser,
    resetState,
  };
}
