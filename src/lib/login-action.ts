'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { encode } from 'next-auth/jwt';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    redirect('/login?error=missing-credentials');
  }

  try {
    // Vérifier l'utilisateur admin
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password || !user.isAdmin) {
      redirect('/login?error=invalid-credentials');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      redirect('/login?error=invalid-credentials');
    }

    // Créer un token NextAuth compatible
    const token = await encode({
      token: {
        sub: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
      },
      secret: process.env.NEXTAUTH_SECRET!
    });

    // Définir le cookie de session NextAuth
    const cookieStore = cookies();
    cookieStore.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 heures
      path: '/'
    });

    redirect('/admin');

  } catch (error) {
    console.error('Login error:', error);
    redirect('/login?error=server-error');
  }
}