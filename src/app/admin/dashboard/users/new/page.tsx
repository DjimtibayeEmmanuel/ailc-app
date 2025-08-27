import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createUser } from "@/lib/user-actions";

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(session.user as any).isAdmin) {
    redirect('/login');
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <Link href="/admin/dashboard/users" className="btn btn-back">
          ← Retour à la liste
        </Link>
        <h1>Nouvel Utilisateur</h1>
      </div>

      <div className="form-container">
        <form action={createUser} className="admin-form">
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Ex: Jean Dupont"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Ex: jean.dupont@ailc.td"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              placeholder="Minimum 6 caractères"
            />
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isAdmin"
                name="isAdmin"
              />
              <label htmlFor="isAdmin">
                Accorder les privilèges administrateur
              </label>
            </div>
            <small className="form-help">
              Les administrateurs peuvent gérer tous les rapports et utilisateurs
            </small>
          </div>

          <div className="form-actions">
            <Link href="/admin/dashboard/users" className="btn btn-secondary">
              Annuler
            </Link>
            <button type="submit" className="btn btn-primary">
              Créer l'utilisateur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}