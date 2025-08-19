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

// GET - Récupérer l'activité d'un utilisateur
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const authResult = verifyAdminToken(request);
    if (authResult.error) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { userId } = await params;
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'day'; // day, week, month
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    console.log(`📊 Demande rapport activité utilisateur ${userId} pour ${period} du ${date}`);


    // Calculer les dates de début et fin selon la période
    let startDate: string, endDate: string;
    const targetDate = new Date(date);

    switch (period) {
        case 'week':
            // Début de la semaine (lundi)
            const startOfWeek = new Date(targetDate);
            startOfWeek.setDate(targetDate.getDate() - targetDate.getDay() + 1);
            startDate = startOfWeek.toISOString().split('T')[0];
            
            // Fin de la semaine (dimanche)
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endDate = endOfWeek.toISOString().split('T')[0];
            break;
            
        case 'month':
            // Début du mois
            startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString().split('T')[0];
            // Fin du mois
            endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).toISOString().split('T')[0];
            break;
            
        default: // 'day'
            startDate = endDate = date;
    }

    try {
        // Récupérer les informations de l'utilisateur
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        // Récupérer les signalements créés par cet utilisateur dans la période
        const reports = await prisma.report.findMany({
            where: {
                userId: userId,
                createdAt: {
                    gte: new Date(startDate + 'T00:00:00.000Z'),
                    lte: new Date(endDate + 'T23:59:59.999Z')
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Pour simuler d'autres activités, on peut ajouter des timestamps fictifs
        // En production, cela viendrait d'une vraie table d'audit
        const activities = [
            ...reports.map(report => ({
                id: `report_${report.id}`,
                type: 'report_created',
                description: `Signalement créé: ${report.corruptionType}`,
                details: {
                    reportId: report.id,
                    trackingCode: report.trackingCode,
                    corruptionType: report.corruptionType,
                    sector: report.sector,
                    location: report.location
                },
                timestamp: report.createdAt.toISOString(),
                ip_address: report.ipAddress || 'N/A',
                user_agent: report.userAgent || 'N/A'
            }))
        ];

        // Ajouter des activités simulées de connexion/déconnexion
        if (activities.length > 0) {
            const firstActivity = new Date(activities[0].timestamp);
            const lastActivity = new Date(activities[activities.length - 1].timestamp);
            
            // Simuler une connexion avant la première activité
            activities.unshift({
                id: `login_${firstActivity.getTime()}`,
                type: 'login',
                description: 'Connexion utilisateur',
                details: { sessionStart: true },
                timestamp: new Date(firstActivity.getTime() - 5 * 60 * 1000).toISOString(), // 5 min avant
                ip_address: reports[0]?.ipAddress || 'N/A',
                user_agent: reports[0]?.userAgent || 'N/A'
            });

            // Simuler une déconnexion après la dernière activité
            activities.push({
                id: `logout_${lastActivity.getTime()}`,
                type: 'logout',
                description: 'Déconnexion utilisateur',
                details: { sessionEnd: true },
                timestamp: new Date(lastActivity.getTime() + 10 * 60 * 1000).toISOString(), // 10 min après
                ip_address: reports[reports.length - 1]?.ipAddress || 'N/A',
                user_agent: reports[reports.length - 1]?.userAgent || 'N/A'
            });
        }

        // Trier par timestamp décroissant
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const activitySummary = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                is_admin: user.isAdmin,
                created_at: user.createdAt
            },
            period: {
                type: period,
                startDate,
                endDate,
                requestedDate: date
            },
            statistics: {
                totalActivities: activities.length,
                reportsCreated: reports.length,
                loginSessions: activities.filter(a => a.type === 'login').length,
                uniqueIPs: [...new Set(activities.map(a => a.ip_address).filter(ip => ip !== 'N/A'))].length,
                timeSpent: activities.length > 1 ? 
                    (new Date(activities[0].timestamp).getTime() - new Date(activities[activities.length - 1].timestamp).getTime()) / (1000 * 60) 
                    : 0 // minutes
            },
            activities: activities,
            reports: reports.map(report => ({
                ...report,
                files: report.files ? JSON.parse(report.files) : []
            }))
        };

        console.log(`✅ Rapport activité généré pour ${user.name}: ${activities.length} activités, ${reports.length} signalements`);
        return NextResponse.json(activitySummary);
    } catch (error) {
        console.error('Erreur génération rapport activité:', error);
        return NextResponse.json({ error: 'Erreur de base de données' }, { status: 500 });
    }
}