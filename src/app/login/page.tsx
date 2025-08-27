import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./components/LoginForm";

type Props = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  
  // Si l'utilisateur est déjà connecté et est admin, rediriger vers /admin
  if (session?.user && (session.user as any).isAdmin) {
    redirect('/admin');
  }

  return <LoginForm error={params.error} />;
}