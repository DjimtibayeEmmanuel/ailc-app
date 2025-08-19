#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => {
        rl.question(query, resolve);
    });
}

async function setupEmail() {
    console.log('📧 Configuration Email AILC Tchad\n');
    
    console.log('Services disponibles:');
    console.log('1. Gmail (Recommandé pour test)');
    console.log('2. SendGrid (Recommandé pour production)');
    console.log('3. Mailgun');
    console.log('4. Configuration manuelle\n');
    
    const choice = await question('Choisissez un service (1-4): ');
    
    let config = {};
    
    switch (choice) {
        case '1':
            console.log('\n📧 Configuration Gmail:');
            console.log('1. Créez un compte Gmail dédié (ex: ailc.reports@gmail.com)');
            console.log('2. Activez la 2FA sur ce compte');
            console.log('3. Générez un mot de passe d\'application: https://myaccount.google.com/apppasswords\n');
            
            const gmailUser = await question('Email Gmail: ');
            const gmailPass = await question('Mot de passe d\'application (16 caractères): ');
            
            config = {
                SMTP_HOST: 'smtp.gmail.com',
                SMTP_PORT: '587',
                SMTP_SECURE: 'false',
                SMTP_USER: gmailUser,
                SMTP_PASS: gmailPass
            };
            break;
            
        case '2':
            console.log('\n📧 Configuration SendGrid:');
            console.log('1. Créez un compte sur https://sendgrid.com');
            console.log('2. Générez une clé API dans Settings > API Keys\n');
            
            const sendgridKey = await question('Clé API SendGrid: ');
            const fromEmail = await question('Email expéditeur: ');
            
            config = {
                SMTP_HOST: 'smtp.sendgrid.net',
                SMTP_PORT: '587',
                SMTP_SECURE: 'false',
                SMTP_USER: 'apikey',
                SMTP_PASS: sendgridKey
            };
            break;
            
        case '3':
            console.log('\n📧 Configuration Mailgun:');
            
            const mailgunHost = await question('Host Mailgun (ex: smtp.mailgun.org): ');
            const mailgunUser = await question('Utilisateur Mailgun: ');
            const mailgunPass = await question('Mot de passe Mailgun: ');
            
            config = {
                SMTP_HOST: mailgunHost,
                SMTP_PORT: '587',
                SMTP_SECURE: 'false',
                SMTP_USER: mailgunUser,
                SMTP_PASS: mailgunPass
            };
            break;
            
        case '4':
            console.log('\n📧 Configuration manuelle:');
            
            config.SMTP_HOST = await question('SMTP Host: ');
            config.SMTP_PORT = await question('SMTP Port (587): ') || '587';
            config.SMTP_SECURE = await question('SMTP Secure (false): ') || 'false';
            config.SMTP_USER = await question('SMTP User: ');
            config.SMTP_PASS = await question('SMTP Password: ');
            break;
            
        default:
            console.log('❌ Choix invalide');
            process.exit(1);
    }
    
    // Lire le fichier .env.local actuel
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Mettre à jour les variables email
    const emailVars = Object.keys(config);
    let newEnvContent = envContent;
    
    emailVars.forEach(key => {
        const value = config[key];
        const regex = new RegExp(`^${key}=.*$`, 'm');
        
        if (regex.test(newEnvContent)) {
            newEnvContent = newEnvContent.replace(regex, `${key}=${value}`);
        } else {
            newEnvContent += `\n${key}=${value}`;
        }
    });
    
    // Sauvegarder
    fs.writeFileSync(envPath, newEnvContent);
    
    console.log('\n✅ Configuration email mise à jour dans .env.local');
    console.log('\n🧪 Test de la configuration...\n');
    
    rl.close();
    
    // Tester la configuration
    const { spawn } = require('child_process');
    const test = spawn('node', ['smtp-test.js'], { stdio: 'inherit' });
    
    test.on('close', (code) => {
        if (code === 0) {
            console.log('\n🎉 Configuration email réussie!');
            console.log('Vous pouvez maintenant recevoir les codes 2FA.');
        } else {
            console.log('\n❌ La configuration a échoué.');
            console.log('Vérifiez vos credentials et réessayez.');
            console.log('\nPour aide: consultez SETUP-EMAIL.md');
        }
        process.exit(code);
    });
}

setupEmail().catch(error => {
    console.error('❌ Erreur:', error.message);
    rl.close();
    process.exit(1);
});