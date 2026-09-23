import { useState } from 'react';
import { AxiosError } from 'axios';
import {
  resetPasswordService,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
} from '../services/resetPasswordService';

interface BackendErrorResponse {
  error?: string;
  message?: string;
}

export function useResetPassword() {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Armazena o token vindo da API
  const [token, setToken] = useState<string>('');

  /**
   * Etapa 1: Enviar e-mail para solicitar a recuperação
   */
  const handleForgotPassword = async (data: ForgotPasswordRequest) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await resetPasswordService.forgotPassword(data);
      setSuccessMessage(response.message);

      if (response.token) {
        setToken(response.token);
      }

      // Avança para a etapa de redefinição
      setStep('reset');
    } catch (err) {
      const apiError = err as AxiosError<BackendErrorResponse>;
      const errorMessage =
        apiError.response?.data?.error ||
        apiError.response?.data?.message ||
        'Erro ao solicitar recuperação de senha.';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Etapa 2: Redefinir a senha informando o token e a nova senha
   */
  const handleResetPassword = async (data: ResetPasswordRequest) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await resetPasswordService.resetPassword(data);
      setSuccessMessage(response.message);
      return true;
    } catch (err) {
      const apiError = err as AxiosError<BackendErrorResponse>;
      const errorMessage =
        apiError.response?.data?.error ||
        apiError.response?.data?.message ||
        'Erro ao redefinir a senha.';

      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStep('request');
    setError(null);
    setSuccessMessage(null);
    setToken('');
    setLoading(false);
  };

  return {
    step,
    setStep,
    token,
    setToken,
    loading,
    error,
    successMessage,
    handleForgotPassword,
    handleResetPassword,
    resetState,
  };
}