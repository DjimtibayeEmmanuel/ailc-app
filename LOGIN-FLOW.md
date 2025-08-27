# Flux de Connexion Simplifié

## ✅ Architecture ultra-simple avec /login

Le système d'authentification utilise une **page de connexion dédiée** qui redirige toujours vers `/admin`.

### **Flux d'accès aux routes admin :**

```
┌─ Utilisateur accède à /admin ───────────┐
│  Server Component vérifie session       │
│  ├─ Si connecté + admin                 │
│  │  └─ redirect('/admin/dashboard')     │
│  └─ Sinon                               │
│     └─ redirect('/login')               │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─ Page /login ────────────────────────────┐
│  ├─ Server Component vérifie session    │
│  │  └─ Si déjà connecté → redirect('/admin') │
│  └─ Sinon → LoginForm                   │
│     ├─ Étape 1: POST sendTwoFactorCode  │
│     ├─ Étape 2: POST verifyAndLogin     │
│     ├─ NextAuth signIn                  │
│     └─ redirect('/admin')               │
└─────────────────────────────────────────┘
```

### **Pages créées :**

#### 1. **`/login` - Page de connexion centralisée**
```typescript
export default async function LoginPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  
  // Si déjà connecté → redirect vers destination
  if (session?.user?.isAdmin) {
    redirect(searchParams.callbackUrl || '/admin');
  }
  
  return <LoginForm callbackUrl={searchParams.callbackUrl} />;
}
```

#### 2. **`/admin` - Garde d'accès automatique**
```typescript
export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  // Si connecté → dashboard
  if (session?.user?.isAdmin) {
    redirect('/admin/dashboard');
  }
  
  // Sinon → forcer connexion avec callback
  redirect('/login?callbackUrl=/admin');
}
```

### **LoginForm - Composant avec callback**
```typescript
export default function LoginForm({ callbackUrl }) {
  const handleVerifyAndLogin = async (e) => {
    // ... validation 2FA ...
    
    if (result.success) {
      await signIn('admin-2fa', { ... });
      
      // Redirection intelligente
      const destination = callbackUrl || '/admin';
      router.push(destination);
    }
  };
}
```

### **Avantages du nouveau flux :**

✅ **Séparation claire** - `/login` pour auth, `/admin` pour business logic  
✅ **Redirections intelligentes** - Callback URL préservé  
✅ **UX améliorée** - Un seul endroit pour se connecter  
✅ **Sécurité** - Vérifications server-side systématiques  
✅ **Extensible** - Facile d'ajouter d'autres routes protégées  

### **Scénarios d'utilisation :**

#### Scénario 1: Accès direct à `/admin`
```
/admin → [pas connecté] → /login?callbackUrl=/admin → [login] → /admin → /admin/dashboard
```

#### Scénario 2: Accès direct à `/admin/dashboard` 
```
/admin/dashboard → [middleware] → /login → [login] → /admin/dashboard
```

#### Scénario 3: Déjà connecté
```
/admin → [connecté] → /admin/dashboard (direct)
/login → [connecté] → /admin (ou callbackUrl)
```

### **Configuration NextAuth mise à jour :**

```typescript
export const authOptions: NextAuthOptions = {
  // ...
  pages: {
    signIn: "/login",  // Page de connexion centralisée
  }
}
```

### **Structure des fichiers :**

```
app/
├── login/
│   ├── page.tsx                # Server component avec callback
│   └── components/
│       └── LoginForm.tsx       # Client component 2FA
├── admin/
│   ├── page.tsx               # Garde d'accès (redirect only)
│   └── dashboard/
│       └── page.tsx           # Server component protégé
```

### **Middleware protection :**

```typescript
export default withAuth(
  function middleware(req) {
    // Protection /admin/dashboard uniquement
    if (req.nextUrl.pathname.startsWith("/admin/dashboard")) {
      if (!req.nextauth.token?.isAdmin) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }
  }
)
```

### **Flux complet détaillé :**

**1. Utilisateur tape `/admin` dans son navigateur**
```typescript
// /admin/page.tsx (Server Component)
const session = await getServerSession();

if (session?.user?.isAdmin) {
  redirect('/admin/dashboard');  // ✅ Accès direct au dashboard
}

redirect('/login?callbackUrl=/admin');  // 🔒 Force la connexion
```

**2. Redirection vers `/login?callbackUrl=/admin`**
```typescript
// /login/page.tsx (Server Component)  
const session = await getServerSession();

if (session?.user?.isAdmin) {
  redirect('/admin');  // ✅ Déjà connecté, va à la destination
}

return <LoginForm callbackUrl="/admin" />;  // 🔒 Affiche le formulaire
```

**3. Processus de connexion 2FA**
```typescript
// LoginForm.tsx (Client Component)
// Étape 1: Credentials → POST sendTwoFactorCode
// Étape 2: Code 2FA → POST verifyAndLogin + signIn
// ✅ Connexion réussie → router.push('/admin')
```

**4. Retour à `/admin` après connexion**
```typescript
// /admin/page.tsx (Server Component) - 2e passage
const session = await getServerSession();

if (session?.user?.isAdmin) {
  redirect('/admin/dashboard');  // ✅ Maintenant connecté → dashboard
}
```

Le système est maintenant **parfaitement organisé** avec une séparation claire des responsabilités ! 🚀

### **Points d'extension futurs :**

1. **Autres routes protégées** : Même pattern avec callbackUrl
2. **Différents niveaux d'auth** : User normal vs admin
3. **Session persistence** : Remember me functionality  
4. **Audit logging** : Traçabilité des connexions
5. **Rate limiting** : Protection contre brute force sur /login