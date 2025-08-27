'use client';

import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

// Import du composant AdminPanel original avec tous ses interfaces
import { useState as useStateOriginal, useEffect as useEffectOriginal } from 'react';

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

interface AdminPanelWithAuthProps {
  user: any;
}

export default function AdminPanelWithAuth({ user }: AdminPanelWithAuthProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  // États du panel admin
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

  // Fonction API utilisant NextAuth session
  const apiCall = async (endpoint: string, method = 'GET', data?: any) => {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        // NextAuth gère automatiquement les cookies de session
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

  const handleBack = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleEditUser = (user: any) => {
    sessionStorage.setItem('editingUser', JSON.stringify(user));
    router.push(`/admin/dashboard/users/${user.id}`);
  };

  // Rediriger si pas de session valide
  if (!session?.user || !(session.user as any).isAdmin) {
    router.push('/admin');
    return null;
  }

  // Réutiliser toute la logique de AdminPanel mais avec notre apiCall qui utilise NextAuth
  // Pour simplifier, nous importons directement AdminPanel et remplaçons juste les props
  
  return (
    <div>
      {/* Ici nous pourrions copier tout le contenu d'AdminPanel */}
      {/* Ou créer une version modifiée qui utilise NextAuth */}
      <p>AdminPanel avec NextAuth - En cours de développement</p>
    </div>
  );
}