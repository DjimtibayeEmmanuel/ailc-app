# 📧 Configuration Email AILC Tchad

## 🚨 Problème Actuel
Les emails ne sont pas reçus car la configuration utilise des paramètres de test invalides.

## ✅ Solution 1: Gmail (Recommandée)

### Étapes pour Gmail:
1. **Créer un compte Gmail** dédié (ex: `ailc.tchad.reports@gmail.com`)
2. **Activer la 2FA** sur ce compte
3. **Générer un mot de passe d'application**:
   - Aller sur https://myaccount.google.com/security
   - Cliquer "2-Step Verification" → "App passwords"
   - Générer un mot de passe pour "Mail"

### Configuration .env.local:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ailc.tchad.reports@gmail.com
SMTP_PASS="votre-mot-de-passe-application-16-caracteres"
```

## ✅ Solution 2: SendGrid (Production)

### Avantages SendGrid:
- Service professionnel pour emails transactionnels
- Meilleure délivrabilité
- Analytics et logs détaillés
- Gratuit jusqu'à 100 emails/jour

### Configuration .env.local:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS="votre-cle-api-sendgrid"
```

## ✅ Solution 3: Autres Services

### Mailgun:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@mg.votre-domaine.com
SMTP_PASS="votre-cle-mailgun"
```

### AWS SES:
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-access-key-id
SMTP_PASS="votre-secret-access-key"
```

## 🧪 Test de Configuration

Après avoir mis à jour .env.local, tester avec:
```bash
node smtp-test.js
```

## 🔒 Sécurité Important

⚠️ **NE JAMAIS** commiter les vrais mots de passe dans Git
- Utilisez toujours .env.local (ignoré par Git)
- Régénérez les mots de passe si compromis
- Utilisez des mots de passe d'application, pas les mots de passe principaux

## 📋 Checklist Final

- [ ] Choisir un service email (Gmail/SendGrid/Mailgun/SES)
- [ ] Créer le compte et configurer la 2FA si nécessaire
- [ ] Générer les credentials (mot de passe app/clé API)
- [ ] Mettre à jour .env.local avec les vrais paramètres
- [ ] Tester avec `node smtp-test.js`
- [ ] Tester l'envoi 2FA depuis l'admin
- [ ] Vérifier la réception dans la boîte mail

---

## 🆘 Aide Rapide

**Pour Gmail uniquement:**
1. Créez `ailc.admin@gmail.com` (ou utilisez votre Gmail existant)
2. Activez 2FA: https://myaccount.google.com/security
3. Générez mot de passe app: https://myaccount.google.com/apppasswords
4. Copiez le mot de passe 16 caractères dans SMTP_PASS
5. Testez avec `node smtp-test.js`