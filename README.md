# 🏥 OSTIE - Guide de Configuration et Dépannage

## 📋 Table des Matières
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Erreurs Courantes](#erreurs-courantes)
4. [Dépannage](#dépannage)

---

## 🚀 Installation

### Prérequis
- Un navigateur moderne (Chrome, Firefox, Edge, Safari)
- Connexion Internet active
- Accès à Google (pour Google Apps Script)
- Les fichiers du projet:
  - `index.html`
  - `script.js`
  - `style.css`
  - `config.js`
  - `code.gs` (Google Apps Script)
  - `logo.png` (image)

### Étapes d'Installation

#### 1️⃣ Téléchargez les fichiers
Assurez-vous que tous les fichiers sont dans le même répertoire:
```
ostie/
├── index.html
├── script.js
├── style.css
├── config.js
├── code.gs
└── logo.png
```

#### 2️⃣ Déployez le Google Apps Script
1. Ouvrez [https://script.google.com](https://script.google.com)
2. Créez un nouveau projet ou ouvrez le vôtre
3. Collez le contenu du fichier `code.gs`
4. Enregistrez le projet (Ctrl+S ou Cmd+S)
5. Cliquez sur **Déployer** → **Nouveau déploiement**
6. Sélectionnez **Application Web**
7. Configuration du déploiement:
   - **Exécuter en tant que**: Votre compte Google
   - **Donner accès à**: Tout le monde
8. Cliquez sur **Déployer**
9. **IMPORTANT**: Copiez l'URL du déploiement (exemple: `https://script.google.com/macros/s/AKfycby.../exec`)

#### 3️⃣ Configurez l'URL API
1. Ouvrez le fichier `config.js`
2. Remplacez la valeur `API_URL` par l'URL copiée:
```javascript
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/VOTRE_URL_ICI/exec",
  // ... autres configurations
};
```
3. Enregistrez le fichier

#### 4️⃣ Ouvrez l'application
1. Ouvrez le fichier `index.html` dans votre navigateur
2. Vous devriez voir la page de connexion

---

## ⚙️ Configuration

### Fichier `config.js`

#### 1. API_URL (OBLIGATOIRE)
```javascript
API_URL: "https://script.google.com/macros/s/AKfycby.../exec"
```
- Remplacez par l'URL de votre Google Apps Script
- Cette URL doit être accessible depuis votre PC

#### 2. API_TIMEOUT
```javascript
API_TIMEOUT: 15000  // 15 secondes
```
- Augmentez si vous avez une connexion lente
- Valeur minimale: 5000 ms (5 secondes)

#### 3. DEBUG_MODE
```javascript
DEBUG_MODE: true  // Affiche les logs détaillés
```
- Utile pour diagnostiquer les problèmes
- À mettre sur `false` en production

#### 4. LOCALE et TIMEZONE
```javascript
LOCALE: 'fr-FR',
TIMEZONE: 'Africa/Blantyre'  // Madagascar
```
- Adaptez selon votre région

### Identifiants de Connexion

Deux comptes sont disponibles par défaut:

| Identifiant | Mot de passe | Accès | Permissions |
|------------|-----------|-------|-----------|
| admin | ostie | Toutes les fonctions | Lecture/Écriture |
| admin | production | Dashboards uniquement | Lecture seule |

(À configurer dans `code.gs` - section `LOGIN_CONFIG`)

---

## ⚠️ Erreurs Courantes

### ❌ "Impossible de se connecter au serveur"

**Causes possibles:**
1. L'URL API n'est pas configurée correctement
2. Le Google Apps Script n'est pas déployé
3. Connexion Internet interrompue

**Solutions:**
- Vérifiez la configuration dans `config.js`
- Testez l'URL API directement dans le navigateur
- Vérifiez votre connexion Internet
- Videz le cache du navigateur (Ctrl+Shift+Del)

### ❌ "Erreur réseau"

**Causes possibles:**
1. Pas d'accès à Internet
2. Firewall ou proxy bloquant l'accès

**Solutions:**
- Vérifiez votre connexion Internet
- Vérifiez les paramètres du firewall/proxy
- Essayez depuis un autre réseau (mobile/wifi)

### ❌ "Erreur serveur: 404"

**Cause:** L'URL API est incorrecte ou le déploiement n'existe plus

**Solution:**
- Redéployez le Google Apps Script
- Copiez la nouvelle URL en `config.js`

### ❌ "Logo non trouvé"

**Cause:** Le fichier `logo.png` manque

**Solutions:**
- Assurez-vous que `logo.png` est dans le même répertoire
- Ou créez un fichier de logo avec une autre image

### ❌ "Identifiants incorrects"

**Cause:** Nom d'utilisateur ou mot de passe incorrect

**Solution:**
- Les identifiants par défaut sont:
  - Utilisateur: `admin`
  - Mot de passe: `ostie` ou `production`

---

## 🔧 Dépannage

### Vérifiez la Configuration

1. **Ouvrez la Console du Navigateur** (F12 ou Ctrl+Shift+I)
2. Allez à l'onglet **Console**
3. Cherchez les messages d'erreur

### Messages de Diagnostic

```javascript
// Si vous devez vérifier l'API_URL:
console.log(API_URL);

// Pour activer le mode debug:
// Modifiez dans config.js: DEBUG_MODE: true
```

### Test de Connexion API

1. Ouvrez un nouvel onglet
2. Collez l'URL API dans la barre d'adresse:
```
https://script.google.com/macros/s/VOTRE_URL/exec?action=getCollaborateurs
```
3. Vous devriez voir une réponse JSON

### Nettoyer le Cache Local

Si l'application se comporte bizarrement:
1. Appuyez sur **F12** pour ouvrir la Console
2. Allez dans **Stockage** → **Stockage Local**
3. Supprimez tous les éléments
4. Actualisez la page (F5)

### Vérifier les Autorisations

Si vous avez une erreur d'autorisation:
1. Allez sur [https://script.google.com](https://script.google.com)
2. Ouvrez votre projet
3. Vérifiez que le déploiement est en tant que **"Tout le monde"**
4. Si nécessaire, redéployez

---

## 🛠️ Optimisations Effectuées

### ✅ Amélioration de la Gestion des Erreurs
- Messages d'erreur détaillés et utiles
- Timeout configurable pour les requêtes
- Gestion des erreurs réseau

### ✅ Configuration Centralisée
- Fichier `config.js` dédié
- Configuration facilement modifiable
- Pas besoin d'éditer le code JavaScript

### ✅ Compatibilité Cross-Platform
- Chemins relatifs et absolus gérés correctement
- Support des différents navigateurs
- Gestion des fuseaux horaires

### ✅ Debug et Logging
- Mode debug activable
- Logs détaillés pour diagnostiquer les problèmes
- Console du navigateur utilisée efficacement

---

## 📞 Support

Si l'application ne fonctionne toujours pas:

1. **Vérifiez les prérequis** (voir Installation)
2. **Consultez le dépannage** (voir section Dépannage)
3. **Activez le mode debug** dans `config.js`
4. **Vérifiez les logs** dans la Console du navigateur (F12)
5. **Testez l'API** directement en collagant l'URL dans le navigateur

---

## 📝 Changelog des Optimisations

### Version Optimisée
- ✅ Meilleure gestion des erreurs réseau
- ✅ Configuration externalisée (config.js)
- ✅ Timeouts configurables
- ✅ Messages d'erreur plus détaillés
- ✅ Support du mode debug
- ✅ Validation de la configuration au chargement
- ✅ Métadonnées HTML complètes (viewport, charset, etc.)

---

## 📄 Licence et Crédits

Application créée pour la gestion des consultations médicales.
Support des consultations et suivi des retours.

---

**Dernière mise à jour:** Mars 2026
**Version:** 2.0 (Optimisée)
