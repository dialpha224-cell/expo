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
    "reviews.no_reviews": "Aucun avis pour le moment"
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
    "landing.hero.subtitle": "Book, simulate your haircut with AI, discover the best products and participate in the biggest hairstyling contest.",
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
    "reviews.no_reviews": "No reviews yet"
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
    "landing.hero.subtitle": "Boek, simuleer je kapsel met AI, ontdek de beste producten en neem deel aan de grootste kapselwedstrijd.",
    "landing.hero.cta": "Nu boeken",
    "landing.hero.cta_admin": "Naar Admin Dashboard",
    "landing.hero.cta_salon": "Naar Mijn Salon",
    "landing.hero.demo": "Bekijk demo",
    "landing.stats.salons": "Partnersalons",
    "landing.stats.clients": "Tevreden klanten",
    "landing.stats.styles": "Beschikbare stijlen",
    "landing.stats.rating": "Gemiddelde score",
    
    // Search Section
    "landing.search.title": "Vind een Salon",
    "landing.search.subtitle": "Zoek op land, stad of gebruik geolocatie",
    "landing.search.country": "Land",
    "landing.search.city": "Stad",
    "landing.search.locate": "Lokaliseer mij",
    "landing.search.button": "Zoeken",
    "landing.search.results": "salons gevonden",
    "landing.search.no_results": "Geen salon gevonden",
    
    // Footer
    "footer.inspired": "Inspired by Kadj'",
    "footer.rights": "Alle rechten voorbehouden",
    
    // Common
    "common.loading": "Laden...",
    "common.save": "Opslaan",
    "common.cancel": "Annuleren",
    "common.close": "Sluiten"
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
    "landing.hero.subtitle": "Reserva, simula tu corte con IA, descubre los mejores productos y participa en el mayor concurso de peluquería.",
    "landing.hero.cta": "Reservar ahora",
    "landing.hero.cta_admin": "Ir al Panel Admin",
    "landing.hero.cta_salon": "Ir a Mi Salón",
    "landing.hero.demo": "Ver demo",
    "landing.stats.salons": "Salones asociados",
    "landing.stats.clients": "Clientes satisfechos",
    "landing.stats.styles": "Estilos disponibles",
    "landing.stats.rating": "Puntuación media",
    
    // Search Section
    "landing.search.title": "Encuentra un Salón",
    "landing.search.subtitle": "Busca por país, ciudad o usa geolocalización",
    "landing.search.country": "País",
    "landing.search.city": "Ciudad",
    "landing.search.locate": "Localizarme",
    "landing.search.button": "Buscar",
    "landing.search.results": "salones encontrados",
    "landing.search.no_results": "No se encontró ningún salón",
    
    // Footer
    "footer.inspired": "Inspired by Kadj'",
    "footer.rights": "Todos los derechos reservados",
    
    // Common
    "common.loading": "Cargando...",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.close": "Cerrar"
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
    
    // Search Section
    "landing.search.title": "ابحث عن صالون",
    "landing.search.subtitle": "ابحث حسب البلد أو المدينة أو استخدم تحديد الموقع",
    "landing.search.country": "البلد",
    "landing.search.city": "المدينة",
    "landing.search.locate": "حدد موقعي",
    "landing.search.button": "بحث",
    "landing.search.results": "صالونات وجدت",
    "landing.search.no_results": "لم يتم العثور على صالون",
    
    // Footer
    "footer.inspired": "Inspired by Kadj'",
    "footer.rights": "جميع الحقوق محفوظة",
    
    // Common
    "common.loading": "جاري التحميل...",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.close": "إغلاق"
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
    "landing.hero.subtitle": "Buchen Sie, simulieren Sie Ihren Haarschnitt mit KI, entdecken Sie die besten Produkte und nehmen Sie am größten Friseurwettbewerb teil.",
    "landing.hero.cta": "Jetzt buchen",
    "landing.hero.cta_admin": "Zum Admin Dashboard",
    "landing.hero.cta_salon": "Zu Meinem Salon",
    "landing.hero.demo": "Demo ansehen",
    "landing.stats.salons": "Partnersalons",
    "landing.stats.clients": "Zufriedene Kunden",
    "landing.stats.styles": "Verfügbare Stile",
    "landing.stats.rating": "Durchschnittsbewertung",
    
    // Search Section
    "landing.search.title": "Finden Sie einen Salon",
    "landing.search.subtitle": "Suchen Sie nach Land, Stadt oder verwenden Sie Geolokalisierung",
    "landing.search.country": "Land",
    "landing.search.city": "Stadt",
    "landing.search.locate": "Mich lokalisieren",
    "landing.search.button": "Suchen",
    "landing.search.results": "Salons gefunden",
    "landing.search.no_results": "Kein Salon gefunden",
    
    // Footer
    "footer.inspired": "Inspired by Kadj'",
    "footer.rights": "Alle Rechte vorbehalten",
    
    // Common
    "common.loading": "Laden...",
    "common.save": "Speichern",
    "common.cancel": "Abbrechen",
    "common.close": "Schließen"
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
