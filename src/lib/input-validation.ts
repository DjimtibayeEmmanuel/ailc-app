import { z } from 'zod';

// Schémas de validation pour les différents types de données

// Validation des emails
export const EmailSchema = z.string()
    .email('Format d\'email invalide')
    .min(5, 'Email trop court')
    .max(254, 'Email trop long')
    .refine(email => {
        // Bloquer les domaines suspects
        const suspiciousDomains = ['tempmail', 'guerrillamail', '10minutemail'];
        return !suspiciousDomains.some(domain => email.toLowerCase().includes(domain));
    }, 'Domaine email non autorisé');

// Validation des mots de passe
export const PasswordSchema = z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long')
    .refine(password => /[A-Z]/.test(password), 'Doit contenir au moins une majuscule')
    .refine(password => /[a-z]/.test(password), 'Doit contenir au moins une minuscule')
    .refine(password => /\d/.test(password), 'Doit contenir au moins un chiffre');

// Validation des noms
export const NameSchema = z.string()
    .min(2, 'Nom trop court')
    .max(100, 'Nom trop long')
    .refine(name => /^[a-zA-ZÀ-ÿ\u0600-\u06FF\s\-'\.]+$/.test(name), 'Caractères non autorisés dans le nom')
    .transform(name => name.trim());

// Validation des numéros de téléphone
export const PhoneSchema = z.string()
    .regex(/^[\+]?[0-9\-\s\(\)]{8,20}$/, 'Format de téléphone invalide')
    .transform(phone => phone.replace(/[\s\-\(\)]/g, ''));

// Validation des codes de suivi
export const TrackingCodeSchema = z.string()
    .regex(/^[A-Z0-9]{8}$/, 'Code de suivi invalide (8 caractères alphanumériques)')
    .length(8, 'Code de suivi doit faire 8 caractères');

// Validation des codes 2FA
export const TwoFACodeSchema = z.string()
    .regex(/^\d{6}$/, 'Code 2FA invalide (6 chiffres)')
    .length(6, 'Code 2FA doit faire 6 chiffres');

// Validation des montants
export const AmountSchema = z.union([
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Montant invalide').transform(Number),
    z.number().positive('Le montant doit être positif')
]).optional();

// Validation des descriptions/textes longs
export const LongTextSchema = z.string()
    .min(10, 'Description trop courte')
    .max(5000, 'Description trop longue')
    .refine(text => {
        // Filtrer les contenus suspects
        const suspiciousPatterns = [
            /<script/i, /javascript:/i, /on\w+=/i,
            /data:text\/html/i, /vbscript:/i
        ];
        return !suspiciousPatterns.some(pattern => pattern.test(text));
    }, 'Contenu suspect détecté')
    .transform(text => text.trim());

// Validation des IDs
export const IdSchema = z.union([
    z.string().regex(/^[a-zA-Z0-9\-_]{1,50}$/, 'ID invalide'),
    z.number().int().positive()
]);

// Schéma pour les signalements - Compatible avec le formulaire frontend
export const ReportSchema = z.object({
    // Champs obligatoires du formulaire
    corruptionType: z.enum([
        'pot_de_vin', 'detournement', 'favoritisme', 'abus_pouvoir', 
        'marche_public', 'concussion', 'racket', 'autre'
    ]).refine(val => val !== '', 'Type de corruption requis'),
    
    sector: z.enum(['public', 'parapublic', 'prive'])
        .refine(val => val !== '', 'Secteur requis'),
    
    sectorName: z.string()
        .min(2, 'Nom du secteur trop court')
        .max(200, 'Nom du secteur trop long')
        .refine(val => val.trim() !== '', 'Nom du secteur requis'),
    
    urgency: z.enum(['faible', 'moyenne', 'haute', 'critique'])
        .refine(val => val !== '', 'Niveau d\'urgence requis'),
    
    incidentDate: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
        .refine(val => val !== '', 'Date d\'incident requise'),
    
    location: z.string()
        .min(2, 'Lieu trop court')
        .max(200, 'Lieu trop long')
        .refine(val => val.trim() !== '', 'Lieu requis'),
    
    description: z.string()
        .min(10, 'Description trop courte (minimum 10 caractères)')
        .max(5000, 'Description trop longue')
        .refine(val => val.trim() !== '', 'Description requise'),
    
    relationToFacts: z.string()
        .min(5, 'Relation aux faits trop courte')
        .max(500, 'Relation aux faits trop longue')
        .refine(val => val.trim() !== '', 'Relation aux faits requise'),
    
    anonymity: z.enum(['total', 'partiel', 'aucun'])
        .refine(val => val !== '', 'Niveau d\'anonymat requis'),
    
    // Montant obligatoire
    amountRange: z.string()
        .min(1, 'Montant impliqué requis')
        .refine(val => val !== '', 'Veuillez sélectionner une fourchette de montant'),
    
    // Champs optionnels
    circumstances: z.string().max(2000).optional(),
    frequency: z.string().optional(),
    impact: z.string().max(1000).optional(),
    suspectNames: z.string().max(500).optional(),
    suspectPositions: z.string().max(500).optional(),
    suspectInstitution: z.string().max(200).optional(),
    witnesses: z.string().max(1000).optional(),
    witnessContacts: z.string().max(500).optional(),
    
    // Informations du signaleur (optionnelles selon anonymat)
    reporterName: z.string().max(100).optional(),
    reporterPhone: z.string().max(20).optional(),
    reporterEmail: z.string().email('Format email invalide').optional().or(z.literal('')),
    
    // Fichiers (validation simplifiée pour éviter les erreurs)
    files: z.union([
        z.array(z.object({
            name: z.string(),
            size: z.number(),
            type: z.string()
        })),
        z.array(z.any()),  // Fallback pour données malformées
        z.undefined(),
        z.null()
    ]).optional().default([])
});

// Schéma pour les utilisateurs
export const UserSchema = z.object({
    name: NameSchema,
    email: EmailSchema,
    phone: PhoneSchema.optional(),
    password: PasswordSchema,
    isAdmin: z.boolean().optional()
});

// Fonction de sanitisation SQL
export function sanitizeSqlString(input: string): string {
    if (!input) return '';
    
    // Supprimer les caractères dangereux
    return input
        .replace(/['";\\]/g, '') // Supprimer quotes et backslashes
        .replace(/--/g, '')      // Supprimer commentaires SQL
        .replace(/\/\*/g, '')    // Supprimer commentaires multi-lignes
        .replace(/\*\//g, '')
        .replace(/\bUNION\b/gi, '') // Supprimer UNION
        .replace(/\bSELECT\b/gi, '') // Supprimer SELECT
        .replace(/\bINSERT\b/gi, '') // Supprimer INSERT
        .replace(/\bDELETE\b/gi, '') // Supprimer DELETE
        .replace(/\bDROP\b/gi, '')   // Supprimer DROP
        .replace(/\bUPDATE\b/gi, '') // Supprimer UPDATE
        .trim();
}

// Fonction de validation générique
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true, data: T } | { success: false, errors: string[] } {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Dans Zod v4+, les erreurs sont dans error.issues, pas error.errors
            const issues = error.issues || error.errors || [];
            
            if (!Array.isArray(issues)) {
                console.error('❌ Validation: Issues n\'est pas un tableau:', typeof issues);
                return { success: false, errors: ['Erreur de validation - structure invalide'] };
            }
            
            try {
                const errors = issues.map((err, index) => {
                    // Protection contre path undefined ou non-array
                    let pathString = 'champ';
                    try {
                        if (err.path && Array.isArray(err.path) && err.path.length > 0) {
                            pathString = err.path.join('.');
                        } else if (err.path) {
                            pathString = String(err.path);
                        }
                    } catch (pathError) {
                        console.error('❌ Erreur traitement path:', pathError);
                        pathString = `erreur_${index}`;
                    }
                    
                    return `${pathString}: ${err.message || 'Erreur de validation'}`;
                });
                return { success: false, errors };
            } catch (mapError) {
                console.error('❌ Erreur formatage validation:', mapError);
                return { success: false, errors: ['Erreur lors du formatage des erreurs de validation'] };
            }
        }
        console.error('❌ Erreur validation non-Zod:', error);
        return { success: false, errors: ['Erreur de validation inconnue'] };
    }
}

// Fonction de validation et sanitisation pour les requêtes SQL
export function prepareSqlParams(params: any[]): any[] {
    if (!Array.isArray(params)) {
        console.error('prepareSqlParams: params n\'est pas un tableau', params);
        return [];
    }
    
    return params.map(param => {
        if (typeof param === 'string') {
            return sanitizeSqlString(param);
        }
        if (typeof param === 'number') {
            return isFinite(param) ? param : 0;
        }
        if (param === null || param === undefined) {
            return null;
        }
        return param;
    });
}