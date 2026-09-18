import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { LoginPage } from "../pages/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { ClientPage } from "../pages/ClientPage";

export default function RoutesMain(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <ClientPage />
                    </ProtectedRoute>
                } />
                {/* Qualquer rota desconhecida redireciona para o login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}