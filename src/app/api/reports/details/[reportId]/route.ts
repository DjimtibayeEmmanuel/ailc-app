import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ reportId: string }> }
) {
    const { reportId } = await params;

    if (!reportId) {
        return NextResponse.json({ error: 'ID de signalement requis' }, { status: 400 });
    }

    console.log(`🔍 Récupération détails signalement: ${reportId}`);

    try {
        const report = await prisma.report.findUnique({
            where: { id: reportId }
        });

        if (!report) {
            console.log(`❌ Signalement non trouvé: ${reportId}`);
            return NextResponse.json({ error: 'Signalement non trouvé' }, { status: 404 });
        }

        // Traiter les données selon le niveau d'anonymat
        const processedReport = { ...report } as any;
        
        // Supprimer les données sensibles
        delete processedReport.reporterNameEncrypted;
        delete processedReport.reporterPhoneEncrypted;
        delete processedReport.reporterEmailEncrypted;
        delete processedReport.ipAddress;
        delete processedReport.userAgent;

        // Parser les fichiers JSON
        if (report.files) {
            try {
                processedReport.files = JSON.parse(report.files);
            } catch (e) {
                processedReport.files = [];
            }
        } else {
            processedReport.files = [];
        }

        // Gérer l'anonymat (pour l'affichage après soumission, on peut montrer plus d'infos)
        if (report.anonymityLevel === 'anonymous') {
            processedReport.reporter_name = 'Signalement Anonyme';
            processedReport.reporter_email = 'Non communiqué';
            processedReport.reporter_phone = 'Non communiqué';
        } else {
            // Déchiffrer les données pour l'affichage
            processedReport.reporter_name = report.reporterNameEncrypted ? 
                decrypt(report.reporterNameEncrypted) || 'Non fourni' : 'Non fourni';
            processedReport.reporter_email = report.reporterEmailEncrypted ? 
                decrypt(report.reporterEmailEncrypted) || 'Non fourni' : 'Non fourni';
            processedReport.reporter_phone = report.reporterPhoneEncrypted ? 
                decrypt(report.reporterPhoneEncrypted) || 'Non fourni' : 'Non fourni';
        }

        console.log(`✅ Détails signalement récupérés: ${reportId}, fichiers: ${processedReport.files.length}`);

        return NextResponse.json(processedReport);
    } catch (error) {
        console.error('Erreur récupération signalement:', error);
        return NextResponse.json({ error: 'Erreur de base de données' }, { status: 500 });
    }
}