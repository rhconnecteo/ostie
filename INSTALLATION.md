# 📋 INSTALLATION DÉTAILLÉE D'OSTIE

## 🎯 Objectif
Configurer l'application OSTIE de gestion des consultations médicales sur votre PC.

---

## ✅ Checklist Pré-Installation

- [ ] Navigateur moderne installé (Chrome, Firefox, Edge)
- [ ] Connexion Internet stable
- [ ] Compte Google (pour Google Apps Script)
- [ ] Accès aux fichiers du projet
- [ ] Editeur de texte (Notepad, VS Code, etc.)

---

## 🔧 Étape 1: Préparation de l'Environnement

### 1.1 Télécharger le Projet
```
ostie/
├── index.html          (Page principale)
├── script.js           (JavaScript principal)
├── style.css           (Styles de l'application)
├── config.js           (Configuration - À MODIFIER)
├── code.gs             (Google Apps Script)
├── demo-mode.js        (Mode démo optionnel)
├── logo.png            (Logo - optionnel)
├── .htaccess           (Config Apache - optionnel)
├── launch-ostie.bat    (Lanceur Windows - optionnel)
├── README.md           (Documentation)
└── INSTALLATION.md     (Ce fichier)
```

### 1.2 Placer les Fichiers
- Créez un dossier `ostie` quelque part (ex: `C:\Users\VotreNom\Desktop\ostie`)
- Mettez tous les fichiers dans ce dossier
- Assurez-vous que tous les fichiers sont au même niveau (pas de sous-dossiers)

### 1.3 Vérifier les Fichiers
```cmd
cd C:\Users\VotreNom\Desktop\ostie
dir
```
Vous devriez voir tous les fichiers listés ci-dessus.

---

## 📝 Étape 2: Configurer Google Apps Script

### 2.1 Créer un Projet Google Apps Script

1. Allez sur https://script.google.com
2. Cliquez sur **"Nouveau projet"** ou **"+ Nouveau"**
3. Donnez un nom au projet (ex: "OSTIE-API")
4. Cliquez sur **"Créer"**

### 2.2 Ajouter le Code Backend

1. Supprimez le code par défaut
2. Copiez-collez tout le contenu du fichier `code.gs`
3. Appuyez sur **Ctrl+S** pour enregistrer

### 2.3 Configurer le Google Sheet

1. Allez dans **Paramètres du projet** (⚙️)
2. Notez l'**ID du projet**
3. Créez un Google Sheet avec les tables nécessaires:
   - **Collaborateurs**: matricule, nom, fonction, rattachement
   - **Consultations**: tous les champs de consultation

4. Copier l'ID du Sheet dans `code.gs`:
```javascript
const SHEET_ID = "VOTRE_ID_ICI";
```

### 2.4 Déployer le Script

1. Cliquez sur **"Déployer"** en haut à droite
2. Sélectionnez **"Nouveau déploiement"**
3. Cliquez sur **⚙️** et sélectionnez **"Application Web"**
4. Dans les paramètres:
   - **Exécuter en tant que**: Votre compte Google
   - **Donner accès à**: Tout le monde
5. Cliquez sur **"Déployer"**
6. Accepted the authorization prompt
7. **COPIER L'URL** qui s'affiche (format: `https://script.google.com/macros/s/AKfycby.../exec`)

### 2.5 Notes sur les Autorisations

- Vous devez autoriser l'accès à votre Google Drive
- Le script peut modifier vos Google Sheets
- Cela est nécessaire pour sauvegarder les données

---

## ⚙️ Étape 3: Configurer l'Application

### 3.1 Éditer le Fichier config.js

1. Ouvrez le fichier `config.js` avec un éditeur de texte
2. Remplacez la valeur de `API_URL`:

```javascript
const CONFIG = {
  // Remplacez par l'URL copiée à l'étape 2.4
  API_URL: "https://script.google.com/macros/s/VOTRE_URL_EXACTE_ICI/exec",
  
  // Autres configurations (optionnelles)
  DEBUG_MODE: false,  // Changez à true pour déboguer
  DEMO_MODE: false,   // Changez à true pour tester sans API
  // ...
};
```

3. **Sauvegardez** le fichier (Ctrl+S)

### 3.2 Configuration Optionnelle

#### Mode Debug
Pour voir les logs détaillés:
```javascript
DEBUG_MODE: true
```

#### Mode Démo
Pour tester sans API (données fictives):
1. Incluez `demo-mode.js` avant `script.js` dans `index.html`
2. Changez dans `config.js`: `DEMO_MODE: true`

#### Fuseau Horaire
Pour Madagascar (par défaut):
```javascript
TIMEZONE: 'Africa/Blantyre'
```

Pour autre région:
```javascript
TIMEZONE: 'Europe/Paris'  // Exemple pour la France
```

---

## 🚀 Étape 4: Lancer l'Application

### Méthode 1: Fichier HTML Direct (Plus Simple)

**Windows:**
1. Naviguez dans le dossier `ostie`
2. Cliquez sur `launch-ostie.bat`
3. Sélectionnez votre navigateur préféré

**Mac/Linux:**
```bash
cd /chemin/vers/ostie
python -m http.server 8000
# Puis allez sur http://localhost:8000
```

### Méthode 2: Navigateur Manuel

1. Ouvrez votre navigateur
2. Allez sur **File → Open** (ou Ctrl+O)
3. Sélectionnez `ostie/index.html`
4. La page devrait s'ouvrir

### Méthode 3: Serveur Local (Python)

