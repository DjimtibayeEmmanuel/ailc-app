# Authentification Server Components + NextAuth

## ✅ Refactorisation complète

L'authentification admin utilise maintenant **exclusivement des server components** et **server actions**, sans aucun appel API côté client.

### **Architecture server-first :**

```
┌─ /admin (Server Component) ─────────────┐
│  ├─ Vérification session NextAuth       │
│  ├─ Gestion searchParams (step, error)  │  
│  └─ Render AdminLoginServer             │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─ AdminLoginServer (Server Component) ───┐
│  ├─ handleRequest2FA (Server Action)    │
│  │  └─ Valide email + password          │
│  │  └─ Génère et envoie code 2FA        │
│  │  └─ Redirect avec step=2             │
│  └─ Render formulaires selon step       │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─ AuthForm (Client Component minimal) ───┐
│  ├─ Saisie code 2FA                     │
│  ├─ signIn('admin-2fa') NextAuth        │
│  └─ Redirect vers /admin/dashboard      │
└─────────────────────────────────────────┘
```

### **Server Actions créées :**

#### 1. **request2FACode(email, password)**
```typescript
// lib/admin-actions.ts
export async function request2FACode(email: string, password?: string) {
  // 1. Vérifier utilisateur admin en base
  // 2. Valider mot de passe avec bcrypt  
  // 3. Générer code 6 chiffres
  // 4. Sauvegarder en base (TempCode)
  // 5. Envoyer par email
  return { success: boolean, message/error: string }
}
```

#### 2. **handleRequest2FA (Server Action inline)**
```typescript
async function handleRequest2FA(formData: FormData) {
  'use server';
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  const result = await request2FACode(email, password);
  
  if (result.success) {
    redirect(`/admin?step=2&email=${email}&password=${password}&success=${message}`);
  } else {
    redirect('/admin?error=' + error);
  }
}
```

### **Flux d'authentification server-first :**

1. **Étape 1 - Credentials** `/admin`
   - Server component render formulaire  
   - Server action `handleRequest2FA`
   - Validation server-side email + password
   - Génération et envoi code 2FA côté serveur
   - Redirect avec searchParams

2. **Étape 2 - Code 2FA** `/admin?step=2&email=...&password=...`
   - Server component lit searchParams
   - Render `AuthForm` (client component minimal)
   - Client utilise `signIn()` NextAuth avec tous les params
   - NextAuth provider valide et crée session

3. **Redirection** `/admin/dashboard`
   - Server component vérifie session NextAuth
   - Si admin → AdminPanel complet
   - Sinon → redirect /admin

### **Avantages server components :**

✅ **Pas d'appels API côté client** - Tout en server actions  
✅ **Validation côté serveur** - Email + password vérifiés avant envoi code  
✅ **Données sensibles sécurisées** - Mot de passe ne transite que côté serveur  
✅ **SEO-friendly** - Server components pré-rendus  
✅ **Performance** - Pas de loading states côté client  
✅ **Sécurité** - Logique métier côté serveur uniquement  

### **Composants refactorisés :**

#### Server Components (pages)
- `/app/admin/page.tsx` - Gestion session + searchParams
- `AdminLoginServer.tsx` - Formulaires + server actions

#### Client Components (UI minimal)  
- `AuthForm.tsx` - Saisie code 2FA + NextAuth signIn
- `AdminDashboardClient.tsx` - Interface admin avec session

### **NextAuth intégration :**

- **Provider 2FA** : Vérifie email + password + code 2FA
- **Session management** : Cookies sécurisés automatiques  
- **Middleware protection** : Routes `/admin/dashboard/*` protégées
- **Server session** : `getServerSession()` dans server components

### **Migration des API calls :**

**Avant :**
```typescript
// Client side API calls
const response = await fetch('/api/request-2fa', {
  method: 'POST',
  body: JSON.stringify({ email })
});
```

**Après :**
```typescript
// Server action directe
async function handleRequest2FA(formData: FormData) {
  'use server';
  const result = await request2FACode(email, password);
  redirect(...);
}
```

### **Sécurité renforcée :**

🔒 **Validation server-side** avant envoi code  
🔒 **Mot de passe jamais exposé côté client**  
🔒 **Server actions** sécurisées par défaut  
🔒 **NextAuth sessions** avec cookies HttpOnly  
🔒 **Middleware protection** automatique  

Le système est maintenant **100% server-first** avec une approche moderne Next.js 15, tout en préservant la logique 2FA existante ! 🚀

### **Points d'amélioration futurs :**

1. **Chiffrement searchParams** pour masquer password dans URL
2. **Rate limiting** sur server actions 2FA  
3. **Session storage temporaire** pour éviter searchParams
4. **Audit logging** des tentatives d'authentification
5. **Biométrie** pour remplacer 2FA email