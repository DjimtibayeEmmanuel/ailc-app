'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  is_admin: boolean;
  created_at: string;
}

interface Report {
  id: string;
  corruption_type: string;
  sector: string;
  severity: string;
  status: string;
  location: string;
  description: string;
  tracking_code: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  anonymity_level: string;
  amount?: string;
  created_at: string;
  updated_at: string;
  files?: Array<{name: string, size: number, type: string}>;
}

interface DashboardStats {
  totalReports: number;
  totalUsers: number;
  pendingReports: number;
  resolvedReports: number;
  totalAmount: number;
  averageAmount: number;
  monthlyReports: number;
  criticalReports: number;
}

interface AdminPanelProps {
  authToken: string;
  user: any;
  onBack: () => void;
  onEditUser?: (user: User) => void;
}

export default function AdminPanel({ authToken, user, onBack, onEditUser }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports' | 'activity'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activityPeriod, setActivityPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const apiCall = async (endpoint: string, method = 'GET', data?: any) => {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Erreur API');
    }

    return responseData;
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/admin/users');
      setUsers(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/admin/reports');
      setReports(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [usersData, reportsData] = await Promise.all([
        apiCall('/api/admin/users'),
        apiCall('/api/admin/reports')
      ]);
      
      setUsers(usersData);
      setReports(reportsData);
      
      // Calculer les statistiques
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      const monthlyReports = reportsData.filter((report: Report) => {
        const reportDate = new Date(report.created_at);
        return reportDate.getMonth() === thisMonth && reportDate.getFullYear() === thisYear;
      }).length;

      const pendingReports = reportsData.filter((r: Report) => r.status === 'new' || r.status === 'investigating').length;
      const resolvedReports = reportsData.filter((r: Report) => r.status === 'resolved').length;
      const criticalReports = reportsData.filter((r: Report) => 
        r.severity === 'plus_100000000' || 
        r.severity === '10000000_100000000' ||
        r.amount === 'plus_100000000' ||
        r.amount === '10000000_100000000'
      ).length;

      // Calculer les montants
      const amounts = reportsData
        .map((r: Report) => {
          const amountField = r.amount || r.severity || '';
          if (amountField === 'moins_100000') return 50000;
          if (amountField === '100000_1000000') return 500000;
          if (amountField === '1000000_10000000') return 5000000;
          if (amountField === '10000000_100000000') return 50000000;
          if (amountField === 'plus_100000000') return 200000000;
          return 0;
        })
        .filter(amount => amount > 0);

      const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
      const averageAmount = amounts.length > 0 ? totalAmount / amounts.length : 0;

      setStats({
        totalReports: reportsData.length,
        totalUsers: usersData.length,
        pendingReports,
        resolvedReports,
        totalAmount,
        averageAmount,
        monthlyReports,
        criticalReports
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboard();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'reports') {
      loadReports();
    } else if (activeTab === 'activity') {
      loadUsers(); // Charger les utilisateurs pour la sélection
    }
  }, [activeTab]);

  // Filtrer les rapports en fonction des critères de recherche
  useEffect(() => {
    let filtered = reports;
    
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.corruption_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.tracking_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }
    
    if (sectorFilter !== 'all') {
      filtered = filtered.filter(report => report.sector === sectorFilter);
    }
    
    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, sectorFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XAF',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeLabel = (type: string) => {
    if (!type) return 'Fichier';
    if (type.startsWith('image/')) return 'Image';
    if (type.startsWith('video/')) return 'Vidéo';
    if (type.startsWith('audio/')) return 'Audio';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word')) return 'Document Word';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'Excel';
    if (type.includes('zip') || type.includes('rar')) return 'Archive';
    return 'Fichier';
  };

  const contactReporter = (report: Report) => {
    if (report.anonymity_level === 'total') {
      alert('Ce signalement est totalement anonyme. Contact impossible.');
      return;
    }
    
    const subject = `AILC Tchad - Signalement #${report.tracking_code}`;
    const body = `Bonjour,\n\nNous prenons contact avec vous concernant votre signalement #${report.tracking_code} déposé le ${formatDate(report.created_at)}.\n\nVotre signalement fait l'objet d'un suivi attentif de la part de nos équipes.\n\nCordialement,\nL'équipe AILC Tchad`;
    
    if (report.reporter_email && report.reporter_email !== 'Non fourni') {
      window.location.href = `mailto:${report.reporter_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      // Utiliser l'email de contact AILC
      const adminBody = `Signalement: #${report.tracking_code}\nRapporteur: ${report.reporter_name}\nTéléphone: ${report.reporter_phone}\n\n${body}`;
      window.location.href = `mailto:contact@ailc.td?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(adminBody)}`;
    }
  };

  const loadUserActivity = async (userId: number, period: string = activityPeriod, date: string = activityDate) => {
    try {
      setLoadingActivity(true);
      const data = await apiCall(`/api/admin/user-activity/${userId}?period=${period}&date=${date}`);
      setUserActivity(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoadingActivity(false);
    }
  };

  const exportUserActivityToPDF = async (activityData: any) => {
    try {
      if (!activityData) {
        alert('Aucune donnée d\'activité à exporter');
        return;
      }

      const user = activityData.user;
      const period = activityData.period;
      const activities = activityData.activities;
      const stats = activityData.statistics;

      const formatActivityIcon = (type: string) => {
        switch (type) {
          case 'login': return '🔑';
          case 'logout': return '🚪';
          case 'report_created': return '📝';
          default: return '📋';
        }
      };

      const formatPeriodLabel = (period: any) => {
        const labels = {
          day: 'Journée',
          week: 'Semaine',
          month: 'Mois'
        };
        return labels[period.type as keyof typeof labels] || period.type;
      };

      // Créer le contenu HTML pour le PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Rapport d'Activité AILC Tchad - ${user.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #2d3748;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              border-bottom: 3px solid #4a639a; 
              padding-bottom: 25px; 
              background: linear-gradient(135deg, #4a639a 0%, #cc9e65 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              margin: -20px -20px 40px -20px;
            }
            .header h1 { margin: 0 0 10px 0; font-size: 2rem; }
            .header h2 { margin: 0 0 5px 0; font-size: 1.2rem; font-weight: 400; }
            .user-info { 
              background: #f8fafc; 
              padding: 20px; 
              border-radius: 10px; 
              margin-bottom: 30px;
              border-left: 5px solid #cc9e65;
            }
            .user-info h3 { color: #4a639a; margin: 0 0 15px 0; }
            .stats-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 15px; 
              margin-bottom: 30px;
            }
            .stat-item { 
              background: white; 
              padding: 15px; 
              border-radius: 8px; 
              text-align: center;
              border: 1px solid #e2e8f0;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .stat-number { font-size: 1.5rem; font-weight: bold; color: #4a639a; }
            .stat-label { font-size: 0.9rem; color: #64748b; margin-top: 5px; }
            .activity-section { margin-bottom: 30px; }
            .activity-title { 
              font-size: 1.2rem; 
              font-weight: bold; 
              color: #4a639a; 
              margin: 0 0 20px 0;
              padding: 10px 0;
              border-bottom: 2px solid #cc9e65;
            }
            .activity-item { 
              display: flex;
              align-items: center;
              padding: 12px; 
              margin-bottom: 10px;
              background: white;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .activity-icon { 
              font-size: 1.5rem; 
              margin-right: 15px; 
              width: 40px;
              text-align: center;
            }
            .activity-content { flex: 1; }
            .activity-description { 
              font-weight: 600; 
              color: #2d3748; 
              margin-bottom: 5px;
            }
            .activity-details { 
              font-size: 0.85rem; 
              color: #64748b; 
            }
            .activity-time { 
              font-size: 0.8rem; 
              color: #9ca3af;
              text-align: right;
              min-width: 120px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #64748b;
              font-size: 0.9rem;
            }
            @media print {
              .activity-item { page-break-inside: avoid; }
              body { margin: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🇹🇩 AILC TCHAD</h1>
            <h2>Rapport d'Activité Utilisateur</h2>
            <p>Généré le ${new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
          
          <div class="user-info">
            <h3>👤 Informations Utilisateur</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div><strong>Nom:</strong> ${user.name}</div>
              <div><strong>Email:</strong> ${user.email}</div>
              <div><strong>Rôle:</strong> ${user.is_admin ? 'Administrateur' : 'Utilisateur'}</div>
              <div><strong>Membre depuis:</strong> ${new Date(user.created_at).toLocaleDateString('fr-FR')}</div>
            </div>
            <div style="margin-top: 15px;">
              <strong>Période analysée:</strong> ${formatPeriodLabel(period)} du ${new Date(period.startDate).toLocaleDateString('fr-FR')} 
              ${period.startDate !== period.endDate ? `au ${new Date(period.endDate).toLocaleDateString('fr-FR')}` : ''}
            </div>
          </div>
          
          <div class="activity-section">
            <div class="activity-title">📊 Statistiques de la Période</div>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">${stats.totalActivities}</div>
                <div class="stat-label">Activités Totales</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${stats.reportsCreated}</div>
                <div class="stat-label">Signalements Créés</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${stats.loginSessions}</div>
                <div class="stat-label">Sessions de Connexion</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${Math.round(stats.timeSpent)}</div>
                <div class="stat-label">Minutes d'Activité</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${stats.uniqueIPs}</div>
                <div class="stat-label">Adresses IP Uniques</div>
              </div>
            </div>
          </div>
          
          <div class="activity-section">
            <div class="activity-title">🕒 Chronologie des Activités (${activities.length})</div>
            ${activities.map(activity => `
              <div class="activity-item">
                <div class="activity-icon">${formatActivityIcon(activity.type)}</div>
                <div class="activity-content">
                  <div class="activity-description">${activity.description}</div>
                  <div class="activity-details">
                    ${activity.details.reportId ? `ID: ${activity.details.reportId} | ` : ''}
                    ${activity.details.trackingCode ? `Code: ${activity.details.trackingCode} | ` : ''}
                    IP: ${activity.ip_address}
                  </div>
                </div>
                <div class="activity-time">
                  ${new Date(activity.timestamp).toLocaleDateString('fr-FR')}<br>
                  ${new Date(activity.timestamp).toLocaleTimeString('fr-FR')}
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p><strong>Document confidentiel</strong> - AILC Tchad</p>
            <p>Rapport d'activité généré automatiquement le ${new Date().toLocaleString('fr-FR')}</p>
            <p>🔒 Ce rapport contient des informations sensibles et doit être traité conformément aux procédures de sécurité de l'AILC</p>
          </div>
        </body>
        </html>
      `;

      // Créer un blob et télécharger
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-activite-${user.name.replace(/\s+/g, '-')}-${period.type}-${period.startDate}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Export réussi ! Le rapport d\'activité a été téléchargé.');
    } catch (error) {
      console.error('Erreur export activité:', error);
      alert('Erreur lors de l\'export du rapport d\'activité');
    }
  };

  const exportToPDF = async (reportId?: string) => {
    try {
      const dataToExport = reportId ? 
        reports.filter(r => r.id === reportId) : 
        reports;
      
      if (dataToExport.length === 0) {
        alert('Aucune donnée à exporter');
        return;
      }

      // Créer le contenu HTML pour le PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Rapport AILC Tchad - ${reportId ? `Signalement #${dataToExport[0]?.tracking_code}` : 'Rapport Complet'}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #2d3748;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              border-bottom: 3px solid #4a639a; 
              padding-bottom: 25px; 
              background: linear-gradient(135deg, #4a639a 0%, #cc9e65 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              margin: -20px -20px 40px -20px;
            }
            .header h1 { margin: 0 0 10px 0; font-size: 2.2rem; }
            .header h2 { margin: 0 0 5px 0; font-size: 1.4rem; font-weight: 400; }
            .header p { margin: 15px 0 0 0; font-size: 1rem; opacity: 0.9; }
            .summary { 
              background: #f8fafc; 
              padding: 25px; 
              border-radius: 10px; 
              margin-bottom: 30px;
              border-left: 5px solid #cc9e65;
            }
            .summary h3 { color: #4a639a; margin: 0 0 15px 0; }
            .summary-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 15px; 
            }
            .summary-item { 
              background: white; 
              padding: 15px; 
              border-radius: 8px; 
              text-align: center;
              border: 1px solid #e2e8f0;
            }
            .summary-number { font-size: 1.8rem; font-weight: bold; color: #4a639a; }
            .summary-label { font-size: 0.9rem; color: #64748b; margin-top: 5px; }
            .report { 
              margin-bottom: 40px; 
              padding: 30px; 
              border: 2px solid #e2e8f0; 
              border-radius: 12px;
              background: white;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .report h3 { 
              color: #4a639a; 
              margin: 0 0 25px 0; 
              font-size: 1.4rem;
              border-bottom: 2px solid #cc9e65;
              padding-bottom: 10px;
            }
            .report-section { margin-bottom: 25px; }
            .section-title { 
              font-size: 1.1rem; 
              font-weight: bold; 
              color: #4a639a; 
              margin: 0 0 15px 0;
              padding: 8px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .field { 
              margin-bottom: 12px; 
              display: grid; 
              grid-template-columns: 150px 1fr; 
              gap: 10px;
              align-items: start;
            }
            .label { 
              font-weight: 600; 
              color: #4a639a; 
              font-size: 0.9rem;
            }
            .value { 
              color: #2d3748;
              word-wrap: break-word;
            }
            .description-box {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #cc9e65;
              margin: 15px 0;
              font-style: italic;
            }
            .status { 
              padding: 6px 12px; 
              border-radius: 20px; 
              font-size: 0.85rem; 
              font-weight: 600;
              display: inline-block;
            }
            .status.new { background: #dbeafe; color: #1e40af; }
            .status.investigating { background: #fed7aa; color: #9a3412; }
            .status.resolved { background: #dcfce7; color: #166534; }
            .status.closed { background: #f3f4f6; color: #374151; }
            .urgency-high { color: #dc2626; font-weight: bold; }
            .urgency-critical { color: #dc2626; font-weight: bold; background: #fee2e2; padding: 4px 8px; border-radius: 4px; }
            .amount-range { 
              background: #f0f9ff; 
              color: #0369a1; 
              padding: 4px 8px; 
              border-radius: 4px;
              font-weight: 600;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #64748b;
              font-size: 0.9rem;
            }
            @media print {
              .report { page-break-inside: avoid; }
              body { margin: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🇹🇩 AILC TCHAD</h1>
            <h2>Autorité Indépendante de Lutte contre la Corruption</h2>
            <p>السلطة المستقلة لمكافحة الفساد</p>
            <p>Rapport ${reportId ? 'détaillé du signalement' : 'complet des signalements'} - Généré le ${new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
          
          ${!reportId ? `
            <div class="summary">
              <h3>📊 Résumé Exécutif</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-number">${dataToExport.length}</div>
                  <div class="summary-label">Total Signalements</div>
                </div>
                <div class="summary-item">
                  <div class="summary-number">${dataToExport.filter(r => r.status === 'new' || r.status === 'investigating').length}</div>
                  <div class="summary-label">En cours de traitement</div>
                </div>
                <div class="summary-item">
                  <div class="summary-number">${dataToExport.filter(r => r.status === 'resolved').length}</div>
                  <div class="summary-label">Résolus</div>
                </div>
                <div class="summary-item">
                  <div class="summary-number">${dataToExport.filter(r => r.amount === 'plus_100000000' || r.amount === '10000000_100000000').length}</div>
                  <div class="summary-label">Cas Critiques</div>
                </div>
              </div>
            </div>
          ` : ''}
          
          ${dataToExport.map((report, index) => `
            <div class="report">
              <h3>📋 Signalement #${report.tracking_code} ${dataToExport.length > 1 ? `(${index + 1}/${dataToExport.length})` : ''}</h3>
              
              <div class="report-section">
                <div class="section-title">ℹ️ Informations Générales</div>
                <div class="field">
                  <span class="label">Type de corruption:</span>
                  <span class="value">${report.corruption_type}</span>
                </div>
                <div class="field">
                  <span class="label">Secteur concerné:</span>
                  <span class="value">${report.sector}</span>
                </div>
                <div class="field">
                  <span class="label">Localisation:</span>
                  <span class="value">${report.location}</span>
                </div>
                <div class="field">
                  <span class="label">Date de signalement:</span>
                  <span class="value">${formatDate(report.created_at)}</span>
                </div>
                <div class="field">
                  <span class="label">Statut actuel:</span>
                  <span class="value"><span class="status ${report.status}">${
                    report.status === 'new' ? 'Nouveau' :
                    report.status === 'investigating' ? 'En enquête' :
                    report.status === 'resolved' ? 'Résolu' : 'Fermé'
                  }</span></span>
                </div>
                ${report.amount ? `
                  <div class="field">
                    <span class="label">Montant estimé:</span>
                    <span class="value"><span class="amount-range">${
                      report.amount === 'moins_100000' ? 'Moins de 100 000 FCFA' :
                      report.amount === '100000_1000000' ? '100 000 - 1 000 000 FCFA' :
                      report.amount === '1000000_10000000' ? '1 - 10 millions FCFA' :
                      report.amount === '10000000_100000000' ? '10 - 100 millions FCFA' :
                      report.amount === 'plus_100000000' ? 'Plus de 100 millions FCFA' :
                      'Montant inconnu'
                    }</span></span>
                  </div>
                ` : ''}
                ${report.anonymity_level ? `
                  <div class="field">
                    <span class="label">Niveau d'anonymat:</span>
                    <span class="value">${report.anonymity_level}</span>
                  </div>
                ` : ''}
              </div>
              
              <div class="report-section">
                <div class="section-title">📝 Description des Faits</div>
                <div class="description-box">
                  ${report.description}
                </div>
              </div>
              
              ${report.reporter_name && report.reporter_name !== 'Signalement Anonyme' ? `
                <div class="report-section">
                  <div class="section-title">👤 Informations du Rapporteur</div>
                  <div class="field">
                    <span class="label">Nom:</span>
                    <span class="value">${report.reporter_name}</span>
                  </div>
                  ${report.reporter_email ? `
                    <div class="field">
                      <span class="label">Email:</span>
                      <span class="value">${report.reporter_email}</span>
                    </div>
                  ` : ''}
                  ${report.reporter_phone ? `
                    <div class="field">
                      <span class="label">Téléphone:</span>
                      <span class="value">${report.reporter_phone}</span>
                    </div>
                  ` : ''}
                </div>
              ` : `
                <div class="report-section">
                  <div class="section-title">🕵️ Type de Signalement</div>
                  <div class="field">
                    <span class="label">Anonymat:</span>
                    <span class="value">🔒 Signalement Anonyme</span>
                  </div>
                </div>
              `}
              
              <div class="report-section">
                <div class="section-title">📊 Informations de Suivi</div>
                <div class="field">
                  <span class="label">Code de suivi:</span>
                  <span class="value">${report.tracking_code}</span>
                </div>
                <div class="field">
                  <span class="label">Dernière mise à jour:</span>
                  <span class="value">${formatDate(report.updated_at)}</span>
                </div>
                <div class="field">
                  <span class="label">ID système:</span>
                  <span class="value">${report.id}</span>
                </div>
              </div>
            </div>
          `).join('')}
          
          <div class="footer">
            <p><strong>Document confidentiel</strong> - AILC Tchad</p>
            <p>Généré automatiquement le ${new Date().toLocaleString('fr-FR')} par le système de gestion des signalements</p>
            <p>🔒 Ce rapport contient des informations sensibles et doit être traité conformément aux procédures de sécurité de l'AILC</p>
          </div>
        </body>
        </html>
      `;

      // Créer un blob et télécharger
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-ailc-${reportId || 'complet'}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Export réussi ! Le fichier a été téléchargé.');
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'new': { label: 'Nouveau', color: 'bg-blue-100 text-blue-800' },
      'investigating': { label: 'Enquête', color: 'bg-orange-100 text-orange-800' },
      'resolved': { label: 'Résolu', color: 'bg-green-100 text-green-800' },
      'closed': { label: 'Fermé', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const deleteUser = async (userId: number) => {
    if (userId === 1) {
      alert('Impossible de supprimer l\'administrateur principal');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await apiCall(`/api/admin/users/${userId}`, 'DELETE');
      await loadUsers(); // Recharger la liste
      alert('Utilisateur supprimé avec succès');
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      await apiCall(`/api/admin/reports/${reportId}/status`, 'PUT', { status: newStatus });
      await loadReports(); // Recharger les données
      alert('Statut mis à jour avec succès');
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const openReportModal = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setSelectedReport(null);
    setShowReportModal(false);
  };

  const renderReportModal = () => {
    if (!selectedReport || !showReportModal) return null;
    
    return (
      <div className="modal-overlay" onClick={closeReportModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Détails du Signalement #{selectedReport.tracking_code}</h3>
            <button className="modal-close" onClick={closeReportModal}>✕</button>
          </div>
          
          <div className="modal-body">
            <div className="detail-grid">
              <div className="detail-section">
                <h4>Informations générales</h4>
                <div className="detail-item">
                  <label>Type:</label>
                  <span>{selectedReport.corruption_type}</span>
                </div>
                <div className="detail-item">
                  <label>Secteur:</label>
                  <span>{selectedReport.sector}</span>
                </div>
                <div className="detail-item">
                  <label>Lieu:</label>
                  <span>{selectedReport.location}</span>
                </div>
                <div className="detail-item">
                  <label>Date de signalement:</label>
                  <span>{formatDate(selectedReport.created_at)}</span>
                </div>
                <div className="detail-item">
                  <label>Statut:</label>
                  <span>{getStatusBadge(selectedReport.status)}</span>
                </div>
                {selectedReport.amount && (
                  <div className="detail-item">
                    <label>Montant estimé:</label>
                    <span>{selectedReport.amount}</span>
                  </div>
                )}
              </div>
              
              <div className="detail-section">
                <h4>Description</h4>
                <div className="description-text">
                  {selectedReport.description}
                </div>
              </div>
              
              {(selectedReport.reporter_name && selectedReport.reporter_name !== 'Signalement Anonyme') && (
                <div className="detail-section">
                  <h4>Rapporteur</h4>
                  <div className="detail-item">
                    <label>Nom:</label>
                    <span>{selectedReport.reporter_name}</span>
                  </div>
                  {selectedReport.reporter_email && (
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedReport.reporter_email}</span>
                    </div>
                  )}
                  {selectedReport.reporter_phone && (
                    <div className="detail-item">
                      <label>Téléphone:</label>
                      <span>{selectedReport.reporter_phone}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="detail-section">
                <h4>Fichiers et Preuves</h4>
                <div className="files-section">
                  {selectedReport.files && selectedReport.files.length > 0 ? (
                    <div className="files-list">
                      <p className="files-count">📎 {selectedReport.files.length} fichier(s) joint(s)</p>
                      {selectedReport.files.map((file, index) => (
                        <div key={index} className="file-item-detailed">
                          <div className="file-icon">
                            {file.type?.startsWith('image/') ? '🖼️' :
                             file.type?.startsWith('video/') ? '🎥' :
                             file.type?.startsWith('audio/') ? '🎵' :
                             file.type?.includes('pdf') ? '📄' :
                             file.type?.includes('word') ? '📝' :
                             file.type?.includes('excel') || file.type?.includes('spreadsheet') ? '📊' :
                             file.type?.includes('zip') || file.type?.includes('rar') ? '🗜️' :
                             '📎'}
                          </div>
                          <div className="file-details">
                            <div className="file-name">{file.name}</div>
                            <div className="file-meta">
                              <span className="file-size">{formatFileSize(file.size)}</span>
                              <span className="file-type">{getFileTypeLabel(file.type)}</span>
                            </div>
                          </div>
                          <div className="file-actions-item">
                            <button 
                              className="btn btn-small btn-primary"
                              onClick={() => alert('Fonctionnalité de téléchargement en développement')}
                            >
                              📥 Télécharger
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="files-actions-global">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => alert('Fonctionnalité de téléchargement groupé en développement')}
                        >
                          📦 Télécharger tout ({selectedReport.files.length} fichiers)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="files-placeholder">
                      <div className="files-icon">📎</div>
                      <p>Aucun fichier joint à ce signalement</p>
                      <div className="file-types">
                        <span className="file-type-tag">📄 Documents</span>
                        <span className="file-type-tag">📊 Excel</span>
                        <span className="file-type-tag">🎵 Audio</span>
                        <span className="file-type-tag">🎥 Vidéo</span>
                        <span className="file-type-tag">🖼️ Images</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Historique et Suivi</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-date">{formatDate(selectedReport.created_at)}</div>
                    <div className="timeline-content">
                      <strong>Signalement créé</strong>
                      <p>Code de suivi généré: {selectedReport.tracking_code}</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">{formatDate(selectedReport.updated_at)}</div>
                    <div className="timeline-content">
                      <strong>Dernière mise à jour</strong>
                      <p>Statut: {selectedReport.status}</p>
                    </div>
                  </div>
                  <div className="timeline-item future">
                    <div className="timeline-date">À venir</div>
                    <div className="timeline-content">
                      <strong>Suivi détaillé</strong>
                      <p>Historique complet des actions sur ce signalement</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Actions</h4>
                <div className="action-buttons-modal">
                  <button 
                    className="btn btn-primary"
                    onClick={() => exportToPDF(selectedReport.id)}
                  >
                    📄 Exporter en PDF
                  </button>
                  <select 
                    value={selectedReport.status}
                    onChange={(e) => {
                      updateReportStatus(selectedReport.id, e.target.value);
                      setSelectedReport({...selectedReport, status: e.target.value});
                    }}
                    className="status-select"
                  >
                    <option value="new">Nouveau</option>
                    <option value="investigating">En enquête</option>
                    <option value="resolved">Résolu</option>
                    <option value="closed">Fermé</option>
                  </select>
                  <button 
                    className="btn btn-success" 
                    onClick={() => contactReporter(selectedReport)}
                    disabled={selectedReport.anonymity_level === 'total'}
                    title={selectedReport.anonymity_level === 'total' ? 'Signalement anonyme - contact impossible' : 'Contacter le rapporteur'}
                  >
                    📧 Contacter le rapporteur
                  </button>
                  <button className="btn btn-warning" disabled>
                    📝 Ajouter une note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h3 className="dashboard-title">Vue d'ensemble</h3>
        <p className="dashboard-subtitle">Statistiques et métriques des signalements</p>
        <button 
          className="btn btn-primary export-btn"
          onClick={() => exportToPDF()}
        >
          📄 Exporter tout en PDF
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des données...</p>
        </div>
      ) : stats ? (
        <>
          {/* Statistiques principales */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalReports}</div>
                <div className="stat-label">Total Signalements</div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-number">{stats.resolvedReports}</div>
                <div className="stat-label">Résolus</div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <div className="stat-number">{stats.pendingReports}</div>
                <div className="stat-label">En attente</div>
              </div>
            </div>

            <div className="stat-card danger">
              <div className="stat-icon">🚨</div>
              <div className="stat-content">
                <div className="stat-number">{stats.criticalReports}</div>
                <div className="stat-label">Critiques</div>
              </div>
            </div>
          </div>

          {/* Statistiques financières */}
          <div className="financial-stats">
            <h4 className="section-title">💰 Analyse Financière</h4>
            <div className="financial-grid">
              <div className="financial-card">
                <div className="financial-label">Montant Total Déclaré</div>
                <div className="financial-amount total">{formatAmount(stats.totalAmount)}</div>
              </div>
              <div className="financial-card">
                <div className="financial-label">Montant Moyen par Cas</div>
                <div className="financial-amount average">{formatAmount(stats.averageAmount)}</div>
              </div>
              <div className="financial-card">
                <div className="financial-label">Ce mois</div>
                <div className="financial-amount monthly">{stats.monthlyReports} signalement(s)</div>
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div className="recent-activity">
            <h4 className="section-title">📈 Activité Récente</h4>
            <div className="activity-list">
              {reports.slice(0, 5).map(report => (
                <div 
                  key={report.id} 
                  className="activity-item clickable" 
                  onClick={() => openReportModal(report)}
                >
                  <div className="activity-icon">
                    {report.status === 'new' ? '🆕' : 
                     report.status === 'investigating' ? '🔍' :
                     report.status === 'resolved' ? '✅' : '📁'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{report.corruption_type}</div>
                    <div className="activity-meta">
                      {report.location} • {formatDate(report.created_at)}
                    </div>
                  </div>
                  <div className="activity-status">
                    {getStatusBadge(report.status)}
                  </div>
                  <div className="activity-arrow">→</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );

  const renderUsers = () => (
    <div className="users-content">
      <div className="section-header">
        <h3 className="section-title">👥 Gestion des Utilisateurs</h3>
        <button 
          className="btn btn-primary"
          onClick={() => alert('Fonctionnalité à venir')}
        >
          ➕ Nouvel utilisateur
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des utilisateurs...</p>
        </div>
      ) : (
        <div className="modern-table-container">
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Créé le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{user.name}</div>
                          {user.phone && <div className="user-phone">{user.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="email-cell">{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.is_admin ? 'admin' : 'user'}`}>
                        {user.is_admin ? 'Administrateur' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(user.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit"
                          onClick={() => onEditUser && onEditUser(user)}
                        >
                          ✏️
                        </button>
                        {user.id !== 1 && (
                          <button 
                            className="action-btn delete"
                            onClick={() => deleteUser(user.id)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="reports-content">
      <div className="section-header">
        <h3 className="section-title">📋 Gestion des Signalements</h3>
        <div className="header-actions">
          <button 
            className="btn btn-primary export-btn"
            onClick={() => exportToPDF()}
          >
            📄 Exporter tout
          </button>
        </div>
      </div>

      {/* Filtres de recherche */}
      <div className="search-filters">
        <div className="filter-group">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Rechercher par type, description, lieu ou code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="new">Nouveau</option>
            <option value="investigating">En enquête</option>
            <option value="resolved">Résolu</option>
            <option value="closed">Fermé</option>
          </select>
          
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les secteurs</option>
            <option value="public">Secteur Public</option>
            <option value="prive">Secteur Privé</option>
          </select>
        </div>
        
        <div className="filter-results">
          <span className="results-count">
            {filteredReports.length} signalement(s) trouvé(s)
          </span>
          {(searchTerm || statusFilter !== 'all' || sectorFilter !== 'all') && (
            <button 
              className="clear-filters"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSectorFilter('all');
              }}
            >
              ✕ Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des signalements...</p>
        </div>
      ) : (
        <div className="reports-grid">
          {filteredReports.map(report => (
            <div key={report.id} className="report-card clickable" onClick={() => openReportModal(report)}>
              <div className="report-header">
                <div className="report-title">
                  <span className="report-type">{report.corruption_type}</span>
                  <span className="report-code">#{report.tracking_code}</span>
                </div>
                <div className="report-actions">
                  {getStatusBadge(report.status)}
                  <button 
                    className="action-btn export"
                    onClick={(e) => {
                      e.stopPropagation();
                      exportToPDF(report.id);
                    }}
                    title="Exporter ce signalement"
                  >
                    📄
                  </button>
                </div>
              </div>

              <div className="report-meta">
                <div className="meta-item">
                  <span className="meta-label">Secteur:</span>
                  <span className="meta-value">{report.sector}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Lieu:</span>
                  <span className="meta-value">{report.location}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Date:</span>
                  <span className="meta-value">{formatDate(report.created_at)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Anonymat:</span>
                  <span className="meta-value">{report.anonymity_level}</span>
                </div>
              </div>

              <div className="report-description">
                <p>{report.description.substring(0, 120)}...</p>
              </div>

              {report.reporter_name && report.reporter_name !== 'Signalement Anonyme' && (
                <div className="reporter-info">
                  <div className="reporter-label">Rapporteur:</div>
                  <div className="reporter-details">
                    <div>{report.reporter_name}</div>
                    {report.reporter_email && <div>{report.reporter_email}</div>}
                  </div>
                </div>
              )}

              <div className="report-footer">
                <select 
                  value={report.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateReportStatus(report.id, e.target.value);
                  }}
                  className="status-select"
                >
                  <option value="new">Nouveau</option>
                  <option value="investigating">En enquête</option>
                  <option value="resolved">Résolu</option>
                  <option value="closed">Fermé</option>
                </select>
                <div className="view-details">Cliquez pour voir les détails</div>
              </div>
            </div>
          ))}
          
          {filteredReports.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h4>Aucun signalement trouvé</h4>
              <p>Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderActivity = () => (
    <div className="activity-content">
      <div className="section-header">
        <h3 className="section-title">📊 Rapports d'Activité des Utilisateurs</h3>
        <p className="section-subtitle">Surveillez l'activité de chaque utilisateur (journée, semaine, mois)</p>
      </div>

      {/* Sélection d'utilisateur et période */}
      <div className="activity-controls">
        <div className="control-group">
          <label htmlFor="user-select">👤 Sélectionner un utilisateur :</label>
          <select 
            id="user-select"
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
            className="filter-select"
          >
            <option value="">-- Choisir un utilisateur --</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email}) {user.is_admin ? '👑' : '👤'}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="period-select">📅 Période :</label>
          <select 
            id="period-select"
            value={activityPeriod}
            onChange={(e) => setActivityPeriod(e.target.value as 'day' | 'week' | 'month')}
            className="filter-select"
          >
            <option value="day">📅 Journée</option>
            <option value="week">📅 Semaine</option>
            <option value="month">📅 Mois</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="date-select">📆 Date :</label>
          <input 
            id="date-select"
            type="date"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            className="search-input"
            style={{ width: 'auto' }}
          />
        </div>

        <div className="control-group">
          <button 
            className="btn btn-primary"
            onClick={() => selectedUserId && loadUserActivity(selectedUserId, activityPeriod, activityDate)}
            disabled={!selectedUserId || loadingActivity}
          >
            {loadingActivity ? '⏳ Chargement...' : '🔍 Générer le rapport'}
          </button>
        </div>
      </div>

      {/* Affichage du rapport d'activité */}
      {userActivity && (
        <div className="activity-report">
          <div className="activity-report-header">
            <div className="report-title-section">
              <h4>📋 Rapport d'Activité - {userActivity.user.name}</h4>
              <p className="report-period">
                {activityPeriod === 'day' ? 'Journée' : 
                 activityPeriod === 'week' ? 'Semaine' : 'Mois'} du {' '}
                {new Date(userActivity.period.startDate).toLocaleDateString('fr-FR')}
                {userActivity.period.startDate !== userActivity.period.endDate && 
                  ` au ${new Date(userActivity.period.endDate).toLocaleDateString('fr-FR')}`}
              </p>
            </div>
            <button 
              className="btn btn-success"
              onClick={() => exportUserActivityToPDF(userActivity)}
            >
              📄 Exporter PDF
            </button>
          </div>

          {/* Statistiques */}
          <div className="activity-stats">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-number">{userActivity.statistics.totalActivities}</div>
                <div className="stat-label">Activités Total</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <div className="stat-number">{userActivity.statistics.reportsCreated}</div>
                <div className="stat-label">Signalements</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔑</div>
              <div className="stat-content">
                <div className="stat-number">{userActivity.statistics.loginSessions}</div>
                <div className="stat-label">Connexions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <div className="stat-number">{Math.round(userActivity.statistics.timeSpent)}</div>
                <div className="stat-label">Minutes</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🌐</div>
              <div className="stat-content">
                <div className="stat-number">{userActivity.statistics.uniqueIPs}</div>
                <div className="stat-label">IPs Uniques</div>
              </div>
            </div>
          </div>

          {/* Timeline des activités */}
          <div className="activity-timeline">
            <h5 className="timeline-title">🕒 Chronologie des Activités ({userActivity.activities.length})</h5>
            <div className="timeline-container">
              {userActivity.activities.map((activity: any, index: number) => (
                <div key={activity.id} className="timeline-activity-item">
                  <div className="activity-time-badge">
                    <div className="activity-date">{new Date(activity.timestamp).toLocaleDateString('fr-FR')}</div>
                    <div className="activity-time">{new Date(activity.timestamp).toLocaleTimeString('fr-FR')}</div>
                  </div>
                  <div className="activity-details">
                    <div className="activity-type-icon">
                      {activity.type === 'login' ? '🔑' :
                       activity.type === 'logout' ? '🚪' :
                       activity.type === 'report_created' ? '📝' : '📋'}
                    </div>
                    <div className="activity-content">
                      <div className="activity-description">{activity.description}</div>
                      <div className="activity-meta">
                        {activity.details.reportId && <span className="meta-tag">ID: {activity.details.reportId}</span>}
                        {activity.details.trackingCode && <span className="meta-tag">Code: {activity.details.trackingCode}</span>}
                        <span className="meta-tag">IP: {activity.ip_address}</span>
                      </div>
                      {activity.details.corruptionType && (
                        <div className="activity-extra">
                          Secteur: {activity.details.sector} | Type: {activity.details.corruptionType}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Détails des signalements créés */}
          {userActivity.reports && userActivity.reports.length > 0 && (
            <div className="activity-reports">
              <h5 className="reports-title">📋 Signalements Créés ({userActivity.reports.length})</h5>
              <div className="reports-summary">
                {userActivity.reports.map((report: any) => (
                  <div key={report.id} className="report-summary-card">
                    <div className="report-summary-header">
                      <span className="report-type">{report.corruption_type}</span>
                      <span className="report-code">#{report.tracking_code}</span>
                    </div>
                    <div className="report-summary-details">
                      <div>Secteur: {report.sector}</div>
                      <div>Lieu: {report.location}</div>
                      <div>Fichiers: {report.files ? report.files.length : 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!userActivity && !loadingActivity && (
        <div className="activity-placeholder">
          <div className="placeholder-icon">📊</div>
          <h4>Aucun rapport généré</h4>
          <p>Sélectionnez un utilisateur et une période pour générer un rapport d'activité</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="modern-admin-panel">
      {/* Header avec navigation */}
      <div className="admin-header">
        <div className="admin-header-content">
          <button className="btn btn-back" onClick={onBack}>
            ← Retour à l'accueil
          </button>
          
          <div className="admin-title-section">
            <h2 className="admin-title">Panneau d'Administration</h2>
            <div className="admin-user-info">
              <span className="admin-user-icon">👤</span>
              <span className="admin-user-name">{user?.name}</span>
              <span className="admin-user-role">Administrateur</span>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="admin-navigation">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Tableau de bord</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">Utilisateurs</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-label">Signalements</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`nav-tab ${activeTab === 'activity' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Activité Utilisateurs</span>
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="admin-content">
        {error && (
          <div className="error-message">{error}</div>
        )}

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'activity' && renderActivity()}
      </div>
      
      {/* Modal pour les détails */}
      {renderReportModal()}
    </div>
  );
}