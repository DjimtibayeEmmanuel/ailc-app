import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { verifyJWT } from '@/lib/jwt-config';

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

// GET - Récupérer tous les signalements
export async function GET(request: NextRequest) {
    const authResult = verifyAdminToken(request);
    if (authResult.error) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const sector = url.searchParams.get('sector');
    const severity = url.searchParams.get('severity');

    console.log('📊 Admin demande la liste des signalements');

    try {
        // Construire les filtres Prisma
        const where: any = {};
        
        if (status) {
            where.status = status;
        }
        if (sector) {
            where.sector = sector;
        }
        if (severity) {
            where.severity = severity;
        }

        // Récupérer les signalements avec Prisma
        const reports = await prisma.report.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Traiter les données pour respecter l'anonymat et déchiffrer si nécessaire
        const processedReports = reports.map(report => {
            const processedReport = { ...report } as any;
            
            // Supprimer les données sensibles des réponses
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

            if (report.anonymityLevel === 'anonymous') {
                processedReport.reporter_name = 'Signalement Anonyme';
                processedReport.reporter_email = 'Non communiqué';
                processedReport.reporter_phone = 'Non communiqué';
            } else if (report.anonymityLevel === 'confidential') {
                // Pour l'admin, déchiffrer les données
                processedReport.reporter_name = report.reporterNameEncrypted ? decrypt(report.reporterNameEncrypted) : 'Non fourni';
                processedReport.reporter_email = report.reporterEmailEncrypted ? decrypt(report.reporterEmailEncrypted) : 'Non fourni';
                processedReport.reporter_phone = report.reporterPhoneEncrypted ? decrypt(report.reporterPhoneEncrypted) : 'Non fourni';
            } else {
                // Anonymité non demandée, déchiffrer les données
                processedReport.reporter_name = report.reporterNameEncrypted ? decrypt(report.reporterNameEncrypted) : 'Non fourni';
                processedReport.reporter_email = report.reporterEmailEncrypted ? decrypt(report.reporterEmailEncrypted) : 'Non fourni';
                processedReport.reporter_phone = report.reporterPhoneEncrypted ? decrypt(report.reporterPhoneEncrypted) : 'Non fourni';
            }

            return processedReport;
        });

        console.log(`✅ ${processedReports.length} signalements retournés à l'admin`);
        return NextResponse.json(processedReports);
    } catch (error) {
        console.error('Erreur récupération signalements:', error);
        return NextResponse.json({ error: 'Erreur de base de données' }, { status: 500 });
    }
}