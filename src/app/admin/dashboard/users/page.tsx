import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteUser, toggleAdminStatus } from "@/lib/user-actions";

type Props = {
  searchParams: Promise<{ error?: string; success?: string }>
}

export default async function UsersPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  
  if (!session?.user || !(session.user as any).isAdmin) {
    redirect('/login');
  }

  // Récupérer tous les utilisateurs
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const getMessageClass = (type: string) => {
    return type === 'error' ? 'error-message' : 'success-message';
  };

  const getMessage = (error?: string, success?: string) => {
    if (error) {
      switch (error) {
        case 'missing-fields': return 'Tous les champs sont requis';
        case 'email-exists': return 'Cet email est déjà utilisé';
        case 'missing-id': return 'ID utilisateur manquant';
        case 'server-error': return 'Erreur serveur';
        default: return 'Erreur inconnue';
      }
    }
    if (success) {
      switch (success) {
        case 'user-created': return 'Utilisateur créé avec succès';
        case 'user-updated': return 'Utilisateur modifié avec succès';
        case 'user-deleted': return 'Utilisateur supprimé avec succès';
        case 'admin-status-updated': return 'Statut admin mis à jour avec succès';
        default: return 'Opération réussie';
      }
    }
    return null;
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <Link href="/admin/dashboard" className="btn btn-back">
          ← Retour au dashboard
        </Link>
        <h1>Gestion des Utilisateurs</h1>
        <Link href="/admin/dashboard/users/new" className="btn btn-primary">
          + Nouvel Utilisateur
        </Link>
      </div>

      {(params.error || params.success) && (
        <div className={getMessageClass(params.error ? 'error' : 'success')}>
          {getMessage(params.error, params.success)}
        </div>
      )}

      <div className="users-grid">
        {users.length === 0 ? (
          <div className="empty-state">
            <p>Aucun utilisateur trouvé</p>
            <Link href="/admin/dashboard/users/new" className="btn btn-primary">
              Créer le premier utilisateur
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Statut</th>
                  <th>Créé le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.isAdmin ? 'badge-admin' : 'badge-user'}`}>
                        {user.isAdmin ? 'Admin' : 'Utilisateur'}
                      </span>
                    </td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          href={`/admin/dashboard/users/${user.id}`}
                          className="btn btn-small btn-secondary"
                        >
                          Modifier
                        </Link>
                        
                        <form action={toggleAdminStatus} style={{ display: 'inline' }}>
                          <input type="hidden" name="id" value={user.id} />
                          <input type="hidden" name="currentIsAdmin" value={user.isAdmin.toString()} />
                          <button 
                            type="submit" 
                            className={`btn btn-small ${user.isAdmin ? 'btn-warning' : 'btn-success'}`}
                          >
                            {user.isAdmin ? 'Rétrograder' : 'Promouvoir'}
                          </button>
                        </form>

                        <Link 
                          href={`/admin/dashboard/users/${user.id}/delete`}
                          className="btn btn-small btn-danger"
                        >
                          Supprimer
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}