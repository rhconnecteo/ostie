# ⚡ DÉMARRAGE RAPIDE OSTIE (5 MINUTES)

## 🎯 Résumé Ultra-Rapide

```
1. Ouvrez config.js
2. Remplacez l'URL API
3. Double-cliquez sur launch-ostie.bat
4. Connectez-vous avec: admin / ostie
5. C'est prêt! 🎉
```

---

## 📝 Étape 1: Configurer l'URL API (2 min)

### A. Obtenir l'URL Google Apps Script

1. Allez sur https://script.google.com
2. Créez/ouvrez un projet
3. Collez le contenu du fichier `code.gs`
4. Cliquez sur **"Déployer"** → **"Nouveau déploiement"**
5. Sélectionnez **"Application Web"** → **"Déployer"**
6. **COPIER** l'URL (format: `https://script.google.com/macros/s/AKfycby.../exec`)

### B. Mettre à jour config.js

1. Ouvrez `config.js` avec un éditeur de texte
2. Trouvez la ligne:
```javascript
API_URL: "https://script.google.com/macros/s/AKfycbyY4C2YVyBBgf.../exec",
```
3. Remplacez par votre URL copiée
4. Sauvegardez (Ctrl+S)

---

## 🚀 Étape 2: Lancer l'Application (30 sec)

### Windows
- Double-cliquez sur `launch-ostie.bat`
- Sélectionnez votre navigateur
- L'app s'ouvre automatiquement ✨

### Mac/Linux/Web
- Ouvrez `index.html` dans votre navigateur
- Ou utilisez: `python -m http.server 8000` + `localhost:8000`

---

## 🔐 Étape 3: Connexion (30 sec)

**Identifiants par défaut:**
- Utilisateur: `admin`
- Mot de passe: `ostie`

Cliquez **"Se connecter"** → C'est fait! 🎉

---

## 🧪 Tester Sans API (Optionnel)

Si vous n'avez pas accès à l'API Google Apps Script:

1. Ouvrez `config.js`
2. Changez: `DEMO_MODE: true`
3. Vérifiez que `demo-mode.js` est avant `script.js` dans `index.html`
4. Relancez l'app

---

## ⚠️ Erreur Commune

### "Impossible de se connecter au serveur"

**Solution:**
1. Vérifiez l'URL API dans `config.js`
2. Vérifiez que Google Apps Script est déployé
3. Vous avez une connexion Internet?

---

## 📚 Documentation Complète

Pour plus de détails:
- `README.md` - Guide complet
- `INSTALLATION.md` - Installation détaillée
- `OPTIMISATIONS.md` - Changements effectués

---

## 💡 Conseils Rapides

| Action | Fichier |
|--------|---------|
| Changer URL API | config.js |
| Activer logs détaillés | `DEBUG_MODE: true` dans config.js |
| Tester sans API | `DEMO_MODE: true` dans config.js |
| Diagnostiquer problèmes | Ouvrir Console (F12) + copier DIAGNOSTIC.js |

---

**C'est tout! Votre application OSTIE est maintenant configurée et prête à l'emploi.** 🎊

Pour les problèmes détaillés → voir README.md
