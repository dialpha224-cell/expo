# 📱 AfroCrown Mobile - Guide de Déploiement Android

## Option 1 : Test rapide avec Expo Go (5 minutes)

### Sur votre téléphone Android :
1. Ouvrez le **Play Store**
2. Recherchez et installez **"Expo Go"**

### Sur votre ordinateur :
1. Téléchargez le code depuis GitHub (Save to Github)
2. Ouvrez un terminal dans le dossier `mobile/`
3. Exécutez :
   ```bash
   npm install
   npx expo start
   ```
4. Scannez le QR code affiché avec l'app Expo Go

---

## Option 2 : Build APK installable (15-20 minutes)

### Prérequis :
- Node.js installé
- Compte Expo gratuit : https://expo.dev/signup

### Étapes :
```bash
# 1. Installer EAS CLI
npm install -g eas-cli

# 2. Se connecter à Expo
eas login

# 3. Aller dans le dossier mobile
cd mobile

# 4. Configurer le projet
eas build:configure

# 5. Générer l'APK (preview = pour test)
eas build --platform android --profile preview
```

### Après le build :
- EAS vous donnera un lien pour télécharger l'APK
- Téléchargez-le sur votre téléphone
- Autorisez l'installation d'apps inconnues
- Installez l'APK

---

## ⚙️ Configuration

L'app est configurée pour se connecter à :
```
API: https://salon-dashboard-48.preview.emergentagent.com/api
```

Pour changer l'URL de l'API, modifiez `app.json` :
```json
"extra": {
  "apiUrl": "VOTRE_URL_API"
}
```

---

## 📦 Contenu de l'app

- **Home** : Liste des réservations
- **Réservation** : Flux complet en 5 étapes
- **Simulation IA** : Tester des coupes avec la caméra
- **Marketplace** : Produits capillaires
- **TrimConnect** : Concours de coiffure
- **Profil** : Gestion du compte et notifications push

---

## 🔔 Notifications Push

Les notifications push fonctionnent automatiquement :
1. L'app demande la permission au premier lancement
2. Le token est envoyé au serveur
3. Vous recevez des notifications pour vos RDV

---

## 🐛 Problèmes courants

### "Network Error" :
- Vérifiez que votre téléphone a accès à Internet
- L'API doit être accessible publiquement

### "Camera not working" :
- Accordez les permissions caméra dans les paramètres Android

### "Build failed" :
- Vérifiez que vous êtes connecté à Expo (`eas whoami`)
- Assurez-vous d'avoir un compte Expo valide

---

## 📞 Support

Pour toute question, consultez la documentation Expo :
https://docs.expo.dev/
