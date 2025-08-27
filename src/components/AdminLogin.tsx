'use client';

import { useState } from 'react';

interface AdminLoginProps {
  onBack: () => void;
  onLoginSuccess: (token: string, user: any) => void;
}

export default function AdminLogin({ onBack, onLoginSuccess }: AdminLoginProps) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('admin@ailc.td');
  const [password, setPassword] = useState('admin123');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const request2FA = async () => {
    if (!username || !password) {
      setError('Veuillez remplir l\'identifiant et le mot de passe');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/request-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
      } else {
        setError(data.error || 'Erreur lors de la demande du code');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async () => {
    if (!adminCode) {
      setError('Veuillez saisir le code de sécurité');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/le-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, adminCode }),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.error || 'Erreur de connexion');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button className="btn btn-back mb-4" onClick={onBack}>
        ← Retour
      </button>
      
      <h3 className="text-2xl font-bold mb-6">Accès Administration AILC Tchad</h3>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {step === 1 && (
        <div className="auth-step">
          <div className="form-group">
            <label>Identifiant administrateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Mot de passe administrateur</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            className="btn btn-primary w-full" 
            onClick={request2FA}
            disabled={loading}
          >
            {loading ? 'Envoi...' : 'Demander le code de sécurité'}
          </button>
        </div>
      )}
      
      {step === 2 && (
        <div className="auth-step">
          <div className="success-message">
            📧 Code de sécurité envoyé par email !
          </div>
          <div className="form-group">
            <label>Code de sécurité (6 chiffres)</label>
            <input
              type="text"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              required
            />
            <small className="text-text-light">
              Vérifiez votre boîte email. Le code expire dans 10 minutes.
            </small>
          </div>
          <div className="flex gap-4">
            <button 
              className="btn btn-danger flex-1" 
              onClick={adminLogin}
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Accéder à l\'administration'}
            </button>
            <button 
              className="btn btn-secondary flex-1" 
              onClick={request2FA}
              disabled={loading}
            >
              Renvoyer le code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}