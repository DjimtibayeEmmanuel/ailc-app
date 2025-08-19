'use client';

import { useState } from 'react';
import MainOptions from '@/components/MainOptions';
import AdminLogin from '@/components/AdminLogin';
import UserCreation from '@/components/UserCreation';
import ReportForm from '@/components/ReportForm';
import ReportTracking from '@/components/ReportTracking';
import ReportSuccess from '@/components/ReportSuccess';
import AdminPanel from '@/components/AdminPanel';
import UserEdit from '@/components/UserEdit';

type ViewType = 'main' | 'admin' | 'reportForm' | 'tracking' | 'adminPanel' | 'reportSuccess' | 'userEdit';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [authToken, setAuthToken] = useState('');
  const [user, setUser] = useState<any>(null);
  const [reportData, setReportData] = useState<{trackingCode: string, reportId: string} | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleAdminLoginSuccess = (token: string, userData: any) => {
    setAuthToken(token);
    setUser(userData);
    setCurrentView('adminPanel');
    alert('Connexion administrateur réussie !');
  };

  const handleReportSuccess = (trackingCode: string, reportId: string) => {
    setReportData({ trackingCode, reportId });
    setCurrentView('reportSuccess');
  };

  const backToMain = () => {
    setCurrentView('main');
    setReportData(null);
    setEditingUser(null);
  };

  const showUserEdit = (user: any) => {
    setEditingUser(user);
    setCurrentView('userEdit');
  };

  const backToAdmin = () => {
    setCurrentView('adminPanel');
    setEditingUser(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'admin':
        return (
          <AdminLogin 
            onBack={backToMain}
            onLoginSuccess={handleAdminLoginSuccess}
          />
        );
      
      
      case 'reportForm':
        return (
          <ReportForm 
            onBack={backToMain}
            onSuccess={handleReportSuccess}
          />
        );
      
      case 'tracking':
        return (
          <ReportTracking onBack={backToMain} />
        );
      
      case 'reportSuccess':
        return reportData ? (
          <ReportSuccess 
            trackingCode={reportData.trackingCode}
            reportId={reportData.reportId}
            onBack={backToMain}
            onNewReport={() => setCurrentView('reportForm')}
          />
        ) : null;
      
      case 'adminPanel':
        return (
          <AdminPanel 
            authToken={authToken}
            user={user}
            onBack={backToMain}
            onEditUser={showUserEdit}
          />
        );
      
      case 'userEdit':
        return (
          <UserEdit 
            user={editingUser}
            authToken={authToken}
            onBack={backToAdmin}
            onSave={backToAdmin}
          />
        );
      
      default:
        return (
          <MainOptions
            onShowAdmin={() => setCurrentView('admin')}
            onShowReportForm={() => setCurrentView('reportForm')}
            onShowTracking={() => setCurrentView('tracking')}
          />
        );
    }
  };

  return (
    <div className="container">
      {renderCurrentView()}
    </div>
  );
}