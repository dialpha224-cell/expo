# AfroCrown - Generer l'APK Android

## Prerequis
- Node.js 18+ installe
- Compte Expo gratuit : https://expo.dev/signup

---

## Etapes pour generer l'APK

### 1. Telechargez le code
Cliquez sur **"Save to GitHub"** dans Emergent, puis :
```bash
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO/mobile
```

### 2. Supprimez les fichiers de cache (important!)
```bash
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
```

### 3. Installez les dependances avec npm
```bash
npm install
```

### 4. Installez EAS CLI globalement
```bash
npm install -g eas-cli@latest
```

### 5. Connectez-vous a Expo
```bash
eas login
```
Entrez votre email et mot de passe Expo.

### 6. Configurez le projet EAS
```bash
eas build:configure
```
- Quand demande si vous voulez creer un nouveau projet: **Oui**
- Choisissez **Android** comme plateforme

Cette commande va automatiquement:
- Creer un projet dans votre compte Expo
- Mettre a jour `app.json` avec le bon `projectId`
- Configurer les permissions necessaires

### 7. Generez l'APK
```bash
eas build --platform android --profile preview
```

**Temps estime : 15-20 minutes**

### 8. Telechargez l'APK
Une fois le build termine, vous recevrez un lien :
```
Build finished
Android build: https://expo.dev/artifacts/eas/xxxxx.apk
```

Cliquez sur le lien pour telecharger l'APK.

---

## Installer l'APK sur Android

1. Telechargez l'APK sur votre telephone (ou envoyez-le par email)
2. Ouvrez le fichier telecharge
3. Autorisez l'installation d'applications de sources inconnues si demande
4. Installez et lancez AfroCrown !

---

## Problemes courants

### "Error: Cannot determine which native SDK version your project uses"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### "npm ci failed" lors du build
**Solution:**
Assurez-vous d'utiliser `npm install` et non `npm ci` localement.
Le fichier `package-lock.json` sera regenere correctement.

### "Not logged in"
```bash
eas logout
eas login
```

### "Project not configured" ou "Missing projectId"
```bash
eas build:configure
```
Cela va creer automatiquement un projet et configurer le projectId.

### L'app affiche "Welcome to Expo" au lieu d'AfroCrown
Verifiez que vous etes dans le bon dossier `/mobile` et que le build utilise bien le code source.

---

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `eas build --platform android --profile preview` | APK de test |
| `eas build --platform android --profile production` | AAB pour Play Store |
| `eas whoami` | Voir le compte connecte |
| `eas project:info` | Info sur le projet |

---

## Pour iOS (App Store)

Prerequis:
- Compte Apple Developer ($99/an): https://developer.apple.com
- Mac pour finaliser

```bash
eas build --platform ios --profile production
```

---

## Support
- Documentation Expo: https://docs.expo.dev/build/introduction/
- Forum Expo: https://forums.expo.dev/
