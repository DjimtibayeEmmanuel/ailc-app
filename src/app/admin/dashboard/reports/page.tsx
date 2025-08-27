import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ status?: string; error?: string; success?: string }>
}

export default async function ReportsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  
  if (!session?.user || !(session.user as any).isAdmin) {
    redirect('/login');
  }

  // Récupérer les rapports avec filtrage optionnel
  const whereClause = params.status ? { status: params.status } : {};
  
  const reports = await prisma.report.findMany({
    where: whereClause,
    select: {
      id: true,
      corruptionType: true,
      amount: true,
      status: true,
      createdAt: true,
      reporterNameEncrypted: true,
      reporterEmailEncrypted: true,
      description: true,
      trackingCode: true,
      sector: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50 // Limiter à 50 rapports pour la performance
  });

  // Statistiques des rapports
  const reportStats = await Promise.all([
    prisma.report.count(),
    prisma.report.count({ where: { status: 'new' } }),
    prisma.report.count({ where: { status: 'investigating' } }),
    prisma.report.count({ where: { status: 'closed' } })
  ]);

  const [totalReports, newReports, investigatingReports, closedReports] = reportStats;

  const getMessageClass = (type: string) => {
    return type === 'error' ? 'error-message' : 'success-message';
  };

  const getMessage = (error?: string, success?: string) => {
    if (error) {
      switch (error) {
        case 'update-failed': return 'Erreur lors de la mise à jour du rapport';
        case 'server-error': return 'Erreur serveur';
        default: return 'Erreur inconnue';
      }
    }
    if (success) {
      switch (success) {
        case 'status-updated': return 'Statut du rapport mis à jour avec succès';
        default: return 'Opération réussie';
      }
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      new: 'badge-warning',
      investigating: 'badge-info', 
      closed: 'badge-success',
      rejected: 'badge-danger'
    };
    return badges[status as keyof typeof badges] || 'badge-secondary';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      new: 'Nouveau',
      investigating: 'En cours',
      closed: 'Fermé',
      rejected: 'Rejeté'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <Link href="/admin/dashboard" className="btn btn-back">
          ← Retour au dashboard
        </Link>
        <h1>Gestion des Rapports</h1>
        <div className="header-filters">
          <Link 
            href="/admin/dashboard/reports" 
            className={`btn btn-small ${!params.status ? 'btn-primary' : 'btn-secondary'}`}
          >
            Tous
          </Link>
          <Link 
            href="/admin/dashboard/reports?status=new" 
            className={`btn btn-small ${params.status === 'new' ? 'btn-warning' : 'btn-secondary'}`}
          >
            Nouveaux
          </Link>
          <Link 
            href="/admin/dashboard/reports?status=investigating" 
            className={`btn btn-small ${params.status === 'investigating' ? 'btn-info' : 'btn-secondary'}`}
          >
            En cours
          </Link>
          <Link 
            href="/admin/dashboard/reports?status=closed" 
            className={`btn btn-small ${params.status === 'closed' ? 'btn-success' : 'btn-secondary'}`}
          >
            Fermés
          </Link>
        </div>
      </div>

      {(params.error || params.success) && (
        <div className={getMessageClass(params.error ? 'error' : 'success')}>
          {getMessage(params.error, params.success)}
        </div>
      )}

      {/* Statistiques */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total</h3>
          <p className="stat-number">{totalReports}</p>
        </div>
        <div className="stat-card">
          <h3>Nouveaux</h3>
          <p className="stat-number">{newReports}</p>
        </div>
        <div className="stat-card">
          <h3>En cours</h3>
          <p className="stat-number">{investigatingReports}</p>
        </div>
        <div className="stat-card">
          <h3>Fermés</h3>
          <p className="stat-number">{closedReports}</p>
        </div>
      </div>

      {/* Liste des rapports */}
      {reports.length === 0 ? (
        <div className="empty-state">
          <p>
            {params.status 
              ? `Aucun rapport avec le statut "${getStatusLabel(params.status)}"`
              : "Aucun rapport trouvé"
            }
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Montant</th>
                <th>Rapporteur</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div>
                      <strong>{report.corruptionType}</strong>
                      {report.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '4px' }}>
                          {report.description.substring(0, 80)}
                          {report.description.length > 80 && '...'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {report.amount ? `${report.amount.toLocaleString()} FCFA` : 'Non spécifié'}
                  </td>
                  <td>
                    <div>
                      <div>{report.reporterNameEncrypted ? '[Chiffré]' : 'Anonyme'}</div>
                      {report.reporterEmailEncrypted && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                          [Email chiffré]
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                  </td>
                  <td>
                    {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        href={`/admin/dashboard/reports/${report.id}`}
                        className="btn btn-small btn-secondary"
                      >
                        Voir
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reports.length === 50 && (
        <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-light)' }}>
          <p>Seuls les 50 rapports les plus récents sont affichés.</p>
        </div>
      )}
    </div>
  );
}