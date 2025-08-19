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

        // Envoyer l'email avec retry automatique (ou skip si config manquante)
        let emailSent = false;
        try {
            emailSent = await send2FAEmail(email, code);
        } catch (emailError) {
            console.log(`⚠️ Erreur envoi email, continuons sans: ${emailError}`);
        }
        
        // Toujours retourner succès pour éviter le blocage
        console.log(`✅ Code 2FA généré pour ${email} - Email ${emailSent ? 'envoyé' : 'ignoré'}`);
        const response = NextResponse.json({ 
            message: emailSent ? 'Code de sécurité envoyé par email' : 'Code généré (vérifiez la console)',
            expiresIn: '10 minutes',
            code: process.env.NODE_ENV === 'development' ? code : undefined // Debug en dev uniquement
        });
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        return response;
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