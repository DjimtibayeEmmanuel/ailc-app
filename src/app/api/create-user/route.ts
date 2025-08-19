import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { UserSchema, validateInput, prepareSqlParams } from '@/lib/input-validation';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validation sécurisée avec Zod
        const validationResult = validateInput(UserSchema, body);
        
        if (!validationResult.success) {
            console.log('❌ Validation utilisateur échouée:', validationResult.errors);
            return NextResponse.json({ 
                error: 'Données utilisateur invalides',
                details: validationResult.errors
            }, { status: 400 });
        }

        const { name, email, phone, password, isAdmin } = validationResult.data;
        console.log(`👤 Création sécurisée d'utilisateur: ${email.replace(/(.{3}).*(@.*)/, '$1***$2')}`);

        // Vérifier que l'email n'existe pas déjà
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 409 });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Créer l'utilisateur avec Prisma
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                phone: phone || null,
                password: hashedPassword,
                isAdmin: isAdmin || false
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isAdmin: true
            }
        });

        console.log(`✅ Utilisateur créé: ${email} (ID: ${newUser.id})`);

        return NextResponse.json({
            message: 'Utilisateur créé avec succès',
            userId: newUser.id,
            user: newUser
        });
    } catch (error) {
        console.error('Erreur création utilisateur:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}