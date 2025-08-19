# 🇹🇩 AILC Tchad - Plateforme Anti-Corruption

Plateforme sécurisée de signalement de corruption pour l'AILC (Autorité d'Investigation sur la Lutte contre la Corruption) du Tchad. Application Next.js moderne avec système de signalement anonyme, gestion d'utilisateurs et administration avancée.

## 🎯 Description du Projet

Cette application web permet aux citoyens tchadiens de signaler des actes de corruption de manière sécurisée et anonyme. Elle offre un système complet de gestion des signalements avec suivi, administration et chiffrement des données sensibles.

## 🚀 Fonctionnalités Principales

### 👥 Gestion des Utilisateurs
- ✅ **Authentification 2FA par email** avec codes dynamiques à 6 chiffres
- ✅ **Création d'utilisateurs** avec interface web intuitive
- ✅ **Gestion des profils** et modification des informations
- ✅ **Rôles admin/utilisateur** avec permissions différenciées

### 📊 Système de Signalement
- ✅ **Formulaire de signalement complet** avec tous les champs métier
- ✅ **Signalement anonyme** avec chiffrement des données personnelles
- ✅ **Codes de suivi unique** (8 caractères) pour chaque signalement
- ✅ **Catégorisation** par type, secteur et niveau de gravité
- ✅ **Upload de fichiers** (preuves, documents, photos)

### 🛡️ Sécurité & Chiffrement
- ✅ **Chiffrement AES-256** pour les données sensibles
- ✅ **JWT sécurisés** avec expiration automatique
- ✅ **Rate limiting** sur les APIs critiques
- ✅ **Validation stricte** des entrées utilisateur

### 🎨 Interface Moderne
- ✅ **Design responsive** avec Tailwind CSS 4
- ✅ **Navigation intuitive** entre les sections
- ✅ **Animations fluides** et transitions CSS
- ✅ **Interface bilingue** (français adapté au contexte tchadien)

## 📦 Installation

```bash
# Cloner le projet (si pas déjà fait)
# cd dans le dossier nextjs-app

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local

# Initialiser la base de données (fait automatiquement)
npm run init-db
```

## ⚙️ Configuration

Éditer le fichier `.env.local` avec vos paramètres :

```env
# JWT Secret Key
JWT_SECRET=ailc_tchad_secret_key_2025

# Encryption Key (must be 32 characters)
ENCRYPTION_KEY=ailc_tchad_encryption_key_32_chars

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
```

### Configuration Email Gmail

1. Activer l'authentification à 2 facteurs
2. Générer un mot de passe d'application
3. Utiliser ce mot de passe dans `SMTP_PASS`

## 🔧 Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

L'application sera disponible sur : http://localhost:3000

## 👤 Compte Administrateur par Défaut

- **Email :** admin@ailc.td
- **Mot de passe :** admin123
- **2FA :** Code envoyé par email

## 🏗️ Architecture du Projet

### 📁 Structure des Dossiers

```
nextjs-app/
├── src/
│   ├── app/                    # App Router Next.js 15
│   │   ├── api/               # Routes API Backend
│   │   │   ├── admin/         # APIs Administration
│   │   │   │   ├── reports/   # Gestion des signalements
│   │   │   │   ├── users/     # Gestion des utilisateurs  
│   │   │   │   └── user-activity/ # Activité utilisateurs
│   │   │   ├── reports/       # APIs Signalements publics
│   │   │   │   ├── anonymous/ # Signalements anonymes
│   │   │   │   ├── details/   # Détails signalements
│   │   │   │   └── track/     # Suivi par code
│   │   │   ├── admin-login/   # Connexion administrateur
│   │   │   ├── create-user/   # Création utilisateurs
│   │   │   ├── request-2fa/   # Codes 2FA
│   │   │   └── health/        # Santé de l'API
│   │   ├── globals.css        # Styles globaux Tailwind
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Page d'accueil (SPA)
│   ├── components/            # Composants React
│   │   ├── AdminLogin.tsx     # Connexion admin 2FA
│   │   ├── AdminPanel.tsx     # Panneau d'administration
│   │   ├── MainOptions.tsx    # Menu principal
│   │   ├── ReportForm.tsx     # Formulaire signalement
│   │   ├── ReportSuccess.tsx  # Confirmation signalement
│   │   ├── ReportTracking.tsx # Suivi signalements
│   │   ├── UserCreation.tsx   # Création utilisateurs
│   │   └── UserEdit.tsx       # Édition utilisateurs
│   └── lib/                   # Bibliothèques utilitaires
│       ├── database.ts        # Gestionnaire SQLite
│       ├── email.ts           # Envoi emails SMTP
│       ├── encryption.ts      # Chiffrement AES-256
│       └── utils.ts           # Fonctions utilitaires
├── scripts/
│   └── init-db.js            # Initialisation base données
├── public/                   # Assets statiques
│   └── logo-ailc.png        # Logo officiel AILC
└── ailc_tchad_database.db   # Base SQLite (auto-créée)
```

