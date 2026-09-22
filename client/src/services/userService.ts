import { api } from './api';

export interface CreateUserRequest {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface CreateUserResponse {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  createdAt: string;
}

export const userService = {
  /**
   * Cria um novo usuário na plataforma
   */
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await api.post<CreateUserResponse>('/user', data);
    return response.data;
  },
};