'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReportSuccess from '@/components/ReportSuccess';

export  default async function ReportSuccessPage() {
  const [reportData, setReportData] = useState<{trackingCode: string, reportId: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get report data from session storage
    const storedData = sessionStorage.getItem('reportData');
    
    if (!storedData) {
      router.push('/');
      return;
    }
    
    setReportData(JSON.parse(storedData));
    setLoading(false);
    
    // Clear the stored data after using it
    sessionStorage.removeItem('reportData');
  }, [router]);

  const handleBack = () => {
    router.push('/');
  };

  const handleNewReport = () => {
    router.push('/report');
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!reportData) {
    return null;
  }

  return (
    <div className="success-container">
      <ReportSuccess 
        trackingCode={reportData.trackingCode}
        reportId={reportData.reportId}
        onBack={handleBack}
        onNewReport={handleNewReport}
      />
    </div>
  );
}