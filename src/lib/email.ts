import nodemailer from 'nodemailer';

// Validation des paramètres email
function validateEmailConfig() {
    const config = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    };

    // Vérifications de sécurité
    if (!config.host || config.host === 'ailc.td') {
        throw new Error('SMTP_HOST non configuré ou invalide. Utilisez un serveur SMTP réel.');
    }
    
    if (!config.user || !config.pass) {
        throw new Error('SMTP_USER et SMTP_PASS doivent être configurés.');
    }
    
    if (config.pass === '71secret2ailc') {
        throw new Error('SÉCURITÉ: Mot de passe SMTP par défaut détecté. Configurez un mot de passe sécurisé.');
    }
    
    return config;
}

// Configuration email sécurisée
function createEmailConfig() {
    const config = validateEmailConfig();
    
    return {
        host: config.host,
        port: config.port,
        secure: config.secure, // true pour port 465, false pour autres ports
        auth: {
            user: config.user,
            pass: config.pass
        },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        tls: {
            rejectUnauthorized: true, // Validation stricte des certificats
            minVersion: 'TLSv1.2',    // Version TLS minimum sécurisée
            ciphers: [               // Chiffrements sécurisés uniquement
                'ECDHE-RSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES256-GCM-SHA384',
                'ECDHE-RSA-AES128-SHA256',
                'ECDHE-RSA-AES256-SHA256'
            ].join(':'),
            honorCipherOrder: true
        },
        requireTLS: true,           // Forcer TLS
        logger: false,              // Désactiver logs détaillés en production
        debug: process.env.NODE_ENV === 'development'
    };
}

// Fonction pour générer un code 2FA cryptographiquement sécurisé
export function generate2FACode(): string {
    const crypto = require('crypto');
    // Générer un nombre aléatoire cryptographiquement sûr
    const randomBytes = crypto.randomBytes(4);
    const randomNumber = randomBytes.readUInt32BE(0);
    return (100000 + (randomNumber % 900000)).toString();
}

// Fonction pour envoyer un email 2FA avec retry automatique et sécurité renforcée
export async function send2FAEmail(email: string, code: string, retryCount: number = 0): Promise<boolean> {
    const MAX_RETRIES = 2; // Réduire les tentatives pour éviter le spam
    
    // Validation de l'email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.error('❌ Adresse email invalide:', email);
        return false;
    }
    
    // Validation du code 2FA
    if (!code || !/^\d{6}$/.test(code)) {
        console.error('❌ Code 2FA invalide format');
        return false;
    }
    
    try {
        console.log(`📧 Tentative sécurisée d'envoi ${retryCount + 1}/${MAX_RETRIES + 1} vers: ${email.replace(/(.{3}).*(@.*)/, '$1***$2')}`);
        
        // Créer un nouveau transporteur avec configuration sécurisée
        const emailConfig = createEmailConfig();
        const transporter = nodemailer.createTransport(emailConfig);

        // Vérifier la connectivité avant l'envoi
        await transporter.verify();
        
        const validatedConfig = validateEmailConfig();
        const mailOptions = {
            from: `"AILC Tchad Sécurité" <${validatedConfig.user}>`,
            to: email,
            subject: 'Code de sécurité AILC Tchad - Confidentiel',
            text: `Votre code de sécurité AILC Tchad: ${code}. Ce code expire dans 10 minutes. Ne le partagez jamais.`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                    <div style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">🛡️ AILC Tchad</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Code de sécurité confidentiel</p>
                    </div>
                    <div style="padding: 40px 30px; background: #f8fafc; border-radius: 0 0 10px 10px;">
                        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">Bonjour,</p>
                        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">Votre code de sécurité temporaire pour l'accès administrateur :</p>
                        <div style="background: #e2e8f0; padding: 25px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #3182ce; color: #1a365d;">
                            ${code}
                        </div>
                        <div style="background: #fed7e2; border-left: 4px solid #e53e3e; padding: 15px; margin: 20px 0; border-radius: 6px;">
                            <p style="margin: 0; color: #c53030; font-weight: bold;">⚠️ Mesures de sécurité importantes :</p>
                            <ul style="color: #742a2a; margin: 10px 0 0 20px; padding: 0;">
                                <li>Ce code expire automatiquement dans 10 minutes</li>
                                <li>Ne communiquez jamais ce code à qui que ce soit</li>
                                <li>Utilisez-le uniquement sur le site officiel AILC</li>
                                <li>Si vous n'avez pas demandé ce code, ignorez cet email</li>
                            </ul>
                        </div>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="color: #718096; font-size: 12px; margin: 0;">
                                © ${new Date().getFullYear()} AILC Tchad - Autorité d'Investigation sur la Lutte contre la Corruption<br>
                                Cet email a été généré automatiquement, ne pas répondre.
                            </p>
                        </div>
                    </div>
                </div>
            `,
            priority: 'high',
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high'
            }
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email 2FA sécurisé envoyé avec succès (tentative ${retryCount + 1}) - MessageId: ${result.messageId}`);
        
        // Fermer la connexion proprement
        transporter.close();
        return true;
        
    } catch (error: any) {
        console.error(`❌ Erreur envoi email sécurisé (tentative ${retryCount + 1}):`, {
            message: error.message,
            code: error.code,
            command: error.command
        });
        
        // Retry automatique avec backoff exponentiel pour certaines erreurs
        if (retryCount < MAX_RETRIES && isRetryableError(error)) {
            const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s
            console.log(`🔄 Nouvelle tentative dans ${delay}ms pour erreur récupérable...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return send2FAEmail(email, code, retryCount + 1);
        }
        
        console.error(`❌ Échec définitif de l'envoi email sécurisé après ${retryCount + 1} tentatives`);
        return false;
    }
}

// Fonction pour déterminer si une erreur est récupérable
function isRetryableError(error: any): boolean {
    const retryableCodes = [
        'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN',
        'ENOTFOUND', 'ENETUNREACH', 'EHOSTUNREACH'
    ];
    
    const retryableMessages = [
        'timeout', 'connection reset', 'network error',
        'temporary failure', 'try again'
    ];
    
    return retryableCodes.includes(error.code) ||
           retryableMessages.some(msg => error.message?.toLowerCase().includes(msg));
}