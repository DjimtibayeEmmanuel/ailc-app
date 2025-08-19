import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ trackingCode: string }> }
) {
    const { trackingCode } = await params;

    if (!trackingCode || trackingCode.length !== 8) {
        return NextResponse.json({ error: 'Code de suivi invalide (8 caractères requis)' }, { status: 400 });
    }

    console.log(`🔍 Recherche signalement avec code: ${trackingCode}`);

    try {
        const report = await prisma.report.findUnique({
            where: {
                trackingCode: trackingCode.toUpperCase()
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                files: true
            }
        });

        if (!report) {
            console.log(`❌ Signalement non trouvé pour le code: ${trackingCode}`);
            return NextResponse.json({ error: 'Signalement non trouvé avec ce code de suivi' }, { status: 404 });
        }

        const statusMessages = {
            'new': 'Signalement reçu et en attente de traitement',
            'investigating': 'Enquête en cours par nos services',
            'resolved': 'Affaire résolue',
            'closed': 'Dossier fermé'
        };

        // Compter les fichiers
        let filesCount = 0;
        if (report.files && report.files !== '[]') {
            try {
                const files = JSON.parse(report.files);
                filesCount = files.length;
            } catch (e) {
                console.error('Erreur parsing fichiers:', e);
            }
        }

        console.log(`✅ Signalement trouvé: ${report.id}, statut: ${report.status}, fichiers: ${filesCount}`);

        return NextResponse.json({
            reportId: report.id,
            status: report.status,
            statusMessage: statusMessages[report.status as keyof typeof statusMessages] || 'Statut inconnu',
            filesCount: filesCount,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt
        });
    } catch (error) {
        console.error('Erreur recherche signalement:', error);
        return NextResponse.json({ error: 'Erreur de base de données' }, { status: 500 });
    }
}