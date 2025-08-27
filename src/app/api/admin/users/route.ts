import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/admin-auth';

// GET - Récupérer tous les utilisateurs
export async function GET(request: NextRequest) {
    const authResult = await verifyAdminSession(request);
    if (authResult.error) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    console.log('📊 Admin demande la liste des utilisateurs');

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isAdmin: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`✅ ${users.length} utilisateurs retournés à l'admin`);
        return NextResponse.json(users);
    } catch (error) {
        console.error('Erreur récupération utilisateurs:', error);
        return NextResponse.json({ error: 'Erreur de base de données' }, { status: 500 });
    }
}

// POST - Créer un utilisateur (depuis l'admin)
export async function POST(request: NextRequest) {
    const authResult = await verifyAdminSession(request);
    if (authResult.error) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    try {
        const { name, email, phone, password, isAdmin } = await request.json();

        console.log(`👤 Admin crée un utilisateur: ${email}`);

        // Rediriger vers l'API de création d'utilisateur existante
        const createRequest = new Request(new URL('/api/create-user', request.url), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, phone, password, isAdmin }),
        });

        // Utiliser directement l'API de création d'utilisateur
        return NextResponse.json({ error: 'Utilisez l\'API /api/create-user pour créer des utilisateurs' }, { status: 501 });
    } catch (error) {
        console.error('Erreur création utilisateur admin:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}