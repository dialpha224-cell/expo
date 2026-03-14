# AfroCrown - Product Requirements Document

## Original Problem Statement
Plateforme digitale centralisee pour la coiffure afro reliant clients, salons et coiffeurs. Offre reservations, marketplace, concours TrimConnect, IA de simulation de coupe, fidelite et communaute.

## Architecture
- **Backend**: FastAPI + MongoDB
- **Frontend Web**: React + Tailwind CSS + Shadcn UI
- **Frontend Mobile**: React Native / Expo (structure creee)
- **Auth**: Google OAuth via Emergent
- **Payments**: Stripe (cle test configuree)
- **Images**: Cloudinary (configure avec cles utilisateur)
- **AI**: OpenAI GPT Image 1 via Emergent LLM Key

## User Personas
1. **Fondateur**: Controle global, gestion salons, supervision TrimConnect
2. **Proprietaire Salon**: Gestion coiffeurs, rendez-vous, coupes, produits, ventes
3. **Client**: Reservation, simulation IA, achat produits, vote TrimConnect

## What's Been Implemented (Jan 2026)

### Backend APIs (28 endpoints)
- Auth: session, me, logout
- Salons: CRUD, stats, assign owner
- Barbers: CRUD par salon
- Haircuts: CRUD par salon + liste globale
- Appointments: CRUD, status, details avec QR code, scan
- Products: CRUD marketplace
- TrimConnect: entries, votes, leaderboard, hall of fame
- Payments: Stripe checkout, status, webhook
- Cloudinary: signature upload
- AI Simulation: generate haircut

### Frontend Web Pages
- Landing Page avec navigation complete
- Auth Callback (Google OAuth)
- Dashboard Fondateur: Overview, Salons, Users, Stats, TrimConnect, Settings
- Dashboard Salon: Overview, Barbers, Appointments, Haircuts, Products, Stats, Settings
- Booking Page: 5 etapes (Salon > Coupe > Coiffeur > Date > Confirmation)
- Booking Confirmation: Details + QR Code
- Mes Rendez-vous: Liste avec QR codes
- Marketplace: Produits avec filtres, recherche, panier
- TrimConnect: Participations, Classement, Hall of Fame
- AI Simulation: 8 styles de coupe

### Application Mobile (React Native/Expo)
Structure creee dans /app/mobile avec:
- Home screen
- Booking flow
- Marketplace
- TrimConnect
- AI Simulation
- Profile

### Demo Data
- 2 Salons: Afro Barber MLK, Baggio Barber Shop
- 5 Coiffeurs avec specialites
- 7 Coupes avec prix et durees
- 8 Produits capillaires avec images

## Test Results
- Backend: 100% (28/28 tests)
- Frontend: 95% (minor console errors)

## Prioritized Backlog

### P0 (Done)
- [x] Platform structure
- [x] Authentication
- [x] CRUD operations
- [x] Booking flow
- [x] QR Code generation
- [x] Marketplace
- [x] TrimConnect
- [x] AI Simulation page

### P1 (Next)
- [ ] Deploy mobile app to stores
- [ ] Real Stripe payment testing
- [ ] AI Simulation real testing with images

### P2 (Medium)
- [ ] Calendar view for appointments
- [ ] Real-time notifications (push)
- [ ] Interactive screen for salons
- [ ] Client loyalty points

### P3 (Low)
- [ ] Advanced statistics charts
- [ ] Multi-language support
- [ ] Video tutorials
- [ ] Academy section

## Next Tasks
1. Publier l'app mobile sur App Store / Play Store
2. Tester les paiements Stripe en production
3. Ajouter plus de produits et coiffeurs reels
4. Implementer les notifications push
5. Creer l'ecran interactif pour salons