```bash
cd C:\Users\VotreNom\Desktop\ostie
python -m http.server 8000
```

Puis allez sur: `http://localhost:8000`

### Méthode 4: Serveur Local (Node.js)

```bash
npm install http-server -g
cd C:\Users\VotreNom\Desktop\ostie
http-server
```

---

## 🔐 Étape 5: Se Connecter

### Identifiants par Défaut

| Rôle | Identifiant | Mot de passe | Accès |
|------|-----------|-----------|-------|
| **Admin** | admin | ostie | Toutes les fonctions |
| **Viewer** | admin | production | Dashboards uniquement |

### Changer les Identifiants

1. Allez dans Google Apps Script
2. Ouvrez `code.gs`
3. Trouvez la section `LOGIN_CONFIG`:

```javascript
const LOGIN_CONFIG = {
  "ostie": {
    username: "admin",
    password: "ostie",  // ← Changez le mot de passe
    type: "OSTIE_ADMIN",
    permissions: "all"
  }
};
```

4. Enregistrez et redéployez

---

## 🧪 Étape 6: Test de Fonctionnement

### 6.1 Test Basique

1. Ouvrez l'application
2. Vous devriez voir la page **LOGIN**
3. Entrez les identifiants (admin / ostie)
4. Cliquez sur **"Se connecter"**

### 6.2 Si Erreur "Impossible de se connecter au serveur"

1. Ouvrez la **Console du Navigateur** (F12)
2. Allez dans l'onglet **Console**
3. Vérifiez les messages d'erreur
4. Assurez-vous que:
   - L'URL API est correcte (voir config.js)
   - Le Google Apps Script est déployé
   - Vous avez une connexion Internet

### 6.3 Si Erreur "Identifiants Incorrects"

- Vérifiez les identifiants dans `code.gs`
- Les identifiants par défaut sont: admin / ostie
- Ou admin / production

---

## 🛠️ Dépannage Avancé

### Problème: "Logo non trouvé"

**Solution 1**: Ajouter un fichier logo.png
- Mettez une image `logo.png` (40x40 pixels minimum)
- Dans le même dossier que `index.html`

**Solution 2**: Logo par défaut (déjà implémenté)
- Si `logo.png` n'existe pas, un logo OSTIE par défaut s'affiche

### Problème: "Erreur de CORS"

Si vous voyez une erreur CORS:

1. Vérifiez que le Google Apps Script est déployé correctement
2. Assurez-vous que "Donner accès à" est sur **"Tout le monde"**
3. Essayez un redéploiement

### Problème: "localStorage désactivé"

Si vous voyez une erreur localStorage:

1. Vérifiez les paramètres de confidentialité du navigateur
2. Assurez-vous que le site n'est pas en mode "Incognito"
3. Essayez un autre navigateur

### Problème: "60 secondes dépassées"

Si l'API prend plus de 60 secondes:

1. Augmentez le timeout dans `config.js`:
```javascript
API_TIMEOUT: 30000  // 30 secondes
```

2. Vérifiez la performance de votre Google Sheet (si très grande)

---

## 📊 Utilisation Basique

### Ajouter une Consultation

1. Allez dans l'onglet **"📋 Formulaire"**
2. Cherchez un collaborateur
3. Remplissez le formulaire
4. Cliquez sur **"✓ Enregistrer"**

### Voir le Tableau de Bord

1. Allez dans l'onglet **"🔄 Suivi de retour"**
2. Consultez les statistiques
3. Voyez les personnes en attente

### Générer un Rapport

1. Allez dans l'onglet **"📅 Rapport"**
2. Sélectionnez les dates/filtres
3. Cliquez sur **"🔍 Filtrer"**
4. Consultez les statistiques

---

## 🔒 Sécurité

### Recommandations

1. **Ne pas partager** les identifiants par défaut
2. **Changer les mots de passe** dans `code.gs`
3. **Utiliser HTTPS** si possible
4. **Limiter l'accès** au Google Apps Script
5. **Sauvegarder** régulièrement votre Google Sheet

### Sauvegarder les Données

```bash
# Télécharger le Google Sheet en CSV
1. Allez sur Google Sheets
2. Fichier → Télécharger → CSV
3. Stockez le fichier sécurisé
```

---

## 📞 Support et Debugging

### Activer le Mode Debug

Dans `config.js`:
```javascript
DEBUG_MODE: true
```

Puis ouvrez la Console (F12) pour voir les logs détaillés.

### Vérifier la Connexion API

1. Ouvrez la Console (F12)
2. Exécutez:
```javascript
console.log(API_URL);
```

3. Testez l'URL directement dans le navigateur

### Logs Utiles

```javascript
[OSTIE DEBUG] Configuration validée
[OSTIE DEBUG] Tentative de login...
[OSTIE DEBUG] Requête API envoyée...
```

---

## 🎉 C'est Prêt!

Félicitations! Votre application OSTIE est configurée et prête à être utilisée.

### Prochaines Étapes

1. ✅ Invitez d'autres utilisateurs
2. ✅ Peuplez la base de collaborateurs
3. ✅ Commencez à enregistrer des consultations
4. ✅ Générez les rapports

---

## 📝 Notes Importantes

- Les modifications dans `code.gs` nécessitent un **redéploiement**
- Les modifications dans `config.js` sont **immédiatement** effectuées
- Les données sont stockées dans le **Google Sheet**
- L'application est **compatible** avec tous les navigateurs modernes

---

**Version:** 2.0 (Optimisée)  
**Dernière mise à jour:** Mars 2026  
**Support:** Voir README.md
