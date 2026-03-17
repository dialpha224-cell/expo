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

## What's Been Implemented

### Session - 17 Mars 2025
- ✅ Bouton "Retour à l'accueil" ajouté sur la page Tendances
- ✅ Page Tendances confirmée fonctionnelle avec données affichées
- ✅ Système de filtres ajouté (Populaires, Récentes, Par salon) avec dropdown interactif
- ✅ CTA "Devenir Salon Partenaire" remplace les fausses statistiques
- ✅ Formulaire inscription salon en 2 étapes (propriétaire + salon)
- ✅ Système de validation admin avec endpoints (pending/approve/reject)
- ✅ Interface FounderDashboard avec onglets salons actifs/en attente (Mars 2026)

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
- [x] Systeme de promotions (reductions % ou fixes, dates, jours specifiques)
- [x] Upload photos profil utilisateurs, coiffeurs et coupes
- [x] Reservations Premium (+20%) avec boissons et snacks
- [x] Gestion des services premium par salon

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

## Nouvelles Fonctionnalites (Mars 2026 - Session 2)
- [x] Pages de connexion dediees (/login/admin, /login/salon, /login/client)
- [x] Carrousel "Coupes du Mois" sur landing page avec likes
- [x] Gestion des coupes du mois par les salons (upload + publication)
- [x] Programme de fidelite avec QR code client
- [x] Scanner fidelite pour les salons
- [x] Configuration des recompenses fidelite par salon (nombre de tampons, type de recompense)
- [x] Recherche de salons par pays/ville avec geolocalisation
- [x] API de localisation des salons (pays, villes, distance)

## Nouvelles Fonctionnalites (Mars 2026 - Session 3)
- [x] Reassignation des clients entre coiffeurs (modal + API)
- [x] Scan QR code pour confirmation RDV (arrivee, debut, fin de coupe)
- [x] Notification automatique de demande d'avis apres coupe terminee
- [x] Import de site web salon existant (adaptation au format AfroCrown)
- [x] Systeme de vote TrimConnect (3 votes max par utilisateur par concours)
- [x] Galerie publique TrimConnect avec classement par votes
- [x] Vente d'ecrans tactiles (3 modeles: Basic, Pro, Premium)
- [x] Commande d'ecrans depuis le Marketplace

### P1 (Next)
- [ ] Test manuel connexion Google (verifier bouton Admin) - EN ATTENTE VALIDATION USER
- [ ] Deploy mobile app (Expo EAS) - Instructions mises a jour dans BUILD_APK.md
- [ ] Real Stripe payment testing
- [ ] Activer simulation IA (connecter frontend existant au backend)

