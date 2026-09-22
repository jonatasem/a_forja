import { useState } from 'react';
import { AxiosError } from 'axios';
import {
  userService,
  type CreateUserRequest,
  type CreateUserResponse,
} from '../services/userService';

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
      const apiError = err as AxiosError<{ message?: string }>;
      const errorMessage =
        apiError.response?.data?.message || apiError.message || 'Erro ao cadastrar usuário.';

      setError(errorMessage);
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
