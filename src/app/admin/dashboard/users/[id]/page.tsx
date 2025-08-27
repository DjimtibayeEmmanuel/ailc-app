import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { updateUser } from "@/lib/user-actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>
}

export default async function EditUserPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const { error } = await searchParams;
  
  if (!session?.user || !(session.user as any).isAdmin) {
    redirect('/login');
  }

  // Récupérer l'utilisateur à modifier
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      createdAt: true
    }
  });

  if (!user) {
    notFound();
  }

  const getErrorMessage = (error?: string) => {
    switch (error) {
      case 'missing-fields': return 'Tous les champs sont requis';
      case 'email-exists': return 'Cet email est déjà utilisé par un autre utilisateur';
      case 'server-error': return 'Erreur serveur lors de la modification';
      default: return null;
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <Link href="/admin/dashboard/users" className="btn btn-back">
          ← Retour à la liste
        </Link>
        <h1>Modifier l'utilisateur</h1>
      </div>

      {error && (
        <div className="error-message">
          {getErrorMessage(error)}
        </div>
      )}

      <div className="user-info">
        <p><strong>Créé le :</strong> {new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
        <p><strong>Statut actuel :</strong> 
          <span className={`badge ${user.isAdmin ? 'badge-admin' : 'badge-user'}`}>
            {user.isAdmin ? 'Administrateur' : 'Utilisateur'}
          </span>
        </p>
      </div>

      <div className="form-container">
        <form action={updateUser} className="admin-form">
          <input type="hidden" name="id" value={user.id} />
          
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={user.name || ''}
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
              defaultValue={user.email}
              placeholder="Ex: jean.dupont@ailc.td"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              minLength={6}
              placeholder="Laisser vide pour conserver l'actuel"
            />
            <small className="form-help">
              Laissez ce champ vide si vous ne souhaitez pas changer le mot de passe
            </small>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isAdmin"
                name="isAdmin"
                defaultChecked={user.isAdmin}
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
              Sauvegarder les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}