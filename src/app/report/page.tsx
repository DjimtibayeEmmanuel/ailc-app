'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReportForm from '@/components/ReportForm';

export default function ReportPage() {
  const router = useRouter();

  const handleReportSuccess = (trackingCode: string, reportId: string) => {
    // Store report data and redirect to success page
    sessionStorage.setItem('reportData', JSON.stringify({ trackingCode, reportId }));
    router.push('/report/success');
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="report-container">
      <ReportForm 
        onBack={handleBack}
        onSuccess={handleReportSuccess}
      />
    </div>
  );
}