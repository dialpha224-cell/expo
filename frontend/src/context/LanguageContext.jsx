import { createContext, useContext, useState, useEffect } from "react";

// Translations database
const translations = {
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.booking": "Reserver",
    "nav.marketplace": "Marketplace",
    "nav.simulation": "Simulation IA",
    "nav.trimconnect": "TrimConnect",
    "nav.appointments": "Mes RDV",
    "nav.admin": "Admin",
    "nav.salon": "Mon Salon",
    "nav.logout": "Deconnexion",
    "nav.login": "Connexion",
    
    // Landing Page
    "landing.hero.title": "La Coiffure Afro Reimaginee",
    "landing.hero.subtitle": "Reservez, simulez et connectez avec les meilleurs salons de coiffure afro",
    "landing.hero.cta": "Commencer",
    "landing.features.booking": "Reservation facile",
    "landing.features.ai": "Simulation IA",
    "landing.features.marketplace": "Marketplace",
    "landing.features.contest": "Concours TrimConnect",
    "landing.search.title": "Trouvez un Salon",
    "landing.search.country": "Pays",
    "landing.search.city": "Ville",
    "landing.search.locate": "Me localiser",
    "landing.search.button": "Rechercher",
    "landing.monthly.title": "Les Plus Belles Coupes",
    "landing.monthly.subtitle": "Decouvrez les realisations exceptionnelles de nos salons partenaires",
    
    // Booking
    "booking.title": "Reservez votre coupe",
    "booking.select_salon": "Choisir un salon",
    "booking.select_barber": "Choisir un coiffeur",
    "booking.select_haircut": "Choisir une coupe",
    "booking.select_date": "Choisir une date",
    "booking.select_time": "Choisir un horaire",
    "booking.premium": "Option Premium (+20%)",
    "booking.confirm": "Confirmer la reservation",
    "booking.total": "Total",
    
    // Salon Dashboard
    "salon.dashboard": "Tableau de bord",
    "salon.barbers": "Coiffeurs",
    "salon.appointments": "Rendez-vous",
    "salon.haircuts": "Coupes & Tarifs",
    "salon.monthly_cuts": "Coupes du Mois",
    "salon.loyalty": "Programme Fidelite",
    "salon.promotions": "Promotions",
    "salon.premium_services": "Services Premium",
    "salon.products": "Produits",
    "salon.stats": "Statistiques",
    "salon.settings": "Parametres",
    
    // Common
    "common.loading": "Chargement...",
    "common.save": "Sauvegarder",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.add": "Ajouter",
    "common.search": "Rechercher",
    "common.filter": "Filtrer",
    "common.all": "Tous",
    "common.none": "Aucun",
    "common.yes": "Oui",
    "common.no": "Non",
    "common.price": "Prix",
    "common.date": "Date",
    "common.time": "Heure",
    "common.status": "Statut",
    "common.actions": "Actions",
    
    // Auth
    "auth.login": "Connexion",
    "auth.register": "Inscription",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.name": "Nom complet",
    "auth.phone": "Telephone",
    "auth.google_login": "Continuer avec Google",
    "auth.forgot_password": "Mot de passe oublie?",
    
    // Loyalty
    "loyalty.card": "Carte Fidelite",
    "loyalty.stamps": "Tampons",
    "loyalty.reward": "Recompense",
    "loyalty.scan": "Scanner",
    "loyalty.qr_code": "QR Code",
    
    // TrimConnect
    "trimconnect.title": "TrimConnect",
    "trimconnect.vote": "Voter",
    "trimconnect.votes": "votes",
    "trimconnect.participate": "Participer",
    "trimconnect.gallery": "Galerie",
    "trimconnect.leaderboard": "Classement"
  },
  
  en: {
    // Navigation
    "nav.home": "Home",
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
    "landing.hero.title": "Afro Hairstyling Reimagined",
    "landing.hero.subtitle": "Book, simulate and connect with the best afro hair salons",
    "landing.hero.cta": "Get Started",
    "landing.features.booking": "Easy Booking",
    "landing.features.ai": "AI Simulation",
    "landing.features.marketplace": "Marketplace",
    "landing.features.contest": "TrimConnect Contest",
    "landing.search.title": "Find a Salon",
    "landing.search.country": "Country",
    "landing.search.city": "City",
    "landing.search.locate": "Locate me",
    "landing.search.button": "Search",
    "landing.monthly.title": "Best Haircuts",
    "landing.monthly.subtitle": "Discover exceptional creations from our partner salons",
    
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
    
    // Salon Dashboard
    "salon.dashboard": "Dashboard",
    "salon.barbers": "Barbers",
    "salon.appointments": "Appointments",
    "salon.haircuts": "Haircuts & Prices",
    "salon.monthly_cuts": "Monthly Cuts",
    "salon.loyalty": "Loyalty Program",
    "salon.promotions": "Promotions",
    "salon.premium_services": "Premium Services",
    "salon.products": "Products",
    "salon.stats": "Statistics",
    "salon.settings": "Settings",
    
    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.all": "All",
    "common.none": "None",
    "common.yes": "Yes",
    "common.no": "No",
    "common.price": "Price",
    "common.date": "Date",
    "common.time": "Time",
    "common.status": "Status",
    "common.actions": "Actions",
    
    // Auth
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.name": "Full name",
    "auth.phone": "Phone",
    "auth.google_login": "Continue with Google",
    "auth.forgot_password": "Forgot password?",
    
    // Loyalty
    "loyalty.card": "Loyalty Card",
    "loyalty.stamps": "Stamps",
    "loyalty.reward": "Reward",
    "loyalty.scan": "Scan",
    "loyalty.qr_code": "QR Code",
    
    // TrimConnect
    "trimconnect.title": "TrimConnect",
    "trimconnect.vote": "Vote",
    "trimconnect.votes": "votes",
    "trimconnect.participate": "Participate",
    "trimconnect.gallery": "Gallery",
    "trimconnect.leaderboard": "Leaderboard"
  },
  
  nl: {
    // Navigation
    "nav.home": "Home",
    "nav.booking": "Boeken",
    "nav.marketplace": "Marktplaats",
    "nav.simulation": "AI Simulatie",
    "nav.trimconnect": "TrimConnect",
    "nav.appointments": "Mijn Afspraken",
    "nav.admin": "Admin",
    "nav.salon": "Mijn Salon",
    "nav.logout": "Uitloggen",
    "nav.login": "Inloggen",
    
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
    "common.no": "Nee"
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
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations["fr"]?.[key] || key;
  };

  const availableLanguages = [
    { code: "fr", name: "Francais", flag: "🇫🇷" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "nl", name: "Nederlands", flag: "🇧🇪" }
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

// Language Selector Component
export const LanguageSelector = ({ className = "" }) => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  
  return (
    <div className={`relative ${className}`}>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm cursor-pointer appearance-none pr-8"
        data-testid="language-selector"
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default translations;
