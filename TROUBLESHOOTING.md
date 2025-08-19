# 🔧 Guide de Dépannage - Formulaire AILC Tchad

## 🚨 Erreur "Unexpected token 'I', 'Internal S'... is not valid JSON"

### Diagnostic rapide

1. **Ouvrir les DevTools** (F12)
2. **Aller dans Console** 
3. **Soumettre le formulaire**
4. **Chercher les messages avec emojis** : 📥, ❌, ✅

### Étapes de résolution

#### 1. Vérifier que le serveur fonctionne
```bash
# Terminal 1 - Démarrer le serveur
npm run dev

# Terminal 2 - Tester la santé
npm run test-api-health
```

#### 2. Tester différents scénarios
```bash
# Test complet de tous les cas d'erreur
npm run test-error-scenarios
```

#### 3. Vérifier la configuration
```bash
# S'assurer que .env.local existe
ls -la .env.local

# Si manquant, copier depuis le template sécurisé
cp .env.secure .env.local
```

#### 4. Régénérer les secrets si nécessaire
```bash
npm run generate-secrets
cp .env.secure .env.local
```

#### 5. Réinitialiser la base de données
```bash
npm run init-db
```

---

## 🔍 Messages d'Erreur Spécifiques

### "Configuration de sécurité requise"
- **Cause** : Clés de chiffrement manquantes ou par défaut
- **Solution** : `npm run generate-secrets && cp .env.secure .env.local`

### "Données JSON invalides" 
- **Cause** : Problème de format dans le formulaire
- **Solution** : Vérifier les logs Console pour voir les données envoyées

### "Erreur de base de données"
- **Cause** : Problème SQLite ou permissions
- **Solution** : `npm run init-db` puis vérifier les permissions

### "Propriété manquante: Cannot read properties"
- **Cause** : Champs undefined dans le formulaire
- **Solution** : Maintenant gérée automatiquement, reporter le bug

---

## 📊 Logs à surveiller

### ✅ Logs normaux de succès
```
📥 Nouveau signalement anonyme reçu (Next.js)
📋 Données reçues: { ... }
🔐 Chiffrement des données personnelles réussi
💾 Insertion en base de données...
✅ Signalement anonyme Next.js créé: TCHREP-2024-123456
```

### ❌ Logs d'erreur à chercher
```
❌ ERREUR CRITIQUE INTERCEPTÉE: ...
❌ Erreur parsing JSON request: ...
❌ Erreur de chiffrement: ...
❌ Erreur connexion DB: ...
```

---

## 🧪 Tests de Validation

### Test 1: Santé de l'API
```bash
curl http://localhost:3000/api/health
# Devrait retourner JSON avec status: "OK"
```

### Test 2: Données minimales
```javascript
// Copier-coller dans Console des DevTools
fetch('/api/reports/anonymous', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        corruptionType: 'autre',
        sector: 'autre',
        severity: 'faible',
        incidentDate: '2024-12-01',
        location: 'Test',
        description: 'Test de diagnostic',
        relationToFacts: 'Test',
        anonymity: 'total'
    })
}).then(r => r.json()).then(console.log)
```

---

## 🛠️ Solutions Avancées

### Si rien ne fonctionne

1. **Reset complet**
```bash
rm -rf node_modules package-lock.json
npm install
npm run generate-secrets
cp .env.secure .env.local
npm run init-db
npm run build
npm run dev
```

2. **Vérifier les permissions**
```bash
chmod 755 ./
chmod 666 ./ailc_tchad_database.db
```

3. **Mode debug maximum**
   - Ouvrir 2 terminaux
   - Terminal 1: `npm run dev` (voir logs serveur)
   - Terminal 2: `npm run test-error-scenarios` (tests automatiques)

---

## 📞 Signaler un Bug

Si le problème persiste, inclure dans votre rapport :

1. **Logs complets** de la Console DevTools
2. **Logs serveur** du terminal `npm run dev` 
3. **Résultat** de `npm run test-api-health`
4. **Environnement** : OS, navigateur, version Node.js
5. **Données** exactes envoyées par le formulaire

### Format de rapport :
```
## Erreur rencontrée
[Description de l'erreur]

## Logs Console (DevTools)
[Copier les logs avec les emojis 📥 ❌ etc.]

## Logs Serveur 
[Copier les logs du terminal npm run dev]

## Tests automatiques
$ npm run test-api-health
[Résultat]

## Environnement
- OS: [Windows/Mac/Linux]
- Navigateur: [Chrome/Firefox/Safari + version]
- Node.js: [version]
```

---

## 📧 Problème: Emails 2FA Non Reçus

### Diagnostic
Les logs montrent "email envoyé avec succès" mais aucune réception.

**Cause**: Configuration SMTP avec paramètres de test invalides
- `SMTP_USER=test@ailc.td` (inexistant)
- `SMTP_PASS="test-password-simulation"` (factice)

### Solution Rapide
```bash
npm run setup-email
```

### Solutions Détaillées
- **Gmail**: Voir `SETUP-EMAIL.md` 
- **SendGrid**: Service professionnel recommandé
- **Test**: `npm run test-smtp`

---

## ⚡ Résolution Rapide

**90% des cas** : Problem de configuration
```bash
npm run generate-secrets
cp .env.secure .env.local  
npm run dev
```

**9% des cas** : Problème de base de données
```bash
npm run init-db
```

**1% des cas** : Bug réel à signaler avec logs complets