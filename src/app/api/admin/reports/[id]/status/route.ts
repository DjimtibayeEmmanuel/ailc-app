import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt-config';
import { prisma } from '@/lib/prisma';


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

// PUT - Mettre à jour le statut d'un signalement
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
        const { status } = await request.json();

        const validStatuses = ['new', 'investigating', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ 
                error: 'Statut invalide. Statuts valides: ' + validStatuses.join(', ') 
            }, { status: 400 });
        }

        console.log(`📝 Mise à jour statut signalement ${id} vers: ${status}`);

        try {
            const updatedReport = await prisma.report.update({
                where: { id },
                data: { 
                    status,
                    updatedAt: new Date()
                }
            });

            console.log(`✅ Statut mis à jour: ${id} -> ${status}`);
            return NextResponse.json({ message: 'Statut mis à jour avec succès' });
        } catch (error: any) {
            if (error.code === 'P2025') {
                return NextResponse.json({ error: 'Signalement non trouvé' }, { status: 404 });
            }
            console.error('Erreur mise à jour statut:', error);
            return NextResponse.json({ error: 'Erreur de mise à jour' }, { status: 500 });
        }
    } catch (error) {
        console.error('Erreur mise à jour statut:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}