# AfroCrown - Product Requirements Document

## Original Problem Statement
Plateforme digitale centralisee pour la coiffure afro reliant clients, salons et coiffeurs. Offre reservations, marketplace, concours TrimConnect, IA de simulation de coupe, fidelite et communaute.

## Architecture
- **Backend**: FastAPI + MongoDB
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Auth**: Google OAuth via Emergent
- **Payments**: Stripe
- **Images**: Cloudinary (placeholder - needs user keys)
- **AI**: OpenAI GPT Image 1 via Emergent LLM Key

## User Personas
1. **Fondateur**: Controle global, gestion salons, supervision TrimConnect
2. **Proprietaire Salon**: Gestion coiffeurs, rendez-vous, coupes, produits, ventes
3. **Client**: Reservation, simulation IA, achat produits, vote TrimConnect

## Core Requirements (Static)
- Interface web Fondateur avec dashboard global
- Interface web Salon avec gestion complete
- Marketplace produits capillaires
- TrimConnect Barber Battle (concours biannuel)
- Systeme de paiement (Stripe + Cash)
- Authentification Google OAuth

## What's Been Implemented (Jan 2026)
### Backend APIs
- Auth: /api/auth/session, /api/auth/me, /api/auth/logout
- Salons: CRUD operations, stats
- Barbers: CRUD par salon
- Haircuts: CRUD par salon
- Appointments: Creation, gestion statuts
- Products: CRUD marketplace
- TrimConnect: Entries, votes, leaderboard, hall of fame
- Payments: Stripe checkout, webhooks
- Cloudinary: Signature upload (placeholder keys)
- AI Simulation: Endpoint ready (needs testing)

### Frontend Pages
- Landing Page avec hero, features, stats, CTA
- Auth Callback (Google OAuth)
- Founder Dashboard: Overview, Salons, Users, Stats, TrimConnect, Settings
- Salon Dashboard: Overview, Barbers, Appointments, Haircuts, Products, Stats, Settings
- Marketplace: Products grid, search, filters, cart
- TrimConnect: Entries, Leaderboard, Hall of Fame, Vote system

## Prioritized Backlog
### P0 (Critical)
- [DONE] Core platform structure
- [DONE] Authentication flow
- [DONE] Basic CRUD operations

### P1 (High)
- [ ] Cloudinary integration (waiting for user keys)
- [ ] AI Simulation testing
- [ ] Real payment testing

### P2 (Medium)
- [ ] Calendar view for appointments
- [ ] Real-time notifications
- [ ] QR Code generation for appointments
- [ ] Interactive screen for salons

### P3 (Low)
- [ ] Loyalty points system
- [ ] Advanced statistics charts
- [ ] Multi-language support

## Next Tasks
1. User to provide Cloudinary API keys
2. Test AI simulation endpoint
3. Add sample data for demo
4. Implement calendar view for appointments
5. Add QR code generation for bookings
