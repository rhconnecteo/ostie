# 📚 STRUCTURE ET GUIDE DES FICHIERS OSTIE

## 📂 Vue d'Ensemble du Projet

```
ostie/
│
├── 📄 Fichiers Principaux (Application Web)
│   ├── index.html          ← Page principale
│   ├── script.js           ← JavaScript (logique)
│   ├── style.css           ← Feuille de style
│   └── logo.png            ← Logo (optionnel)
│
├── ⚙️ Configuration & Scripts Backend
│   ├── config.js           ← 🔴 Configuration à modifier
│   ├── code.gs             ← Google Apps Script (backend)
│   └── demo-mode.js        ← Mode démo (optionnel)
│
├── 🚀 Scripts de Lancement
│   ├── launch-ostie.bat    ← Lanceur Windows
│   └── .htaccess           ← Config Apache (optionnel)
│
├── 📖 Documentation
│   ├── ⭐ QUICK_START.md       ← 👈 Commence ici (5 min)
│   ├── README.md           ← Guide complet & dépannage
│   ├── INSTALLATION.md     ← Guide détaillé d'installation
│   ├── OPTIMISATIONS.md    ← Résumé des optimisations
│   ├── DIAGNOSTIC.js       ← Outil de diagnostic
│   └── FILES.md            ← Ce fichier
│
└── 🔧 Autres
    ├── .git/               ← Historique Git (optionnel)
    └── node_modules/       ← Non nécessaire (optionnel)
```

---

## 📄 FICHIERS PRINCIPAUX

### 1️⃣ **index.html** (Page Web Principale)
**Rôle:** Structure HTML de l'interface  
**À modifier:** Rarement, sauf si changement d'interface
**Contient:**
- Formulaire de connexion
- Section formulaire
- Section dashboard
- Section rapports
- Références aux CSS et JS

### 2️⃣ **script.js** (Logique JavaScript)
**Rôle:** Logique métier de l'application
**À modifier:** Si vous modifiez le code JavaScript
**Contient:**
- Gestion du login
- Appels API
- Gestion des données
- Graphiques et statistiques

### 3️⃣ **style.css** (Design & Mise en Page)
**Rôle:** Styling CSS
**À modifier:** Si vous modifiez les couleurs ou le design
**Contient:**
- Couleurs et typographie
- Mise en page responsive
- Animations et transitions

### 4️⃣ **logo.png** (Image du Logo)
**Rôle:** Logo affiche dans la navbar
**À modifier:** Remplacer par votre propre logo
**Taille recommandée:** 40x40 pixels ou plus
**Note:** Si absent, un logo SVG par défaut s'affiche

---

## ⚙️ CONFIGURATION & BACKEND

