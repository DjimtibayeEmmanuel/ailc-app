import crypto from 'crypto';

// Validation de la clé de chiffrement
function validateEncryptionKey(): string {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY non définie dans les variables d\'environnement');
    }
    if (key === 'ailc_tchad_encryption_key_32_chars') {
        throw new Error('SÉCURITÉ: Clé de chiffrement par défaut détectée. Générez une clé unique.');
    }
    if (key.length !== 32) {
        throw new Error('ENCRYPTION_KEY doit faire exactement 32 caractères');
    }
    return key;
}

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

// Fonctions de chiffrement sécurisées avec AES-GCM
export function encrypt(text: string): string | null {
    if (!text) return null;
    
    try {
        const key = validateEncryptionKey();
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipherGCM(ENCRYPTION_ALGORITHM, key);
        cipher.setAAD(Buffer.from('AILC_TCHAD_2025', 'utf8'));
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        // Format: iv:authTag:encryptedData
        return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Erreur de chiffrement:', error);
        throw new Error('Échec du chiffrement des données sensibles');
    }
}

export function decrypt(text: string): string | null {
    if (!text) return null;
    
    try {
        const textParts = text.split(':');
        if (textParts.length !== 3) {
            // Tentative de déchiffrement de l'ancien format pour migration
            return legacyDecrypt(text);
        }
        
        const key = validateEncryptionKey();
        const iv = Buffer.from(textParts[0], 'hex');
        const authTag = Buffer.from(textParts[1], 'hex');
        const encryptedText = textParts[2];
        
        const decipher = crypto.createDecipherGCM(ENCRYPTION_ALGORITHM, key);
        decipher.setAAD(Buffer.from('AILC_TCHAD_2025', 'utf8'));
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Erreur de déchiffrement:', error);
        throw new Error('Échec du déchiffrement des données');
    }
}

// Fonction de migration pour l'ancien chiffrement (à supprimer après migration)
function legacyDecrypt(text: string): string | null {
    console.warn('⚠️ Déchiffrement avec ancien algorithme détecté - Migration recommandée');
    try {
        const textParts = text.split(':');
        if (textParts.length < 2) return text;
        
        const encryptedText = textParts.slice(1).join(':');
        const key = process.env.ENCRYPTION_KEY || 'ailc_tchad_encryption_key_32_chars';
        const decipher = crypto.createDecipher('aes-256-cbc', key);
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Erreur déchiffrement legacy:', error);
        return text;
    }
}

// Fonction utilitaire pour générer une clé de chiffrement sécurisée
export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('base64').slice(0, 32);
}