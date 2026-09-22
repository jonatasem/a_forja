import React, { useState } from 'react';
import { useResetPassword } from '../hooks/useResetPassword';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose }) => {
  const {
    step,
    setStep,
    token,
    loading,
    error,
    successMessage,
    handleForgotPassword,
    handleResetPassword,
    resetState,
  } = useResetPassword();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [inputToken, setInputToken] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    resetState();
    setEmail('');
    setNewPassword('');
    setInputToken('');
    onClose();
  };

  const onRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleForgotPassword({ email });
  };

  const onResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalToken = token || inputToken;
    
    if (!finalToken) {
      return;
    }

    const isSuccess = await handleResetPassword({
      token: finalToken,
      newPassword,
    });

    if (isSuccess) {
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <button onClick={handleClose} style={{ float: 'right' }}>X</button>
        
        <h2>Recuperação de Senha</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

        {step === 'request' ? (
          <form onSubmit={onRequestSubmit}>
            <p>Informe o seu e-mail para receber as instruções de recuperação.</p>
            <div>
              <label>E-mail:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Gerar Token / Continuar'}
            </button>
          </form>
        ) : (
          <form onSubmit={onResetSubmit}>
            <p>Informe o token recebido e a sua nova senha.</p>
            
            {/* Campo exibido caso o token não tenha vindo preenchido do hook */}
            {!token && (
              <div>
                <label>Token de Recuperação:</label>
                <input
                  type="text"
                  required
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="Cole o token aqui"
                />
              </div>
            )}

            <div>
              <label>Nova Senha:</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setStep('request')}
                style={{ marginRight: '0.5rem' }}
              >
                Voltar
              </button>
              <button type="submit" disabled={loading}>
                {loading ? 'Redefinindo...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Estilos básicos inline apenas para demonstração do layout
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  background: '#fff',
  padding: '2rem',
  borderRadius: '8px',
  maxWidth: '400px',
  width: '100%',
};