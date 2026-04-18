/**
 * =========================================================
 * FICHIER DE CONFIGURATION - À MODIFIER
 * =========================================================
 * 
 * Ce fichier centralise les configurations de l'application.
 * Modifiez les valeurs ci-dessous selon votre environnement.
 */

// ==================== API CONFIGURATION ====================
// IMPORTANT: Remplacez cette URL par celle de votre Google Apps Script déployé
// Comment obtenir l'URL:
// 1. Ouvrez Google Apps Script (script.gs)
// 2. Cliquez sur "Déployer" → "Nouveau déploiement"
// 3. Sélectionnez "Application Web"
// 4. Exécutez en tant que: Votre compte
// 5. Autorisez l'accès
// 6. Copiez l'URL du déploiement
// 
// Exemple: https://script.google.com/macros/s/AKfycby.../exec

const CONFIG = {
  // =========== API Endpoint ===========
  // Remplacez par l'URL de votre Google Apps Script
  API_URL: "https://script.google.com/macros/s/AKfycbyZERWhlq_oUY0yVe--_W0wYd19aUVXF2wF1Ty0LpIYnJWDatEHAR4qXIhuwvYShwCWlw/exec",

  // =========== Mode Demo ===========
  // Si DEMO_MODE est true, l'app utilise des données fictives
  // Inclure demo-mode.js avant script.js pour activer
  DEMO_MODE: false,

  // =========== Timeouts (ms) ===========
  API_TIMEOUT: 15000,        // Timeout pour les requêtes API
  LOGIN_TIMEOUT: 10000,      // Timeout pour la connexion

  // =========== Logging ===========
  DEBUG_MODE: false,         // Activer le mode debug (affiche plus de logs)
  LOG_API_REQUESTS: false,   // Logger toutes les requêtes API

  // =========== Locale ===========
  LOCALE: 'fr-FR',          // Locale pour les dates et nombres
  TIMEZONE: 'Africa/Blantyre', // Fuseau horaire Madagascar (UTC+2)

  // =========== Validation ===========
  MIN_PASSWORD_LENGTH: 6,
  MAX_USERNAME_LENGTH: 50,

  // =========== Cache ===========
  CACHE_DURATION: 3600000,   // 1 heure en ms
  CACHE_ENABLED: true,

  // =========== Erreurs ===========
  SHOW_ERROR_DETAILS: true,  // Afficher les détails des erreurs aux utilisateurs
  RETRY_ON_FAILURE: true,
  MAX_RETRIES: 3
};

/**
 * Valide la configuration
 */
function validateConfig() {
  const errors = [];

  if (!CONFIG.API_URL || CONFIG.API_URL.includes('script.google.com') === false) {
    errors.push('API_URL non configurée correctement. Veuillez vérifier config.js');
  }

  if (CONFIG.API_TIMEOUT < 5000) {
    console.warn('⚠️ API_TIMEOUT très court - peut causer des timeouts');
  }

  if (errors.length > 0) {
    console.warn('⚠️ Erreurs de configuration:', errors);
    return false;
  }

  return true;
}

/**
 * Logger un message (selon le mode debug)
 */
function debugLog(message, data = null) {
  if (CONFIG.DEBUG_MODE) {
    if (data) {
      console.log(`[OSTIE DEBUG] ${message}`, data);
    } else {
      console.log(`[OSTIE DEBUG] ${message}`);
    }
  }
}

// Valider la config au chargement
validateConfig();
