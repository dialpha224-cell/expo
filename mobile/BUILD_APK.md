# AfroCrown - Build APK Android v1.1.0

## Nouveautés de cette version
- ✅ Mode hors-ligne amélioré (cache local)
- ✅ Synchronisation automatique au retour en ligne
- ✅ File d'attente virtuelle
- ✅ Système d'abonnements
- ✅ Gestion des consentements RGPD

## Prérequis
- Node.js 18+ installé
- Compte Expo gratuit: https://expo.dev/signup

---

## Instructions Windows (PowerShell)

### Étape 1: Cloner le projet
```powershell
# Si vous avez déjà le projet, passez à l'étape 2
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
cd VOTRE_REPO/mobile
```

### Étape 2: Installer les dépendances
```powershell
cd mobile
npm install
```

### Étape 3: Installer EAS CLI
```powershell
npm install -g eas-cli@latest
```

### Étape 4: Se connecter à Expo
```powershell
eas login
```
Entrez vos identifiants Expo (email/mot de passe)

### Étape 5: Configurer le projet (première fois)
```powershell
eas build:configure
```
Répondez "Yes" aux questions

### Étape 6: Lancer le build APK
```powershell
eas build --platform android --profile preview
```

---

## Résultat attendu
Après 15-20 minutes, vous recevrez un message comme:
```
✔ Build finished
🤖 Android build: https://expo.dev/artifacts/eas/XXXXX.apk
```

Cliquez sur le lien pour télécharger l'APK.

---

## Installation sur Android
1. Téléchargez l'APK sur votre téléphone
2. Ouvrez le fichier APK
3. Autorisez "Sources inconnues" si demandé
4. Installez et lancez AfroCrown!

---

## Résolution des problèmes

### Erreur "npm not found"
Installez Node.js: https://nodejs.org/

### Erreur "eas: command not found"
```powershell
npm install -g eas-cli@latest
```

### Erreur "Not logged in"
```powershell
eas logout
eas login
```

### Erreur de dépendances
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
```

### Erreur "expo-cli deprecated"
Utilisez EAS CLI (pas expo-cli):
```powershell
npm uninstall -g expo-cli
npm install -g eas-cli@latest
```

---

## Commandes utiles
```powershell
eas whoami          # Voir le compte connecté
eas build:list      # Voir les builds en cours
eas build:cancel    # Annuler un build
npx expo doctor     # Diagnostiquer les problèmes
```

---

## Configuration actuelle
- **API Backend**: https://salon-dashboard-48.preview.emergentagent.com/api
- **Package**: com.afrocrown.mobile
- **Version**: 1.1.0
- **Version Code**: 3

## Mode Hors-ligne
L'application fonctionne en mode hors-ligne avec:
- Cache des salons, rendez-vous et profil
- File d'attente des actions (réservations, annulations)
- Synchronisation automatique au retour en ligne
- Indicateur visuel du statut de connexion

## Support
- Documentation Expo: https://docs.expo.dev/
- Forum Expo: https://forums.expo.dev/
