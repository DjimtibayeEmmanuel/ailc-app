import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  // Si l'utilisateur est déjà connecté et est admin, aller au dashboard
  if (session?.user && (session.user as any).isAdmin) {
    redirect('/admin/dashboard');
  }
  
  // Sinon, forcer la connexion via /login
  redirect('/login');
}