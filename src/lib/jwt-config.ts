import jwt from 'jsonwebtoken';

// Validation et gestion centralisée du JWT
function validateJWTSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET non définie dans les variables d\'environnement');
    }
    if (secret === 'ailc_tchad_secret_key_2025' || secret.length < 32) {
        throw new Error('SÉCURITÉ: JWT_SECRET par défaut ou trop faible détectée. Générez une clé forte.');
    }
    return secret;
}

export const JWT_CONFIG = {
    secret: validateJWTSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    algorithm: 'HS256' as jwt.Algorithm
};

// Fonction pour vérifier et décoder un token JWT
export function verifyJWT(token: string) {
    return jwt.verify(token, JWT_CONFIG.secret) as any;
}

// Fonction pour créer un token JWT
export function createJWT(payload: object) {
    return jwt.sign(payload, JWT_CONFIG.secret, { 
        expiresIn: JWT_CONFIG.expiresIn,
        algorithm: JWT_CONFIG.algorithm
    });
}

// Fonction utilitaire pour générer un secret JWT sécurisé
export function generateJWTSecret(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(64).toString('base64');
}