### 🗄️ Schéma de Base de Données

```sql
-- Table des utilisateurs (admins et utilisateurs standards)
users (id, name, email, phone, password, two_factor_secret, is_admin, created_at)

-- Table des signalements avec chiffrement des données sensibles
reports (id, user_id, corruption_type, sector, severity, incident_date, 
         location, description, amount, suspect_names, witnesses,
         anonymity_level, reporter_*_encrypted, tracking_code, status,
         files, ip_address, user_agent, created_at, updated_at)

-- Table des fichiers uploadés (preuves)
uploaded_files (id, report_id, original_name, filename, mimetype, 
                size, path, upload_date)

-- Table des codes 2FA temporaires
temp_codes (id, email, code, expires_at, used, created_at)
```

## 🔐 Sécurité

- **Chiffrement AES-256** pour les données sensibles
- **JWT** avec expiration 8h
- **Codes 2FA** à usage unique, expiration 10min
- **Rate limiting** sur les APIs
- **Validation** des entrées utilisateur
- **HTTPS** recommandé en production

## 📊 Documentation des APIs

### 🔓 APIs Publiques (sans authentification)

| Endpoint | Méthode | Description | Paramètres |
|----------|---------|-------------|------------|
| `/api/health` | GET | Statut de l'API | - |
| `/api/request-2fa` | POST | Demander code 2FA | `email` |
| `/api/admin-login` | POST | Connexion admin | `email`, `password`, `twoFactorCode` |
| `/api/create-user` | POST | Créer utilisateur | `name`, `email`, `phone`, `password` |
| `/api/reports/anonymous` | POST | Signalement anonyme | Données complètes du formulaire |
| `/api/reports/track/{code}` | GET | Suivi par code | `trackingCode` (URL param) |
| `/api/reports/details/{id}` | GET | Détails signalement | `reportId` (URL param) |

### 🔒 APIs Administrateur (authentification JWT requise)

| Endpoint | Méthode | Description | Paramètres |
|----------|---------|-------------|------------|
| `/api/admin/reports` | GET | Liste signalements | `page`, `limit`, `status` |
| `/api/admin/reports/{id}/status` | PUT | Changer statut | `reportId`, `status` |
| `/api/admin/users` | GET | Liste utilisateurs | `page`, `limit` |
| `/api/admin/users/{id}` | GET/PUT/DELETE | CRUD utilisateur | `userId` + données |
| `/api/admin/user-activity/{id}` | GET | Activité utilisateur | `userId` |

### 📋 Codes de Statut des Signalements

- `new` - Nouveau signalement
- `under_review` - En cours d'examen  
- `investigating` - En cours d'enquête
- `resolved` - Résolu
- `closed` - Fermé
- `rejected` - Rejeté

## 🔄 Flux d'Authentification 2FA

1. Utilisateur saisit email/mot de passe
2. Système envoie code 6 chiffres par email
3. Utilisateur saisit le code reçu
4. Vérification et connexion

## 🎨 Interface Utilisateur

- **Design moderne** avec dégradés et ombres
- **Navigation intuitive** entre les sections
- **Messages d'erreur/succès** clairs
- **Formulaires réactifs** avec validation
- **Animations fluides** CSS

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## ✅ État des Fonctionnalités

### 🟢 Complètement Implémentées

- ✅ **Authentification 2FA par email** - Codes 6 chiffres, expiration 10min
- ✅ **Gestion des utilisateurs** - Création, édition, suppression
- ✅ **Formulaire de signalement complet** - Tous les champs métier
- ✅ **Signalement anonyme** - Chiffrement des données personnelles
- ✅ **Système de suivi** - Codes uniques 8 caractères
- ✅ **Panneau d'administration** - Gestion complète des signalements
- ✅ **Base de données SQLite** - Schéma complet avec chiffrement
- ✅ **APIs sécurisées** - JWT, rate limiting, validation
- ✅ **Interface responsive** - Design moderne Tailwind CSS

### 🟡 Partiellement Implémentées

- 🟡 **Upload de fichiers** - Structure présente, à finaliser
- 🟡 **Notifications email** - Base présente, à étendre
- 🟡 **Recherche et filtres** - Basique, à améliorer

### 🔴 À Implémenter (Roadmap)

