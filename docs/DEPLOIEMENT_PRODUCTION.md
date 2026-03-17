# AfroCrown - Guide de Déploiement en Production

## Vue d'ensemble
Ce document décrit les étapes pour déployer AfroCrown en production.

---

## 1. Architecture de Production

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐  │
│   │   Frontend  │     │   Backend   │     │   MongoDB   │  │
│   │   (React)   │────▶│  (FastAPI)  │────▶│   Atlas     │  │
│   │   Vercel    │     │   Railway   │     │             │  │
│   └─────────────┘     └─────────────┘     └─────────────┘  │
│         │                    │                              │
│         │                    │                              │
│         ▼                    ▼                              │
│   ┌─────────────┐     ┌─────────────┐                      │
│   │ Cloudinary  │     │   Stripe    │                      │
│   │  (Images)   │     │ (Paiements) │                      │
│   └─────────────┘     └─────────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Prérequis

### Comptes requis
- [ ] MongoDB Atlas (gratuit) - https://www.mongodb.com/atlas
- [ ] Vercel (gratuit) - https://vercel.com
- [ ] Railway (gratuit/$5) - https://railway.app
- [ ] Stripe (gratuit) - https://stripe.com
- [ ] Cloudinary (gratuit) - https://cloudinary.com
- [ ] Resend (gratuit) - https://resend.com

### Variables d'environnement à préparer
```env
# Backend (.env)
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=afrocrown_prod
STRIPE_API_KEY=sk_live_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=re_...
SENDER_EMAIL=noreply@afrocrown.com
EMERGENT_KEY=... (pour simulation IA)

# Frontend (.env)
REACT_APP_BACKEND_URL=https://api.afrocrown.com
```

---

## 3. Déploiement Backend (Railway)

### Étape 1: Préparer le projet
```bash
cd backend
pip freeze > requirements.txt
```

### Étape 2: Créer le fichier Procfile
```
web: uvicorn server:app --host 0.0.0.0 --port $PORT
```

### Étape 3: Déployer sur Railway
1. Connectez votre repo GitHub à Railway
2. Sélectionnez le dossier `/backend`
3. Ajoutez les variables d'environnement
4. Railway détecte automatiquement Python et déploie

### Configuration Railway
- **Start command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- **Health check**: `/api/health`

---

## 4. Déploiement Frontend (Vercel)

### Étape 1: Préparer le projet
```bash
cd frontend
yarn build
```

### Étape 2: Déployer sur Vercel
1. Importez le projet depuis GitHub
2. Sélectionnez le dossier `/frontend`
3. Framework preset: Create React App
4. Build command: `yarn build`
5. Output directory: `build`

### Variables d'environnement Vercel
```
REACT_APP_BACKEND_URL=https://api.afrocrown.com
```

---

## 5. Configuration MongoDB Atlas

### Étape 1: Créer un cluster
1. Créez un compte sur mongodb.com
2. Créez un cluster gratuit (M0)
3. Choisissez la région la plus proche de vos utilisateurs

### Étape 2: Configuration réseau
1. Network Access → Add IP Address
2. Pour Railway: utilisez `0.0.0.0/0` (ou les IPs Railway)

### Étape 3: Créer un utilisateur
1. Database Access → Add New Database User
2. Notez le username et password

### Étape 4: Obtenir la connexion string
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/afrocrown_prod
```

---

## 6. Configuration Stripe (Production)

### Étape 1: Activer le mode live
1. Stripe Dashboard → Developers → API Keys
2. Copiez la clé live: `sk_live_...`

### Étape 2: Configurer les webhooks
1. Developers → Webhooks → Add endpoint
2. URL: `https://api.afrocrown.com/api/payments/webhook`
3. Events: `checkout.session.completed`, `payment_intent.succeeded`

### Étape 3: Produits et prix
Créez les produits d'abonnement:
- Basic: 29.99€/mois
- Standard: 49.99€/mois
- Premium: 79.99€/mois

---

## 7. Configuration DNS et domaine

### Option A: Domaine personnalisé
1. Achetez un domaine (OVH, Namecheap, etc.)
2. Configurez les DNS:
   - `afrocrown.com` → Vercel
   - `api.afrocrown.com` → Railway

### Option B: Sous-domaines gratuits
- Frontend: `afrocrown.vercel.app`
- Backend: `afrocrown.up.railway.app`

---

## 8. Checklist de lancement

### Sécurité
- [ ] HTTPS activé partout
- [ ] Variables d'environnement sécurisées
- [ ] Clés API en mode production
- [ ] Rate limiting configuré

### Fonctionnel
- [ ] Authentification fonctionne
- [ ] Paiements Stripe testés
- [ ] Emails envoyés correctement
- [ ] Uploads d'images fonctionnels

### Performance
- [ ] Build optimisé (yarn build)
- [ ] Images compressées
- [ ] Lazy loading activé

### Légal
- [ ] CGU accessibles
- [ ] Politique de confidentialité
- [ ] Mentions légales
- [ ] Consentement cookies

---

## 9. Monitoring et maintenance

### Outils recommandés
- **Logs**: Railway/Vercel built-in
- **Uptime**: UptimeRobot (gratuit)
- **Analytics**: Google Analytics / Plausible
- **Erreurs**: Sentry (gratuit)

### Backups MongoDB
Atlas offre des backups automatiques sur les plans payants.
Pour le plan gratuit, planifiez des exports manuels réguliers.

---

## 10. Coûts estimés

| Service | Plan | Coût/mois |
|---------|------|-----------|
| MongoDB Atlas | M0 (gratuit) | 0€ |
| Vercel | Hobby | 0€ |
| Railway | Starter | ~5€ |
| Cloudinary | Free | 0€ |
| Resend | Free (3000 emails) | 0€ |
| Domaine | .com | ~1€ |
| **Total** | | **~6€/mois** |

---

## Support

- Documentation Vercel: https://vercel.com/docs
- Documentation Railway: https://docs.railway.app
- Documentation MongoDB Atlas: https://www.mongodb.com/docs/atlas

---

*AfroCrown - Prêt pour la production*
*Guide de déploiement v1.0 - Mars 2026*
