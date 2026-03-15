# 📱 AfroCrown - Générer l'APK Android

## Prérequis
- Node.js 18+ installé
- Compte Expo gratuit : https://expo.dev/signup

---

## 🚀 Étapes pour générer l'APK

### 1. Téléchargez le code
Cliquez sur **"Save to GitHub"** dans Emergent, puis :
```bash
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO/mobile
```

### 2. Installez les dépendances
```bash
npm install
```

### 3. Installez EAS CLI
```bash
npm install -g eas-cli
```

### 4. Connectez-vous à Expo
```bash
eas login
```
Entrez votre email et mot de passe Expo.

### 5. Configurez le projet (première fois uniquement)
```bash
eas build:configure
```
- Choisissez **Android** quand demandé
- Acceptez les paramètres par défaut

### 6. Générez l'APK
```bash
eas build --platform android --profile preview
```

⏱️ **Temps estimé : 15-20 minutes**

### 7. Téléchargez l'APK
Une fois le build terminé, vous recevrez un **lien de téléchargement** :
```
✔ Build finished
🤖 Android build: https://expo.dev/artifacts/eas/xxxxx.apk
```

Cliquez sur le lien pour télécharger l'APK sur votre téléphone.

---

## 📲 Installer l'APK sur Android

1. Téléchargez l'APK sur votre téléphone
2. Ouvrez le fichier téléchargé
3. Si demandé, autorisez l'installation d'applications inconnues
4. Installez et lancez AfroCrown !

---

## 🍎 Pour iOS (App Store)

Pour publier sur l'App Store, vous avez besoin :
- Un compte Apple Developer ($99/an) : https://developer.apple.com
- Un Mac pour finaliser le build

```bash
eas build --platform ios --profile production
```

---

## 🔧 Commandes utiles

| Commande | Description |
|----------|-------------|
| `eas build --platform android --profile preview` | APK de test |
| `eas build --platform android --profile production` | AAB pour Play Store |
| `eas build --platform ios --profile preview` | Build iOS simulateur |
| `eas build --platform ios --profile production` | Build iOS App Store |
| `eas submit --platform android` | Publier sur Play Store |
| `eas submit --platform ios` | Publier sur App Store |

---

## ❓ Problèmes courants

### "Not logged in"
```bash
eas login
```

### "Project not configured"
```bash
eas build:configure
```

### "Build failed - Gradle error"
Vérifiez que `eas.json` existe dans le dossier mobile.

---

## 📞 Support Expo
https://docs.expo.dev/build/introduction/
