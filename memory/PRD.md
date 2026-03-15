# AfroCrown - Product Requirements Document

## Original Problem Statement
Plateforme digitale centralisee pour la coiffure afro reliant clients, salons et coiffeurs. Offre reservations, marketplace, concours TrimConnect, IA de simulation de coupe, fidelite et communaute.

## Architecture
- **Backend**: FastAPI + MongoDB
- **Frontend Web**: React + Tailwind CSS + Shadcn UI
- **Frontend Mobile**: React Native / Expo (complete, pret pour deploiement)
- **Auth**: Google OAuth via Emergent + Email/Password custom
- **Payments**: Stripe (cle test configuree)
- **Images**: Cloudinary (configure avec cles utilisateur)
- **AI**: OpenAI GPT Image 1 via Emergent LLM Key
- **Email**: Resend (mode test)
- **Push Notifications**: Expo Push (integre backend + mobile)

## User Personas
1. **Fondateur**: Controle global, gestion salons, supervision TrimConnect
2. **Proprietaire Salon**: Gestion coiffeurs, rendez-vous, coupes, produits, ventes
3. **Client**: Reservation, simulation IA, achat produits, vote TrimConnect

## What's Been Implemented (Mars 2026)

### Backend APIs (35+ endpoints)
- Auth: session, me, logout, login (email/password), change-password, setup-password, verify-setup-token
- Founder: create users, list users, delete users, stats, reservations, update appointment status
- Salons: CRUD, stats, assign owner
- Barbers: CRUD par salon
- Haircuts: CRUD par salon + liste globale
- Appointments: CRUD, status, details avec QR code, scan
- Products: CRUD marketplace
- TrimConnect: entries, votes, leaderboard, hall of fame
- Payments: Stripe checkout, status, webhook
- Cloudinary: signature upload
- AI Simulation: generate haircut (avec image base64)
- Push Notifications: register-token, unregister-token, test
- Email: welcome emails avec lien de setup password

### Frontend Web Pages
- Landing Page avec navigation complete et double authentification (Google + Email)
- Auth Callback (Google OAuth) - REFACTORISE pour corriger bug navigation
- Setup Password page (pour nouveaux utilisateurs)
- Dashboard Fondateur: Overview, Salons, Users (create/delete), Reservations, Stats, TrimConnect, Settings
- Dashboard Salon: Overview, Barbers, Appointments, Haircuts, Products, Stats, Settings
- Booking Page: 5 etapes (Salon > Coupe > Coiffeur > Date > Confirmation)
- Booking Confirmation: Details + QR Code
- Mes Rendez-vous: Liste avec QR codes
- Marketplace: Produits avec filtres, recherche, panier
- TrimConnect: Participations, Classement, Hall of Fame
- AI Simulation: 8 styles de coupe

### Application Mobile (React Native/Expo) - COMPLETE
Structure dans /app/mobile avec:
- Home screen (reservations)
- Booking flow complet
- Marketplace
- TrimConnect (vote, classement)
- AI Simulation (camera/galerie)
- Profile (gestion compte, push notifications)
- Push notifications integrees
- AuthContext avec session persistante

### Demo Data
- 3 Salons: Afro Barber MLK, Baggio Barber Shop, AfroCrown Premium
- 5 Coiffeurs avec photos africaines/metisses
- 7 Coupes avec prix et durees
- 8 Produits capillaires avec images

## Test Results (Mars 2026)
- Backend: 100% (23+ tests passes - iteration_6)
- Frontend: 100% (toutes pages fonctionnelles)
- Mobile: Structure complete, pret pour test utilisateur
- Custom Pricing: 11/11 tests passes

## Bug Fixes Recents
- [x] Bug bouton Admin navbar apres connexion Google - Refactorisation AuthCallback avec window.location.href
- [x] Badge "Made with Emergent" supprime de index.html
- [x] Double rendu OnboardingTutorial corrige avec prop forceShow

## Nouvelles Fonctionnalites (Mars 2026)
- [x] Tutoriel d'onboarding interactif pour proprietaires de salon (8 etapes)
- [x] Tutoriel d'onboarding pour fondateurs (6 etapes)
- [x] Bouton d'aide flottant (?) pour revoir le tutoriel
- [x] Memorisation localStorage pour ne pas reafficher le tutoriel
- [x] Notifications in-app pour les nouveaux RDV
- [x] Systeme d'avis clients avec notes etoiles (1-5) pour salon, coiffeur et plateforme
- [x] Gestion des roles coiffeurs (proprietaire, employe, benevole, stagiaire)
- [x] Disponibilite coiffeurs (disponible/indisponible avec raison et redirection)
- [x] Notification d'arrivee client (retard/avance avec minutes)
- [x] Ecran live salon avec RDV en temps reel (vert=a l'heure, rouge=retard, barre=annule)
- [x] Mode Simulation IA sur ecran live
- [x] Tarification personnalisee par salon (chaque salon definit ses prix)

## Prioritized Backlog

### P0 (Done)
- [x] Platform structure
- [x] Authentication (Google + Email/Password)
- [x] CRUD operations
- [x] Booking flow
- [x] QR Code generation
- [x] Marketplace
- [x] TrimConnect
- [x] AI Simulation page
- [x] Mobile app structure complete
- [x] Push notifications backend
- [x] Admin user management avec email

### P1 (Next)
- [ ] Test manuel connexion Google (verifier bouton Admin)
- [ ] Deploy mobile app (Expo EAS)
- [ ] Real Stripe payment testing

### P2 (Medium)
- [ ] Calendar view for appointments
- [ ] Ecran tactile salon (vente via plateforme)
- [ ] Client loyalty points
- [ ] Full TrimConnect voting mechanism

### P3 (Low)
- [ ] Advanced statistics charts
- [ ] Multi-language support
- [ ] Video tutorials
- [ ] Academy section

## Next Tasks
1. Tester manuellement la connexion Google avec dialpha224@gmail.com
2. Telecharger et deployer l'app mobile via Expo EAS
3. Tester le scan QR code dans le dashboard salon
4. Verifier domaine Resend pour envoi emails en production
5. Implementer ecran interactif salon
