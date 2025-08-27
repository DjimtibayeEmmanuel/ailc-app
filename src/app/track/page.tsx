'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReportTracking from '@/components/ReportTracking';

export default function TrackPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="track-container">
      <ReportTracking onBack={handleBack} />
    </div>
  );
}