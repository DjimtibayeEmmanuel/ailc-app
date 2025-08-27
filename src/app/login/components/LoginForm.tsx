import Link from 'next/link';
import { loginAction } from '@/lib/login-action';

type Props = {
  error?: string
}

export default function LoginForm({ error }: Props) {
  const getErrorMessage = (error?: string) => {
    switch (error) {
      case 'missing-credentials':
        return 'Email et mot de passe requis';
      case 'invalid-credentials':
        return 'Email ou mot de passe incorrect';
      case 'server-error':
        return 'Erreur de connexion';
      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <Link href="/" className="btn btn-back mb-4">
        ← Retour à l'accueil
      </Link>
      
      <h3 className="text-2xl font-bold mb-6">Connexion Administration AILC Tchad</h3>
      
      {error && (
        <div className="error-message">{getErrorMessage(error)}</div>
      )}

      <div className="auth-step">
        <form action={loginAction}>
          <div className="form-group">
            <label>Identifiant administrateur</label>
            <input
              type="text"
              name="email"
              defaultValue="admin@ailc.td"
              required
            />
          </div>
          <div className="form-group">
            <label>Mot de passe administrateur</label>
            <input
              type="password"
              name="password"
              defaultValue="admin123"
              required
            />
          </div>
          <button 
            type="submit"
            className="btn btn-primary w-full"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}