import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generate2FACode, send2FAEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            const response = NextResponse.json({ error: 'Email requis' }, { status: 400 });
            response.headers.set('Access-Control-Allow-Origin', '*');
            response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
            return response;
        }

        console.log(`🔐 Demande de code 2FA pour: ${email}`);

        // Vérifier que l'email existe et est admin
        const admin = await prisma.user.findFirst({
            where: {
                email,
                isAdmin: true
            }
        });

        if (!admin) {
            const response = NextResponse.json({ error: 'Compte administrateur non trouvé' }, { status: 404 });
            response.headers.set('Access-Control-Allow-Origin', '*');
            response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
            return response;
        }

        // Générer le code 2FA
        const code = generate2FACode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Sauvegarder le code temporaire avec Prisma
        await prisma.tempCode.create({
            data: {
                email,
                code,
                expiresAt
            }
        });

        // Envoyer l'email avec retry automatique
        const emailSent = await send2FAEmail(email, code);
        
        if (emailSent) {
            console.log(`✅ Code 2FA généré et envoyé à ${email}`);
            const response = NextResponse.json({ 
                message: 'Code de sécurité envoyé par email',
                expiresIn: '10 minutes'
            });
            response.headers.set('Access-Control-Allow-Origin', '*');
            response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
            return response;
        } else {
            // Fallback: retourner succès même si email échoue
            console.log(`⚠️ Code généré mais email non envoyé pour ${email}`);
            const response = NextResponse.json({ 
                message: 'Code généré mais problème d\'envoi email',
                expiresIn: '10 minutes'
            });
            response.headers.set('Access-Control-Allow-Origin', '*');
            response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
            return response;
        }
    } catch (error) {
        console.error('Erreur demande 2FA:', error);
        const response = NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        return response;
    }
}

// Méthode OPTIONS pour les requêtes preflight CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}