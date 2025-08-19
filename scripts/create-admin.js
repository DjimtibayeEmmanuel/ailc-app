// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        console.log('🔐 Création d\'un administrateur...');

        // Vérifier si un admin existe déjà
        const existingAdmin = await prisma.user.findFirst({
            where: {
                isAdmin: true
            }
        });

        if (existingAdmin) {
            console.log('⚠️  Un administrateur existe déjà:', existingAdmin.email);
            console.log('🔄 Mise à jour du mot de passe...');
            
            // Mettre à jour le mot de passe
            const hashedPassword = await bcrypt.hash('12345678', 10);
            
            const updatedAdmin = await prisma.user.update({
                where: { id: existingAdmin.id },
                data: { password: hashedPassword },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    isAdmin: true,
                    createdAt: true
                }
            });

            console.log('✅ Mot de passe administrateur mis à jour:');
            console.log('   📧 Email:', updatedAdmin.email);
            console.log('   🔑 Mot de passe: 12345678');
            console.log('   🆔 ID:', updatedAdmin.id);
        } else {
            // Créer un nouvel admin
            const hashedPassword = await bcrypt.hash('71secret2fale', 10);
            
            const newAdmin = await prisma.user.create({
                data: {
                    name: 'Administrateur AILC',
                    email: 'djimtehassane92@gmail.com',
                    password: hashedPassword,
                    isAdmin: true,
                    phone: '+23530429898'
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    isAdmin: true,
                    createdAt: true
                }
            });

            console.log('✅ Administrateur créé avec succès:');
            console.log('   👤 Nom:', newAdmin.name);
            console.log('   📧 Email:', newAdmin.email);
            console.log('   🔑 Mot de passe: 71secret2fale');
            console.log('   🆔 ID:', newAdmin.id);
            console.log('   📅 Créé le:', newAdmin.createdAt);
        }

        console.log('\n🎯 Informations de connexion:');
        console.log('   URL: http://localhost:3000');
        console.log('   Email: admin@ailc-tchad.org');
        console.log('   Mot de passe: 12345678');
        console.log('\n⚠️  IMPORTANT: Changez ce mot de passe en production !');

    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'administrateur:', error);
        
        if (error.code === 'P2002') {
            console.log('💡 L\'email existe déjà. Utilisez un email différent ou mettez à jour l\'utilisateur existant.');
        } else if (error.code === 'P2025') {
            
            console.log('💡 Utilisateur non trouvé lors de la mise à jour.');
        } else {
            console.log('💡 Vérifiez que la base de données est accessible et que les migrations sont appliquées.');
            console.log('   Commandes à exécuter:');
            console.log('   - npm run db:migrate');
            console.log('   - npm run db:generate');
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script
if (require.main === module) {
    createAdmin();
}

module.exports = { createAdmin };