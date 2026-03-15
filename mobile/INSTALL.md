# AfroCrown Mobile - Guide d'Installation

## Configuration pour votre projet Expo (kazapp-mobile)

### 1. Cloner ou créer le projet
```bash
# Si nouveau projet
npx create-expo-app kazapp-mobile
cd kazapp-mobile
```

### 2. Installer les dépendances
```bash
npm install expo-router expo-camera expo-image-picker expo-notifications expo-device expo-linear-gradient expo-web-browser @react-native-async-storage/async-storage axios @expo/vector-icons expo-secure-store expo-constants expo-linking expo-status-bar react-native-gesture-handler react-native-safe-area-context react-native-screens react-native-svg
```

### 3. Configurer app.json
```json
{
  "expo": {
    "name": "AfroCrown",
    "slug": "kazapp-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0F172A"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.afrocrown.mobile",
      "infoPlist": {
        "NSCameraUsageDescription": "AfroCrown utilise la caméra pour la simulation de coupe",
        "NSPhotoLibraryUsageDescription": "AfroCrown accède à vos photos pour la simulation"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0F172A"
      },
      "package": "com.afrocrown.mobile",
      "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE"]
    },
    "scheme": "afrocrown",
    "plugins": [
      "expo-router",
      ["expo-camera", { "cameraPermission": "Accès caméra pour simulation IA" }],
      ["expo-image-picker", { "photosPermission": "Accès photos pour simulation" }]
    ],
    "extra": {
      "apiUrl": "https://salon-dashboard-48.preview.emergentagent.com/api"
    }
  }
}
```

### 4. Structure des fichiers
```
app/
├── _layout.js          # Layout principal + Auth Context
├── index.js            # Écran de bienvenue
├── login.js            # Écran de connexion
└── (tabs)/
    ├── _layout.js      # Navigation par onglets
    ├── home.js         # Accueil avec liste des salons
    ├── booking.js      # Réservation en 5 étapes
    ├── simulation.js   # Simulation IA avec caméra
    ├── marketplace.js  # Boutique produits
    └── profile.js      # Profil utilisateur
```

### 5. API Backend
L'API est déjà configurée à:
- URL: https://salon-dashboard-48.preview.emergentagent.com/api

### 6. Lancer l'application
```bash
npx expo start
```

Puis scannez le QR code avec l'app Expo Go sur votre téléphone.

---

## Fonctionnalités de la Simulation IA

1. **Prendre un selfie** - Caméra frontale pour capturer votre visage
2. **Charger une photo** - Sélectionner depuis la galerie
3. **Choisir un style** - 6 styles disponibles (Dégradé, Dreadlocks, Tresses, Afro, Waves, Buzz)
4. **Générer** - L'IA crée une simulation de votre nouvelle coupe

L'API de simulation:
- POST /api/ai/simulate-haircut
- Body: { haircut_style: "fade", image_base64: "..." (optionnel) }
