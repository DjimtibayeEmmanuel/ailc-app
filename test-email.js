const nodemailer = require('nodemailer');

// Configuration de test avec vos paramètres
const testConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'ailctchad@gmail.com',
        pass: 'wjcc udtr hsaf ybvs'
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    tls: {
        rejectUnauthorized: false
    },
    debug: true, // Active le debug
    logger: true // Active les logs
};

async function testEmailConnection() {
    console.log('🔧 Test de connexion SMTP...');
    console.log('Configuration:', {
        host: testConfig.host,
        port: testConfig.port,
        secure: testConfig.secure,
        user: testConfig.auth.user
    });

    const transporter = nodemailer.createTransport(testConfig);

    try {
        // Test de vérification de la connexion
        console.log('🔍 Vérification de la connexion...');
        await transporter.verify();
        console.log('✅ Connexion SMTP réussie!');

        // Test d'envoi d'email
        console.log('📧 Test d\'envoi d\'email...');
        const testEmail = {
            from: '"AILC Tchad Test" <ailctchad@gmail.com>',
            to: 'ailctchad@gmail.com', // Envoi vers vous-même pour test
            subject: 'Test SMTP AILC Tchad',
            text: 'Ceci est un email de test pour vérifier la configuration SMTP.',
            html: '<h1>Test SMTP</h1><p>Ceci est un email de test pour vérifier la configuration SMTP.</p>'
        };

        const result = await transporter.sendMail(testEmail);
        console.log('✅ Email de test envoyé avec succès!');
        console.log('Résultat:', {
            messageId: result.messageId,
            accepted: result.accepted,
            rejected: result.rejected
        });

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
        console.error('Détails:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
    }
}

testEmailConnection();