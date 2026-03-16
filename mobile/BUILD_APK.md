# AfroCrown - Guide de Build APK Android

## Methode Rapide (EAS Cloud Build)

### Prerequis
- Compte Expo gratuit: https://expo.dev/signup
- Node.js 18+ installe

### Etapes

```bash
# 1. Cloner le projet depuis GitHub
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO/mobile

# 2. Installer les dependances
npm install

# 3. Installer EAS CLI
npm install -g eas-cli@latest

# 4. Se connecter a Expo
eas login

# 5. Configurer le projet (premiere fois uniquement)
eas build:configure

# 6. Lancer le build APK
eas build --platform android --profile preview
```

### Resultat
Apres 15-20 minutes, vous recevrez un lien pour telecharger l'APK:
```
Build finished
Android build: https://expo.dev/artifacts/eas/xxxxx.apk
```

---

## Resolution des Problemes

### Erreur "npm ci failed"
```bash
rm -rf node_modules package-lock.json
npm install
eas build --platform android --profile preview --clear-cache
```

### Erreur "Not logged in"
```bash
eas logout
eas login
eas whoami
```

### Erreur de dependances
```bash
npx expo install --fix
npm install
```

---

## Installation sur Android
1. Telechargez l'APK sur votre telephone
2. Ouvrez le fichier APK
3. Autorisez l'installation depuis sources inconnues si demande
4. Installez et lancez AfroCrown!

---

## Commandes Utiles
```bash
eas whoami          # Voir le compte connecte
eas build:list      # Voir les builds en cours
eas build:cancel    # Annuler un build
```

## Support
- Documentation: https://docs.expo.dev/build/introduction/
- Forum: https://forums.expo.dev/
