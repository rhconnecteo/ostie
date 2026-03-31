/**
 * =========================================================
 * DIAGNOSTIC TOOL - Copie/colle ce code dans la Console (F12)
 * =========================================================
 * 
 * Cet outil aide à diagnostiquer les problèmes avec OSTIE
 * 
 * Utilisation:
 * 1. Ouvrez la Console (F12 ou Ctrl+Shift+I)
 * 2. Allez dans l'onglet "Console"
 * 3. Copiez-collez ce code
 * 4. Appuyez sur Entrée
 */

console.clear();
console.log("%c=== 🔍 DIAGNOSTIC OSTIE ===", "font-size: 16px; font-weight: bold; color: #667eea;");
console.log("");

// =========== 1. Vérifier la Configuration ===========
console.log("%c1. VÉRIFICATION DE LA CONFIGURATION", "font-size: 14px; font-weight: bold; color: #667eea;");

if (typeof CONFIG !== 'undefined') {
  console.log("✅ CONFIG trouvée");
  console.log("   API_URL:", CONFIG.API_URL);
  console.log("   API_TIMEOUT:", CONFIG.API_TIMEOUT, "ms");
  console.log("   DEBUG_MODE:", CONFIG.DEBUG_MODE);
  console.log("   DEMO_MODE:", CONFIG.DEMO_MODE);
} else {
  console.warn("❌ CONFIG non trouvée - le fichier config.js n'est pas chargé?");
}

console.log("");

// =========== 2. Vérifier l'API URL ===========
console.log("%c2. VÉRIFICATION DE L'API URL", "font-size: 14px; font-weight: bold; color: #667eea;");

if (typeof API_URL !== 'undefined') {
  console.log("✅ API_URL définie:", API_URL);
  
  // Tester si c'est une URL valide
  try {
    new URL(API_URL);
    console.log("✅ Format URL correct");
  } catch (e) {
    console.warn("❌ Format URL incorrect:", e.message);
  }
  
  // Vérifier si c'est script.google.com
  if (API_URL.includes('script.google.com')) {
    console.log("✅ URL pointe vers Google Apps Script");
  } else {
    console.warn("⚠️ URL ne pointe pas vers script.google.com");
  }
} else {
  console.warn("❌ API_URL non définie");
}

console.log("");

// =========== 3. Vérifier localStorage ===========
console.log("%c3. VÉRIFICATION DU STOCKAGE LOCAL", "font-size: 14px; font-weight: bold; color: #667eea;");

try {
  localStorage.setItem('ostie_test', 'test');
  const value = localStorage.getItem('ostie_test');
  localStorage.removeItem('ostie_test');
  
  if (value === 'test') {
    console.log("✅ localStorage fonctionne");
  } else {
    console.warn("❌ localStorage ne retourne pas la bonne valeur");
  }
} catch (e) {
  console.warn("❌ localStorage désactivé ou plein:", e.message);
  console.warn("   - Vérifiez le mode incognito");
  console.warn("   - Vérifiez les paramètres de confidentialité du navigateur");
}

console.log("");

// =========== 4. Vérifier Chart.js ===========
console.log("%c4. VÉRIFICATION DES DÉPENDANCES", "font-size: 14px; font-weight: bold; color: #667eea;");

if (typeof Chart !== 'undefined') {
  console.log("✅ Chart.js chargé (version", Chart.version + ")");
} else {
  console.warn("❌ Chart.js non chargé - les graphiques ne fonctionneront pas");
}

console.log("");

// =========== 5. Vérifier les fichiers CSS ===========
console.log("%c5. VÉRIFICATION DES FEUILLES DE STYLE", "font-size: 14px; font-weight: bold; color: #667eea;");

const stylesheets = document.styleSheets;
console.log(`Trouvé ${stylesheets.length} feuille(s) de style`);

let cssFound = false;
for (let i = 0; i < stylesheets.length; i++) {
  if (stylesheets[i].href && stylesheets[i].href.includes('style.css')) {
    console.log("✅ style.css chargé");
    cssFound = true;
  }
}

if (!cssFound && stylesheets.length > 0) {
  console.warn("⚠️ style.css introuvable - vérifiez le chemin relatif");
}

console.log("");

// =========== 6. Vérifier le connexion status ===========
console.log("%c6. VÉRIFICATION DE LA CONNEXION", "font-size: 14px; font-weight: bold; color: #667eea;");

if (navigator.onLine) {
  console.log("✅ Connexion Internet active");
} else {
  console.warn("❌ Pas de connexion Internet!");
}

console.log("");

// =========== 7. Test rapide API ===========
console.log("%c7. TEST RAPIDE DE L'API", "font-size: 14px; font-weight: bold; color: #667eea;");
console.log("Pour tester la connexion API, exécutez:");
console.log("");
console.log('%cfetch(API_URL + "?action=getCollaborateurs").then(r => r.json()).then(d => console.log(d));', "font-size: 12px; font-family: monospace; background: #f5f5f5; padding: 5px;");

console.log("");
console.log("%c=== FIN DU DIAGNOSTIC ===", "font-size: 14px; font-weight: bold; color: #667eea;");
console.log("");
console.log("💡 Conseil: Pour plus de détails, activez DEBUG_MODE: true dans config.js");
