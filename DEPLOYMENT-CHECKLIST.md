# 📋 CHECKLIST DE DÉPLOIEMENT - AILC PLATFORM

## ✅ AVANT LE DÉPLOIEMENT

### Sécurité
- [ ] Clés JWT et Encryption générées avec `npm run generate-secrets`
- [ ] Variables d'environnement configurées (.env.production)
- [ ] SMTP configuré pour emails 2FA
- [ ] Base de données initialisée avec `npm run init-db`
- [ ] Mot de passe admin mis à jour
- [ ] Fichiers sensibles dans .gitignore

### Build
- [ ] `npm run build` réussit sans erreur
- [ ] `npm run lint` passe (warnings acceptables)
- [ ] Tests API fonctionnels avec `npm run test-api-health`

### Configuration Serveur
- [ ] Node.js 18+ installé
- [ ] PM2 ou équivalent pour process management
- [ ] Nginx configuré avec HTTPS
- [ ] Certificat SSL (Let's Encrypt)
- [ ] Firewall configuré (ports 80, 443, 22)

## 🚀 DÉPLOIEMENT

### Étapes
- [ ] Code poussé sur repository Git
- [ ] Variables d'environnement configurées sur serveur
- [ ] Build déployé sur serveur de production
- [ ] DNS pointé vers serveur
- [ ] HTTPS forcé et fonctionnel
- [ ] Monitoring configuré

### Tests Post-Déploiement
- [ ] Page d'accueil accessible
- [ ] Formulaire de signalement fonctionne
- [ ] Connexion admin fonctionne
- [ ] Emails 2FA envoyés correctement
- [ ] Upload de fichiers fonctionnel
- [ ] Base de données accessible

## 🔒 SÉCURITÉ PRODUCTION

### Headers de Sécurité
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security activé
- [ ] CSP configuré (si nécessaire)

### Monitoring
- [ ] Logs d'erreur configurés
- [ ] Monitoring uptime configuré
- [ ] Backups base de données configurés
- [ ] Alertes système configurées

## 📞 CONTACTS D'URGENCE
- Admin système: [VOTRE-CONTACT]
- Support technique: [VOTRE-CONTACT]
- Hébergeur: [CONTACT-HÉBERGEUR]

## 🔄 MAINTENANCE
- [ ] Plan de sauvegarde automatique
- [ ] Mise à jour de sécurité planifiées
- [ ] Monitoring des performances
- [ ] Rotation des logs