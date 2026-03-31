# Guide de Débogage - Liste d'Attente

## Symptôme
L'erreur "Erreur: impossible d'ajouter à la liste d'attente" s'affiche quand on clique sur "Ajouter à l'attente"

## Étapes de Diagnostic

### Étape 1: Vérifier la Console du Navigateur
1. Ouvrez l'application dans votre navigateur (ex: http://localhost:5500)
2. Appuyez sur **F12** pour ouvrir les Developer Tools
3. Allez à l'onglet **Console**
4. Cliquez sur "Ajouter à l'attente"
5. Cherchez les messages de log:
   - `📡 Réponse API addToWaiting: {...}` - Montre la réponse reçue du serveur
   - `❌ Erreur API: ...` - Montre le message d'erreur spécifique

**À noter:** Le message exact de l'erreur sera affiché dans la console et dans le message d'erreur rouge.

---

### Étape 2: Vérifier l'URL de l'API
1. Ouvrez `config.js`
2. Vérifiez que `API_URL` pointe à votre déploiement Google Apps Script
3. Tests rapides dans le navigateur:
   - Ouvrez: `https://script.google.com/macros/s/VOTRE_ID/exec?action=getWaitingList`
   - Vous devriez voir: `{"success":true,"data":[]}`
   - Si vous voyez un message d'erreur, l'URL est incorrecte ou non déployée

---

### Étape 3: Vérifier le Déploiement Google Apps Script
1. Ouvrez votre Google Apps Script (dans Google Drive ou Apps Script Editor)
2. Cliquez sur **"Déployer" → "Gérer les déploiements"**
3. Vérifiez qu'il y a un déploiement actif de type "Application Web"
4. Vérifiez les permissions:
   - "Exécuter en tant que": Votre compte
   - "Qui a accès": Vous-même (ou selon vos besoins)

---

### Étape 4: Vérifier la Feuille "Attentes"
La feuille "Attentes" est créée automatiquement à la première utilisation. Voici comment vérifier:
1. Ouvrez votre Google Sheet
2. Regardez les onglets en bas
3. Cherchez l'onglet "Attentes"
4. Si absent, il sera créé au premier ajout (vérifiez après avoir cliqué sur le bouton)

---

### Étape 5: Vérifier les Logs du Google Apps Script
Pour voir les erreurs exactes du serveur:
1. Ouvrez votre Google Apps Script
2. Cliquez sur **"Exécution"** (flèche sur la droite)
3. Regardez la section **"Exécutions"** 
4. Cliquez sur la dernière exécution pour voir les logs
5. Cherchez `❌ Erreur addToWaitingList:` - cela montre l'erreur exacte

---

## Erreurs Courantes et Solutions

### Erreur: "Erreur serveur HTTP 401"
- **Cause**: L'utilisateur n'est pas authentifié pour accéder au Google Apps Script
- **Solution**: Vérifiez les permissions du déploiement

### Erreur: "SyntaxError: Unexpected token"
- **Cause**: La réponse n'est pas du JSON valide
- **Solution**: Vérifiez que l'API_URL pointe au bon déploiement

### Erreur: "Données invalides: matricule et nom requis"
- **Cause**: Les paramètres ne sont pas passés correctement
- **Solution**: Vérifiez que vous sélectionnez un collaborateur avant de cliquer

### Erreur: "Erreur: undefined"
- **Cause**: L'API n'a pas répondu ou la réponse est vide
- **Solution**: Vérifiez la connexion Internet et l'URL de l'API

---

## Messages de Succès
Si tout fonctionne, vous devriez voir:
- ✅ Message vert "Ajouté à la liste d'attente"
- La carte du collaborateur dans la liste d'attente avec l'heure
- Un bouton X rouge pour supprimer de la liste

---

## Test Manuel depuis la Navigateur
Pour tester directement l'API depuis votre navigateur:

### Commander 1: Créer un Attente
Collez dans la barre d'adresse (remplacez `YOUR_ID` et les paramètres):
```
https://script.google.com/macros/s/YOUR_ID/exec?action=addToWaiting&matricule=CN01105&nom=TEST&fonction=Manager&rattachement=OSTIE&heureAjout=14:30
```

Vous devriez voir:
```json
{"success":true}
```

### Commande 2: Récupérer la Liste
```
https://script.google.com/macros/s/YOUR_ID/exec?action=getWaitingList
```

Vous devriez voir:
```json
{"success":true,"data":[{"matricule":"CN01105","nom":"TEST",...}]}
```

### Commande 3: Supprimer de la Liste
```
https://script.google.com/macros/s/YOUR_ID/exec?action=removeFromWaiting&matricule=CN01105
```

Vous devriez voir:
```json
{"success":true}
```

---

## Besoin d'Aide?
Si vous toujours l'erreur après ces vérifications, vérifiez:
1. ✅ Console du navigateur → Message d'erreur exact
2. ✅ Logs Google Apps Script → Erreur exacte du serveur
3. ✅ L'URL API est correcte dans config.js
4. ✅ Le déploiement Google Apps Script est actif

Les messages de log vous donneront l'erreur exacte qui vous permettra de corriger le problème.
