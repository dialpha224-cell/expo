import { createContext, useContext, useState, useEffect } from "react";

// Translations database - 6 languages: fr, en, nl, es, ar, de
const translations = {
  fr: {
    // Navigation
    "nav.features": "Fonctionnalités",
    "nav.booking": "Réserver",
    "nav.marketplace": "Marketplace",
    "nav.simulation": "Simulation IA",
    "nav.trimconnect": "TrimConnect",
    "nav.appointments": "Mes RDV",
    "nav.admin": "Admin",
    "nav.salon": "Mon Salon",
    "nav.logout": "Déconnexion",
    "nav.login": "Connexion",
    
    // Landing Page
    "landing.badge": "TrimConnect Battle - Inscriptions ouvertes",
    "landing.hero.title1": "La Référence de la",
    "landing.hero.title2": "Coiffure Afro",
    "landing.hero.subtitle": "Réservez, simulez votre coupe avec l'IA, découvrez les meilleurs produits et participez au plus grand concours de coiffure.",
    "landing.hero.cta": "Réserver maintenant",
    "landing.hero.cta_admin": "Accéder au Dashboard Admin",
    "landing.hero.cta_salon": "Accéder à Mon Salon",
    "landing.hero.demo": "Voir la démo",
    "landing.stats.salons": "Salons partenaires",
    "landing.stats.clients": "Clients satisfaits",
    "landing.stats.styles": "Styles disponibles",
    "landing.stats.rating": "Note moyenne",
    
    // Features
    "landing.features.booking.title": "Réservation en ligne",
    "landing.features.booking.desc": "Réservez votre coupe en quelques clics, 24h/24",
    "landing.features.ai.title": "Simulation IA",
    "landing.features.ai.desc": "Testez votre nouvelle coupe avant de passer au salon",
    "landing.features.marketplace.title": "Marketplace",
    "landing.features.marketplace.desc": "Découvrez les meilleurs produits pour vos cheveux",
    "landing.features.contest.title": "TrimConnect",
    "landing.features.contest.desc": "Participez au plus grand concours de coiffure afro",
    
    // Search Section
    "landing.search.title": "Trouvez un Salon",
    "landing.search.subtitle": "Recherchez par pays, ville ou utilisez la géolocalisation",
    "landing.search.country": "Pays",
    "landing.search.city": "Ville",
    "landing.search.locate": "Me localiser",
    "landing.search.button": "Rechercher",
    "landing.search.results": "salons trouvés",
    "landing.search.no_results": "Aucun salon trouvé",
    "landing.search.locating": "Localisation...",
    
    // Monthly Cuts
    "landing.monthly.title": "Les Plus Belles Coupes",
    "landing.monthly.subtitle": "Découvrez les réalisations exceptionnelles de nos salons partenaires ce mois-ci.",
    "landing.monthly.likes": "likes",
    
    // CTA Section
    "landing.cta.title": "Prêt à transformer votre style ?",
    "landing.cta.subtitle": "Rejoignez des milliers de clients satisfaits",
    "landing.cta.button": "Commencer maintenant",
    
    // Footer
    "footer.inspired": "Inspired by Kadj'",
    "footer.rights": "Tous droits réservés",
    "footer.product": "Produit",
    "footer.features": "Fonctionnalités",
    "footer.pricing": "Tarifs",
    "footer.company": "Entreprise",
    "footer.about": "À propos",
    "footer.contact": "Contact",
    "footer.legal": "Légal",
    "footer.privacy": "Confidentialité",
    "footer.terms": "Conditions",
    
    // Booking
    "booking.title": "Réservez votre coupe",
    "booking.select_salon": "Choisir un salon",
    "booking.select_barber": "Choisir un coiffeur",
    "booking.select_haircut": "Choisir une coupe",
    "booking.select_date": "Choisir une date",
    "booking.select_time": "Choisir un horaire",
    "booking.premium": "Option Premium (+20%)",
    "booking.confirm": "Confirmer la réservation",
    "booking.total": "Total",
    
    // Auth
    "auth.login": "Connexion",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.google_login": "Continuer avec Google",
    "auth.or": "ou",
    "auth.no_account": "Vous n'avez pas de compte ? Contactez l'administrateur.",
    "auth.submit": "Se connecter",
    
    // Common
    "common.loading": "Chargement...",
    "common.save": "Sauvegarder",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.add": "Ajouter",
    "common.search": "Rechercher",
    "common.all": "Tous",
    "common.yes": "Oui",
    "common.no": "Non",
    "common.close": "Fermer",
    "common.back": "Retour",
    "common.next": "Suivant",
    "common.previous": "Précédent",
    "common.submit": "Envoyer",
    "common.confirm": "Confirmer",
    "common.select": "Sélectionner",
    "common.price": "Prix",
    "common.duration": "Durée",
    "common.minutes": "minutes",
    "common.hours": "heures",
    "common.days": "jours",
    
    // Gallery Section
    "gallery.title": "Nos Réalisations",
    "gallery.subtitle": "Découvrez les transformations de nos clients satisfaits",
    
    // Marketplace Page
    "marketplace.title": "Marketplace",
    "marketplace.subtitle": "Découvrez les meilleurs produits pour vos cheveux",
    "marketplace.products": "Produits",
    "marketplace.screens": "Écrans Tactiles",
    "marketplace.add_to_cart": "Ajouter au panier",
    "marketplace.buy_now": "Acheter maintenant",
    "marketplace.out_of_stock": "Rupture de stock",
    "marketplace.category": "Catégorie",
    "marketplace.all_products": "Tous les produits",
    "marketplace.hair_care": "Soins Capillaires",
    "marketplace.styling": "Coiffage",
    "marketplace.accessories": "Accessoires",
    "marketplace.equipment": "Équipement Pro",
    
    // TrimConnect Page
    "trimconnect.title": "TrimConnect Barber Battle",
    "trimconnect.subtitle": "Le plus grand concours de coiffure afro",
    "trimconnect.vote": "Voter",
    "trimconnect.votes": "votes",
    "trimconnect.participate": "Participer au concours",
    "trimconnect.view_entries": "Voir les participations",
    "trimconnect.winner": "Gagnant",
    "trimconnect.finalist": "Finaliste",
    "trimconnect.hall_of_fame": "Hall of Fame",
    "trimconnect.current_battle": "Battle en cours",
    "trimconnect.previous_winners": "Gagnants précédents",
    
    // AI Simulation Page
    "simulation.title": "Simulation IA",
    "simulation.subtitle": "Essayez votre nouvelle coupe virtuellement",
    "simulation.upload_photo": "Télécharger une photo",
    "simulation.select_style": "Choisir un style",
    "simulation.generate": "Générer la simulation",
    "simulation.generating": "Génération en cours...",
    "simulation.result": "Résultat",
    "simulation.try_another": "Essayer un autre style",
    "simulation.save_result": "Sauvegarder le résultat",
    "simulation.styles.fade": "Dégradé Classique",
    "simulation.styles.afro": "Afro Naturelle",
    "simulation.styles.buzz": "Buzz Cut",
    "simulation.styles.high_top": "High Top Fade",
    "simulation.styles.waves": "360 Waves",
    "simulation.styles.locks": "Starter Locks",
    
    // Booking Page
    "booking.page_title": "Réservez votre coupe",
    "booking.step1": "Choisir un salon",
    "booking.step2": "Choisir un coiffeur",
    "booking.step3": "Choisir une prestation",
    "booking.step4": "Choisir date et heure",
    "booking.step5": "Confirmation",
    "booking.no_slots": "Aucun créneau disponible",
    "booking.confirm_booking": "Confirmer la réservation",
    "booking.booking_success": "Réservation confirmée !",
    "booking.booking_error": "Erreur lors de la réservation",
    
    // My Appointments Page
    "appointments.title": "Mes Rendez-vous",
    "appointments.upcoming": "À venir",
    "appointments.past": "Passés",
    "appointments.no_appointments": "Aucun rendez-vous",
    "appointments.cancel": "Annuler le RDV",
    "appointments.reschedule": "Reporter",
    "appointments.status.confirmed": "Confirmé",
    "appointments.status.pending": "En attente",
    "appointments.status.cancelled": "Annulé",
    "appointments.status.completed": "Terminé",
    
    // Reviews
    "reviews.title": "Avis clients",
    "reviews.write_review": "Écrire un avis",
    "reviews.your_rating": "Votre note",
    "reviews.your_comment": "Votre commentaire",
    "reviews.submit_review": "Publier l'avis",
    "reviews.no_reviews": "Aucun avis pour le moment",
    
    // Urgent Booking
    "urgent.button": "Réservation urgente",
    "urgent.title": "Créneaux disponibles maintenant",
    "urgent.subtitle": "Trouvez un créneau dans les 2 prochaines heures près de vous.",
    "urgent.no_results": "Aucun créneau disponible",
    "urgent.locating": "Localisation en cours...",
    "urgent.searching": "Recherche de créneaux...",
    "urgent.salons_found": "salon(s) avec des créneaux disponibles",
    "urgent.enable_location": "Activer la localisation",
    "urgent.try_normal": "Essayez de réserver normalement pour plus d'options"
  },
  
  en: {
    // Navigation
    "nav.features": "Features",
    "nav.booking": "Book",
    "nav.marketplace": "Marketplace",
    "nav.simulation": "AI Simulation",
    "nav.trimconnect": "TrimConnect",
    "nav.appointments": "My Appointments",
    "nav.admin": "Admin",
    "nav.salon": "My Salon",
    "nav.logout": "Logout",
    "nav.login": "Login",
    
    // Landing Page
    "landing.badge": "TrimConnect Battle - Registration Open",
    "landing.hero.title1": "The Reference for",
    "landing.hero.title2": "Afro Hairstyling",
    "landing.hero.subtitle": "Book, simulate your haircut virtually, discover the best products and participate in the biggest hairstyling contest.",
    "landing.hero.cta": "Book now",
    "landing.hero.cta_admin": "Go to Admin Dashboard",
    "landing.hero.cta_salon": "Go to My Salon",
    "landing.hero.demo": "Watch demo",
    "landing.stats.salons": "Partner salons",
    "landing.stats.clients": "Satisfied clients",
    "landing.stats.styles": "Available styles",
    "landing.stats.rating": "Average rating",
    
    // Features
    "landing.features.booking.title": "Online Booking",
    "landing.features.booking.desc": "Book your haircut in a few clicks, 24/7",
    "landing.features.ai.title": "AI Simulation",
    "landing.features.ai.desc": "Try your new haircut before visiting the salon",
    "landing.features.marketplace.title": "Marketplace",
    "landing.features.marketplace.desc": "Discover the best products for your hair",
    "landing.features.contest.title": "TrimConnect",
    "landing.features.contest.desc": "Participate in the biggest afro hairstyling contest",
    
    // Search Section
    "landing.search.title": "Find a Salon",
    "landing.search.subtitle": "Search by country, city or use geolocation",
    "landing.search.country": "Country",
    "landing.search.city": "City",
    "landing.search.locate": "Locate me",
    "landing.search.button": "Search",
    "landing.search.results": "salons found",
    "landing.search.no_results": "No salon found",
    "landing.search.locating": "Locating...",
    
    // Monthly Cuts
    "landing.monthly.title": "Best Haircuts of the Month",
    "landing.monthly.subtitle": "Discover exceptional creations from our partner salons this month.",
    "landing.monthly.likes": "likes",
    
    // CTA Section
    "landing.cta.title": "Ready to transform your style?",
    "landing.cta.subtitle": "Join thousands of satisfied customers",
    "landing.cta.button": "Get started",
    
    // Footer
    "footer.inspired": "Inspired by Kadj'",
    "footer.rights": "All rights reserved",
    "footer.product": "Product",
    "footer.features": "Features",
    "footer.pricing": "Pricing",
    "footer.company": "Company",
    "footer.about": "About",
    "footer.contact": "Contact",
    "footer.legal": "Legal",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    
    // Booking
    "booking.title": "Book your haircut",
    "booking.select_salon": "Select a salon",
    "booking.select_barber": "Select a barber",
    "booking.select_haircut": "Select a haircut",
    "booking.select_date": "Select a date",
    "booking.select_time": "Select a time",
    "booking.premium": "Premium Option (+20%)",
    "booking.confirm": "Confirm booking",
    "booking.total": "Total",
    
    // Auth
    "auth.login": "Login",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.google_login": "Continue with Google",
    "auth.or": "or",
    "auth.no_account": "No account? Contact the administrator.",
    "auth.submit": "Sign in",
    
    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.search": "Search",
    "common.all": "All",
    "common.yes": "Yes",
    "common.no": "No",
    "common.close": "Close",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.submit": "Submit",
    "common.confirm": "Confirm",
    "common.select": "Select",
    "common.price": "Price",
    "common.duration": "Duration",
    "common.minutes": "minutes",
    "common.hours": "hours",
    "common.days": "days",
    
    // Gallery Section
    "gallery.title": "Our Creations",
    "gallery.subtitle": "Discover our satisfied clients' transformations",
    
    // Marketplace Page
    "marketplace.title": "Marketplace",
    "marketplace.subtitle": "Discover the best products for your hair",
    "marketplace.products": "Products",
    "marketplace.screens": "Touch Screens",
    "marketplace.add_to_cart": "Add to cart",
    "marketplace.buy_now": "Buy now",
    "marketplace.out_of_stock": "Out of stock",
    "marketplace.category": "Category",
    "marketplace.all_products": "All products",
    "marketplace.hair_care": "Hair Care",
    "marketplace.styling": "Styling",
    "marketplace.accessories": "Accessories",
    "marketplace.equipment": "Pro Equipment",
    
    // TrimConnect Page
    "trimconnect.title": "TrimConnect Barber Battle",
    "trimconnect.subtitle": "The biggest afro hairstyling contest",
    "trimconnect.vote": "Vote",
    "trimconnect.votes": "votes",
    "trimconnect.participate": "Join the contest",
    "trimconnect.view_entries": "View entries",
    "trimconnect.winner": "Winner",
    "trimconnect.finalist": "Finalist",
    "trimconnect.hall_of_fame": "Hall of Fame",
    "trimconnect.current_battle": "Current Battle",
    "trimconnect.previous_winners": "Previous Winners",
    
    // AI Simulation Page
    "simulation.title": "AI Simulation",
    "simulation.subtitle": "Try your new haircut virtually",
    "simulation.upload_photo": "Upload a photo",
    "simulation.select_style": "Select a style",
    "simulation.generate": "Generate simulation",
    "simulation.generating": "Generating...",
    "simulation.result": "Result",
    "simulation.try_another": "Try another style",
    "simulation.save_result": "Save result",
    "simulation.styles.fade": "Classic Fade",
    "simulation.styles.afro": "Natural Afro",
    "simulation.styles.buzz": "Buzz Cut",
    "simulation.styles.high_top": "High Top Fade",
    "simulation.styles.waves": "360 Waves",
    "simulation.styles.locks": "Starter Locks",
    
    // Booking Page
    "booking.page_title": "Book your haircut",
    "booking.step1": "Choose a salon",
    "booking.step2": "Choose a barber",
    "booking.step3": "Choose a service",
    "booking.step4": "Choose date and time",
    "booking.step5": "Confirmation",
    "booking.no_slots": "No slots available",
    "booking.confirm_booking": "Confirm booking",
    "booking.booking_success": "Booking confirmed!",
    "booking.booking_error": "Booking error",
    
    // My Appointments Page
    "appointments.title": "My Appointments",
    "appointments.upcoming": "Upcoming",
    "appointments.past": "Past",
    "appointments.no_appointments": "No appointments",
    "appointments.cancel": "Cancel appointment",
    "appointments.reschedule": "Reschedule",
    "appointments.status.confirmed": "Confirmed",
    "appointments.status.pending": "Pending",
    "appointments.status.cancelled": "Cancelled",
    "appointments.status.completed": "Completed",
    
    // Reviews
    "reviews.title": "Customer Reviews",
    "reviews.write_review": "Write a review",
    "reviews.your_rating": "Your rating",
    "reviews.your_comment": "Your comment",
    "reviews.submit_review": "Submit review",
    "reviews.no_reviews": "No reviews yet",
    
    // Urgent Booking
    "urgent.button": "Urgent Booking",
    "urgent.title": "Available slots now",
    "urgent.subtitle": "Find a slot in the next 2 hours near you.",
    "urgent.no_results": "No slots available",
    "urgent.locating": "Locating...",
    "urgent.searching": "Searching for slots...",
    "urgent.salons_found": "salon(s) with available slots",
    "urgent.enable_location": "Enable location",
    "urgent.try_normal": "Try normal booking for more options"
  },
  
  nl: {
    // Navigation
    "nav.features": "Functies",
    "nav.booking": "Boeken",
    "nav.marketplace": "Marktplaats",
    "nav.simulation": "AI Simulatie",
    "nav.trimconnect": "TrimConnect",
    "nav.appointments": "Mijn Afspraken",
    "nav.admin": "Admin",
    "nav.salon": "Mijn Salon",
    "nav.logout": "Uitloggen",
    "nav.login": "Inloggen",
    
    // Landing Page
    "landing.badge": "TrimConnect Battle - Inschrijvingen open",
    "landing.hero.title1": "De Referentie voor",
    "landing.hero.title2": "Afro Haarstyling",
    "landing.hero.subtitle": "Boek, simuleer je kapsel virtueel, ontdek de beste producten en neem deel aan de grootste kapselwedstrijd.",
    "landing.hero.cta": "Nu boeken",
    "landing.hero.cta_admin": "Naar Admin Dashboard",
    "landing.hero.cta_salon": "Naar Mijn Salon",
    "landing.hero.demo": "Bekijk demo",
    "landing.stats.salons": "Partnersalons",
    "landing.stats.clients": "Tevreden klanten",
    "landing.stats.styles": "Beschikbare stijlen",
    "landing.stats.rating": "Gemiddelde score",
    
    // Features
    "landing.features.booking.title": "Online Boeken",
    "landing.features.booking.desc": "Boek je kapsel in een paar klikken, 24/7",
    "landing.features.ai.title": "AI Simulatie",
    "landing.features.ai.desc": "Probeer je nieuwe kapsel voordat je naar de salon gaat",
    "landing.features.marketplace.title": "Marktplaats",
    "landing.features.marketplace.desc": "Ontdek de beste producten voor je haar",
    "landing.features.contest.title": "TrimConnect",
    "landing.features.contest.desc": "Neem deel aan de grootste afro kapselwedstrijd",
    
    // Search Section
    "landing.search.title": "Vind een Salon",
    "landing.search.subtitle": "Zoek op land, stad of gebruik geolocatie",
    "landing.search.country": "Land",
    "landing.search.city": "Stad",
    "landing.search.locate": "Lokaliseer mij",
    "landing.search.button": "Zoeken",
    "landing.search.results": "salons gevonden",
    "landing.search.no_results": "Geen salon gevonden",
    "landing.search.locating": "Lokaliseren...",
    
    // Monthly Cuts
    "landing.monthly.title": "Beste Kapsels van de Maand",
    "landing.monthly.subtitle": "Ontdek uitzonderlijke creaties van onze partnersalons deze maand.",
    "landing.monthly.likes": "likes",
    
    // CTA
    "landing.cta.title": "Klaar om je stijl te transformeren?",
    "landing.cta.subtitle": "Sluit je aan bij duizenden tevreden klanten",
    "landing.cta.button": "Begin nu",
    
    // Footer
    "footer.inspired": "Inspired by Kadj'",
    "footer.rights": "Alle rechten voorbehouden",
    "footer.product": "Product",
    "footer.features": "Functies",
    "footer.pricing": "Prijzen",
    "footer.company": "Bedrijf",
    "footer.about": "Over ons",
    "footer.contact": "Contact",
    "footer.legal": "Juridisch",
    "footer.privacy": "Privacy",
    "footer.terms": "Voorwaarden",
    
    // Booking
    "booking.title": "Boek je kapsel",
    "booking.select_salon": "Kies een salon",
    "booking.select_barber": "Kies een kapper",
    "booking.select_haircut": "Kies een kapsel",
    "booking.select_date": "Kies een datum",
    "booking.select_time": "Kies een tijd",
    "booking.premium": "Premium Optie (+20%)",
    "booking.confirm": "Bevestig boeking",
    "booking.total": "Totaal",
    "booking.page_title": "Boek je kapsel",
    "booking.step1": "Kies een salon",
    "booking.step2": "Kies een kapper",
    "booking.step3": "Kies een dienst",
    "booking.step4": "Kies datum en tijd",
    "booking.step5": "Bevestiging",
    "booking.no_slots": "Geen tijdsloten beschikbaar",
    "booking.confirm_booking": "Bevestig boeking",
    "booking.booking_success": "Boeking bevestigd!",
    "booking.booking_error": "Boekingsfout",
    
    // Auth
    "auth.login": "Inloggen",
    "auth.email": "E-mail",
    "auth.password": "Wachtwoord",
    "auth.google_login": "Doorgaan met Google",
    "auth.or": "of",
    "auth.no_account": "Geen account? Neem contact op met de beheerder.",
    "auth.submit": "Inloggen",
    
    // Common
    "common.loading": "Laden...",
    "common.save": "Opslaan",
    "common.cancel": "Annuleren",
    "common.delete": "Verwijderen",
    "common.edit": "Bewerken",
    "common.add": "Toevoegen",
    "common.search": "Zoeken",
    "common.all": "Alle",
    "common.yes": "Ja",
    "common.no": "Nee",
    "common.close": "Sluiten",
    "common.back": "Terug",
    "common.next": "Volgende",
    "common.previous": "Vorige",
    "common.submit": "Verzenden",
    "common.confirm": "Bevestigen",
    "common.select": "Selecteren",
    "common.price": "Prijs",
    "common.duration": "Duur",
    "common.minutes": "minuten",
    "common.hours": "uren",
    "common.days": "dagen",
    
    // Marketplace
    "marketplace.title": "Marktplaats",
    "marketplace.subtitle": "Ontdek de beste producten voor je haar",
    "marketplace.products": "Producten",
    "marketplace.screens": "Touchscreens",
    "marketplace.add_to_cart": "In winkelwagen",
    "marketplace.buy_now": "Nu kopen",
    "marketplace.out_of_stock": "Uitverkocht",
    
    // TrimConnect
    "trimconnect.title": "TrimConnect Barber Battle",
    "trimconnect.subtitle": "De grootste afro kapselwedstrijd",
    "trimconnect.vote": "Stemmen",
    "trimconnect.votes": "stemmen",
    "trimconnect.participate": "Deelnemen aan wedstrijd",
    
    // Simulation
    "simulation.title": "AI Simulatie",
    "simulation.subtitle": "Probeer je nieuwe kapsel virtueel",
    "simulation.upload_photo": "Upload een foto",
    "simulation.select_style": "Kies een stijl",
    "simulation.generate": "Genereer simulatie",
    "simulation.generating": "Genereren...",
    "simulation.result": "Resultaat",
    
    // Appointments
    "appointments.title": "Mijn Afspraken",
    "appointments.upcoming": "Aankomend",
    "appointments.past": "Afgelopen",
    "appointments.no_appointments": "Geen afspraken",
    "appointments.cancel": "Afspraak annuleren",
    "appointments.status.confirmed": "Bevestigd",
    "appointments.status.pending": "In afwachting",
    "appointments.status.cancelled": "Geannuleerd",
    "appointments.status.completed": "Voltooid"
  },
  
  es: {
    // Navigation
    "nav.features": "Funciones",
    "nav.booking": "Reservar",
    "nav.marketplace": "Tienda",
    "nav.simulation": "Simulación IA",
    "nav.trimconnect": "TrimConnect",
    "nav.appointments": "Mis Citas",
    "nav.admin": "Admin",
    "nav.salon": "Mi Salón",
    "nav.logout": "Cerrar sesión",
    "nav.login": "Iniciar sesión",
    
    // Landing Page
    "landing.badge": "TrimConnect Battle - Inscripciones abiertas",
    "landing.hero.title1": "La Referencia en",
    "landing.hero.title2": "Peluquería Afro",
    "landing.hero.subtitle": "Reserva, simula tu corte virtualmente, descubre los mejores productos y participa en el mayor concurso de peluquería.",
    "landing.hero.cta": "Reservar ahora",
    "landing.hero.cta_admin": "Ir al Panel Admin",
    "landing.hero.cta_salon": "Ir a Mi Salón",
    "landing.hero.demo": "Ver demo",
    "landing.stats.salons": "Salones asociados",
    "landing.stats.clients": "Clientes satisfechos",
    "landing.stats.styles": "Estilos disponibles",
    "landing.stats.rating": "Puntuación media",
    
    // Features
    "landing.features.booking.title": "Reserva Online",
    "landing.features.booking.desc": "Reserva tu corte en unos clics, 24/7",
    "landing.features.ai.title": "Simulación IA",
    "landing.features.ai.desc": "Prueba tu nuevo corte antes de ir al salón",
    "landing.features.marketplace.title": "Tienda",
    "landing.features.marketplace.desc": "Descubre los mejores productos para tu cabello",
    "landing.features.contest.title": "TrimConnect",
    "landing.features.contest.desc": "Participa en el mayor concurso de peluquería afro",
    
    // Search Section
    "landing.search.title": "Encuentra un Salón",
    "landing.search.subtitle": "Busca por país, ciudad o usa geolocalización",
    "landing.search.country": "País",
    "landing.search.city": "Ciudad",
    "landing.search.locate": "Localizarme",
    "landing.search.button": "Buscar",
    "landing.search.results": "salones encontrados",
    "landing.search.no_results": "No se encontró ningún salón",
    "landing.search.locating": "Localizando...",
    
    // Monthly Cuts
    "landing.monthly.title": "Mejores Cortes del Mes",
    "landing.monthly.subtitle": "Descubre las creaciones excepcionales de nuestros salones asociados este mes.",
    "landing.monthly.likes": "me gusta",
    
    // CTA
    "landing.cta.title": "¿Listo para transformar tu estilo?",
    "landing.cta.subtitle": "Únete a miles de clientes satisfechos",
    "landing.cta.button": "Comenzar ahora",
    
    // Footer
    "footer.inspired": "Inspired by Kadj'",
    "footer.rights": "Todos los derechos reservados",
    "footer.product": "Producto",
    "footer.features": "Funciones",
    "footer.pricing": "Precios",
    "footer.company": "Empresa",
    "footer.about": "Sobre nosotros",
    "footer.contact": "Contacto",
    "footer.legal": "Legal",
    "footer.privacy": "Privacidad",
    "footer.terms": "Términos",
    
    // Booking
    "booking.title": "Reserva tu corte",
    "booking.select_salon": "Elige un salón",
    "booking.select_barber": "Elige un peluquero",
    "booking.select_haircut": "Elige un corte",
    "booking.select_date": "Elige una fecha",
    "booking.select_time": "Elige una hora",
    "booking.premium": "Opción Premium (+20%)",
    "booking.confirm": "Confirmar reserva",
    "booking.total": "Total",
    "booking.page_title": "Reserva tu corte",
    "booking.step1": "Elegir un salón",
    "booking.step2": "Elegir un peluquero",
    "booking.step3": "Elegir un servicio",
    "booking.step4": "Elegir fecha y hora",
    "booking.step5": "Confirmación",
    "booking.no_slots": "No hay horarios disponibles",
    "booking.confirm_booking": "Confirmar reserva",
    "booking.booking_success": "¡Reserva confirmada!",
    "booking.booking_error": "Error de reserva",
    
    // Auth
    "auth.login": "Iniciar sesión",
    "auth.email": "Correo electrónico",
    "auth.password": "Contraseña",
    "auth.google_login": "Continuar con Google",
    "auth.or": "o",
    "auth.no_account": "¿Sin cuenta? Contacta al administrador.",
    "auth.submit": "Entrar",
    
    // Common
    "common.loading": "Cargando...",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.add": "Añadir",
    "common.search": "Buscar",
    "common.all": "Todos",
    "common.yes": "Sí",
    "common.no": "No",
    "common.close": "Cerrar",
    "common.back": "Volver",
    "common.next": "Siguiente",
    "common.previous": "Anterior",
    "common.submit": "Enviar",
    "common.confirm": "Confirmar",
    "common.select": "Seleccionar",
    "common.price": "Precio",
    "common.duration": "Duración",
    "common.minutes": "minutos",
    "common.hours": "horas",
    "common.days": "días",
    
    // Marketplace
    "marketplace.title": "Tienda",
    "marketplace.subtitle": "Descubre los mejores productos para tu cabello",
    "marketplace.products": "Productos",
    "marketplace.screens": "Pantallas Táctiles",
    "marketplace.add_to_cart": "Añadir al carrito",
    "marketplace.buy_now": "Comprar ahora",
    "marketplace.out_of_stock": "Agotado",
    
    // TrimConnect
    "trimconnect.title": "TrimConnect Barber Battle",
    "trimconnect.subtitle": "El mayor concurso de peluquería afro",
    "trimconnect.vote": "Votar",
    "trimconnect.votes": "votos",
    "trimconnect.participate": "Participar en el concurso",
    
    // Simulation
    "simulation.title": "Simulación IA",
    "simulation.subtitle": "Prueba tu nuevo corte virtualmente",
    "simulation.upload_photo": "Subir una foto",
    "simulation.select_style": "Elegir un estilo",
    "simulation.generate": "Generar simulación",
    "simulation.generating": "Generando...",
    "simulation.result": "Resultado",
    
    // Appointments
    "appointments.title": "Mis Citas",
    "appointments.upcoming": "Próximas",
    "appointments.past": "Pasadas",
    "appointments.no_appointments": "Sin citas",
    "appointments.cancel": "Cancelar cita",
    "appointments.status.confirmed": "Confirmada",
    "appointments.status.pending": "Pendiente",
    "appointments.status.cancelled": "Cancelada",
    "appointments.status.completed": "Completada"
  },
  
  ar: {
    // Navigation
    "nav.features": "الميزات",
    "nav.booking": "حجز",
    "nav.marketplace": "السوق",
    "nav.simulation": "محاكاة الذكاء الاصطناعي",
    "nav.trimconnect": "TrimConnect",
    "nav.appointments": "مواعيدي",
    "nav.admin": "المدير",
    "nav.salon": "صالوني",
    "nav.logout": "تسجيل الخروج",
    "nav.login": "تسجيل الدخول",
    
    // Landing Page
    "landing.badge": "TrimConnect Battle - التسجيلات مفتوحة",
    "landing.hero.title1": "المرجع في",
    "landing.hero.title2": "تصفيف الشعر الأفرو",
    "landing.hero.subtitle": "احجز، جرب قصة شعرك بالذكاء الاصطناعي، اكتشف أفضل المنتجات وشارك في أكبر مسابقة حلاقة.",
    "landing.hero.cta": "احجز الآن",
    "landing.hero.cta_admin": "الذهاب للوحة المدير",
    "landing.hero.cta_salon": "الذهاب لصالوني",
    "landing.hero.demo": "شاهد العرض",
    "landing.stats.salons": "صالونات شريكة",
    "landing.stats.clients": "عملاء راضون",
    "landing.stats.styles": "أنماط متاحة",
    "landing.stats.rating": "متوسط التقييم",
    
    // Features
    "landing.features.booking.title": "الحجز عبر الإنترنت",
    "landing.features.booking.desc": "احجز قصة شعرك بنقرات قليلة، على مدار الساعة",
    "landing.features.ai.title": "محاكاة الذكاء الاصطناعي",
    "landing.features.ai.desc": "جرب قصة شعرك الجديدة قبل زيارة الصالون",
    "landing.features.marketplace.title": "السوق",
    "landing.features.marketplace.desc": "اكتشف أفضل المنتجات لشعرك",
    "landing.features.contest.title": "TrimConnect",
    "landing.features.contest.desc": "شارك في أكبر مسابقة تصفيف شعر أفرو",
    
    // Search Section
    "landing.search.title": "ابحث عن صالون",
    "landing.search.subtitle": "ابحث حسب البلد أو المدينة أو استخدم تحديد الموقع",
    "landing.search.country": "البلد",
    "landing.search.city": "المدينة",
    "landing.search.locate": "حدد موقعي",
    "landing.search.button": "بحث",
    "landing.search.results": "صالونات وجدت",
    "landing.search.no_results": "لم يتم العثور على صالون",
    "landing.search.locating": "جاري تحديد الموقع...",
    
    // Monthly Cuts
    "landing.monthly.title": "أفضل قصات الشهر",
    "landing.monthly.subtitle": "اكتشف إبداعات استثنائية من صالوناتنا الشريكة هذا الشهر.",
    "landing.monthly.likes": "إعجاب",
    
    // CTA
    "landing.cta.title": "مستعد لتغيير أسلوبك؟",
    "landing.cta.subtitle": "انضم إلى آلاف العملاء الراضين",
    "landing.cta.button": "ابدأ الآن",
    
    // Footer
    "footer.inspired": "Inspired by Kadj'",
    "footer.rights": "جميع الحقوق محفوظة",
    "footer.product": "المنتج",
    "footer.features": "الميزات",
    "footer.pricing": "الأسعار",
    "footer.company": "الشركة",
    "footer.about": "من نحن",
    "footer.contact": "اتصل بنا",
    "footer.legal": "قانوني",
    "footer.privacy": "الخصوصية",
    "footer.terms": "الشروط",
    
    // Booking
    "booking.title": "احجز قصة شعرك",
    "booking.select_salon": "اختر صالون",
    "booking.select_barber": "اختر حلاق",
    "booking.select_haircut": "اختر قصة شعر",
    "booking.select_date": "اختر تاريخ",
    "booking.select_time": "اختر وقت",
    "booking.premium": "خيار مميز (+20%)",
    "booking.confirm": "تأكيد الحجز",
    "booking.total": "المجموع",
    "booking.page_title": "احجز قصة شعرك",
    "booking.step1": "اختر صالون",
    "booking.step2": "اختر حلاق",
    "booking.step3": "اختر خدمة",
    "booking.step4": "اختر التاريخ والوقت",
    "booking.step5": "التأكيد",
    "booking.no_slots": "لا توجد مواعيد متاحة",
    "booking.confirm_booking": "تأكيد الحجز",
    "booking.booking_success": "تم تأكيد الحجز!",
    "booking.booking_error": "خطأ في الحجز",
    
    // Auth
    "auth.login": "تسجيل الدخول",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.google_login": "المتابعة مع Google",
    "auth.or": "أو",
    "auth.no_account": "ليس لديك حساب؟ تواصل مع المدير.",
    "auth.submit": "دخول",
    
    // Common
    "common.loading": "جاري التحميل...",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.add": "إضافة",
    "common.search": "بحث",
    "common.all": "الكل",
    "common.yes": "نعم",
    "common.no": "لا",
    "common.close": "إغلاق",
    "common.back": "رجوع",
    "common.next": "التالي",
    "common.previous": "السابق",
    "common.submit": "إرسال",
    "common.confirm": "تأكيد",
    "common.select": "اختيار",
    "common.price": "السعر",
    "common.duration": "المدة",
    "common.minutes": "دقائق",
    "common.hours": "ساعات",
    "common.days": "أيام",
    
    // Marketplace
    "marketplace.title": "السوق",
    "marketplace.subtitle": "اكتشف أفضل المنتجات لشعرك",
    "marketplace.products": "المنتجات",
    "marketplace.screens": "الشاشات اللمسية",
    "marketplace.add_to_cart": "أضف للسلة",
    "marketplace.buy_now": "اشتر الآن",
    "marketplace.out_of_stock": "نفذ من المخزون",
    
    // TrimConnect
    "trimconnect.title": "TrimConnect Barber Battle",
    "trimconnect.subtitle": "أكبر مسابقة تصفيف شعر أفرو",
    "trimconnect.vote": "صوت",
    "trimconnect.votes": "أصوات",
    "trimconnect.participate": "شارك في المسابقة",
    
    // Simulation
    "simulation.title": "محاكاة الذكاء الاصطناعي",
    "simulation.subtitle": "جرب قصة شعرك الجديدة افتراضياً",
    "simulation.upload_photo": "ارفع صورة",
    "simulation.select_style": "اختر نمط",
    "simulation.generate": "توليد المحاكاة",
    "simulation.generating": "جاري التوليد...",
    "simulation.result": "النتيجة",
    
    // Appointments
    "appointments.title": "مواعيدي",
    "appointments.upcoming": "القادمة",
    "appointments.past": "السابقة",
    "appointments.no_appointments": "لا توجد مواعيد",
    "appointments.cancel": "إلغاء الموعد",
    "appointments.status.confirmed": "مؤكد",
    "appointments.status.pending": "قيد الانتظار",
    "appointments.status.cancelled": "ملغى",
    "appointments.status.completed": "مكتمل"
  },
  
  de: {
    // Navigation
    "nav.features": "Funktionen",
    "nav.booking": "Buchen",
    "nav.marketplace": "Marktplatz",
    "nav.simulation": "KI-Simulation",
    "nav.trimconnect": "TrimConnect",
    "nav.appointments": "Meine Termine",
    "nav.admin": "Admin",
    "nav.salon": "Mein Salon",
    "nav.logout": "Abmelden",
    "nav.login": "Anmelden",
    
    // Landing Page
    "landing.badge": "TrimConnect Battle - Anmeldungen offen",
    "landing.hero.title1": "Die Referenz für",
    "landing.hero.title2": "Afro Frisuren",
    "landing.hero.subtitle": "Buchen Sie, simulieren Sie Ihren Haarschnitt virtuell, entdecken Sie die besten Produkte und nehmen Sie am größten Friseurwettbewerb teil.",
    "landing.hero.cta": "Jetzt buchen",
    "landing.hero.cta_admin": "Zum Admin Dashboard",
    "landing.hero.cta_salon": "Zu Meinem Salon",
    "landing.hero.demo": "Demo ansehen",
    "landing.stats.salons": "Partnersalons",
    "landing.stats.clients": "Zufriedene Kunden",
    "landing.stats.styles": "Verfügbare Stile",
    "landing.stats.rating": "Durchschnittsbewertung",
    
    // Features
    "landing.features.booking.title": "Online-Buchung",
    "landing.features.booking.desc": "Buchen Sie Ihren Haarschnitt mit wenigen Klicks, 24/7",
    "landing.features.ai.title": "KI-Simulation",
    "landing.features.ai.desc": "Probieren Sie Ihren neuen Haarschnitt vor dem Salonbesuch",
    "landing.features.marketplace.title": "Marktplatz",
    "landing.features.marketplace.desc": "Entdecken Sie die besten Produkte für Ihr Haar",
    "landing.features.contest.title": "TrimConnect",
    "landing.features.contest.desc": "Nehmen Sie am größten Afro-Friseurwettbewerb teil",
    
    // Search Section
    "landing.search.title": "Finden Sie einen Salon",
    "landing.search.subtitle": "Suchen Sie nach Land, Stadt oder verwenden Sie Geolokalisierung",
    "landing.search.country": "Land",
    "landing.search.city": "Stadt",
    "landing.search.locate": "Mich lokalisieren",
    "landing.search.button": "Suchen",
    "landing.search.results": "Salons gefunden",
    "landing.search.no_results": "Kein Salon gefunden",
    "landing.search.locating": "Lokalisieren...",
    
    // Monthly Cuts
    "landing.monthly.title": "Beste Haarschnitte des Monats",
    "landing.monthly.subtitle": "Entdecken Sie außergewöhnliche Kreationen unserer Partnersalons diesen Monat.",
    "landing.monthly.likes": "Gefällt mir",
    
    // CTA
    "landing.cta.title": "Bereit, Ihren Stil zu verändern?",
    "landing.cta.subtitle": "Schließen Sie sich Tausenden zufriedener Kunden an",
    "landing.cta.button": "Jetzt starten",
    
    // Footer
    "footer.inspired": "Inspired by Kadj'",
    "footer.rights": "Alle Rechte vorbehalten",
    "footer.product": "Produkt",
    "footer.features": "Funktionen",
    "footer.pricing": "Preise",
    "footer.company": "Unternehmen",
    "footer.about": "Über uns",
    "footer.contact": "Kontakt",
    "footer.legal": "Rechtliches",
    "footer.privacy": "Datenschutz",
    "footer.terms": "AGB",
    
    // Booking
    "booking.title": "Buchen Sie Ihren Haarschnitt",
    "booking.select_salon": "Salon wählen",
    "booking.select_barber": "Friseur wählen",
    "booking.select_haircut": "Haarschnitt wählen",
    "booking.select_date": "Datum wählen",
    "booking.select_time": "Zeit wählen",
    "booking.premium": "Premium-Option (+20%)",
    "booking.confirm": "Buchung bestätigen",
    "booking.total": "Gesamt",
    "booking.page_title": "Buchen Sie Ihren Haarschnitt",
    "booking.step1": "Salon wählen",
    "booking.step2": "Friseur wählen",
    "booking.step3": "Dienstleistung wählen",
    "booking.step4": "Datum und Zeit wählen",
    "booking.step5": "Bestätigung",
    "booking.no_slots": "Keine Termine verfügbar",
    "booking.confirm_booking": "Buchung bestätigen",
    "booking.booking_success": "Buchung bestätigt!",
    "booking.booking_error": "Buchungsfehler",
    
    // Auth
    "auth.login": "Anmelden",
    "auth.email": "E-Mail",
    "auth.password": "Passwort",
    "auth.google_login": "Mit Google fortfahren",
    "auth.or": "oder",
    "auth.no_account": "Kein Konto? Kontaktieren Sie den Administrator.",
    "auth.submit": "Einloggen",
    
    // Common
    "common.loading": "Laden...",
    "common.save": "Speichern",
    "common.cancel": "Abbrechen",
    "common.delete": "Löschen",
    "common.edit": "Bearbeiten",
    "common.add": "Hinzufügen",
    "common.search": "Suchen",
    "common.all": "Alle",
    "common.yes": "Ja",
    "common.no": "Nein",
    "common.close": "Schließen",
    "common.back": "Zurück",
    "common.next": "Weiter",
    "common.previous": "Zurück",
    "common.submit": "Absenden",
    "common.confirm": "Bestätigen",
    "common.select": "Auswählen",
    "common.price": "Preis",
    "common.duration": "Dauer",
    "common.minutes": "Minuten",
    "common.hours": "Stunden",
    "common.days": "Tage",
    
    // Marketplace
    "marketplace.title": "Marktplatz",
    "marketplace.subtitle": "Entdecken Sie die besten Produkte für Ihr Haar",
    "marketplace.products": "Produkte",
    "marketplace.screens": "Touchscreens",
    "marketplace.add_to_cart": "In den Warenkorb",
    "marketplace.buy_now": "Jetzt kaufen",
    "marketplace.out_of_stock": "Ausverkauft",
    
    // TrimConnect
    "trimconnect.title": "TrimConnect Barber Battle",
    "trimconnect.subtitle": "Der größte Afro-Friseurwettbewerb",
    "trimconnect.vote": "Abstimmen",
    "trimconnect.votes": "Stimmen",
    "trimconnect.participate": "Am Wettbewerb teilnehmen",
    
    // Simulation
    "simulation.title": "KI-Simulation",
    "simulation.subtitle": "Probieren Sie Ihren neuen Haarschnitt virtuell",
    "simulation.upload_photo": "Foto hochladen",
    "simulation.select_style": "Stil wählen",
    "simulation.generate": "Simulation generieren",
    "simulation.generating": "Generieren...",
    "simulation.result": "Ergebnis",
    
    // Appointments
    "appointments.title": "Meine Termine",
    "appointments.upcoming": "Bevorstehend",
    "appointments.past": "Vergangen",
    "appointments.no_appointments": "Keine Termine",
    "appointments.cancel": "Termin stornieren",
    "appointments.status.confirmed": "Bestätigt",
    "appointments.status.pending": "Ausstehend",
    "appointments.status.cancelled": "Storniert",
    "appointments.status.completed": "Abgeschlossen"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("afrocrown_language");
    return saved || "fr";
  });

  useEffect(() => {
    localStorage.setItem("afrocrown_language", language);
    // Set document direction for Arabic
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations["fr"]?.[key] || key;
  };

  const availableLanguages = [
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "nl", name: "Nederlands", flag: "🇳🇱" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" }
  ];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Language Selector Component - Modern dropdown
export const LanguageSelector = ({ className = "" }) => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const currentLang = availableLanguages.find(l => l.code === language);
  
  return (
    <div className={`relative group ${className}`}>
      <button 
        className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm transition-colors"
        data-testid="language-selector"
      >
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="hidden sm:inline">{currentLang?.name}</span>
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[160px]">
        {availableLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
              lang.code === language ? 'bg-indigo-600/20 text-indigo-400' : 'text-white'
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default translations;
