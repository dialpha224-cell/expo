# AfroCrown - Guide Complet pour Générer l'APK Android

## Prérequis
- Node.js 18+ installé sur votre machine
- Compte Expo gratuit : https://expo.dev/signup
- Git installé

---

## Méthode 1: Build Cloud avec EAS (Recommandée)

### Étape 1: Cloner le projet
```bash
# Via GitHub (après avoir cliqué "Save to GitHub" dans Emergent)
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO/mobile
```

### Étape 2: Nettoyer et installer les dépendances
```bash
# Supprimer les anciens fichiers de cache
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# Installer avec npm
npm install
```

### Étape 3: Installer EAS CLI
```bash
npm install -g eas-cli@latest
```

### Étape 4: Connexion à Expo
```bash
eas login
# Entrez votre email et mot de passe Expo
```

### Étape 5: Configurer le projet
```bash
eas build:configure
# Répondez "Yes" pour créer un nouveau projet
# Choisissez "Android" comme plateforme
```

### Étape 6: Lancer le build
```bash
# Pour un APK de test (installation directe)
eas build --platform android --profile preview

# OU pour un AAB (Google Play Store)
eas build --platform android --profile production
```

### Étape 7: Télécharger l'APK
Une fois le build terminé (15-20 min), vous recevrez un lien:
```
✔ Build finished
🤖 Android build: https://expo.dev/artifacts/eas/xxxxx.apk
```

---

## Méthode 2: Build Local (Avancé)

### Prérequis supplémentaires
- Android Studio installé
- Java JDK 17+
- Variables d'environnement ANDROID_HOME configurées

### Commandes
```bash
# Installer les dépendances natives
npx expo prebuild --platform android

# Build APK debug
cd android
./gradlew assembleDebug

# L'APK sera dans: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Installation sur Android

1. **Téléchargez l'APK** sur votre téléphone
2. **Ouvrez le fichier** APK téléchargé
3. Si demandé, **autorisez l'installation** depuis des sources inconnues
4. **Installez** et lancez AfroCrown !

---

## Résolution des Problèmes

### "npm ci failed" lors du build EAS
```bash
rm -rf node_modules package-lock.json
npm install
eas build --platform android --profile preview --clear-cache
```

### "Error: Cannot determine SDK version"
```bash
npx expo install --check
npm install
```

### "Not logged in" ou erreur d'authentification
```bash
eas logout
eas login
eas whoami  # Vérifier que vous êtes connecté
```

### L'app affiche "Welcome to Expo"
Vérifiez que le fichier `app/index.js` existe et contient le bon code.
Le point d'entrée est défini dans `index.js` à la racine du projet mobile.

### Erreur de dépendances React Native
```bash
npx expo install --fix
npm install
```

---

## Configuration EAS (eas.json)

Le fichier `eas.json` contient 3 profils:

| Profil | Usage | Format |
|--------|-------|--------|
| `development` | Test avec Expo Go | - |
| `preview` | APK de test | .apk |
| `production` | Google Play Store | .aab |

---

## Commandes Utiles

```bash
# Voir le compte connecté
eas whoami

# Voir les builds en cours
eas build:list

# Annuler un build
eas build:cancel

# Voir les infos du projet
eas project:info

# Mettre à jour l'app sans rebuild
eas update --branch preview
```

---

## Pour iOS (App Store)

Prérequis:
- Mac requis pour la compilation finale
- Compte Apple Developer ($99/an): https://developer.apple.com

```bash
eas build --platform ios --profile production
```

---

## Support

- Documentation Expo Build: https://docs.expo.dev/build/introduction/
- Forum Expo: https://forums.expo.dev/
- Discord Expo: https://chat.expo.dev/
