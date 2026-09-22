import { api } from './api';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  token?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const resetPasswordService = {
  /**
   * Solicita o token/link para recuperação de senha
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await api.post<ForgotPasswordResponse>('/forgot-password', data);
    return response.data;
  },

  /**
   * Redefine a senha utilizando o token recebido
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await api.post<ResetPasswordResponse>('/reset-password', data);
    return response.data;
  },
};