- [ ] **Statistiques avancées** - Tableaux de bord et graphiques
- [ ] **Export des données** - PDF, Excel, formats officiels
- [ ] **Notifications en temps réel** - WebSockets, push notifications
- [ ] **Système de commentaires** - Communication interne équipe
- [ ] **Audit trail** - Traçabilité complète des actions
- [ ] **Multi-langue** - Support anglais/arabe
- [ ] **API mobile** - Endpoints optimisés pour app mobile
- [ ] **Géolocalisation** - Cartographie des signalements
- [ ] **Workflow avancé** - Étapes de validation personnalisables

## 🐛 Guide de Dépannage

### ❌ Erreurs Communes et Solutions

#### 📧 Problèmes Email/2FA
```bash
# Erreur: Cannot send email
# Solution: Vérifier la configuration SMTP
- Paramètres Gmail corrects dans .env.local
- Mot de passe d'application (pas le mot de passe principal)
- Port 587 et TLS activé

# Erreur: Code 2FA invalide
# Causes possibles:
- Code expiré (10 minutes max)
- Code déjà utilisé (usage unique)
- Décalage d'horloge serveur
```

#### 🗄️ Problèmes Base de Données
```bash
# Erreur: Database locked
sudo chmod 755 ./
sudo chmod 666 ./ailc_tchad_database.db

# Erreur: Table does not exist
npm run init-db

# Corruption de base:
rm ailc_tchad_database.db
npm run init-db
```

#### 🔧 Problèmes de Développement
```bash
# Port déjà utilisé
lsof -ti:3000 | xargs kill -9
npm run dev

# Erreurs TypeScript
npm run lint
npm run build

# Problèmes de dépendances
rm -rf node_modules package-lock.json
npm install
```

### 🔍 Debugging et Logs

#### Activation des logs détaillés
```javascript
// Dans .env.local
DEBUG=true
NODE_ENV=development

// Logs SQL disponibles dans database.ts
// Logs email dans email.ts
// Logs JWT dans les middlewares
```

#### Monitoring de l'application
```bash
# Vérification santé API
curl http://localhost:3000/api/health

# Test de la base de données
node -e "const {getDB} = require('./src/lib/database.ts'); console.log('DB OK');"

# Vérification des emails
node test-email.js
```

## 🚀 Mise en Production

### Checklist de Déploiement

#### 🔒 Sécurité
- [ ] Variables d'environnement sécurisées 
- [ ] HTTPS activé (certificat SSL)
- [ ] Rate limiting configuré
- [ ] Passwords admin changés
- [ ] Clés de chiffrement uniques générées
- [ ] Audit de sécurité effectué

#### ⚡ Performance
- [ ] Build optimisé (`npm run build`)
- [ ] Images optimisées (logo, assets)
- [ ] Compression GZIP activée
- [ ] CDN configuré si nécessaire
- [ ] Base de données optimisée (index)

#### 📊 Monitoring
- [ ] Logs de production configurés
- [ ] Monitoring d'erreurs (Sentry)
- [ ] Métriques de performance
- [ ] Alertes email configurées
- [ ] Backup automatique de la DB

### Variables d'Environnement Production

```env
# Production settings
NODE_ENV=production
JWT_SECRET=RANDOM_GENERATED_SECRET_64_CHARS
ENCRYPTION_KEY=RANDOM_GENERATED_KEY_32_CHARS

# Email settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@ailc.td
SMTP_PASS=APP_SPECIFIC_PASSWORD

# Security
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=15
SESSION_TIMEOUT=28800

# Monitoring
SENTRY_DSN=your_sentry_dsn_here
LOG_LEVEL=error
```

## 📞 Support et Contribution

### 🆘 Support Technique
- **Documentation** : Ce README et commentaires du code
- **Issues** : Signaler les bugs via le système de tickets
- **Email** : support.technique@ailc.td

### 👥 Équipe de Développement
- **Développeur Principal** : Architecture et backend
- **Frontend** : Interface utilisateur et UX
- **DevOps** : Déploiement et infrastructure
- **Sécurité** : Audit et conformité

### 🤝 Guidelines de Contribution
1. **Branches** : Utiliser feature/nom-fonctionnalité
2. **Commits** : Messages clairs et en français
3. **Tests** : Tester avant push
4. **Documentation** : Mettre à jour ce README si nécessaire

## 📄 Licences et Propriété Intellectuelle

**Propriété** : AILC (Autorité d'Investigation sur la Lutte contre la Corruption) du Tchad
**Usage** : Application officielle gouvernementale
**Restrictions** : Code confidentiel - Distribution interdite
**Copyright** : © 2025 AILC Tchad - Tous droits réservés

---

**Version** : 1.0.0 | **Dernière mise à jour** : Janvier 2025
**Plateforme** : Next.js 15 + TypeScript + SQLite + Tailwind CSS