import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'utilisateur est connecté et est admin
  if (!session?.user || !(session.user as any).isAdmin) {
    redirect('/admin');
  }

  // Récupérer les statistiques
  const stats = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isAdmin: true } }),
    prisma.report.count(),
    prisma.report.count({ where: { status: 'pending' } })
  ]);

  const [totalUsers, totalAdmins, totalReports, pendingReports] = stats;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <Link href="/" className="btn btn-back">
          ← Retour à l'accueil
        </Link>
        <h1>Dashboard Administration AILC</h1>
        <form action={async () => {
          'use server';
          redirect('/api/auth/signout');
        }}>
          <button type="submit" className="btn btn-secondary">
            Déconnexion
          </button>
        </form>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Utilisateurs</h3>
          <p className="stat-number">{totalUsers}</p>
          <p className="stat-detail">{totalAdmins} administrateurs</p>
        </div>
        <div className="stat-card">
          <h3>Rapports</h3>
          <p className="stat-number">{totalReports}</p>
          <p className="stat-detail">{pendingReports} en attente</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <div className="action-section">
          <h2>Gestion des Utilisateurs</h2>
          <div className="action-cards">
            <Link href="/admin/dashboard/users" className="action-card">
              <h3>👥 Voir tous les utilisateurs</h3>
              <p>Gérer les comptes utilisateurs et leurs permissions</p>
            </Link>
            <Link href="/admin/dashboard/users/new" className="action-card">
              <h3>➕ Nouvel utilisateur</h3>
              <p>Créer un nouveau compte utilisateur</p>
            </Link>
          </div>
        </div>

        <div className="action-section">
          <h2>Gestion des Rapports</h2>
          <div className="action-cards">
            <Link href="/admin/dashboard/reports" className="action-card">
              <h3>📊 Voir tous les rapports</h3>
              <p>Gérer et traiter les rapports de corruption</p>
            </Link>
            <Link href="/admin/dashboard/reports?status=pending" className="action-card">
              <h3>⏳ Rapports en attente</h3>
              <p>{pendingReports} rapports nécessitent une action</p>
            </Link>
          </div>
        </div>
      </div>

      <div className="user-info">
        <p><strong>Connecté en tant que :</strong> {session.user?.name || session.user?.email}</p>
        <p><strong>Statut :</strong> Administrateur</p>
      </div>
    </div>
  );
}