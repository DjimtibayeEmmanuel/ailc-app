#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Générateur de secrets sécurisés AILC Tchad\n');

// Fonction pour générer un secret JWT fort
function generateJWTSecret() {
    return crypto.randomBytes(64).toString('base64');
}

// Fonction pour générer une clé de chiffrement de 32 caractères
function generateEncryptionKey() {
    const bytes = crypto.randomBytes(24); // 24 bytes = 32 chars en base64
    const base64 = bytes.toString('base64');
    return base64.slice(0, 32); // Garantir exactement 32 caractères
}

// Fonction pour générer un mot de passe sécurisé
function generateSecurePassword(length = 32) {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz23456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(crypto.randomInt(0, chars.length));
    }
    return password;
}

// Générer tous les secrets
const secrets = {
    JWT_SECRET: generateJWTSecret(),
    ENCRYPTION_KEY: generateEncryptionKey(),
    ADMIN_MASTER_PASSWORD: generateSecurePassword(24),
    SMTP_SECURE_PASS: generateSecurePassword(32)
};

console.log('✅ Secrets générés avec succès:\n');

// Afficher les secrets générés
Object.entries(secrets).forEach(([key, value]) => {
    console.log(`${key}="${value}"`);
});

console.log('\n🔒 Instructions de sécurité:');
console.log('1. Copiez ces variables dans votre fichier .env.local');
console.log('2. Ne partagez JAMAIS ces secrets');
console.log('3. Utilisez des mots de passe d\'application pour SMTP');
console.log('4. Changez le mot de passe admin par défaut');

// Créer un fichier .env.secure avec les nouveaux secrets
const envSecureContent = `# SECRETS SÉCURISÉS GÉNÉRÉS LE ${new Date().toISOString()}
# ⚠️ CONFIDENTIEL - Ne pas commiter dans Git

# JWT Secret (512 bits)
JWT_SECRET="${secrets.JWT_SECRET}"
JWT_EXPIRES_IN=8h

# Clé de chiffrement AES-256 (32 caractères exactement)
ENCRYPTION_KEY="${secrets.ENCRYPTION_KEY}"

# Configuration email sécurisée
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@ailc.td
SMTP_PASS="${secrets.SMTP_SECURE_PASS}"

# Mot de passe master admin (à changer après première connexion)
ADMIN_MASTER_PASSWORD="${secrets.ADMIN_MASTER_PASSWORD}"

# Configuration production
NODE_ENV=production
DATABASE_URL=./ailc_tchad_database_prod.db

# Rate limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900

# Session sécurisée
SESSION_TIMEOUT=28800
`;

const envSecurePath = path.join(__dirname, '..', '.env.secure');
fs.writeFileSync(envSecurePath, envSecureContent);

console.log(`\n💾 Fichier .env.secure créé: ${envSecurePath}`);
console.log('5. Renommez .env.secure en .env.local pour l\'utiliser');
console.log('6. Configurez SMTP_USER avec votre vraie adresse email');

// Vérifier les forces des secrets
console.log('\n🛡️ Analyse de sécurité des secrets générés:');

function analyzeSecretStrength(secret, name) {
    const entropy = secret.length * Math.log2(94); // 94 caractères possibles
    let strength = 'Faible';
    
    if (entropy >= 128) strength = 'Très fort';
    else if (entropy >= 80) strength = 'Fort';
    else if (entropy >= 60) strength = 'Moyen';
    
    console.log(`  - ${name}: ${strength} (${entropy.toFixed(1)} bits d'entropie)`);
}

analyzeSecretStrength(secrets.JWT_SECRET, 'JWT_SECRET');
analyzeSecretStrength(secrets.ENCRYPTION_KEY, 'ENCRYPTION_KEY');
analyzeSecretStrength(secrets.ADMIN_MASTER_PASSWORD, 'ADMIN_MASTER_PASSWORD');

console.log('\n🚀 Prêt pour un déploiement sécurisé!');
console.log('📋 TODO: Mettre à jour le mot de passe admin dans la base de données');

// Générer un script de mise à jour du mot de passe admin
const updateAdminScript = `-- Mettre à jour le mot de passe administrateur
-- Exécuter ce script après avoir configuré les nouveaux secrets

UPDATE users 
SET password = '$2a$10$' || '${crypto.randomBytes(22).toString('base64').slice(0, 22)}'
WHERE email = 'admin@ailc.td' AND is_admin = 1;

-- Vérifier la mise à jour
SELECT id, email, is_admin, created_at 
FROM users 
WHERE email = 'admin@ailc.td';
`;

fs.writeFileSync(path.join(__dirname, 'update-admin-password.sql'), updateAdminScript);
console.log('📝 Script SQL créé: scripts/update-admin-password.sql');

process.exit(0);