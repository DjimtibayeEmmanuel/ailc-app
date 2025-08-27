# Authentification POST Simplifiée

## ✅ Architecture finale POST-only

L'authentification admin utilise maintenant une approche **POST pure** sans redirects GET avec données sensibles.

### **Flux simplifié :**

```
┌─ Étape 1: POST credentials ─────────────┐
│  Email + Password                       │
│  ↓ Server Action                        │
│  sendTwoFactorCode()                    │
│  ├─ Valide user + password              │
│  ├─ Génère code 2FA                     │
│  ├─ Sauvegarde en base                  │
│  └─ Envoie par email                    │
└─────────────────────────────────────────┘
                    │
                    ▼ setState(step=2)
┌─ Étape 2: POST verification ────────────┐
│  Email + Password + Code 2FA            │
│  ↓ Server Action                        │
│  verifyAndLogin()                       │
│  ├─ Re-valide user + password           │
│  ├─ Vérifie code 2FA                    │
│  ├─ Marque code comme utilisé           │
│  └─ Return user data                    │
│  ↓ Client                               │
│  signIn() NextAuth                      │
│  └─ Redirect dashboard                  │
└─────────────────────────────────────────┘
```

### **Server Actions créées :**

#### 1. **sendTwoFactorCode(FormData)**
```typescript
// Étape 1: Envoyer code 2FA
export async function sendTwoFactorCode(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');
  
  // 1. Vérifier utilisateur admin
  // 2. Vérifier mot de passe  
  // 3. Générer code 6 chiffres
  // 4. Sauvegarder TempCode
  // 5. Envoyer email
  
  return { success: boolean, message/error: string, email }
}
```

#### 2. **verifyAndLogin(FormData)**
```typescript
// Étape 2: Vérifier et préparer login
export async function verifyAndLogin(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const twoFactorCode = formData.get('twoFactorCode');
  
  // 1. Re-vérifier user + password (sécurité)
  // 2. Vérifier code 2FA valide + non utilisé
  // 3. Marquer code comme utilisé
  // 4. Return user data pour NextAuth
  
  return { success: boolean, user/error }
}
```

### **Component unique :**

#### **AdminLoginSimple (Client Component)**
```typescript
export default function AdminLoginSimple() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '', password: '', twoFactorCode: ''
  });
  
  // Étape 1: POST sendTwoFactorCode
  const handleSendCode = async (e) => {
    const result = await sendTwoFactorCode(formDataObj);
    if (result.success) setStep(2);
  };
  
  // Étape 2: POST verifyAndLogin + NextAuth signIn
  const handleVerifyAndLogin = async (e) => {
    const result = await verifyAndLogin(formDataObj);
    if (result.success) {
      await signIn('admin-2fa', { ...credentials });
    }
  };
}
```

### **Sécurité renforcée :**

✅ **Pas de GET avec données sensibles** - Plus de password dans URL  
✅ **Double vérification** - Credentials vérifiés 2 fois  
✅ **État côté client** - Pas de redirects avec query params  
✅ **Server actions pures** - Pas d'exposition des données  
✅ **Validation complète** - User + password + 2FA à chaque étape  

### **Avantages POST-only :**

1. **Sécurité** : Aucune donnée sensible dans l'URL
2. **Simplicité** : Flux linéaire sans redirects
3. **Performance** : Pas de rechargements de page
4. **UX** : Transitions fluides entre étapes
5. **Standards** : Approche HTTP classique POST

### **Flux détaillé :**

**Étape 1 - Credentials :**
```typescript
formData = { email: "admin@ailc.td", password: "admin123" }
↓ POST sendTwoFactorCode(formData)
├─ Vérifie user.isAdmin = true
├─ bcrypt.compare(password, user.password)
├─ Génère code: "123456"  
├─ Sauvegarde: TempCode { email, code, expires: +10min }
├─ send2FAEmail(email, code)
└─ Return: { success: true, message: "Code envoyé", email }
```

**Étape 2 - Vérification :**
```typescript
formData = { email, password, twoFactorCode: "123456" }
↓ POST verifyAndLogin(formData)
├─ Re-vérifie user + password (sécurité)
├─ Trouve TempCode { code, used: false, expires > now }
├─ Marque: TempCode.used = true
├─ Return: { success: true, user: {...} }
↓ Client signIn() NextAuth
├─ Provider admin-2fa valide à nouveau tout
├─ Crée session NextAuth
└─ Redirect: /admin/dashboard
```

### **Comparaison avec l'ancien système :**

**❌ Avant (GET redirects) :**
```
POST /admin → GET /admin?step=2&email=...&password=...&success=...
              ↑ Password exposé dans URL !
```

**✅ Maintenant (POST only) :**
```
POST sendTwoFactorCode → setState(step=2) 
POST verifyAndLogin → signIn() → dashboard
      ↑ Tout en POST sécurisé !
```

L'authentification est maintenant **totalement sécurisée** avec une approche POST pure, sans exposition de données sensibles ! 🔒

### **Structure finale des fichiers :**

```
/admin/
├── page.tsx                    # Server component simple
└── components/
    └── AdminLoginSimple.tsx    # Client component POST-only

lib/
└── admin-actions.ts           # Server actions pures
    ├── sendTwoFactorCode()
    └── verifyAndLogin()
```

**Résultat :** Flux d'auth moderne, sécurisé et simplifié ! 🚀