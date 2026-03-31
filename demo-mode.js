/**
 * =========================================================
 * MODE HORS LIGNE / DÉMONSTRATION
 * =========================================================
 * 
 * Ce fichier permet de tester l'application sans connexion
 * à Google Apps Script (mode démo/développement)
 * 
 * Pour l'utiliser:
 * 1. Incluez ce fichier AVANT script.js dans index.html
 * 2. Ensuite activez le mode demo dans config.js: DEMO_MODE: true
 * 
 */

// Données demo
const DEMO_DATA = {
  collaborateurs: [
    { matricule: "001", nom: "Jean Dupont", fonction: "Ingénieur", rattachement: "IT" },
    { matricule: "002", nom: "Marie Martin", fonction: "Manager", rattachement: "RH" },
    { matricule: "003", nom: "Pierre Bernard", fonction: "Technicien", rattachement: "IT" },
    { matricule: "004", nom: "Sophie Laurent", fonction: "Infirmière", rattachement: "Santé" },
  ],
  consultations: [
    {
      matricule: "001",
      nom: "Jean Dupont",
      fonction: "Ingénieur",
      rattachement: "IT",
      typeConsultation: "Consultation médicale",
      lieuConsultation: "Dispensaire Andranomena",
      choix: "En poste",
      shift: "Jour",
      date: new Date().toISOString().split('T')[0],
      heureSortie: "09:00",
      heureRetour: "10:30",
      resultat: "Consultation médicale",
      joursRM: "0"
    }
  ]
};

/**
 * Intercepte les appels fetch pour le mode démo
 */
if (typeof CONFIG !== 'undefined' && CONFIG.DEMO_MODE) {
  console.log("🔧 Mode Démo activé - API Google Apps Script désactivée");

  // Override fetch pour les démos
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (url.includes('script.google.com')) {
      console.log("📡 Appel API intercepté (mode démo):", url);
      
      // Extraire l'action de l'URL
      const actionMatch = url.match(/action=([^&]*)/);
      const action = actionMatch ? decodeURIComponent(actionMatch[1]) : null;

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          switch (action) {
            case 'validateLogin':
              resolve(new Response(JSON.stringify({
                success: true,
                message: "Connecté en mode démo",
                type: "OSTIE_ADMIN",
                permissions: "all"
              })));
              break;

            case 'getCollaborateurs':
              resolve(new Response(JSON.stringify(DEMO_DATA.collaborateurs)));
              break;

            case 'getConsultations':
              resolve(new Response(JSON.stringify(DEMO_DATA.consultations)));
              break;

            case 'saveConsultation':
              console.log("📝 Consultation sauvegardée (mode démo)");
              resolve(new Response(JSON.stringify({ success: true })));
              break;

            case 'setRetour':
              console.log("✅ Retour enregistré (mode démo)");
              resolve(new Response(JSON.stringify({ success: true })));
              break;

            default:
              resolve(new Response(JSON.stringify({ success: true, data: [] })));
          }
        }, 500); // Simule un délai réseau
      });
    }

    // Appels non-API passent à fetch normal
    return originalFetch.call(window, url, options);
  };
}
