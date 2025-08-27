import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteUser } from "@/lib/user-actions";

type Props = {
  params: Promise<{ id: string }>;
}

export default async function DeleteUserPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  
  if (!session?.user || !(session.user as any).isAdmin) {
    redirect('/login');
  }

  // Récupérer l'utilisateur à supprimer
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

  return (
    <div className="admin-container">
      <div className="admin-header">
        <Link href="/admin/dashboard/users" className="btn btn-back">
          ← Retour à la liste
        </Link>
        <h1>Supprimer l'utilisateur</h1>
      </div>

      <div className="confirmation-container">
        <div className="warning-message">
          <h2>⚠️ Confirmation de suppression</h2>
          <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est <strong>irréversible</strong>.</p>
        </div>

        <div className="user-details">
          <h3>Utilisateur à supprimer :</h3>
          <p><strong>Nom :</strong> {user.name}</p>
          <p><strong>Email :</strong> {user.email}</p>
          <p><strong>Statut :</strong> 
            <span className={`badge ${user.isAdmin ? 'badge-admin' : 'badge-user'}`}>
              {user.isAdmin ? 'Administrateur' : 'Utilisateur'}
            </span>
          </p>
          <p><strong>Créé le :</strong> {new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="form-actions">
          <Link href="/admin/dashboard/users" className="btn btn-secondary">
            Annuler
          </Link>
          <form action={deleteUser} style={{ display: 'inline' }}>
            <input type="hidden" name="id" value={user.id} />
            <button type="submit" className="btn btn-danger">
              Confirmer la suppression
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}