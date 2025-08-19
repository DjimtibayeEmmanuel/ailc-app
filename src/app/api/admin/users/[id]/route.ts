import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt-config';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { isValidEmail } from '@/lib/utils';


// Middleware pour vérifier l'authentification admin
function verifyAdminToken(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return { error: 'Token d\'accès requis', status: 401 };
    }

    try {
        const decoded = verifyJWT(token);
        if (!decoded.is_admin) {
            return { error: 'Accès administrateur requis', status: 403 };
        }
        return { user: decoded };
    } catch (error) {
        return { error: 'Token invalide', status: 403 };
    }
}

// GET - Récupérer un utilisateur spécifique
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = verifyAdminToken(request);
    if (authResult.error) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    console.log(`🔍 Admin demande l'utilisateur: ${id}`);

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isAdmin: true,
                createdAt: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        console.log(`✅ Utilisateur trouvé: ${user.email}`);
        return NextResponse.json(user);
    } catch (error) {
        console.error('Erreur récupération utilisateur:', error);
        return NextResponse.json({ error: 'Erreur de base de données' }, { status: 500 });
    }
}

// PUT - Modifier un utilisateur
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = verifyAdminToken(request);
    if (authResult.error) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    try {
        const { id } = await params;
        const { name, email, phone, password, isAdmin } = await request.json();

        console.log(`✏️ Admin modifie l'utilisateur: ${id}`);

        // Validation
        if (!name || !email) {
            return NextResponse.json({ error: 'Nom et email sont requis' }, { status: 400 });
        }

        if (!isValidEmail(email)) {
            return NextResponse.json({ error: 'Format d\'email invalide' }, { status: 400 });
        }

        // Vérifier que l'utilisateur existe
        const existingUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
        const emailCheck = await prisma.user.findFirst({
            where: {
                email,
                NOT: { id }
            }
        });

        if (emailCheck) {
            return NextResponse.json({ error: 'Cet email est déjà utilisé par un autre utilisateur' }, { status: 409 });
        }

        // Préparer les données de mise à jour
        const updateData: any = {
            name,
            email,
            phone: phone || null,
            isAdmin
        };

        // Si un nouveau mot de passe est fourni, l'inclure dans la mise à jour
        if (password && password.trim()) {
            if (password.length < 6) {
                return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 });
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Effectuer la mise à jour
        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isAdmin: true
            }
        });

        console.log(`✅ Utilisateur mis à jour: ${email}`);
        return NextResponse.json({
            message: 'Utilisateur mis à jour avec succès',
            user: updatedUser
        });
    } catch (error) {
        console.error('Erreur modification utilisateur:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = verifyAdminToken(request);
    if (authResult.error) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    console.log(`🗑️ Admin supprime l'utilisateur: ${id}`);

    // Empêcher la suppression de l'utilisateur admin principal
    if (parseInt(id) === 1) {
        return NextResponse.json({ error: 'Impossible de supprimer l\'administrateur principal' }, { status: 403 });
    }

    try {
        const deletedUser = await prisma.user.delete({
            where: { id }
        });

        console.log(`✅ Utilisateur supprimé: ${id}`);
        return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
        }
        console.error('Erreur suppression utilisateur:', error);
        return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }
}