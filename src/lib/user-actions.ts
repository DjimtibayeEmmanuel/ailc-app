'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Action pour créer un utilisateur
export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const isAdmin = formData.get('isAdmin') === 'on';

  if (!name || !email || !password) {
    redirect('/admin/dashboard/users?error=missing-fields');
  }

  try {
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      redirect('/admin/dashboard/users?error=email-exists');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isAdmin
      }
    });

    revalidatePath('/admin/dashboard/users');
    redirect('/admin/dashboard/users?success=user-created');

  } catch (error) {
    console.error('Create user error:', error);
    redirect('/admin/dashboard/users?error=server-error');
  }
}

// Action pour modifier un utilisateur
export async function updateUser(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const isAdmin = formData.get('isAdmin') === 'on';

  if (!id || !name || !email) {
    redirect('/admin/dashboard/users?error=missing-fields');
  }

  try {
    // Vérifier si l'email existe déjà pour un autre utilisateur
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        NOT: { id }
      }
    });

    if (existingUser) {
      redirect(`/admin/dashboard/users/${id}?error=email-exists`);
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      name,
      email,
      isAdmin
    };

    // Ajouter le mot de passe seulement s'il est fourni
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id },
      data: updateData
    });

    revalidatePath('/admin/dashboard/users');
    redirect('/admin/dashboard/users?success=user-updated');

  } catch (error) {
    console.error('Update user error:', error);
    redirect(`/admin/dashboard/users/${id}?error=server-error`);
  }
}

// Action pour supprimer un utilisateur
export async function deleteUser(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    redirect('/admin/dashboard/users?error=missing-id');
  }

  try {
    await prisma.user.delete({
      where: { id }
    });

    revalidatePath('/admin/dashboard/users');
    redirect('/admin/dashboard/users?success=user-deleted');

  } catch (error) {
    console.error('Delete user error:', error);
    redirect('/admin/dashboard/users?error=server-error');
  }
}

// Action pour basculer le statut admin
export async function toggleAdminStatus(formData: FormData) {
  const id = formData.get('id') as string;
  const currentIsAdmin = formData.get('currentIsAdmin') === 'true';

  if (!id) {
    redirect('/admin/dashboard/users?error=missing-id');
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { isAdmin: !currentIsAdmin }
    });

    revalidatePath('/admin/dashboard/users');
    redirect('/admin/dashboard/users?success=admin-status-updated');

  } catch (error) {
    console.error('Toggle admin status error:', error);
    redirect('/admin/dashboard/users?error=server-error');
  }
}