### P2 (Medium)
- [ ] Calendar view for appointments (composant existe, a integrer)
- [ ] Finaliser le traitement automatique des imports de sites web
- [ ] Envoyer des emails de confirmation apres commande d'ecrans
- [ ] Refactoring server.py en modules (backend/routes/*, backend/models/*)

### P3 (Low)
- [ ] Advanced statistics charts
- [ ] Multi-language support
- [ ] Video tutorials
- [ ] Academy section

## Endpoints API Ajoutes (Session 2)
- `POST /api/salons/{salon_id}/monthly-cuts` - Ajouter une coupe du mois
- `GET /api/salons/{salon_id}/monthly-cuts` - Liste coupes du mois d'un salon
- `GET /api/monthly-cuts/featured` - Coupes du mois pour le carrousel
- `POST /api/monthly-cuts/{cut_id}/like` - Liker une coupe
- `DELETE /api/monthly-cuts/{cut_id}` - Supprimer une coupe
- `GET /api/loyalty/my-cards` - Cartes fidelite de l'utilisateur
- `GET /api/loyalty/card/{salon_id}` - Obtenir/creer carte fidelite
- `POST /api/loyalty/scan` - Scanner QR code fidelite (salon)
- `GET /api/salons/{salon_id}/loyalty-config` - Config fidelite salon
- `PUT /api/salons/{salon_id}/loyalty-config` - Modifier config fidelite
- `GET /api/loyalty/rewards` - Recompenses de l'utilisateur
- `POST /api/loyalty/redeem/{reward_id}` - Utiliser une recompense
- `PUT /api/salons/{salon_id}/location` - Mettre a jour localisation salon
- `GET /api/salons/locations/countries` - Liste des pays
- `GET /api/salons/locations/cities` - Liste des villes
- `GET /api/salons/search` - Recherche salons par localisation
- `GET /api/salons/nearby` - Salons a proximite

## Endpoints API Ajoutes (Session 3)
- `POST /api/appointments/{appointment_id}/reassign` - Reassigner un RDV
- `GET /api/barbers/{barber_id}/available-colleagues` - Coiffeurs disponibles
- `POST /api/appointments/scan-qr` - Scanner QR code RDV
- `POST /api/salons/{salon_id}/import-website` - Importer site web salon
- `POST /api/trimconnect/{entry_id}/vote` - Voter pour une participation
- `DELETE /api/trimconnect/{entry_id}/vote` - Retirer son vote
- `GET /api/trimconnect/my-votes` - Mes votes TrimConnect
- `GET /api/trimconnect/public-gallery` - Galerie publique TrimConnect
- `GET /api/shop/tactile-screens` - Liste des ecrans tactiles
- `POST /api/shop/tactile-screens/order` - Commander un ecran

## Bug Fixes (Mars 2026 - Session 4)
- [x] Bug routage backend: Routes statiques `/api/salons/search`, `/api/salons/locations/*` interceptees par route dynamique `/api/salons/{salon_id}` - CORRIGE en deplacant les routes statiques AVANT la route dynamique
- [x] Salons mis a jour avec donnees de localisation (country, city, coordinates)
- [x] Tests backend: 12/12 passes (recherche salons)
- [x] Tests frontend: 100% (flow recherche landing page)

## Nouvelles Fonctionnalites (Mars 2026 - Session 4)
- [x] Modal video demo sur la landing page (bouton "Voir la demo")
- [x] Footer avec "Inspired by Kadj'" en anglais
- [x] Accents corriges sur tout le site (Reference -> Référence, Reservez -> Réservez, decouvrez -> découvrez)
- [x] Support multi-langues complet (6 langues): Français, English, Nederlands, Español, العربية, Deutsch
- [x] Selecteur de langue moderne dans la navbar avec drapeaux
- [x] Traductions de: navigation, hero section, stats, search section, footer
- [x] Support RTL automatique pour l'arabe
- [x] Simulation IA activee et connectee au backend (endpoint /api/ai/simulate-haircut)
- [x] VIDEO PROMO generee avec Sora 2 AI (8 secondes, barbershop premium africain)
- [x] NOUVELLE PALETTE AFRO: Tons dores (#D4A55C), bronze (#8B5A2B), terracotta (#C06040)
- [x] EFFET FILIGRANE BARBER avec lueur subtile (faisceau anime, ciseaux stylises)
- [x] Logo AfroCrown avec effet de halo dore
- [x] Cartes et boutons avec dégradés chauds
- [x] Animations CSS pour la lueur et le mouvement du filigrane

## Nouvelles Fonctionnalites (Mars 2026 - Session 5)
- [x] TEXTE "BARBER" en filigrane avec animation d'illumination (glow pulsant)
- [x] VOIX OFF professionnelle generee avec OpenAI TTS HD (voix Onyx, francais)
- [x] 4 PHOTOS clients generees par IA (miroir, coupe en cours, afro, waves)
- [x] SECTION GALERIE ajoutee sur la landing page avec hover effects
- [x] TRADUCTIONS ETENDUES: Marketplace, TrimConnect, Simulation IA, Booking, Appointments, Reviews
- [x] Amelioration de l'effet de lueur (plus visible, animation subtile)

## Nouvelles Fonctionnalites (Mars 2026 - Session 6)
- [x] LANDING PAGE LUMINEUSE avec palette BLEU + OR (#3B82F6, #FFD700)
- [x] Filigrane BARBER en bleu avec lueur animee
- [x] 19 PAYS EUROPEENS avec 33 salons au total
- [x] VIDEO PRESENTATION COMPLETE avec 3 phases:
  - Phase 1: INTRO avec logo couronne + "AFROCROWN" + "AFROCROWN TV"
  - Phase 2: VIDEO DEMO du barbershop + voix off
  - Phase 3: GENERIQUE DE FIN style cinema:
    * "AFROCROWN TV"
    * "FONDEE PAR KAZALI"
    * "Un entrepreneur visionnaire qui apporte une nouvelle vision"
    * Credits: Direction Creative, Concept & Vision, Production
    * Logo final + "Inspired by Kadj'"
- [x] Composant VideoPresentation.jsx avec controles play/pause/mute
- [x] Refactoring backend demarre: /backend/models/, /backend/utils/, /backend/services/
- [x] Guide APK mobile mis a jour: /mobile/BUILD_APK.md

## Nouvelles Fonctionnalites (Mars 2026 - Session 7)
- [x] VIDEO ORIGINALE restauree (version avec intro couronne + branding)
- [x] TESTS FRONTEND: 100% (18/18 tests passes - iteration_10)
- [x] Theme or/jaune verifie (F59E0B, FBBF24)
- [x] Selecteur de langue avec 6 langues fonctionnel
- [x] Recherche salons par pays/ville fonctionnelle
- [x] Toutes les pages principales chargent correctement
- [x] REFACTORING BACKEND demarre:
  - /backend/models/schemas.py - 450+ lignes de modeles Pydantic extraits
  - /backend/services/database.py - Connexion MongoDB et collections
  - /backend/utils/helpers.py - Fonctions utilitaires (hash, QR, etc.)
- [x] GUIDE BUILD APK simplifie: /mobile/BUILD_APK.md
- [x] Configuration app.json mise a jour pour EAS Build

## Bug Fixes (Mars 2026 - Session 8)
- [x] Page Tendances: Dropdown "Par salon" corrige (scrollable, z-index)
- [x] Page Tendances: Erreur React "removeChild" corrigee (AnimatePresence mode="wait")
- [x] Page Booking: Images dupliquees corrigees (nouvelles images generees)
- [x] Bug Founder Login: Role non reconnu - CORRIGE (utilisateur manquait dans la DB test_database)
- [x] Compte Founder cree: founder@afrocrown.com / founder123

## Nouvelles Fonctionnalites (Mars 2026 - Session 8)
- [x] **ANALYTICS AVANCES** pour Salon Owner et Founder:
  - Sélecteur de période: 7 jours, 14 jours, 30 jours, 3 mois, 6 mois
  - Cartes de résumé avec KPIs clés (réservations, revenus, taux complétion, panier moyen)
  - Graphique d'évolution temporelle (AreaChart/LineChart avec Recharts)
  - Répartition par pays (PieChart pour Founder)
  - Top 5 coiffeurs et coupes populaires (pour Salon)
  - Distribution horaire des réservations (BarChart horizontal)
  - Tableaux de données détaillées avec colonnes triables
  - Top 10 salons par réservations et revenus (pour Founder)
- [x] Nouveaux endpoints API:
  - GET /api/analytics/salon/{salon_id}?days=N
  - GET /api/analytics/founder?days=N

- [x] **GAMIFICATION & ENGAGEMENT** (Phase 1):
  - **Système de badges salons** avec 7 badges (Nouveau Partenaire, Étoile Montante, Salon Populaire, Excellence, Maître des Revenus, Fidélité Exemplaire, Salon Élite)
  - **Programme VIP clients** avec 4 tiers (Bronze, Silver, Gold, Platinum) et points cumulables
  - **Code de parrainage** généré automatiquement pour chaque client (100 pts par parrainage)
  - **Préférences de notification** anti-spam (max messages/semaine, heures calmes, opt-in/out)
  - **Relances clients inactifs** (4+ semaines) avec throttling intelligent (1 rappel/semaine max)
  - **Réservation urgente** "dans les 2h" avec géolocalisation

- [x] Nouveaux composants frontend:
  - ClientVIPStatus.jsx - Carte VIP avec statut, points, parrainage, préférences notif
  - SalonBadges.jsx - Page badges avec stats et progression
  - UrgentBooking.jsx - Modal de réservation urgente géolocalisée
  - InactiveClientReminders.jsx - Liste des clients à relancer avec bouton "Relancer"

- [x] Nouveaux endpoints API:
  - GET /api/client/profile/enhanced - Profil VIP client
  - PUT /api/client/notification-preferences - Préférences notification
  - POST /api/client/referral/apply - Appliquer code parrainage
  - GET /api/salon/{salon_id}/badges - Badges du salon
  - GET /api/bookings/urgent - Créneaux urgents géolocalisés
  - GET /api/client/inactive-reminder - Liste clients inactifs
  - POST /api/client/{client_id}/send-reminder - Envoyer relance (avec throttling)

- [x] **AI SIMULATION BACKEND** - Amélioré avec 30+ styles de coiffures Afro:
  - Mapping détaillé de 30+ styles (Fades, Waves, Afro, Tresses, Locks, Natural, Trendy, Classic, Long)
  - Prompts optimisés pour génération d'images réalistes
  - Endpoint: POST /api/ai/simulate-haircut

- [x] **TRADUCTIONS MULTI-LANGUES COMPLETES** - 6 langues:
  - Français (fr) - Complet
  - English (en) - Complet
  - Nederlands (nl) - Complet avec navigation, booking, marketplace, simulation, appointments
  - Español (es) - Complet avec navigation, booking, marketplace, simulation, appointments
  - العربية (ar) - Complet avec navigation, booking, marketplace, simulation, appointments
  - Deutsch (de) - Complet avec navigation, booking, marketplace, simulation, appointments
  - Composant UrgentBooking traduit dans toutes les langues

## Next Tasks
1. Vérifier build APK mobile avec mode offline
2. Facebook Login (en attente de credentials utilisateur)
3. Continuer refactoring server.py (5700+ lignes)

## Completed (Session 9 - Mars 2026)
- [x] **Abonnements Mensuels** - Système complet:
  - 3 plans: Basic (29.99€), Standard (49.99€), Premium (79.99€)
  - Endpoints: /api/subscriptions/plans, /my, /subscribe, /cancel, /use-cut
  - Page /subscriptions avec affichage des plans
  - Lien "Abonnements" dans la navigation principale
  - +200 points bonus à l'inscription

- [x] **File d'attente Virtuelle** - Système complet:
  - Endpoints: /api/queue/{salon_id}, /join, /leave, /call-next, /my-position
  - Composant VirtualQueue.jsx avec gestion complète
  - Statistiques temps réel (en attente, en cours, temps estimé)
  - Page /salon/queue intégrée au dashboard salon
  - Interface de gestion pour propriétaires de salon

- [x] **Guides PDF Téléchargeables**:
  - Endpoints: /api/guides (liste), /api/guides/download/{filename}
  - Page dédiée /guides avec téléchargement
  - Lien "Guides PDF" ajouté au footer
  - 2 PDFs: Guide Client (251 Ko), Guide Salon (167 Ko)

- [x] **Composants Existants Vérifiés**:
  - WebsiteImporter.jsx - Fonctionnel (import site web salon)
  - ReassignClientModal.jsx - Fonctionnel (réassigner client)
  - AppointmentQRScanner.jsx - Fonctionnel (scanner QR RDV)

## Completed (Session 8 - Mars 2026)
- [x] Analytics avancés pour salons et founder (graphiques + tableaux)
- [x] Gamification Phase 1 (badges, VIP, parrainage, relances)
- [x] AI Simulation backend amélioré (30+ styles)
- [x] Vue 360° avec génération IA (3 angles: Face, Profil, Dos)
- [x] Traductions multi-langues complètes (6 langues)
- [x] Mode hors-ligne pour app mobile (cache + sync)
- [x] Guides utilisateur créés (GUIDE_SALON.md, GUIDE_CLIENT.md)

## Credentials
- **Founder**: founder@afrocrown.com / founder123

## Mobile App - Instructions Build
Voir `/mobile/BUILD_APK.md` pour les instructions completes.

Commandes rapides:
```bash
cd mobile
npm install
npm install -g eas-cli@latest
eas login
eas build --platform android --profile preview
```

Le build prend ~15-20 min. Lien APK fourni a la fin.

