import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function verifyAdminSession(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { error: 'Session requise', status: 401 };
    }
    
    if (!(session.user as any).isAdmin) {
      return { error: 'Accès administrateur requis', status: 403 };
    }
    
    return { user: session.user };
  } catch (error) {
    return { error: 'Erreur de vérification de session', status: 500 };
  }
}