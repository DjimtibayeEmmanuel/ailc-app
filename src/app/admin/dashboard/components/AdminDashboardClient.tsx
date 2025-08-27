'use client';

import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import AdminPanel from '@/components/AdminPanel';

interface AdminDashboardClientProps {
  user: any;
}

export default function AdminDashboardClient({ user }: AdminDashboardClientProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleBack = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleEditUser = (user: any) => {
    sessionStorage.setItem('editingUser', JSON.stringify(user));
    router.push(`/admin/dashboard/users/${user.id}`);
  };

  // Vérification de sécurité côté client aussi
  if (!session?.user || !(session.user as any).isAdmin) {
    router.push('/admin');
    return null;
  }

  // AdminPanel fonctionne maintenant avec les cookies de session NextAuth
  // Les API routes vérifieront automatiquement la session
  const authToken = 'nextauth-session'; // Token fictif pour compatibilité

  return (
    <AdminPanel 
      authToken={authToken}
      user={user}
      onBack={handleBack}
      onEditUser={handleEditUser}
    />
  );
}