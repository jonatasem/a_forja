import { createContext } from "react";
import {
  type LoginCredentialsProps,
  type LoginResponseProps,
} from "../services/loginService";

type UserProps = LoginResponseProps["user"];

export interface AuthContextData {
  user: UserProps | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentialsProps) => Promise<boolean>;
  signOut: () => void;
}

export const AuthContext = createContext({} as AuthContextData);