### 🔴 **config.js** (IMPORTANT - À CONFIGURER)
**Rôle:** Configuration centralisée de l'app  
**À modifier:** OBLIGATOIRE (au moins l'URL API)
**Contient:**
- URL Google Apps Script (OBLIGATOIRE)
- Timeouts et performances
- Mode debug
- Paramètres de locale
- Configuration cache

**À faire:**
```javascript
// Remplacez cette ligne:
API_URL: "https://script.google.com/macros/s/VOTRE_URL_ICI/exec"
```

### **code.gs** (Google Apps Script Backend)
**Rôle:** Code serveur (Google Apps Script)
**À modifier:** Pour changer backend ou identifiants
**Contient:**
- Logique serveur
- Appels Google Sheets
- Authentification
- Validation des données

**À faire:**
- Collez ce code dans Script.google.com
- Remplacez SHEET_ID par votre Google Sheet
- Changez les identifiants dans LOGIN_CONFIG

### **demo-mode.js** (Mode Démo / Optionnel)
**Rôle:** Permettre les tests sans API disponible  
**À modifier:** Rarement, c'est un mock
**Contient:**
- Données fictives
- Mock des appels API
- Simulation de délais réseau

**À faire:**
- Inclure avant script.js pour activer
- Activer DEMO_MODE: true dans config.js

---

## 🚀 SCRIPTS DE LANCEMENT

### **launch-ostie.bat** (Lanceur Windows)
**Rôle:** Ouvrir automatiquement l'app dans le navigateur
**À modifier:** Rarement
**À faire:**
- Double-cliquez dessus
- Sélectionnez votre navigateur

### **.htaccess** (Configuration Apache)
**Rôle:** Configuration si hébergé sur serveur Apache  
**À modifier:** Si vous hébergez sur Apache
**À faire:**
- Placer dans le répertoire racine
- Apache doit avoir mod_rewrite activé

---

## 📖 DOCUMENTATION

### ⭐ **QUICK_START.md** (5 MINUTES)
**Pour qui:** Quelqu'un qui veut juste commencer vite  
**Contient:** Les 5 étapes minimales
**À faire:** Lisez ça en premier si vous êtes pressé

### **README.md** (GUIDE COMPLET)
**Pour qui:** Tous les utilisateurs
**Contient:**
- Vue d'ensemble
- Guide de configuration
- Erreurs courantes et solutions
- Dépannage avancé

### **INSTALLATION.md** (GUIDE DÉTAILLÉ)
**Pour qui:** Installation complète étape par étape
**Contient:**
- Pré-requis
- Installation pas à pas
- Configuration Google Apps Script
- Dépannage détaillé

### **OPTIMISATIONS.md** (CHANGEMENTS EFFECTUÉS)
**Pour qui:** Comprendre ce qui a été modifié
**Contient:**
- Résumé des optimisations
- Avant/après
- Fichiers modifiés vs créés

### **DIAGNOSTIC.js** (OUTIL DE DIAGNOSTIC)
**Pour qui:** Diagnostiquer les problèmes techniques
**À faire:**
1. Ouvrez Console (F12)
2. Copiez-collez ce code
3. Appuyez sur Entrée

### **FILES.md** (Ce Fichier)
**Pour qui:** Comprendre la structure du projet
**Contient:** Guide de tous les fichiers

---

## 📊 MATRICE DE MODIFICATION

| Fichier | Modifier? | Fréquence | Raison |
|---------|-----------|-----------|--------|
| config.js | ✅ OUI | Une fois | URL API + settings |
| code.gs | ✅ Selon besoins | Rarement | Backend custom |
| index.html | ⚠️ Rarement | Jamais | Interface fixe |
| script.js | ⚠️ Rarement | Jamais | Logique fixe |
| style.css | ⚠️ Rarement | Jamais | Design fixe |
| logo.png | ✅ OUI | Optionnel | Logo customisé |
| demo-mode.js | ❌ NON | - | À inclure seulement |
| launch-ostie.bat | ❌ NON | - | Lanceur automatique |
| .htaccess | ⚠️ Rarement | Si Apache | Config serveur |

---

## 🔄 FLUX D'UTILISATION DES FICHIERS

```
1. Utilisateur ouvre index.html
   ↓
2. index.html charge style.css (style)
   ↓
3. index.html charge config.js (configuration)
   ↓
4. index.html charge script.js (logique)
   ↓
5. script.js lit config.js pour obtenir API_URL
   ↓
6. script.js appelle Google Apps Script (code.gs)
   ↓
7. code.gs accède au Google Sheet pour les données
   ↓
8. Données retournées à script.js
   ↓
9. script.js affiche les données dans index.html
```

---

## 🎯 POINTS D'ENTRÉE

### Pour... | Allez à...
|---|---|
| Démarrer rapidement | QUICK_START.md (5 min) |
| Configurer l'app | config.js |
| Comprendre l'app | README.md |
| Installer complètement | INSTALLATION.md |
| Diagnostiquer problèmes | DIAGNOSTIC.js (Console F12) |
| Comprendre les changements | OPTIMISATIONS.md |
| Activez le debug | config.js - DEBUG_MODE: true |
| Testez sans API | config.js - DEMO_MODE: true |
| Lancez sur Windows | launch-ostie.bat |
| Lancez sur Mac/Linux | Ouvrez index.html dans le navigateur |

---

## 💾 FICHIERS À SAUVEGARDER

**IMPORTANT:** Sauvegardez ces fichiers régulièrement:

1. **config.js** - Votre configuration personnalisée
2. **code.gs** - Votre code backend customisé
3. **Google Sheet** - Vos données (export CSV régulier)

**Comment exporter:**
```
1. Allez sur votre Google Sheet
2. Fichier → Télécharger → CSV
3. Stockez le fichier en sécurité
```

---

## 🔧 FICHIERS PAR TECHNOLOGIE

### HTML
- index.html

### CSS
- style.css

### JavaScript (Client)
- script.js
- config.js
- demo-mode.js
- DIAGNOSTIC.js

### JavaScript (Serveur)
- code.gs

### Autres
- launch-ostie.bat (Batch/cmd)
- .htaccess (Apache config)

---

## 📱 DÉPENDANCES EXTERNES

| Dépendance | Utilisation | Source |
|------------|-------------|--------|
| Chart.js | Graphiques | CDN jsdelivr |
| Google Apps Script | Backend | Google Cloud |
| Google Sheets | Base de données | Google Cloud |

---

## 🚀 DÉPLOIEMENT

### Test Local
```bash
# Méthode 1: Fichier direct
Double-cliquez index.html

# Méthode 2: Serveur Python
python -m http.server 8000
# Allez sur http://localhost:8000
```

### Production
```bash
# Télécharger tous les fichiers sur un serveur
# Assurez-vous que config.js pointe vers le bon Google Apps Script
```

---

## ❓ FAQ Fichiers

**Q: Dois-je modifier tous les fichiers?**  
A: Non, seule config.js DOIT être modifiée pour l'URL API.

**Q: Puis-je supprimer demo-mode.js?**  
A: Oui, si vous n'avez pas besoin du mode démo.

**Q: Puis-je renommer les fichiers?**  
A: Non, les noms doivent rester les mêmes (références internes).

**Q: Où vont les données?**  
A: Dans le Google Sheet (pas dans les fichiers locaux).

**Q: Comment regarder/éditer code.gs?**  
A: Allez sur script.google.com et ouvrez le projet.

---

## 📞 Support

- **Erreur de démarrage?** → Lisez QUICK_START.md
- **Erreur de configuration?** → Consultez README.md
- **Erreur technique?** → Exécutez DIAGNOSTIC.js dans Console
- **Erreur installation?** → Lisez INSTALLATION.md

---

**Dernière mise à jour:** Mars 2026  
**Version:** 2.0 (Optimisée)
