import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createJWT } from '@/lib/jwt-config';

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { username, password, adminCode } = await request.json();

        console.log(`🔐 Tentative de connexion admin: ${username}`);

        // Vérifier le code 2FA
        if (!adminCode) {
            return NextResponse.json({ error: 'Code de sécurité requis' }, { status: 400 });
        }

        // Chercher l'admin
        const admin = await prisma.user.findFirst({
            where: {
                email: username,
                isAdmin: true
            }
        });

        if (!admin) {
            console.log(`❌ Admin non trouvé pour: ${username}`);
            return NextResponse.json({ error: 'Accès administrateur non autorisé' }, { status: 401 });
        }

        console.log(`👤 Admin trouvé: ${admin.email}, ID: ${admin.id}`);

        // Vérifier le mot de passe
        const passwordValid = admin.password ? await bcrypt.compare(password, admin.password) : false;
        console.log(`🔑 Mot de passe valide: ${passwordValid}`);
        if (!passwordValid) {
            console.log(`❌ Mot de passe invalide pour: ${username}`);
            return NextResponse.json({ error: 'Identifiants administrateur invalides' }, { status: 401 });
        }

        // Vérifier le code 2FA
        const tempCode = await prisma.tempCode.findFirst({
            where: {
                email: username,
                code: adminCode,
                used: false,
                expiresAt: {
                    gt: new Date()
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!tempCode) {
            console.log(`❌ Code 2FA invalide ou expiré pour: ${username}`);
            return NextResponse.json({ error: 'Code de sécurité invalide ou expiré' }, { status: 401 });
        }

        // Marquer le code comme utilisé
        await prisma.tempCode.update({
            where: { id: tempCode.id },
            data: { used: true }
        });

        // Générer JWT admin
        const token = createJWT({ 
            id: admin.id, 
            email: admin.email, 
            is_admin: true 
        });

        console.log(`✅ Connexion admin réussie avec 2FA: ${admin.email}`);

        return NextResponse.json({
            message: 'Connexion administrateur réussie',
            token: token,
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                is_admin: true
            }
        });
    } catch (error) {
        console.error('Erreur connexion admin:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}