import { useState } from 'react';
import { AxiosError } from 'axios';
import {
  resetPasswordService,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
} from '../services/resetPasswordService';

export function useResetPassword() {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Armazena o token para o caso do backend retornar o token direto no teste/fluxo sem e-mail
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

      // Avança para a próxima etapa no modal
      setStep('reset');
    } catch (err) {
      const apiError = err as AxiosError<{ message?: string }>;
      setError(
        apiError.response?.data?.message || apiError.message || 'Erro ao solicitar recuperação de senha.'
      );
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
      return true; // Retorna true para indicar que concluiu com sucesso
    } catch (err) {
      const apiError = err as AxiosError<{ message?: string }>;
      setError(
        apiError.response?.data?.message || apiError.message || 'Erro ao redefinir a senha.'
      );
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