document.addEventListener("DOMContentLoaded", function () {

  // ================= CONFIG API =================
  // Utiliser la configuration du fichier config.js
  const API_URL = (typeof CONFIG !== 'undefined' && CONFIG.API_URL) 
    ? CONFIG.API_URL 
    :"https://script.google.com/macros/s/AKfycbyZERWhlq_oUY0yVe--_W0wYd19aUVXF2wF1Ty0LpIYnJWDatEHAR4qXIhuwvYShwCWlw/exec";
  
  const API_TIMEOUT = (typeof CONFIG !== 'undefined' && CONFIG.API_TIMEOUT) 
    ? CONFIG.API_TIMEOUT 
    : 15000;
  
  // Validation de l'URL API
  if (!API_URL || API_URL.includes("script.google.com") === false) {
    console.error("ERREUR: Veuillez configurer l'URL Google Apps Script dans config.js");
  }




  // ================= STATE =================
  let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  let userPassword = localStorage.getItem("userPassword") || "";
  let userType = localStorage.getItem("userType") || ""; // "OSTIE_ADMIN" ou "PRODUCTION_VIEWER"
  let userPermissions = localStorage.getItem("userPermissions") || ""; // "all" ou "readonly"
  let authorizedRattachements = []; // Filtre par domaine
  let allCollaborateurs = [];
  let allConsultations = [];
  let chartCamembert = null;
  let chartJours = null;
  let rattachementColorMap = {}; // Mémoriser les couleurs des rattachements

  // ================= WAITING LIST =================
  // La liste d'attente est maintenant stockée dans la base de données (Google Sheet)
  // Elle sera chargée via loadWaitingList() après la connexion
  let waitingPersonnes = [];
  let waitingListRefreshInterval = null; // Pour l'auto-refresh
  let isAddingToWaiting = false; // Debounce pour éviter les doublons
  let selectingFromWaiting = false; // Debounce pour éviter les doublures de sélection

  // ================= SLOGANS & MOTTOS =================
  const slogans = [
    // Santé
    "✨ Votre santé est votre richesse ! Prenez soin de vous ✨",
    "✨ La santé est un état d'équilibre physique et mental ✨",
    "✨ Chaque jour est une chance d'améliorer votre bien-être ✨",
    "✨ La prévention est meilleure que la guérison ✨",
    "✨ Un corps sain accueille un esprit léger ✨",
    // Psychologie
    "✨ Le bien-être mental est aussi important que la santé physique ✨",
    "✨ Cultiver la sérénité, c'est cultiver la paix intérieure ✨",
    "✨ Votre esprit est votre plus grand atout ✨",
    "✨ Acceptez-vous pour mieux avancer ✨",
    "✨ La croissance personnelle commence par l'auto-compassion ✨",
    // Culture & Développement
    "✨ La culture élève l'âme et enrichit l'esprit ✨",
    "✨ Apprendre c'est grandir, toujours ✨",
    "✨ La diversité culturelle est une force collective ✨",
    "✨ Chaque savoir acquis est un trésor personnel ✨",
    "✨ La curiosité est la clé de la sagesse ✨",
    // Travail & Carrière
    "✨ Faire ce qu'on aime, c'est trouver son sens ✨",
    "✨ L'excellence commence par la passion ✨",
    "✨ Votre travail est le reflet de votre détermination ✨",
    "✨ Chaque défi est une occasion de se dépasser ✨",
    "✨ La persévérance transforme les rêves en réalité ✨",
    // Sagesse & Proverbes
    "✨ Les petits gestes créent les grands changements ✨",
    "✨ Entre la pensée et l'action, il y a la volonté ✨",
    "✨ Le voyage de mille lieues commence par un seul pas ✨",
    "✨ Ce que vous semez, vous le récolterez ✨",
    "✨ La gratitude transforme les blessures en sagesse ✨",
    "✨ Le silence est parfois la meilleure parole ✨",
    "✨ La force vient de la persévérance, pas de la facilité ✨",
    "✨ Chaque jour est une nouvelle opportunité ✨",
    "✨ La confiance en soi est le premier pas du succès ✨",
    "✨ Ensemble, nous sommes plus forts qu'individuellement ✨",
    // Motivation
    "✨ Les vrais amis sont des trésors précieux ✨",
    "✨ Votre potentiel n'a pas de limites ✨",
    "✨ Croyez en vous, même quand personne d'autre ne le fait ✨",
    "✨ Chaque erreur est une leçon, pas une défaite ✨",
    "✨ La vie récompense ceux qui osent essayer ✨",
    "✨ Soyez le changement que vous désirez voir ✨",
    "✨ L'aujourd'hui d'un homme est demain d'un autre ✨",
    "✨ La dignité vient du respect de soi ✨",
    "✨ Merci pour votre confiance et votre engagement ✨",
    "✨ Ensemble pour une meilleure santé et une vie épanouie ✨"
  ];

  let currentSloganIndex = 0;

  // ================= LOGIN ELEMENTS =================
  const loginPage = document.getElementById("loginPage");
  const appPage = document.getElementById("appPage");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  // ================= NAV ELEMENTS =================
  const navBtns = document.querySelectorAll(".nav-btn:not(.logout-btn)");
  const logoutBtn = document.getElementById("logoutBtn");
  const sections = document.querySelectorAll(".section");

  // ================= FORM ELEMENTS =================
  const searchInput = document.getElementById("searchInput");
  const collaborateurSelect = document.getElementById("collaborateur");
  const matriculeSpan = document.getElementById("matricule");
  const nomPrenomSpan = document.getElementById("nomPrenom");
  const fonctionSpan = document.getElementById("fonction");
  const rattachementSpan = document.getElementById("rattachement");
  const formConsultation = document.getElementById("formConsultation");
  const dateInput = document.getElementById("date");
  const heureSortieInput = document.getElementById("heureSortie");
  const typeConsultationSelect = document.getElementById("typeConsultation");
  const lieuConsultationSelect = document.getElementById("lieuConsultation");
  const choixSelect = document.getElementById("choix");
  const shiftSelect = document.getElementById("shift");
  const retourImmediatelyCheckbox = document.getElementById("retourImmediately");
  const heureRetourGroup = document.getElementById("heureRetourGroup");
  const heureRetourInput = document.getElementById("heureRetour");
  const casGraveCheckbox = document.getElementById("casGrave");
  const commentairesRow = document.getElementById("commentairesRow");
  const commentairesGroup = document.getElementById("commentairesGroup");
  const commentairesInput = document.getElementById("commentaires");
  const btnSave = document.getElementById("btnSave");
  const btnCancel = document.getElementById("btnCancel");
  const successMessage = document.getElementById("successMessage");

  // ================= DASHBOARD ELEMENTS =================
  const statTotal = document.getElementById("statTotal");
  const statEnAttente = document.getElementById("statEnAttente");
  const statRepos = document.getElementById("statRepos");
  const pendingList = document.getElementById("pendingList");
  const filterFromDate = document.getElementById("filterFromDate");
  const filterToDate = document.getElementById("filterToDate");
  const filterRattachement = document.getElementById("filterRattachement");
  const filterFonction = document.getElementById("filterFonction");
  const btnFilterReport = document.getElementById("btnFilterReport");
  const btnResetReport = document.getElementById("btnResetReport");
  const btnPreviousDay = document.getElementById("btnPreviousDay");
  const reportTableBody = document.getElementById("reportTableBody");
  
  // Report Stats Elements
  const reportStatTotal = document.getElementById("reportStatTotal");
  const reportStatRM = document.getElementById("reportStatRM");
  const reportStatConsult = document.getElementById("reportStatConsult");
  const reportStatDayoff = document.getElementById("reportStatDayoff");
  
  // Report Chart Elements
  let chartReportResultats = null;
  let chartReportLieu = null;
  let chartReportChoix = null;
  let chartReportShift = null;
  let chartReportTendance = null;
  
  // Waiting List Elements
  const waitingSection = document.getElementById("waitingSection");
  const waitingList = document.getElementById("waitingList");
  const waitingCount = document.getElementById("waitingCount");
  const btnAddToWaiting = document.getElementById("btnAddToWaiting");

  

  function rotateSlogan() {
    const mottoText = document.getElementById("mottoText");
    if (mottoText) {
      mottoText.textContent = slogans[currentSloganIndex];
      currentSloganIndex = (currentSloganIndex + 1) % slogans.length;
    }
  }

  // Afficher le premier slogan et ensuite rotation toutes les 6 secondes
  rotateSlogan();
  setInterval(rotateSlogan, 6000);

  // ================= HELPER FUNCTIONS =================
  // Générer une couleur unique pour chaque rattachement
  function getRattachementColor(rattachement) {
    if (!rattachement || rattachement === "-") return "#f5f5f5"; // Gris clair pour vide
    
    if (!rattachementColorMap[rattachement]) {
      // Générer une couleur HSL basée sur un hash du rattachement
      let hash = 0;
      for (let i = 0; i < rattachement.length; i++) {
        hash = ((hash << 5) - hash) + rattachement.charCodeAt(i);
        hash = hash & hash; // Convertir en entier 32-bit
      }
      const hue = Math.abs(hash) % 360;
      const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
      const lightness = 75 + (Math.abs(hash) % 15); // 75-90%
      rattachementColorMap[rattachement] = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    return rattachementColorMap[rattachement];
  }

  // Extraire l'heure d'un format ISO (ex: "1899-12-30T15:00:00.000Z" → "15:00:00")
  function extractTimeFromISO(isoDateTime) {
    if (!isoDateTime || typeof isoDateTime !== "string") return "-";
    if (isoDateTime.includes("T")) {
      const time = isoDateTime.split("T")[1];
      if (time) {
        return time.split(".")[0]; // Retourne HH:MM:SS
      }
    }
    return isoDateTime;
  }

  // Extraire et corriger la date d'un format ISO (ex: "2026-04-03T15:00:00Z" → "2026-04-04")
  function extractAndCorrectDate(isoDateTime) {
    if (!isoDateTime || typeof isoDateTime !== "string") return "-";
    if (isoDateTime.includes("T")) {
      const date = isoDateTime.split("T")[0]; // 2026-04-03
      const parts = date.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        d.setDate(d.getDate() + 1); // Ajouter 1 jour pour corriger le décalage
        const newYear = d.getFullYear();
        const newMonth = String(d.getMonth() + 1).padStart(2, "0");
        const newDay = String(d.getDate()).padStart(2, "0");
        return `${newYear}-${newMonth}-${newDay}`;
      }
    }
    return isoDateTime;
  }

  function getTodayMadagascar() {
    // Retourner la date d'aujourd'hui au format YYYY-MM-DD
    // Utiliser simplement le fuseau horaire du navigateur (qui doit être en Madagascar)
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    
    return `${year}-${month}-${day}`;
  }

  function getCurrentDateTime() {
    const now = new Date();
    
    // Obtenir la date Madagascar
    const todayISO = getTodayMadagascar(); // Format YYYY-MM-DD
    const parts = todayISO.split("-");
    const date = `${parts[2]}/${parts[1]}/${parts[0]}`; // Convertir en DD/MM/YYYY
    
    const time = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    
    return {
      date: date,
      time: time
    };
  }

  function formatDate(dateStr) {
    // Convertir "2026-03-02" en "02/03/2026" OU garder "02/03/2026" si déjà au bon format
    if (!dateStr || typeof dateStr !== "string") return dateStr;
    
    // Si c'est au format YYYY-MM-DD (ISO)
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    
    // Si c'est déjà au format DD/MM/YYYY, le retourner tel quel
    return dateStr;
  }

  function convertDateToISO(dateStr) {
    // Convertir "03/03/2026" en "2026-03-03" pour le serveur
    if (!dateStr || typeof dateStr !== "string") return dateStr;
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }

  function setDateTimeNow() {
    const now = getCurrentDateTime();
    dateInput.value = now.date;  // Maintenant c'est au format DD/MM/YYYY
    heureSortieInput.value = now.time;
  }

  function showMessage(message, type = "success") {
    successMessage.textContent = message;
    successMessage.className = "success-message show";
    
    if (type === "success") {
      successMessage.style.background = "#d4edda";
      successMessage.style.color = "#155724";
    } else {
      successMessage.style.background = "#f8d7da";
      successMessage.style.color = "#721c24";
    }

    setTimeout(() => {
      successMessage.classList.remove("show");
    }, 4000);
  }

  // ================= LOGIN =================
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Login attempt

    // Validation basique
    if (!username || !password) {
      loginError.textContent = "❌ Veuillez remplir tous les champs";
      return;
    }

    // Désactiver le bouton et afficher un message d'attente
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "⏳ Connexion en cours...";
    }
    loginError.textContent = "⏳ Connexion en cours...";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, API_TIMEOUT);

      try {
        // Sending login request
        const response = await fetch(
          `${API_URL}?action=validateLogin&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        // Received response

        if (!response.ok) {
          throw new Error(`Erreur serveur: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        // Login result processed

        if (result.success) {
          // Login successful
          isLoggedIn = true;
          userPassword = password;
          userType = result.type; // "OSTIE_ADMIN" ou "PRODUCTION_VIEWER"
          userPermissions = result.permissions; // "all" ou "readonly"
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userPassword", password);
          localStorage.setItem("userType", userType);
          localStorage.setItem("userPermissions", userPermissions);
          loginError.textContent = "";
          
          // Switching to app
          loginPage.classList.remove("active");
          appPage.classList.add("active");
          
          // NE PAS effacer les champs tout de suite - attendre le chargement complet
          // usernameInput.value = "";
          // passwordInput.value = "";
          
          showMessage("✅ Connecté avec succès!");
          
          // Adapter l'interface selon le type d'utilisateur
          // UI setup
          setupUIForUserType(userType, userPermissions);
          
          // Loading data - charger séquentiellement pour éviter les race conditions
          await loadCollaborateurs();
          await loadWaitingList();
          await loadDashboardData(); // Charger le dashboard pour les deux types d'utilisateurs
          
          // MAINTENANT effacer les champs
          usernameInput.value = "";
          passwordInput.value = "";
          
          // Recharger la liste d'attente automatiquement toutes les 30 secondes
          startAutoRefreshWaitingList();
        } else {
          console.warn("Login échoué - identifiants incorrects");
          loginError.textContent = "❌ " + (result.message || "Identifiants incorrects");
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err) {
      console.error("Erreur login:", err);
      let errorMsg = "❌ Erreur lors de la connexion";
      
      if (err.name === 'AbortError') {
        errorMsg = "❌ Connexion expirée - Vérifiez votre connexion Internet";
      } else if (err.message.includes("Failed to fetch")) {
        errorMsg = "❌ Impossible de se connecter au serveur. Vérifiez l'URL API.";
      } else if (err.message.includes("NetworkError")) {
        errorMsg = "❌ Erreur réseau - Vérifiez votre connexion Internet";
      }
      
      loginError.textContent = errorMsg;
    } finally {
      // Réactiver le bouton
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Se connecter";
      }
    }
  });

  logoutBtn.addEventListener("click", function () {
    isLoggedIn = false;
    userPassword = "";
    userType = "";
    userPermissions = "";
    waitingPersonnes = []; // Effacer la liste d'attente locale
    stopAutoRefreshWaitingList(); // Arrêter l'auto-refresh
    localStorage.setItem("isLoggedIn", "false");
    localStorage.setItem("userPassword", "");
    localStorage.setItem("userType", "");
    localStorage.setItem("userPermissions", "");
    loginPage.classList.add("active");
    appPage.classList.remove("active");
    resetForm();
  });

  // ================= SETUP UI FOR USER TYPE =================
  function setupUIForUserType(type, permissions) {
    const formulaireSection = document.getElementById("formulaire");
    const dashboardSection = document.getElementById("dashboard");
    const rapportSection = document.getElementById("rapport");
    const formConsultation = document.getElementById("formConsultation");
    const detailsCollaborateur = document.getElementById("detailsCollaborateur");
    const waitingSection = document.getElementById("waitingSection");

    // Déterminer les rattachements autorisés
    authorizedRattachements = []; // Tous les rattachements pour les deux types

    if (type === "OSTIE_ADMIN" && permissions === "all") {
      // Admin complet: voir formulaire + dashboard + rapport
      // Ne pas mettre display:none en inline - laisser les CSS rules gérer via .active
      
      // Afficher tous les boutons de nav
      navBtns.forEach(btn => btn.style.display = "inline-block");
      
      // Afficher le premier formulaire par défaut
      sections.forEach(s => s.classList.remove("active"));
      if (formulaireSection) formulaireSection.classList.add("active");
      navBtns.forEach(b => b.classList.remove("active"));
      navBtns[0].classList.add("active"); // Sélectionner "Formulaire"
      
      // ✅ Afficher le bouton "Vérifier les anomalies" pour OSTIE
      const btnCheckAnomalies = document.getElementById("btnCheckAnomalies");
      if (btnCheckAnomalies) btnCheckAnomalies.style.display = "block";
      
      // Afficher tous les éléments du formulaire
      if (formConsultation) formConsultation.style.display = "none"; // Caché jusqu'au choix d'un collaborateur
      if (detailsCollaborateur) detailsCollaborateur.style.display = "block";
      if (waitingSection) waitingSection.style.display = "block";
      
    } else if (type === "PRODUCTION_VIEWER" && permissions === "readonly") {
      // Production Viewer: Table détaillée des personnes en attente de retour dans le Dashboard
      
      // Afficher boutons: Ajouter en attente, Dashboard, Rapport
      navBtns.forEach(btn => {
        const section = btn.dataset.section;
        if (section === "formulaire") {
          btn.style.display = "inline-block";  // Afficher mais renommé
          btn.textContent = "⏳ Ajouter en Attente";  // Renommer le bouton
        } else if (section === "dashboard" || section === "rapport") {
          btn.style.display = "inline-block";  // Afficher Dashboard et Rapport
        } else {
          btn.style.display = "inline-block";  // Garder Déconnexion
        }
      });
      
      // Afficher le Dashboard par défaut
      sections.forEach(s => s.classList.remove("active"));
      if (dashboardSection) dashboardSection.classList.add("active");
      
      // Sélectionner le bouton Dashboard
      navBtns.forEach(b => b.classList.remove("active"));
      const dashboardBtn = document.querySelector('[data-section="dashboard"]');
      if (dashboardBtn) dashboardBtn.classList.add("active");
      
      // Modifier les titres de la section formulaire pour PRODUCTION_VIEWER
      if (formulaireSection) {
        const h2 = formulaireSection.querySelector('h2');
        if (h2) h2.textContent = "⏳ Ajouter Collaborateurs en Attente";
        
        const subtitle = formulaireSection.querySelector('.section-subtitle');
        if (subtitle) subtitle.textContent = "Sélectionnez un collaborateur et cliquez sur 'Ajouter à l'attente'";
      }
      
      // ✅ Afficher les détails du collaborateur
      if (detailsCollaborateur) detailsCollaborateur.style.display = "block";
      
      // ❌ Cacher le formulaire de consultation complet
      if (formConsultation) formConsultation.style.display = "none";
      
      // ✅ Afficher la section des personnes en attente
      if (waitingSection) waitingSection.style.display = "block";
      
      // ======================= DASHBOARD: PRODUCTION_VIEWER VOIR SEULEMENT LA TABLE D'ATTENTE =======================
      
      // ❌ Masquer TOUTES les cartes statistiques
      const statsContainer = dashboardSection?.querySelector('.stats-container');
      if (statsContainer) statsContainer.style.display = "none";
      
      dashboardSection?.querySelectorAll('.stat-card').forEach(card => {
        card.style.display = "none";
      });
      
      // ❌ Masquer les GRAPHIQUES (Chart.js canvases)
      dashboardSection?.querySelectorAll('canvas').forEach(canvas => {
        canvas.style.display = "none";
        if (canvas.parentElement) {
          canvas.parentElement.style.display = "none";
        }
      });
      
      // ❌ Masquer la grille des graphiques entière
      const chartsGrid = dashboardSection?.querySelector('.charts-grid');
      if (chartsGrid) {
        chartsGrid.style.display = "none";
      }
      
      // ❌ Masquer les conteneurs de graphiques individuels
      const chartContainers = dashboardSection?.querySelectorAll('.chart-container');
      if (chartContainers) {
        chartContainers.forEach(el => {
          el.style.display = "none";
        });
      }
      
      // ❌ Masquer la section des cartes de rattachement COMPLÈTEMENT
      const rattachementCardsSection = document.getElementById("rattachementCardsSection");
      if (rattachementCardsSection) {
        rattachementCardsSection.style.display = "none !important";
      }
      
      // ❌ Masquer TOUTES les cartes colorées (Contact Center, Consulte, etc.)
      dashboardSection?.querySelectorAll('.card').forEach(card => {
        card.style.display = "none";
      });
      
      // ❌ Masquer tous les éléments avec la classe card-* ou rattachement*
      dashboardSection?.querySelectorAll('[class*="card-"], [class*="rattachement"]').forEach(el => {
        if (el.tagName !== 'TABLE' && !el.querySelector('table')) {
          el.style.display = "none";
        }
      });
      
      // ❌ Masquer les conteneurs de graphiques par ID
      const chartContainersById = dashboardSection?.querySelectorAll('[id*="chart"], [class*="chart"]');
      if (chartContainersById) {
        chartContainersById.forEach(el => {
          el.style.display = "none";
        });
      }
      
      // ❌ Cacher le bouton "Vérifier les anomalies"
      const btnCheckAnomalies = document.getElementById("btnCheckAnomalies");
      if (btnCheckAnomalies) btnCheckAnomalies.style.display = "none";
      const btnCheckAnomaliesContainer = btnCheckAnomalies?.parentElement;
      if (btnCheckAnomaliesContainer) btnCheckAnomaliesContainer.style.display = "none";
      
      // ❌ Masquer toutes les tables sauf celle de l'attente (suivi des retours)
      // S'assurer que pending-section est visible
      const pendingSectionDiv = document.querySelector('.pending-section');
      if (pendingSectionDiv) {
        pendingSectionDiv.style.display = "block !important";
        
        // Afficher le tableau de l'attente
        const waitingTable = pendingSectionDiv.querySelector('#pendingWaitingTable');
        if (waitingTable) {
          waitingTable.style.display = "table !important";
          // Waiting table displayed
        }
        
        // Afficher aussi le conteneur
        const tableContainers = pendingSectionDiv.querySelectorAll('.table-container');
        tableContainers.forEach((container, idx) => {
          container.style.display = "block !important";
          // Container displayed
        });
      }
      
      // Masquer les autres conteneurs en dehors de pending-section
      const allOtherContainers = dashboardSection?.querySelectorAll('.table-container');
      if (allOtherContainers) {
        allOtherContainers.forEach(el => {
          if (!pendingSectionDiv?.contains(el)) {
            el.style.display = "none";
          }
        });
      }
      
      // ❌ Masquer les tables complétées
      const completedTables = dashboardSection?.querySelectorAll('[id*="completedTable"], [id*="completed"]');
      if (completedTables) {
        completedTables.forEach(el => {
          el.style.display = "none";
        });
      }
      
      // ❌ Cacher "Consultations d'Aujourd'hui" (section + filtres)
      const todayConsultationsSection = document.querySelector('.today-consultations-section');
      if (todayConsultationsSection) todayConsultationsSection.style.display = "none";
      
      // ❌ Masquer le h4 "Déjà retournée" et sa table
      const h4Headers = dashboardSection?.querySelectorAll('h4');
      if (h4Headers) {
        h4Headers.forEach(h4 => {
          const text = h4.textContent.toLowerCase();
          if (text.includes("retournée") || text.includes("completed")) {
            h4.style.display = "none";
            // Masquer aussi le conteneur suivant (la table)
            let next = h4.nextElementSibling;
            while (next && !next.matches('h4')) {
              if (next.classList.contains('table-container') || next.tagName === 'TABLE') {
                next.style.display = "none";
              }
              next = next.nextElementSibling;
            }
          }
        });
      }
      
      // ✅ Afficher et renommer le titre "Suivi des Retours"
      const pendingSection = document.querySelector('.pending-section');
      if (pendingSection) {
        // Trouver et afficher/renommer le h3
        const h3InPending = pendingSection.querySelector('h3');
        if (h3InPending) {
          h3InPending.textContent = "👥 Suivi des Retours - Détails Complets";
          h3InPending.style.display = "block";
        }
        pendingSection.style.display = "block";
        
        // ✅ Afficher le h4 "En attente" qui précède la table
        const h4InPending = pendingSection.querySelector('h4');
        if (h4InPending) {
          h4InPending.style.display = "block !important";
          h4InPending.textContent = "👥 Détails des Personnes en Attente de Retour";
          console.log("✅ H4 'En attente' affichée");
        }
      }
      
      // ❌ Masquer TOUS les h3 dans le dashboard (pas les h4 du tableau)
      dashboardSection?.querySelectorAll('h3').forEach(h3 => {
        if (!pendingSection?.contains(h3)) {
          h3.style.display = "none";
        }
      });
      
      // ❌ Masquer les h4 "Déjà retournée" 
      dashboardSection?.querySelectorAll('h4').forEach(h4 => {
        if (h4.textContent.includes("Déjà retournée") || h4.textContent.includes("completed")) {
          h4.style.display = "none";
          // Masquer aussi le conteneur suivant (la table)
          let next = h4.nextElementSibling;
          while (next && !next.matches('h4')) {
            if (next.classList.contains('table-container') || next.tagName === 'TABLE') {
              next.style.display = "none";
            }
            next = next.nextElementSibling;
          }
        }
      });
      
      // ❌ Masquer les tabs de rapport (seulement "Rapport" visible)
      const rapportTabs = document.querySelectorAll(".rapport-tab-btn");
      rapportTabs.forEach(tab => {
        const target = tab.getAttribute('data-target');
        if (target !== "rapport-consultations") {
          tab.style.display = "none";
        } else {
          tab.style.display = "inline-block";
        }
      });
      
      // ❌ Masquer les sections des rapports complexes
      const rapportSections = document.querySelectorAll(".rapport-section-content");
      rapportSections.forEach(section => {
        if (section.id !== "rapport-consultations") {
          section.style.display = "none !important";
        }
      });
    }
  }

  // ================= HELPER: FILTER BY DOMAIN =================
  function filterByDomain(consultations) {
    if (authorizedRattachements.length === 0) {
      return consultations; // OSTIE: tous les rattachements
    }
    return consultations.filter(c => authorizedRattachements.includes(c.rattachement));
  }

  // ================= NAV BUTTONS =================
  navBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      const sectionName = this.dataset.section;
      
      navBtns.forEach(b => b.classList.remove("active"));
      this.classList.add("active");

      sections.forEach(s => s.classList.remove("active"));
      document.getElementById(sectionName).classList.add("active");

      if (sectionName === "dashboard") {
        loadDashboardData();
      }

      if (sectionName === "rapport") {
        // Charger tous les consultations du rapport (filtrés par domaine)
        displayReport(filterByDomain(allConsultations));
      }
      
      // Pour PRODUCTION_VIEWER, masquer le formulaire de consultation complètement
      if (sectionName === "formulaire" && userType === "PRODUCTION_VIEWER") {
        const formConsultation = document.getElementById("formConsultation");
        if (formConsultation) formConsultation.style.display = "none";
      }
    });
  });

  // ================= LOAD COLLABORATEURS =================
  async function loadCollaborateurs() {
    try {
      const res = await fetch(`${API_URL}?action=getCollaborateurs`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const json = await res.json();

      if (!json.success) throw new Error(json.error);

      allCollaborateurs = json.data;
      populateSelect("");
      // NE PAS appeler loadDashboardData() ici - elle sera appelée dans le login

    } catch (e) {
      // Ignorer les AbortErrors
      if (e.name !== 'AbortError') {
        console.error("Erreur chargement collaborateurs :", e);
        showMessage("⚠️ Erreur lors du chargement des collaborateurs : " + e.message, "error");
        collaborateurSelect.innerHTML = "<option>Erreur chargement: " + e.message + "</option>";
      }
    }
  }

  // ================= POPULATE SELECT WITH FILTER =================
  function populateSelect(filterText) {
    const filtered = allCollaborateurs.filter(c => {
      const searchStr = (c.matricule + " " + c.nom + " " + (c.prenom || "")).toLowerCase();
      return searchStr.includes(filterText.toLowerCase());
    });

    collaborateurSelect.innerHTML = '<option value="" disabled selected>-- Sélectionner --</option>';

    if (filtered.length === 0) {
      collaborateurSelect.innerHTML += "<option disabled>Aucun résultat</option>";
    } else {
      filtered.forEach(c => {
        const opt = document.createElement("option");
        opt.value = JSON.stringify(c);
        opt.textContent = `${c.matricule} - ${c.nom} ${c.prenom || ""}`;
        collaborateurSelect.appendChild(opt);
      });
    }
  }

  // ================= AUTO-LOGIN ON PAGE LOAD =================
  // Accepté - restoration automatique de la session
  if (isLoggedIn && userPassword && userType && userPermissions) {
    setTimeout(() => {
      loginPage.classList.remove("active");
      appPage.classList.add("active");
      setupUIForUserType(userType, userPermissions);
      
      if (Array.isArray(waitingPersonnes) && waitingPersonnes.length > 0) {
        updateWaitingList();
      }
      
      // Charger les données du dashboard
      loadCollaborateurs();
      loadWaitingList(); // Charger la liste d'attente depuis la base de données
      
      // Recharger la liste d'attente automatiquement toutes les 30 secondes
      startAutoRefreshWaitingList();
    }, 100);
  }

  // ================= SEARCH INPUT =================
  searchInput.addEventListener("input", function () {
    populateSelect(this.value);
  });

  // ================= CHANGE COLLABORATEUR =================
  collaborateurSelect.addEventListener("change", function () {
    if (!this.value) {
      matriculeSpan.textContent = "-";
      nomPrenomSpan.textContent = "-";
      fonctionSpan.textContent = "-";
      rattachementSpan.textContent = "-";
      formConsultation.style.display = "none";
      searchInput.value = "";
      return;
    }

    const c = JSON.parse(this.value);

    matriculeSpan.textContent = c.matricule || "-";
    nomPrenomSpan.textContent = `${c.nom} ${c.prenom || ""}`.trim();
    fonctionSpan.textContent = c.fonction || "-";
    rattachementSpan.textContent = c.rattachement || "-";

    // Réinitialiser les nouveaux champs
    typeConsultationSelect.value = "";
    lieuConsultationSelect.value = "";
    choixSelect.value = "";
    shiftSelect.value = "";
    retourImmediatelyCheckbox.checked = false;
    heureRetourGroup.style.display = "none";
    heureRetourInput.value = "";
    casGraveCheckbox.checked = false;
    commentairesRow.style.display = "none";
    commentairesInput.value = "";

    // Afficher le formulaire SEULEMENT pour OSTIE_ADMIN, pas pour PRODUCTION_VIEWER
    if (userType === "OSTIE_ADMIN") {
      formConsultation.style.display = "block";
    }
    setDateTimeNow();
  });

  // ================= VALIDATION =================
  function validateForm() {
    if (!collaborateurSelect.value) {
      showMessage("❌ Sélectionnez un collaborateur", "error");
      return false;
    }

    if (!dateInput.value) {
      showMessage("❌ Sélectionnez une date", "error");
      return false;
    }

    if (!heureSortieInput.value) {
      showMessage("❌ Entrez l'heure de sortie", "error");
      return false;
    }

    if (!typeConsultationSelect.value) {
      showMessage("❌ Sélectionnez le type de consultation", "error");
      return false;
    }

    if (!lieuConsultationSelect.value) {
      showMessage("❌ Sélectionnez le lieu de consultation", "error");
      return false;
    }

    if (!choixSelect.value) {
      showMessage("❌ Sélectionnez le choix (Day off / Jour)", "error");
      return false;
    }

    if (!shiftSelect.value) {
      showMessage("❌ Sélectionnez le shift", "error");
      return false;
    }

    if (retourImmediatelyCheckbox.checked && !heureRetourInput.value) {
      showMessage("❌ Entrez l'heure de retour", "error");
      return false;
    }

    return true;
  }

  // ================= RETOUR IMMEDIATELY CHECKBOX =================
  retourImmediatelyCheckbox.addEventListener("change", function () {
    if (this.checked) {
      heureRetourGroup.style.display = "block";
      heureRetourInput.disabled = false;
      const now = getCurrentDateTime();
      heureRetourInput.value = now.time;
    } else {
      heureRetourGroup.style.display = "none";
      heureRetourInput.value = "";
      heureRetourInput.disabled = true;
    }
  });

  // ================= CAS GRAVE CHECKBOX =================
  casGraveCheckbox.addEventListener("change", function () {
    if (this.checked) {
      commentairesRow.style.display = "block";
      commentairesInput.disabled = false;
    } else {
      commentairesRow.style.display = "none";
      commentairesInput.value = "";
      commentairesInput.disabled = true;
    }
  });

  // ================= AJOUTER À LA LISTE D'ATTENTE =================
  if (btnAddToWaiting) {
    btnAddToWaiting.addEventListener("click", async function () {
      // Debounce: empêcher les doubles clics
      if (isAddingToWaiting) {
        showMessage("⏳ Ajout en cours... Patientez", "warning");
        return;
      }
      
      if (!collaborateurSelect.value) {
        showMessage("❌ Sélectionnez un collaborateur", "error");
        return;
      }

      isAddingToWaiting = true;
      btnAddToWaiting.disabled = true;
      
      try {
        const c = JSON.parse(collaborateurSelect.value);
        // Collaborateur sélectionné - valider et ajouter
        
        // Vérifier que l'objet est valide
        if (!c || !c.matricule || !c.nom) {
          showMessage("❌ Données de collaborateur invalides", "error");
          return;
        }
        
        // Vérifier si déjà en attente
        if (waitingPersonnes.some(p => p.matricule === c.matricule)) {
          showMessage("⚠️ Cette personne est déjà en attente", "error");
          return;
        }

        // Obtenir l'heure actuelle CORRECTE (timezone locale)
        const now = new Date();
        const heureAjout = String(now.getHours()).padStart(2, "0") + ":" + 
                          String(now.getMinutes()).padStart(2, "0");

        // Construire l'URL avec le password pour vérification
        const pwd = userPassword || localStorage.getItem("userPassword") || "";
        const url = `${API_URL}?action=addToWaiting&password=${encodeURIComponent(pwd)}&matricule=${encodeURIComponent(c.matricule)}&nom=${encodeURIComponent(c.nom)}&fonction=${encodeURIComponent(c.fonction || "")}&rattachement=${encodeURIComponent(c.rattachement || "")}`;

        // Ajouter à la base de données via l'API
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Erreur serveur HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && result.success === true) {
          
          // Ajouter IMMÉDIATEMENT à la liste locale (optimistic update)
          const newPersonne = {
            matricule: c.matricule,
            nom: c.nom,
            fonction: c.fonction || "",
            rattachement: c.rattachement || "",
            heureAjout: heureAjout,
            dateAjout: new Date().toLocaleDateString('fr-FR')
          };
          waitingPersonnes.push(newPersonne);
          updateWaitingList();
          
          // Recharger depuis le serveur en arrière-plan
          loadWaitingList().catch(e => console.error("Erreur rechargement:", e));
          
          showMessage("✅ Ajouté à la liste d'attente");
          collaborateurSelect.value = "";
          if (searchInput) searchInput.value = "";
        } else {
          const errorMsg = result?.error || "Erreur inconnue";
          console.error("Erreur API:", errorMsg);
          showMessage(`❌ Erreur: ${errorMsg}`, "error");
        }
      } catch (e) {
        console.error("Erreur lors de l'ajout à la liste d'attente:", e.message);
        console.error("Stack trace:", e.stack);
        showMessage(`❌ Erreur: ${e.message}`, "error");
      } finally {
        // Réinitialiser le debounce
        isAddingToWaiting = false;
        btnAddToWaiting.disabled = false;
      }
    });
  }

  // Charger la liste d'attente depuis la base de données
  async function loadWaitingList() {
    try {
      const response = await fetch(`${API_URL}?action=getWaitingList`);
      
      if (!response.ok) {
        throw new Error(`Erreur serveur HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result && result.success === true && Array.isArray(result.data)) {
        let data = result.data.filter(row => {
          if (row.matricule === 'Matricule' || row.matricule === 'matricule') {
            return false;
          }
          if (!row.matricule || !row.nom) {
            return false;
          }
          return true;
        });
        
        waitingPersonnes = data;
        updateWaitingList();
      } else if (result && Array.isArray(result)) {
        let data = result.filter(row => {
          if (row.matricule === 'Matricule' || row.matricule === 'matricule') {
            return false;
          }
          if (!row.matricule || !row.nom) {
            return false;
          }
          return true;
        });
        
        waitingPersonnes = data;
        updateWaitingList();
      } else {
        waitingPersonnes = [];
        updateWaitingList();
      }
    } catch (e) {
      // Ignorer les AbortErrors (requête annulée lors de la navigation)
      if (e.name !== 'AbortError') {
        console.error("Erreur chargement attente:", e.message);
        waitingPersonnes = [];
        updateWaitingList();
      }
    }
  }

  function updateWaitingList() {
    // Vérifier que les éléments DOM existent
    if (!waitingCount || !waitingList || !waitingSection) {
      return;
    }
    
    // Double-vérifier que waitingPersonnes est un tableau valide
    if (!Array.isArray(waitingPersonnes)) {
      waitingPersonnes = [];
    }
    
    waitingCount.textContent = waitingPersonnes.length;
    waitingList.innerHTML = "";

    // Si aucune personne valide en attente, masquer la section
    if (waitingPersonnes.length === 0) {
      waitingSection.style.display = "none";
      return;
    }

    waitingSection.style.display = "block";

    waitingPersonnes.forEach((personne, index) => {
      // Vérifier que l'objet personne a les champs requis
      if (!personne || !personne.matricule || !personne.nom) {
        return;
      }
      
      const item = document.createElement("div");
      item.className = "waiting-item";
      
      // Extraire juste l'heure si c'est un format ISO (HH:MM:SS ou date ISO)
      let heureAffichage = personne.heureAjout || '-';
      
      // Afficher l'heure incorrecte si elle ne correspond pas au format attendu
      if (heureAffichage.includes('1899') || heureAffichage.includes('T')) {
        console.error("HEURE INCORRECTE - Redéploie code.gs!", {
          matricule: personne.matricule,
          nom: personne.nom,
          heureAjout: personne.heureAjout
        });
        // Essayer d'extraire l'heure du format ISO
        if (heureAffichage.includes('T')) {
          const parts = heureAffichage.split('T');
          heureAffichage = parts[1] ? parts[1].substring(0, 5) : heureAffichage;
        }
      } else if (heureAffichage.includes('h')) {
        // Format 06h59 → convertir en 06:59
        heureAffichage = heureAffichage.replace('h', ':');
      } else if (heureAffichage.length > 5) {
        // Format HH:MM:SS → cropper à HH:MM
        heureAffichage = heureAffichage.substring(0, 5);
      }
      
      item.innerHTML = `
        <input type="checkbox" class="waiting-checkbox" data-index="${index}">
        <div class="waiting-item-info">
          <div class="waiting-item-header">
            <div class="waiting-item-matricule">${personne.matricule}</div>
            <div class="waiting-item-heure">⏰ ${heureAffichage}</div>
          </div>
          <div class="waiting-item-nom">${personne.nom}</div>
          <div class="waiting-item-fonction">${personne.fonction || ''}</div>
        </div>
        <button class="waiting-item-delete" title="Annuler l'attente">✕</button>
      `;

      const checkbox = item.querySelector(".waiting-checkbox");
      checkbox.addEventListener("change", function () {
        if (this.checked) {
          // Décrocher tous les autres checkboxes
          document.querySelectorAll(".waiting-checkbox").forEach(cb => {
            if (cb !== this) cb.checked = false;
          });
          selectFromWaiting(index);
        }
      });

      // Bouton X pour annuler - masqué pour PRODUCTION_VIEWER
      const deleteBtn = item.querySelector(".waiting-item-delete");
      
      // Cacher le bouton pour PRODUCTION_VIEWER
      if (userType === "PRODUCTION_VIEWER") {
        deleteBtn.style.display = "none";
      } else {
        // Afficher et attacher le listener seulement pour OSTIE_ADMIN
        deleteBtn.addEventListener("click", async function (e) {
          e.stopPropagation();
          const matricule = personne.matricule;
          
          // Optimistic UI update - supprimer immédiatement du DOM
          const itemElement = deleteBtn.closest(".waiting-item");
          itemElement.style.opacity = "0.5";
          itemElement.style.pointerEvents = "none";
          
          showMessage("✅ Personne supprimée de l'attente");
          
          // Supprimer avec le password pour vérification (en arrière-plan)
          try {
            const response = await fetch(`${API_URL}?action=removeFromWaiting&matricule=${encodeURIComponent(matricule)}&password=${encodeURIComponent(userPassword)}`);
            const result = await response.json();
            
            if (result.success) {
              // Supprimer complètement du DOM
              itemElement.remove();
            } else if (result.error && result.error.includes("Accès refusé")) {
              // Recharger la liste en cas d'erreur d'accès
              itemElement.style.opacity = "1";
              itemElement.style.pointerEvents = "auto";
              showMessage("❌ Vous n'avez pas la permission de supprimer de la liste d'attente", "error");
              await loadWaitingList();
            } else {
              // Recharger la liste en cas d'erreur
              itemElement.style.opacity = "1";
              itemElement.style.pointerEvents = "auto";
              showMessage("❌ Erreur lors de la suppression", "error");
              await loadWaitingList();
            }
          } catch (e) {
            console.error("Erreur suppression:", e);
            itemElement.style.opacity = "1";
            itemElement.style.pointerEvents = "auto";
            showMessage("❌ Erreur lors de la suppression", "error");
            await loadWaitingList();
          }
        });
      }

      waitingList.appendChild(item);
    });
    
    // Nettoyer les attentes expirées (plus d'un jour)
    cleanExpiredWaiting();
  }

  // Nettoyer automatiquement les attentes de plus d'un jour
  async function cleanExpiredWaiting() {
    if (typeof waitingPersonnes === 'undefined' || !Array.isArray(waitingPersonnes)) {
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const toDelete = [];
    
    for (const personne of waitingPersonnes) {
      if (!personne.dateAjout) continue;
      
      // Parser la date (format: "31/03/2026" ou ISO)
      let dateAjout;
      if (personne.dateAjout.includes('/')) {
        // Format français DD/MM/YYYY
        const parts = personne.dateAjout.split('/');
        dateAjout = new Date(parts[2], parts[1] - 1, parts[0]);
      } else {
        // Format ISO YYYY-MM-DD
        dateAjout = new Date(personne.dateAjout);
      }
      
      // Vérifier si c'est d'hier ou plus ancien
      dateAjout.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - dateAjout) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        toDelete.push(personne.matricule);
      }
    }
    
    // Supprimer les entrées expirées
    for (const matricule of toDelete) {
      try {
        await fetch(`${API_URL}?action=removeFromWaiting&matricule=${encodeURIComponent(matricule)}`);
      } catch (e) {
        console.error("Erreur suppression:", e);
      }
    }
    
    // Recharger si des suppression ont été faites
    if (toDelete.length > 0) {
      setTimeout(() => loadWaitingList(), 500);
    }
  }

  // Démarrer l'auto-refresh de la liste d'attente
  function startAutoRefreshWaitingList() {
    // Arrêter tout intervalle existant
    stopAutoRefreshWaitingList();
    
    // Recharger toutes les 30 secondes
    waitingListRefreshInterval = setInterval(() => {
      loadWaitingList().catch(e => {
        // Ignorer les AbortErrors (requête interrompue)
        if (e.name !== 'AbortError') {
          console.error("Erreur auto-refresh:", e);
        }
      });
    }, 30000); // 30 secondes
  }

  // Arrêter l'auto-refresh de la liste d'attente
  function stopAutoRefreshWaitingList() {
    if (waitingListRefreshInterval) {
      clearInterval(waitingListRefreshInterval);
      waitingListRefreshInterval = null;
    }
  }

  function selectFromWaiting(index) {
    // Debounce: empêcher les sélections multiples rapides
    if (selectingFromWaiting) {
      return;
    }
    
    if (index < 0 || index >= waitingPersonnes.length) {
      console.error("Index invalide");
      return;
    }
    
    const personne = waitingPersonnes[index];
    if (!personne || !personne.matricule || !personne.nom) {
      console.error("Personne invalide à l'index");
      return;
    }
    
    // Chercher le collaborateur complet dans allCollaborateurs
    let collaborateur = allCollaborateurs.find(c => c.matricule === personne.matricule);
    
    // Si pas trouvé, créer l'objet avec les données de l'attente
    if (!collaborateur) {
      collaborateur = {
        matricule: personne.matricule,
        nom: personne.nom,
        fonction: personne.fonction || "-",
        rattachement: personne.rattachement || "-",
        prenom: ""
      };
    }
    
    // Vérifier que les éléments du formulaire existent
    if (!collaborateurSelect || !matriculeSpan || !nomPrenomSpan || !fonctionSpan || !rattachementSpan || !dateInput || !heureSortieInput) {
      console.error("Éléments de formulaire manquants");
      return;
    }
    
    selectingFromWaiting = true;
    
    // Régénérer les options du select
    populateSelect("");
    
    // S'assurer que l'option existe dans le select
    const optionValue = JSON.stringify(collaborateur);
    let option = Array.from(collaborateurSelect.options).find(opt => opt.value === optionValue);
    
    if (!option) {
      // Créer l'option dynamiquement si elle n'existe pas
      option = document.createElement("option");
      option.value = optionValue;
      option.textContent = `${collaborateur.matricule} - ${collaborateur.nom}`;
      collaborateurSelect.appendChild(option);
    }
    
    // Assigner la valeur du select
    collaborateurSelect.value = optionValue;
    
    // Afficher les détails
    matriculeSpan.textContent = collaborateur.matricule;
    nomPrenomSpan.textContent = collaborateur.nom + (collaborateur.prenom ? " " + collaborateur.prenom : "");
    fonctionSpan.textContent = collaborateur.fonction || "-";
    rattachementSpan.textContent = collaborateur.rattachement || "-";
    
    // Remplir heure de sortie automatiquement
    const todayISO = getTodayMadagascar(); // Format YYYY-MM-DD
    const now = new Date();
    const time = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    
    dateInput.value = todayISO;
    heureSortieInput.value = time;

    // Réinitialiser les autres champs
    retourImmediatelyCheckbox.checked = false;
    heureRetourGroup.style.display = "none";
    heureRetourInput.value = "";
    heureRetourInput.disabled = true;
    casGraveCheckbox.checked = false;
    commentairesRow.style.display = "none";
    commentairesInput.value = "";
    commentairesInput.disabled = true;
    typeConsultationSelect.value = "";
    lieuConsultationSelect.value = "";
    choixSelect.value = "";
    shiftSelect.value = "";

    // ✅ AFFICHER LE FORMULAIRE SEULEMENT POUR OSTIE_ADMIN
    if (userType === "OSTIE_ADMIN") {
      formConsultation.style.display = "block";
    }

    // ⚠️ IMPORTANT: NE PAS retirer de la liste d'attente à la sélection
    // Le collaborateur sera retiré APRÈS l'enregistrement du formulaire
    selectingFromWaiting = false;

    showMessage("✅ Personne sélectionnée, veuillez compléter le formulaire");
  }

  // ================= COUNT TODAY CONSULTATIONS FOR MATRICULE =================
  function countTodayConsultationsForMatricule(matricule) {
    const todayConsultations = getTodayConsultations();
    return todayConsultations.filter(c => c.matricule === matricule).length;
  }

  // ================= SAVE CONSULTATION =================
  formConsultation.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Vérification de permissions: bloquer si mode production (readonly)
    if (userPermissions === "readonly") {
      showMessage("❌ Accès refusé: Mode production en lecture seule", "error");
      return;
    }

    if (!validateForm()) return;

    const c = JSON.parse(collaborateurSelect.value);

    // Vérifier si la personne a une consultation EN COURS (sans heure de retour) aujourd'hui
    // Permet plusieurs consultations si les précédentes sont clôturées
    const todayConsultations = getTodayConsultations();
    const openConsultationToday = todayConsultations.find(con => 
      con.matricule === c.matricule && (!con.heureRetour || con.heureRetour.trim() === "")
    );
    
    if (openConsultationToday) {
      showMessage(`⚠️ ALERTE: ${c.nom} a une consultation EN COURS aujourd'hui. Veuillez la clôturer avant d'en ajouter une nouvelle.`, "error");
      return;
    }

    const params = new URLSearchParams({
      action: "saveConsultation",
      password: userPassword || localStorage.getItem("userPassword") || "",
      matricule: c.matricule,
      nom: c.nom,
      prenom: c.prenom || "",
      fonction: c.fonction,
      rattachement: c.rattachement,
      typeConsultation: typeConsultationSelect.value,
      lieuConsultation: lieuConsultationSelect.value,
      choix: choixSelect.value,
      shift: shiftSelect.value,
      dateSortie: convertDateToISO(dateInput.value),
      heureSortie: heureSortieInput.value,
      heureRetour: retourImmediatelyCheckbox.checked ? heureRetourInput.value : "",
      retourImmediatelyChecked: retourImmediatelyCheckbox.checked,
      casGrave: casGraveCheckbox.checked ? "oui" : "non",
      commentaires: commentairesInput.value
    });

    try {
      btnSave.disabled = true;
      btnSave.textContent = "⏳ Enregistrement...";

      const res = await fetch(`${API_URL}?${params}`);
      const json = await res.json();

      if (json.success) {
        showMessage("✅ Enregistré avec succès !");
        
        // ✅ Retirer de la liste d'attente APRÈS enregistrement
        const matricule = c.matricule;
        if (matricule) {
          const pwd = userPassword || localStorage.getItem("userPassword") || "";
          
          fetch(`${API_URL}?action=removeFromWaiting&password=${encodeURIComponent(pwd)}&matricule=${encodeURIComponent(matricule)}`)
            .then(r => r.json())
            .then(result => {
              if (result.success) {
                loadWaitingList();
              }
            })
            .catch(e => console.error("Erreur suppression:", e));
        }
        
        resetForm();
        // Recharger les consultations pour mettre à jour la liste en cache
        await loadDashboardData();
      } else {
        showMessage("❌ Erreur : " + json.error, "error");
        btnSave.disabled = false;
        btnSave.textContent = "✓ Enregistrer";
      }

    } catch (e) {
      console.error(e);
      showMessage("❌ Erreur serveur", "error");
      btnSave.disabled = false;
      btnSave.textContent = "✓ Enregistrer";
    }
  });

  // ================= CANCEL CONSULTATION =================
  btnCancel.addEventListener("click", function (e) {
    e.preventDefault();
    
    // Réinitialiser la sélection du collaborateur et le formulaire
    searchInput.value = "";
    collaborateurSelect.value = "";
    matriculeSpan.textContent = "-";
    nomPrenomSpan.textContent = "-";
    fonctionSpan.textContent = "-";
    rattachementSpan.textContent = "-";
    
    dateInput.value = "";
    heureSortieInput.value = "";
    typeConsultationSelect.value = "";
    lieuConsultationSelect.value = "";
    choixSelect.value = "";
    shiftSelect.value = "";
    heureRetourInput.value = "";
    heureRetourGroup.style.display = "none";
    heureRetourInput.disabled = true;
    retourImmediatelyCheckbox.checked = false;
    casGraveCheckbox.checked = false;
    commentairesRow.style.display = "none";
    commentairesInput.value = "";
    commentairesInput.disabled = true;
    
    formConsultation.style.display = "none";
    successMessage.textContent = "";
    
    showMessage("🔄 Formulaire annulé", "success");
  });

  function resetForm() {
    searchInput.value = "";
    collaborateurSelect.value = "";
    matriculeSpan.textContent = "-";
    nomPrenomSpan.textContent = "-";
    fonctionSpan.textContent = "-";
    rattachementSpan.textContent = "-";
    formConsultation.style.display = "none";
    dateInput.value = "";
    heureSortieInput.value = "";
    typeConsultationSelect.value = "";
    lieuConsultationSelect.value = "";
    choixSelect.value = "";
    shiftSelect.value = "";
    retourImmediatelyCheckbox.checked = false;
    heureRetourGroup.style.display = "none";
    heureRetourInput.value = "";
    heureRetourInput.disabled = true;
    casGraveCheckbox.checked = false;
    commentairesRow.style.display = "none";
    commentairesInput.value = "";
    commentairesInput.disabled = true;
    btnSave.disabled = false;
    btnSave.textContent = "✓ Enregistrer";
  }

  // ================= DASHBOARD =================
  async function loadDashboardData() {
    try {
      // Vérifier que userPassword est défini (le récupérer du localStorage si nécessaire)
      const pwd = userPassword || localStorage.getItem("userPassword") || "";
      if (!pwd) {
        console.error("Erreur: userPassword non trouvé!");
        showMessage("❌ Erreur: session invalide. Veuillez vous reconnecter.", "error");
        return;
      }
      
      const res = await fetch(`${API_URL}?action=getConsultations&password=${encodeURIComponent(pwd)}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.error);

      allConsultations = json.data || [];
      
      // Filtrer les données
      const rattachmentsReels = [...new Set(allConsultations.map(c => c.rattachement))];
      
      const filteredData = filterByDomain(allConsultations);
      
      updateStatistics();
      
      // PRODUCTION_VIEWER: charger la liste d'attente détaillée
      if (userType === "PRODUCTION_VIEWER") {
        updatePendingList(); // Afficher les personnes en attente de retour
        return;
      }
      
      // OSTIE_ADMIN: charger tout
      updateCharts();
      updatePendingList();
      updateTodayConsultationsTable(); // Afficher la table des consultations du jour
      updateDashboardInfo(); // Mettre à jour l'indicateur de période
      populateFilterSelects(); // Remplir les sélects des filtres
      displayReport(filteredData); // Afficher le rapport initial (filtré)

    } catch (e) {
      // Ignorer les AbortErrors (requête annulée lors de la navigation)
      if (e.name !== 'AbortError') {
        console.error("Erreur chargement dashboard :", e);
        if (reportTableBody) {
          reportTableBody.innerHTML = '<tr><td colspan="12" style="color: red;">Erreur: ' + e.message + '</td></tr>';
        }
      }
    }
  }

  // ================= UTILITY FUNCTIONS FOR FILTERING =================
  /**
   * Compte les consultations par type de résultat
   * @param {Array} consultations - Liste des consultations
   * @param {String} resultType - Type de résultat à compter ("Repos médical", "Assistante maternelle", etc.)
   * @returns {Number} Nombre de consultations du type spécifié
   */
  function countByResult(consultations, resultType) {
    return consultations.filter(c => c.resultat === resultType).length;
  }

  /**
   * Obtient les consultations d'aujourd'hui
   * @returns {Array} Consultations du jour
   */
  function getTodayConsultations() {
    const todayISO = getTodayMadagascar();
    return allConsultations.filter(c => {
      const correctedDate = extractAndCorrectDate(c.date);
      return correctedDate === todayISO;
    });
  }

  function updateStatistics() {
    // ========== AFFICHER LES STATISTIQUES D'AUJOURD'HUI SEULEMENT ==========
    const todayConsultations = getTodayConsultations();
    
    // ========== FILTRÉES PAR DOMAINE ==========
    const filteredToday = filterByDomain(todayConsultations);
    
    const total = filteredToday.length;
    
    // ========== EN ATTENTE: TOTAL de TOUS les jours et TOUS les domaines ==========
    const enAttenteTotal = allConsultations.filter(c => {
      const heureRetour = c.heureRetour || c.heure_retour || "";
      return !heureRetour || heureRetour.trim() === "";
    }).length;
    
    // ========== EN ATTENTE dans MON DOMAINE (d'aujourd'hui) ==========
    const enAttenteMyDomain = filteredToday.filter(c => {
      const heureRetour = c.heureRetour || c.heure_retour || "";
      return !heureRetour || heureRetour.trim() === "";
    }).length;
    
    // ========== REPOS MÉDICAL: Filtrés par domaine ==========
    const repos = filteredToday.filter(c => c.resultat === "Repos médical").length;
    
    // ========== JOURS RM: Somme FILTRÉE par domaine ==========
    const joursRM = filteredToday.reduce((sum, c) => {
      const jours = parseFloat(c.nbJourRM) || 0;
      return sum + jours;
    }, 0);

    statTotal.textContent = total;
    // Afficher seulement le nombre en attente d'aujourd'hui
    statEnAttente.textContent = enAttenteMyDomain;
    statRepos.textContent = repos;
    
    // Si le stat pour jours RM existe, le remplir
    const statJoursRM = document.getElementById("statJoursRM");
    if (statJoursRM) {
      statJoursRM.textContent = joursRM.toFixed(1);
    }

    // Afficher les cartes de rattachement si en mode production
    if (userPermissions === "readonly") {
      updateRattachementCards();
    }
  }

  // ================= UPDATE RATTACHEMENT CARDS =================
  function updateRattachementCards() {
    const todayConsultations = getTodayConsultations();
    
    // Grouper par rattachement
    const rattachementMap = {};
    todayConsultations.forEach(c => {
      const rattachement = c.rattachement || "Non spécifié";
      if (!rattachementMap[rattachement]) {
        rattachementMap[rattachement] = {
          name: rattachement,
          total: 0,
          complete: 0,
          pending: 0
        };
      }
      rattachementMap[rattachement].total++;
      
      const heureRetour = c.heureRetour || c.heure_retour || "";
      if (heureRetour && heureRetour.trim() !== "") {
        rattachementMap[rattachement].complete++;
      } else {
        rattachementMap[rattachement].pending++;
      }
    });
    
    // Convertir en tableau et trier
    const rattachements = Object.values(rattachementMap).sort((a, b) => b.total - a.total);
    
    const cardsSection = document.getElementById("rattachementCardsSection");
    const cardsContainer = document.getElementById("rattachementCards");
    
    if (!cardsContainer) return;
    
    // Afficher la section si au moins un rattachement existe
    if (rattachements.length > 0) {
      cardsSection.style.display = "block";
    } else {
      cardsSection.style.display = "none";
      return;
    }
    
    // Générer les cartes
    cardsContainer.innerHTML = rattachements.map(r => {
      const percentComplete = r.total > 0 ? Math.round((r.complete / r.total) * 100) : 0;
      const isAlert = r.pending > 0;
      const cardClass = isAlert ? "rattachement-card alert" : "rattachement-card complete";
      
      return `
        <div class="${cardClass}">
          <div class="rattachement-card-title">🏢 ${r.name}</div>
          <div class="rattachement-card-stat">
            <span class="rattachement-card-stat-label">Total:</span>
            <span class="rattachement-card-stat-value">${r.total}</span>
          </div>
          <div class="rattachement-card-stat">
            <span class="rattachement-card-stat-label">✅ Consultés:</span>
            <span class="rattachement-card-stat-value">${r.complete}</span>
          </div>
          <div class="rattachement-card-stat">
            <span class="rattachement-card-stat-label">⏳ En attente de retour:</span>
            <span class="rattachement-card-stat-value">${r.pending}</span>
          </div>
          <div class="rattachement-card-progress">
            <div class="rattachement-card-progress-label">Taux de complétion: ${percentComplete}%</div>
            <div class="rattachement-card-progress-bar">
              <div class="rattachement-card-progress-fill" style="width: ${percentComplete}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // ========== TABLEAU DÉTAILLÉ DES COLLABORATEURS ==========
  function updateCollaboratorsTable(consultations) {
    // Grouper par collaborateur
    const collaboratorMap = {};
    const uniqueDates = new Set();
    
    consultations.forEach(c => {
      const key = c.matricule + "|" + c.nom;
      if (!collaboratorMap[key]) {
        collaboratorMap[key] = {
          matricule: c.matricule,
          nom: c.nom,
          fonction: c.fonction,
          rattachement: c.rattachement,
          count: 0,
          joursRM: 0,
          shiftNuit: 0
        };
      }
      collaboratorMap[key].count++;
      
      // Compter les jours RM
      if (c.resultat === "Repos médical") {
        const jours = parseInt(c.nbJourRM) || 0;
        collaboratorMap[key].joursRM += jours;
      }
      
      // Compter les consultations en shift nuit
      if (c.shift === "Nuit") {
        collaboratorMap[key].shiftNuit++;
      }
      
      // Compter les jours uniques pour calculer le seuil
      const correctedDate = extractAndCorrectDate(c.date);
      if (correctedDate !== "-") {
        uniqueDates.add(correctedDate);
      }
    });
    
    // ========== CALCULER LE SEUIL DE COULEUR DYNAMIQUEMENT ==========
    const numberOfDays = uniqueDates.size;
    let threshold = 3;
    
    if (numberOfDays === 1) {
      threshold = 999;
    } else if (numberOfDays <= 3) {
      threshold = 6;
    } else if (numberOfDays <= 7) {
      threshold = 3 * numberOfDays / 7;
    } else {
      threshold = 2 * numberOfDays / 7;
    }
    
    // Convertir en tableau et trier
    const collaborators = Object.values(collaboratorMap).sort((a, b) => b.count - a.count);
    
    // Remplir le tableau HTML
    const tbody = document.getElementById("collaboratorsTableBody");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    collaborators.forEach(collab => {
      const row = document.createElement("tr");
      
      // Colorer en rouge si Jours RM > 3 OR Nb Consultations > 3
      const joursRM = parseFloat(collab.joursRM) || 0;
      const nbConsultations = collab.count || 0;
      const isHighAlert = joursRM > 3 || nbConsultations > 3;
      
      if (isHighAlert) {
        row.classList.add("high-alert");
      }
      
      row.innerHTML = `
        <td><strong>${collab.nom}</strong></td>
        <td style="text-align: center;">${collab.count}</td>
        <td style="text-align: center;">${collab.joursRM}</td>
        <td style="text-align: center;">${collab.shiftNuit}</td>
        <td>${collab.fonction || "-"}</td>
        <td>${collab.rattachement || "-"}</td>
      `;
      
      tbody.appendChild(row);
    });
    
    // Attacher les événements de tri et filtre
    attachSortableHeaders();
    attachTableFilters('collaborators');
  }

  function updateCharts() {
    // ========== UTILISER LES CONSULTATIONS D'AUJOURD'HUI SEULEMENT ==========
    const todayConsultations = getTodayConsultations();
    const filteredToday = filterByDomain(todayConsultations);
    
    const consultation = filteredToday.filter(c => c.resultat === "Consultation médical").length;
    const repos = filteredToday.filter(c => c.resultat === "Repos médical").length;
    const assistante = filteredToday.filter(c => c.resultat === "Assistante maternelle").length;
    const total = consultation + repos + assistante;

    // Chart Camembert - Répartition de tous les types de résultats
    const ctxCamembert = document.getElementById("chartCamembert").getContext("2d");
    if (chartCamembert) chartCamembert.destroy();
    
    chartCamembert = new Chart(ctxCamembert, {
      type: "doughnut",
      data: {
        labels: [
          `Consultation Médical (${consultation})`,
          `Repos Médical (${repos})`,
          `Assistante Maternelle (${assistante})`
        ],
        datasets: [{
          data: [consultation, repos, assistante],
          backgroundColor: ["#667eea", "#e74c3c", "#f39c12"],
          borderColor: "#fff",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { 
            position: "bottom",
            labels: {
              font: { size: 12 },
              padding: 15
            }
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${value} (${percent}%)`;
              }
            }
          }
        }
      }
    });

    // Chart Jours - Consultations totales par jour (filtrées par domaine)
    const filteredAllConsultations = filterByDomain(allConsultations);
    const consultationParJour = {};
    filteredAllConsultations.forEach(c => {
      const correctedDate = extractAndCorrectDate(c.date);
      const dateKey = correctedDate !== "-" ? correctedDate : "";
      consultationParJour[dateKey] = (consultationParJour[dateKey] || 0) + 1;
    });

    const dates = Object.keys(consultationParJour).sort().slice(-7);
    const counts = dates.map(d => consultationParJour[d]);
    
    // Formater les dates en DD-MM-YYYY pour plus de lisibilité
    const formattedDates = dates.map(d => {
      const parts = d.split("-");
      return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : d;
    });

    const ctxJours = document.getElementById("chartJours").getContext("2d");
    if (chartJours) chartJours.destroy();
    
    chartJours = new Chart(ctxJours, {
      type: "bar",
      data: {
        labels: formattedDates,
        datasets: [{
          label: "Consultations",
          data: counts,
          backgroundColor: "#667eea",
          borderColor: "#764ba2",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  // ================= UPDATE TODAY CONSULTATIONS TABLE =================
  function updateTodayConsultationsTable(consultations = null) {
    let filteredConsultations;
    
    if (consultations) {
      // Si des consultations sont passées en paramètre, les utiliser (déjà filtrées)
      filteredConsultations = consultations;
    } else {
      // Sinon, utiliser le comportement par défaut
      const todayConsultations = getTodayConsultations();
      filteredConsultations = filterByDomain(todayConsultations);
    }
    
    const todayConsultationsBody = document.getElementById("todayConsultationsBody");
    
    if (!todayConsultationsBody) return;
    
    if (filteredConsultations.length === 0) {
      todayConsultationsBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #999;">Aucune consultation d\'aujourd\'hui</td></tr>';
      return;
    }
    
    todayConsultationsBody.innerHTML = filteredConsultations.map(c => {
      const heureRetour = c.heure_retour || c.heureRetour || "";
      const hasRetour = heureRetour && heureRetour.trim() !== "";
      const statut = hasRetour ? "✅ Complète" : "⏳ En attente";
      const statutClass = hasRetour ? "complete" : "pending";
      
      return `
        <tr>
          <td><strong>${c.nom || ''}</strong></td>
          <td>${c.matricule || ''}</td>
          <td>${c.type_consultation || c.typeConsultation || ''}</td>
          <td>${c.lieu_consultation || c.lieuConsultation || ''}</td>
          <td>${c.shift || ''}</td>
          <td>${extractTimeFromISO(c.heure_sortie || c.heureSortie)}</td>
          <td>${hasRetour ? extractTimeFromISO(heureRetour) : '--'}</td>
          <td>${c.resultat || '--'}</td>
          <td><span class="statut-badge ${statutClass}">${statut}</span></td>
        </tr>
      `;
    }).join("");
    
    // ========== RECHERCHE DANS LA TABLE ==========
    const searchInput = document.getElementById("searchTodayConsultations");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase();
        const rows = todayConsultationsBody.querySelectorAll("tr");
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(searchTerm) ? "" : "none";
        });
      });
    }
  }

  /**
   * Obtient les consultations en attente de retour
   * @returns {Array} Consultations sans heure de retour enregistrée
   */
  function getPendingConsultations() {
    // Pour PRODUCTION_VIEWER: afficher TOUTES les consultations
    if (userType === "PRODUCTION_VIEWER") {
      console.log("🔍 PRODUCTION_VIEWER mode: on affiche toutes les consultations");
      return allConsultations || [];
    }
    
    // Pour OSTIE_ADMIN: retourner seulement celles avec heure de sortie (en attente OU complétées)
    return allConsultations.filter(c => {
      const heureSortie = c.heureSortie || c.heure_sortie || "";
      return heureSortie && heureSortie.trim() !== "";
    });
  }

  // ================= ATTACH SORTABLE HEADERS =================
  function attachSortableHeaders() {
    document.querySelectorAll(".sortable-header").forEach(header => {
      header.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const colIndex = parseInt(this.dataset.col);
        const tableType = this.dataset.table;
        
        sortPendingTable(colIndex, tableType);
        
        // Mettre à jour l'affichage des flèches
        updateSortArrows(tableType);
      });
    });
  }

  function updateSortArrows(tableType) {
    const headers = document.querySelectorAll(`.sortable-header[data-table="${tableType}"]`);
    headers.forEach(header => {
      const arrow = header.querySelector(".sort-arrow");
      const colIndex = parseInt(header.dataset.col);
      
      if (sortState[tableType].column === colIndex) {
        arrow.textContent = sortState[tableType].ascending ? "⬆️" : "⬇️";
      } else {
        arrow.textContent = "⬆️";
      }
    });
  }

  // ================= SORT PENDING TABLE =================
  let sortState = { waiting: { column: null, ascending: true }, completed: { column: null, ascending: true }, collaborators: { column: null, ascending: true } };

  function sortPendingTable(columnIndex, tableType) {
    let tbody;
    if (tableType === 'waiting') {
      tbody = document.getElementById("pendingWaitingTableBody");
    } else if (tableType === 'completed') {
      tbody = document.getElementById("pendingCompletedTableBody");
    } else if (tableType === 'collaborators') {
      tbody = document.getElementById("collaboratorsTableBody");
    }
    
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll("tr"));
    
    // Changer direction du tri
    if (sortState[tableType].column === columnIndex) {
      sortState[tableType].ascending = !sortState[tableType].ascending;
    } else {
      sortState[tableType].column = columnIndex;
      sortState[tableType].ascending = true;
    }

    // Trier les lignes
    rows.sort((a, b) => {
      const cellA = a.cells[columnIndex]?.textContent.trim() || "";
      const cellB = b.cells[columnIndex]?.textContent.trim() || "";
      
      // Essayer de trier numériquement si possible
      const numA = parseFloat(cellA);
      const numB = parseFloat(cellB);
      
      let comparison;
      if (!isNaN(numA) && !isNaN(numB)) {
        comparison = numA - numB;
      } else {
        comparison = cellA.localeCompare(cellB, 'fr');
      }
      
      return sortState[tableType].ascending ? comparison : -comparison;
    });

    // Réafficher les lignes triées
    tbody.innerHTML = "";
    rows.forEach(row => {
      const newRow = row.cloneNode(true);
      tbody.appendChild(newRow);
    });

    // Réattacher les événements selon le type de table
    if (tableType === 'waiting' || tableType === 'completed') {
      attachPendingActionListeners();
    }
  }

  // ================= UPDATE PENDING LIST =================
  function updatePendingList() {
    console.log("📋 updatePendingList appelée - userType:", userType);
    console.log("📊 allConsultations disponibles?", allConsultations, "Length:", allConsultations?.length);
    
    const allPending = getPendingConsultations(); // TOUS les en attente
    console.log("📊 Tous les en attente de sortie:", allPending.length);
    console.log("🔍 Détail allPending:", allPending);
    
    const filteredPending = filterByDomain(allPending); // Filtrés par domaine
    console.log("🎯 En attente filtrés par domaine:", filteredPending.length);
    console.log("🔍 Détail filteredPending:", filteredPending);
    
    const waitingTableBody = document.getElementById("pendingWaitingTableBody");
    const completedTableBody = document.getElementById("pendingCompletedTableBody");
    
    console.log("✅ waitingTableBody trouvé?", !!waitingTableBody);
    console.log("✅ completedTableBody trouvé?", !!completedTableBody);
    
    if (!waitingTableBody || !completedTableBody) {
      console.error("Éléments DOM manquants! waitingTableBody:", waitingTableBody, "completedTableBody:", completedTableBody);
      return;
    }

    // Mettre à jour le nombre d'attente dans la section
    const pendingReturnCount = document.getElementById("pendingReturnCount");
    if (pendingReturnCount) {
      pendingReturnCount.textContent = allPending.length; // Nombre TOTAL en attente de retour
    }

    // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
    const todayDate = getTodayMadagascar();

    // Séparer en deux listes : en attente et complétée
    let waitingList = filteredPending.filter(c => !(c.heureRetour && c.resultat));
    
    // Pour PRODUCTION_VIEWER: afficher SEULEMENT les collaborateurs d'aujourd'hui SANS heure de retour
    if (userType === "PRODUCTION_VIEWER") {
      waitingList = filteredPending.filter(c => {
        const consultationDate = extractAndCorrectDate(c.date);
        const hasReturn = c.heureRetour && c.heureRetour.trim() !== "";
        const isToday = consultationDate === todayDate;
        return isToday && !hasReturn;
      });
    }
    
    const completedList = filteredPending.filter(c => {
      // Complétée = heure retour + résultat + DATE D'AUJOURD'HUI
      if (!(c.heureRetour && c.resultat)) return false;
      
      // Vérifier si la date est aujourd'hui
      const consultationDate = extractAndCorrectDate(c.date);
      return consultationDate === todayDate;
    });
    console.log("✅ Complétées aujourd'hui:", completedList.length);

    // ===== POUR PRODUCTION_VIEWER: TABLE SIMPLIFIÉE ET DÉTAILLÉE =====
    if (userType === "PRODUCTION_VIEWER") {
      console.log("🔧 Mode PRODUCTION_VIEWER - Affichage table simplifiée");
      
      const pendingWaitingTable = document.getElementById("pendingWaitingTable");
      const pendingCompletedTable = document.getElementById("pendingCompletedTable");
      const tableFilters = document.querySelectorAll(".table-filter-row");
      const sortHeaders = document.querySelectorAll(".sortable-header");
      
      console.log("🔧 pendingWaitingTable trouvé?", !!pendingWaitingTable);
      console.log("🔧 pendingCompletedTable trouvé?", !!pendingCompletedTable);
      
      // S'assurer que la section est visible
      const pendingSection = document.querySelector(".pending-section");
      if (pendingSection) {
        pendingSection.style.display = "block";
        console.log("✅ Section 'pending-section' affichée");
      }
      
      // Adapter les en-têtes pour PRODUCTION_VIEWER
      const thead = pendingWaitingTable?.querySelector("thead tr:first-child");
      if (thead) {
        // Réinitialiser les en-têtes avec seulement 8 colonnes
        thead.innerHTML = `
          <th>Matricule</th>
          <th>Nom & Prénom</th>
          <th>Fonction</th>
          <th>Rattachement</th>
          <th>Type Consultation</th>
          <th>Lieu</th>
          <th>Date</th>
          <th>Heure Sortie</th>
        `;
        console.log("✅ En-têtes adaptés pour PRODUCTION_VIEWER");
      }
      
      // Masquer les filtres pour PRODUCTION_VIEWER
      tableFilters.forEach(tr => tr.style.display = "none");
      console.log("✅ Filtres masqués - nombre:", tableFilters.length);
      
      waitingTableBody.innerHTML = "";
      
      if (waitingList.length === 0) {
        console.log("ℹ️ Aucune personne en attente de retour");
        waitingTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #27ae60; font-weight: bold;">✓ Aucune personne en attente de retour !</td></tr>';
      } else {
        console.log("📝 Affichage de", waitingList.length, "personnes en attente");
        
        waitingList.forEach((c, idx) => {
          console.log(`  ${idx + 1}. ${c.matricule} - ${c.nom} (Sortie: ${c.heureSortie})`);
          
          const row = document.createElement("tr");
          
          // Fallbacks pour les noms de propriétés alternatifs
          const nom = c.nom || c.Nom || c.NAME || "";
          const matricule = c.matricule || c.Matricule || c.MATRICULE || "";
          const prenom = c.prenom || c.Prenom || c.PRENOM || "";
          const fonction = c.fonction || c.Fonction || c.FONCTION || "";
          const rattachement = c.rattachement || c.Rattachement || c.RATTACHEMENT || c.serc || c.Serc || c.domaine || "";
          const typeConsultation = c.typeConsultation || c.TypeConsultation || c.TYPE_CONSULTATION || c.Type || "";
          const lieu = c.lieuConsultation || c.LieuConsultation || c.LIEU_CONSULTATION || c.Lieu || "";
          const date = c.date || c.Date || c.DATE || "";
          const heureSortie = c.heureSortie || c.HeureSortie || c.HEURE_SORTIE || c.heure_sortie || "";
          
          row.innerHTML = `
            <td class="prod-matricule"><strong>${matricule}</strong></td>
            <td class="prod-nom"><strong>${nom} ${prenom}</strong></td>
            <td class="prod-fonction">${fonction || "-"}</td>
            <td class="prod-rattachement">${rattachement || "-"}</td>
            <td class="prod-type">${typeConsultation || "-"}</td>
            <td class="prod-lieu">${lieu || "-"}</td>
            <td class="prod-date">${extractAndCorrectDate(date) || "-"}</td>
            <td class="prod-heure">${extractTimeFromISO(heureSortie) || "-"}</td>
          `;
          
          waitingTableBody.appendChild(row);
        });
      }
      
      // Masquer la table des complétées
      if (pendingCompletedTable?.parentElement) {
        pendingCompletedTable.parentElement.style.display = "none";
      }
      
      // Modifier les titres
      const h4s = document.querySelectorAll("h4");
      h4s.forEach(h4 => {
        if (h4.textContent.includes("En attente")) {
          h4.textContent = "👥 Détails des Personnes en Attente de Retour";
          h4.style.color = "#667eea";
          h4.style.fontWeight = "700";
          h4.style.fontSize = "18px";
        } else if (h4.textContent.includes("Déjà retournée")) {
          h4.style.display = "none";
        }
      });
      
      return;
    }

    // ===== POUR OSTIE_ADMIN: TABLE AVEC ACTIONS =====
    // ===== AFFICHER TABLE "EN ATTENTE" =====
    waitingTableBody.innerHTML = "";
    if (waitingList.length === 0) {
      waitingTableBody.innerHTML = '<tr><td colspan="14" style="text-align: center; padding: 20px;">✓ Aucun en attente !</td></tr>';
    } else {
      waitingList.forEach(c => {
        const row = document.createElement("tr");
        const rowId = `pending-${c.matricule}`;
        
        row.innerHTML = `
          <td>${c.matricule}</td>
          <td>${c.nom} ${c.prenom || ""}</td>
          <td>${c.fonction}</td>
          <td>${c.typeConsultation}</td>
          <td>${c.lieuConsultation}</td>
          <td>${c.shift}</td>
          <td>${c.choix || "-"}</td>
          <td>${extractAndCorrectDate(c.date) || "-"}</td>
          <td>${extractTimeFromISO(c.heureSortie)}</td>
          <td><input type="checkbox" class="checkbox-retour" data-matricule="${c.matricule}" data-row-id="${rowId}" ${c.heureRetour ? 'checked' : ''}></td>
          <td><input type="time" class="time-retour" data-matricule="${c.matricule}" value="${c.heureRetour ? extractTimeFromISO(c.heureRetour) : ''}" ${c.heureRetour ? '' : 'disabled'}></td>
          <td>
            <select class="select-resultat" data-matricule="${c.matricule}" ${c.heureRetour ? '' : 'disabled'} style="width:100%; padding:3px 4px; font-size:10px;">
              <option value="">-- Sélectionner --</option>
              <option value="Consultation médical" ${c.resultat === 'Consultation médical' ? 'selected' : ''}>Consultation médical</option>
              <option value="Repos médical" ${c.resultat === 'Repos médical' ? 'selected' : ''}>Repos médical</option>
              <option value="Assistante maternelle" ${c.resultat === 'Assistante maternelle' ? 'selected' : ''}>Assistante maternelle</option>
              <option value="Visite d'embauche" ${c.resultat === "Visite d'embauche" ? 'selected' : ''}>Visite d'embauche</option>
            </select>
          </td>
          <td><input type="number" class="input-nbjours" data-matricule="${c.matricule}" min="0.5" step="0.5" value="${c.nbJourRM || ''}" placeholder="J" ${(c.resultat === "Repos médical" || c.resultat === "Assistante maternelle") ? '' : 'style="display:none;"'}></td>
          <td><button class="btn-validate-retour" data-matricule="${c.matricule}" ${c.heureRetour ? '' : 'disabled'}>✓</button></td>
        `;
        waitingTableBody.appendChild(row);
      });
    }

    // ===== AFFICHER TABLE "COMPLÉTÉE" =====
    completedTableBody.innerHTML = "";
    if (completedList.length === 0) {
      completedTableBody.innerHTML = '<tr><td colspan="12" style="text-align: center; padding: 20px;">✓ Aucune encore</td></tr>';
    } else {
      completedList.forEach(c => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${c.matricule}</td>
          <td>${c.nom} ${c.prenom || ""}</td>
          <td>${c.fonction}</td>
          <td>${c.typeConsultation}</td>
          <td>${c.lieuConsultation}</td>
          <td>${c.shift}</td>
          <td>${c.choix || "-"}</td>
          <td>${extractAndCorrectDate(c.date) || "-"}</td>
          <td>${extractTimeFromISO(c.heureSortie)}</td>
          <td>${extractTimeFromISO(c.heureRetour) || "-"}</td>
          <td>${c.resultat || "-"}</td>
          <td>${c.nbJourRM || "-"}</td>
        `;
        completedTableBody.appendChild(row);
      });
    }

    // Attacher les événements pour les actions (seulement sur table "en attente")
    attachPendingActionListeners();
    
    // Attacher les filtres pour les deux tableaux
    attachTableFilters('waiting');
    attachTableFilters('completed');
    
    // Attacher les en-têtes triables
    attachSortableHeaders();
  }

  // ================= ATTACH PENDING ACTION LISTENERS =================
  function attachPendingActionListeners() {
    // Événement pour les checkboxes de retour
    document.querySelectorAll(".checkbox-retour").forEach(checkbox => {
      checkbox.addEventListener("change", function () {
        const matricule = this.dataset.matricule;
        const row = this.closest("tr");
        const timeInput = row.querySelector(".time-retour");
        const selectResultat = row.querySelector(".select-resultat");
        const btnValidate = row.querySelector(".btn-validate-retour");
        
        if (this.checked) {
          const now = getCurrentDateTime();
          timeInput.value = now.time;
          timeInput.disabled = false;
          selectResultat.disabled = false;
          btnValidate.disabled = false;
        } else {
          timeInput.value = "";
          timeInput.disabled = true;
          selectResultat.value = "";
          selectResultat.disabled = true;
          row.querySelector(".input-nbjours").style.display = "none";
          row.querySelector(".input-nbjours").value = "";
          btnValidate.disabled = true;
        }
      });
    });

    // Événement pour le select résultat
    document.querySelectorAll(".select-resultat").forEach(select => {
      select.addEventListener("change", function () {
        const row = this.closest("tr");
        const inputJours = row.querySelector(".input-nbjours");
        const selectedValue = this.value;
        
        // Afficher/masquer le champ jours
        if (selectedValue === "Repos médical" || selectedValue === "Assistante maternelle") {
          inputJours.style.display = "inline-block";
          inputJours.disabled = false;
          inputJours.focus();
        } else {
          inputJours.value = "";
          inputJours.style.display = "none";
          inputJours.disabled = true;
        }
      });
    });

    // Événement pour le bouton de validation
    document.querySelectorAll(".btn-validate-retour").forEach(btn => {
      btn.addEventListener("click", async function (e) {
        e.preventDefault();
        const matricule = this.dataset.matricule;
        const row = this.closest("tr");
        const timeInput = row.querySelector(".time-retour");
        const selectResultat = row.querySelector(".select-resultat");
        const inputJours = row.querySelector(".input-nbjours");
        const selectedResult = selectResultat.value;
        
        // Vérifier que le résultat est sélectionné
        if (!selectedResult || selectedResult === "") {
          showMessage("❌ Veuillez sélectionner un résultat avant de valider", "error");
          return;
        }
        
        // Vérifier que les jours sont remplis si nécessaire
        if ((selectedResult === "Repos médical" || selectedResult === "Assistante maternelle") && !inputJours.value) {
          showMessage("❌ Veuillez entrer le nombre de jours", "error");
          inputJours.focus();
          return;
        }
        
        // Enregistrer les données
        const params = new URLSearchParams({
          action: "setRetour",
          password: userPassword,
          matricule: matricule,
          heureRetour: timeInput.value,
          resultat: selectedResult,
          nbJourRM: inputJours.value || ""
        });

        try {
          this.disabled = true;
          this.textContent = "⏳ Enregistrement...";
          
          const res = await fetch(`${API_URL}?${params}`);
          const json = await res.json();

          if (json.success) {
            showMessage("✅ Retour enregistré avec succès");
            
            // Recharger la liste après enregistrement
            setTimeout(() => {
              loadDashboardData();
            }, 1000);
          } else {
            showMessage("❌ Erreur : " + json.error, "error");
            this.disabled = false;
            this.textContent = "✓ Valider";
          }
        } catch (e) {
          console.error("Erreur:", e);
          showMessage("❌ Erreur serveur", "error");
          this.disabled = false;
          this.textContent = "✓ Valider";
        }
      });
    });

    // Événement pour mettre à jour les jours en temps réel
    document.querySelectorAll(".input-nbjours").forEach(input => {
      input.addEventListener("input", function () {
        // Permet à l'utilisateur de voir les changements en temps réel
      });
    });
  }

  // ================= POPULATE PENDING FILTERS =================
  // ========== ATTACHER LES EVENT LISTENERS À LA LISTE EN ATTENTE ==========
  function attachPendingEventListeners() {
    document.querySelectorAll(".checkbox-retour").forEach(checkbox => {
      checkbox.addEventListener("change", function () {
        const matricule = this.dataset.matricule;
        const timeInput = this.parentElement.querySelector(".time-retour");
        const selectResultat = this.parentElement.querySelector(".select-resultat");
        const inputJours = this.parentElement.querySelector(".input-nbjours");
        const btnConfirm = this.parentElement.querySelector(".btn-confirm-retour");
        
        if (this.checked) {
          const now = getCurrentDateTime();
          timeInput.value = now.time;
          timeInput.disabled = false;
          selectResultat.disabled = false;
          checkConfirmButton(matricule);
        } else {
          timeInput.value = "";
          timeInput.disabled = true;
          selectResultat.value = "";
          selectResultat.disabled = true;
          inputJours.value = "";
          inputJours.style.display = "none";
          inputJours.disabled = true;
          btnConfirm.disabled = true;
        }
      });
    });

    document.querySelectorAll(".select-resultat").forEach(select => {
      select.addEventListener("change", function () {
        const matricule = this.dataset.matricule;
        const inputJours = this.parentElement.querySelector(".input-nbjours");
        const timeRetourInput = this.parentElement.querySelector(".time-retour");
        
        if (this.value === "Repos médical" || this.value === "Assistante maternelle") {
          inputJours.style.display = "inline-block";
          inputJours.disabled = false;
          inputJours.focus();
        } else if (this.value === "anomalie") {
          // Anomalie: calculer automatiquement l'heure de retour
          // Pas de champ jours visible pour anomalie
          inputJours.value = "";
          inputJours.style.display = "none";
          inputJours.disabled = true;
          
          // Calculer la durée moyenne et ajouter l'heure de retour
          calculateAndSetAverageReturnTime(matricule);
        } else {
          inputJours.value = "";
          inputJours.style.display = "none";
          inputJours.disabled = true;
        }
        
        checkConfirmButton(matricule);
      });
    });

    document.querySelectorAll(".input-nbjours").forEach(input => {
      input.addEventListener("change", function () {
        const matricule = this.dataset.matricule;
        checkConfirmButton(matricule);
      });
    });

    document.querySelectorAll(".time-retour").forEach(input => {
      input.addEventListener("change", function () {
        const matricule = this.dataset.matricule;
        checkConfirmButton(matricule);
      });
    });

    document.querySelectorAll(".btn-confirm-retour").forEach(btn => {
      btn.addEventListener("click", async function () {
        // Vérification de permissions: bloquer si mode production (readonly)
        if (userPermissions === "readonly") {
          showMessage("❌ Accès refusé: Mode production en lecture seule", "error");
          return;
        }

        const matricule = this.dataset.matricule;
        const timeInput = this.parentElement.querySelector(".time-retour");
        const selectResultat = this.parentElement.querySelector(".select-resultat");
        const inputJours = this.parentElement.querySelector(".input-nbjours");
        const checkbox = this.parentElement.querySelector(".checkbox-retour");

        if (!checkbox.checked || !timeInput.value || !selectResultat.value) {
          showMessage("❌ Remplissez tous les champs", "error");
          return;
        }

        if ((selectResultat.value === "Repos médical" || selectResultat.value === "Assistante maternelle") && (!inputJours.value || parseFloat(inputJours.value) <= 0)) {
          showMessage("❌ Le nombre de jours est obligatoire", "error");
          return;
        }

        const params = new URLSearchParams({
          action: "setRetour",
          password: userPassword,
          matricule: matricule,
          heureRetour: timeInput.value,
          resultat: selectResultat.value,
          nbJourRM: inputJours.value,
          commentaires: ""
        });

        try {
          const res = await fetch(`${API_URL}?${params}`);
          const json = await res.json();

          if (json.success) {
            showMessage("✅ Retour enregistré !");
            loadDashboardData();
          } else {
            showMessage("❌ Erreur : " + json.error, "error");
          }
        } catch (e) {
          console.error(e);
          showMessage("❌ Erreur serveur", "error");
        }
      });
    });
  }

  function checkConfirmButton(matricule) {
    const item = document.querySelector(`.pending-item[data-id*="${matricule}"] .btn-confirm-retour`);
    if (!item) return;
    
    const checkbox = item.parentElement.querySelector(".checkbox-retour");
    const timeRetour = item.parentElement.querySelector(".time-retour");
    const selectResultat = item.parentElement.querySelector(".select-resultat");
    const inputJours = item.parentElement.querySelector(".input-nbjours");

    let valid = checkbox.checked && timeRetour.value && selectResultat.value;
    
    if (valid && (selectResultat.value === "Repos médical" || selectResultat.value === "Assistante maternelle")) {
      valid = inputJours.value && parseFloat(inputJours.value) > 0;
    }

    item.disabled = !valid;
  }

  function updateDashboardInfo() {
    const dashboardSubtitle = document.getElementById("dashboardSubtitle");
    if (!dashboardSubtitle) return;

    // Afficher simplement "aujourd'hui"
    const todayISO = getTodayMadagascar();
    dashboardSubtitle.innerHTML = `Vue d'ensemble des retours et consultations <strong style = "color: #ed0505;">d'aujourd'hui</strong>`;
  }

  /**
   * Remplir les sélects des filtres (Rattachement et Fonction)
   */
  function populateFilterSelects() {
    const filteredConsultations = filterByDomain(allConsultations);

    // Extraire les valeurs uniques de rattachement (filtrées)
    const rattachements = new Set();
    filteredConsultations.forEach(c => {
      if (c.rattachement && c.rattachement !== "-") {
        rattachements.add(c.rattachement);
      }
    });

    // Remplir le select Rattachement
    const sortedRattachements = Array.from(rattachements).sort();
    sortedRattachements.forEach(r => {
      const option = document.createElement("option");
      option.value = r;
      option.textContent = r;
      filterRattachement.appendChild(option);
    });

    // Extraire les valeurs uniques de fonction
    const fonctions = new Set();
    allConsultations.forEach(c => {
      if (c.fonction && c.fonction !== "-") {
        fonctions.add(c.fonction);
      }
    });

    // Remplir le select Fonction
    const sortedFonctions = Array.from(fonctions).sort();
    sortedFonctions.forEach(f => {
      const option = document.createElement("option");
      option.value = f;
      option.textContent = f;
      filterFonction.appendChild(option);
    });

    // ================= REMPLIR LES FILTRES DU DASHBOARD "CONSULTATIONS D'AUJOURD'HUI" =================
    
    // Remplir filterTodayRattachement
    const filterTodayRattachement = document.getElementById("filterTodayRattachement");
    if (filterTodayRattachement) {
      filterTodayRattachement.innerHTML = '<option value="">-- Tous les rattachements --</option>';
      sortedRattachements.forEach(r => {
        const option = document.createElement("option");
        option.value = r;
        option.textContent = r;
        filterTodayRattachement.appendChild(option);
      });
    }

    // Remplir filterTodayFonction
    const filterTodayFonction = document.getElementById("filterTodayFonction");
    if (filterTodayFonction) {
      filterTodayFonction.innerHTML = '<option value="">-- Toutes les fonctions --</option>';
      sortedFonctions.forEach(f => {
        const option = document.createElement("option");
        option.value = f;
        option.textContent = f;
        filterTodayFonction.appendChild(option);
      });
    }

    // Remplir filterTodayResultat avec les résultats uniques
    const filterTodayResultat = document.getElementById("filterTodayResultat");
    if (filterTodayResultat) {
      const resultats = new Set();
      filteredConsultations.forEach(c => {
        if (c.resultat && c.resultat !== "-") {
          resultats.add(c.resultat);
        }
      });
      
      filterTodayResultat.innerHTML = '<option value="">-- Tous les résultats --</option>';
      Array.from(resultats).sort().forEach(r => {
        const option = document.createElement("option");
        option.value = r;
        option.textContent = r;
        filterTodayResultat.appendChild(option);
      });
    }

    // ================= REMPLIR LES FILTRES DES AUTRES SECTIONS RAPPORT =================
    
    // Remplir les selects pour TAUX
    const filterTauxRattachement = document.getElementById("filterTauxRattachement");
    if (filterTauxRattachement) {
      filterTauxRattachement.innerHTML = '<option value="">-- Tous --</option>';
      sortedRattachements.forEach(r => {
        const option = document.createElement("option");
        option.value = r;
        option.textContent = r;
        filterTauxRattachement.appendChild(option);
      });
    }

    const filterTauxFonction = document.getElementById("filterTauxFonction");
    if (filterTauxFonction) {
      filterTauxFonction.innerHTML = '<option value="">-- Tous --</option>';
      sortedFonctions.forEach(f => {
        const option = document.createElement("option");
        option.value = f;
        option.textContent = f;
        filterTauxFonction.appendChild(option);
      });
    }

    // Remplir les selects pour GRAPHIQUES
    const filterChartsRattachement = document.getElementById("filterChartsRattachement");
    if (filterChartsRattachement) {
      filterChartsRattachement.innerHTML = '<option value="">-- Tous --</option>';
      sortedRattachements.forEach(r => {
        const option = document.createElement("option");
        option.value = r;
        option.textContent = r;
        filterChartsRattachement.appendChild(option);
      });
    }

    const filterChartsFonction = document.getElementById("filterChartsFonction");
    if (filterChartsFonction) {
      filterChartsFonction.innerHTML = '<option value="">-- Tous --</option>';
      sortedFonctions.forEach(f => {
        const option = document.createElement("option");
        option.value = f;
        option.textContent = f;
        filterChartsFonction.appendChild(option);
      });
    }

    // Remplir les selects pour COLLABORATEURS
    const filterCollabRattachement = document.getElementById("filterCollabRattachement");
    if (filterCollabRattachement) {
      filterCollabRattachement.innerHTML = '<option value="">-- Tous --</option>';
      sortedRattachements.forEach(r => {
        const option = document.createElement("option");
        option.value = r;
        option.textContent = r;
        filterCollabRattachement.appendChild(option);
      });
    }

    const filterCollabFonction = document.getElementById("filterCollabFonction");
    if (filterCollabFonction) {
      filterCollabFonction.innerHTML = '<option value="">-- Tous --</option>';
      sortedFonctions.forEach(f => {
        const option = document.createElement("option");
        option.value = f;
        option.textContent = f;
        filterCollabFonction.appendChild(option);
      });
    }

    // Remplir les selects pour SYNTHÈSES
    const filterSyntheseRattachement = document.getElementById("filterSyntheseRattachement");
    if (filterSyntheseRattachement) {
      filterSyntheseRattachement.innerHTML = '<option value="">-- Tous --</option>';
      sortedRattachements.forEach(r => {
        const option = document.createElement("option");
        option.value = r;
        option.textContent = r;
        filterSyntheseRattachement.appendChild(option);
      });
    }

    const filterSyntheseFonction = document.getElementById("filterSyntheseFonction");
    if (filterSyntheseFonction) {
      filterSyntheseFonction.innerHTML = '<option value="">-- Tous --</option>';
      sortedFonctions.forEach(f => {
        const option = document.createElement("option");
        option.value = f;
        option.textContent = f;
        filterSyntheseFonction.appendChild(option);
      });
    }
  }

  // ================= UPDATE DASHBOARD INFO INDICATORS =================

  // ================= RAPPORT CONSULTATIONS PASSÉES =================
  function displayReport(consultations) {
    console.log("📋 displayReport - Consultations:", consultations.length, "reportTableBody existe:", !!reportTableBody);
    
    if (!reportTableBody) {
      console.error("reportTableBody n'existe pas!");
      return;
    }
    
    reportTableBody.innerHTML = "";

    if (consultations.length === 0) {
      reportTableBody.innerHTML = '<tr><td colspan="12" style="text-align: center; padding: 20px;">Aucune consultation trouvée</td></tr>';
    } else {
      consultations.forEach(c => {
        const row = document.createElement("tr");
        const rattachementColor = getRattachementColor(c.rattachement);
        row.style.backgroundColor = rattachementColor;
        row.innerHTML = `
          <td>${c.matricule}</td>
          <td>${c.nom} ${c.prenom || ""}</td>
          <td>${c.fonction}</td>
          <td>${c.typeConsultation}</td>
          <td>${c.lieuConsultation}</td>
          <td>${c.shift}</td>
          <td>${c.choix || "-"}</td>
          <td>${extractAndCorrectDate(c.date)}</td>
          <td>${extractTimeFromISO(c.heureSortie)}</td>
          <td>${c.heureRetour ? extractTimeFromISO(c.heureRetour) : "-"}</td>
          <td>${c.resultat || "-"}</td>
          <td>${c.nbJourRM || "-"}</td>
        `;
        reportTableBody.appendChild(row);
      });
    }
    
    // Attacher les filtres
    attachTableFilters('report');
    
    updateCollaboratorsTable(consultations);
    updateReportStatistics(consultations);
    updateReportCharts(consultations);
    loadConsultationRates();
  }

  // ================= ATTACH TABLE FILTERS =================
  function attachTableFilters(tableType) {
    let filterSelector;
    if (tableType === 'report') {
      filterSelector = '.filter-col';
    } else if (tableType === 'waiting') {
      filterSelector = '.filter-waiting-col';
    } else if (tableType === 'completed') {
      filterSelector = '.filter-completed-col';
    } else if (tableType === 'pending') {
      filterSelector = '.filter-pending-col';
    } else if (tableType === 'collaborators') {
      filterSelector = '.filter-collaborators-col';
    } else {
      return;
    }

    const filterInputs = document.querySelectorAll(filterSelector);
    if (filterInputs.length === 0) return;

    filterInputs.forEach(input => {
      input.addEventListener("input", () => applyTableFilters(tableType));
      input.addEventListener("change", () => applyTableFilters(tableType));
    });
  }

  function applyTableFilters(tableType) {
    let tbody;
    if (tableType === 'report') {
      tbody = document.getElementById('reportTableBody');
    } else if (tableType === 'waiting') {
      tbody = document.getElementById('pendingWaitingTableBody');
    } else if (tableType === 'completed') {
      tbody = document.getElementById('pendingCompletedTableBody');
    } else if (tableType === 'pending') {
      tbody = document.getElementById('pendingTableBody');
    } else if (tableType === 'collaborators') {
      tbody = document.getElementById('collaboratorsTableBody');
    }

    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');
    let filterSelector;
    if (tableType === 'report') {
      filterSelector = '.filter-col';
    } else if (tableType === 'waiting') {
      filterSelector = '.filter-waiting-col';
    } else if (tableType === 'completed') {
      filterSelector = '.filter-completed-col';
    } else if (tableType === 'pending') {
      filterSelector = '.filter-pending-col';
    } else if (tableType === 'collaborators') {
      filterSelector = '.filter-collaborators-col';
    }

    const filterInputs = document.querySelectorAll(filterSelector);
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      let show = true;

      filterInputs.forEach(input => {
        const colIndex = parseInt(input.dataset.col);
        const filterValue = input.value.toLowerCase();
        
        if (filterValue && cells[colIndex]) {
          const cellValue = cells[colIndex].textContent.toLowerCase();
          if (!cellValue.includes(filterValue)) {
            show = false;
          }
        }
      });

      row.style.display = show ? '' : 'none';
    });
  }

  function updateReportStatistics(consultations) {
    const total = consultations.length;
    const rm = countByResult(consultations, "Repos médical") + countByResult(consultations, "Assistante maternelle");
    const consult = countByResult(consultations, "Consultation médical");
    const dayoff = consultations.filter(c => c.choix === "Day off").length;

    reportStatTotal.textContent = total;
    reportStatRM.textContent = rm;
    reportStatConsult.textContent = consult;
    reportStatDayoff.textContent = dayoff;
    
    // ========== STATISTIQUES SUPPLÉMENTAIRES ==========
    
    // 1. JOURS DE REPOS MÉDICAL
    const joursRM = consultations.reduce((sum, c) => {
      if (c.resultat === "Repos médical") {
        const jours = parseFloat(c.nbJourRM) || 0;
        return sum + jours;
      }
      return sum;
    }, 0);
    
    // 2. JOURS D'ASSISTANTE MATERNELLE
    const joursAssistante = consultations.reduce((sum, c) => {
      if (c.resultat === "Assistante maternelle") {
        const jours = parseFloat(c.nbJourRM) || 0;
        return sum + jours;
      }
      return sum;
    }, 0);
    
    // 3. COLLABORATEURS EN SHIFT NUIT (count unique)
    const shiftNuitCollaborators = new Set();
    consultations.forEach(c => {
      if (c.shift === "Nuit") {
        shiftNuitCollaborators.add(c.matricule);
      }
    });
    const shiftNuit = shiftNuitCollaborators.size;
    
    // 4. ANOMALIES
    const anomalies = consultations.filter(c => c.resultat === "anomalie").length;
    
    // Mettre à jour les éléments DOM
    const reportStatJoursRM = document.getElementById("reportStatJoursRM");
    const reportStatJoursAssistante = document.getElementById("reportStatJoursAssistante");
    const reportStatShiftNuit = document.getElementById("reportStatShiftNuit");
    const reportStatAnomalies = document.getElementById("reportStatAnomalies");
    
    if (reportStatJoursRM) reportStatJoursRM.textContent = joursRM.toFixed(1);
    if (reportStatJoursAssistante) reportStatJoursAssistante.textContent = joursAssistante.toFixed(1);
    if (reportStatShiftNuit) reportStatShiftNuit.textContent = shiftNuit;
    if (reportStatAnomalies) reportStatAnomalies.textContent = anomalies;
  }

  /**
   * Génère un tableau matriciel à partir des statistiques
   * @param {Object} statsObj - Objet avec statistiques (consultation, rm, assistante)
   * @returns {String} HTML du tableau
   */
  function generateMatrixTable(statsObj) {
    const keys = Object.keys(statsObj).filter(k => k && k !== "undefined").sort();
    
    if (keys.length === 0) {
      return '<p style="text-align: center; color: #999;">Aucune donnée disponible</p>';
    }

    let html = '<table class="matrix-table"><thead><tr>';
    html += '<th>Catégorie</th>';
    html += '<th class="col-consultation">Consultation</th>';
    html += '<th class="col-repos">Repos Médical</th>';
    html += '<th class="col-assistante">Assistante Maternelle</th>';
    html += '<th class="col-total">Total</th>';
    html += '</tr></thead><tbody>';

    keys.forEach(key => {
      const stats = statsObj[key];
      const total = stats.consultation + stats.rm + stats.assistante;
      html += `<tr>`;
      html += `<td>${key || '(Non spécifié)'}</td>`;
      html += `<td class="col-consultation">${stats.consultation}</td>`;
      html += `<td class="col-repos">${stats.rm}</td>`;
      html += `<td class="col-assistante">${stats.assistante}</td>`;
      html += `<td class="col-total">${total}</td>`;
      html += `</tr>`;
    });

    // Ligne de total
    const totalConsultation = keys.reduce((sum, k) => sum + statsObj[k].consultation, 0);
    const totalRM = keys.reduce((sum, k) => sum + statsObj[k].rm, 0);
    const totalAssistante = keys.reduce((sum, k) => sum + statsObj[k].assistante, 0);
    const grandTotal = totalConsultation + totalRM + totalAssistante;

    html += `<tr style="font-weight: bold; background-color: #f0f0f0;">`;
    html += `<td>TOTAL</td>`;
    html += `<td class="col-consultation">${totalConsultation}</td>`;
    html += `<td class="col-repos">${totalRM}</td>`;
    html += `<td class="col-assistante">${totalAssistante}</td>`;
    html += `<td class="col-total">${grandTotal}</td>`;
    html += `</tr>`;

    html += '</tbody></table>';
    return html;
  }

  function updateReportCharts(consultations) {
    if (consultations.length === 0) return;

    // Chart Résultats - Consultation vs Repos Médical vs Assistante Maternelle
    const consultation = countByResult(consultations, "Consultation médical");
    const repos = countByResult(consultations, "Repos médical");
    const assistante = countByResult(consultations, "Assistante maternelle");
    const autres = consultations.length - consultation - repos - assistante;

    const ctxResultats = document.getElementById("chartReportResultats")?.getContext("2d");
    if (ctxResultats) {
      if (chartReportResultats) chartReportResultats.destroy();
      
      // Calculer le total pour les pourcentages
      const totalResultats = consultation + repos + assistante + autres;
      
      chartReportResultats = new Chart(ctxResultats, {
        type: "doughnut",
        data: {
          labels: [
            `Consultation Médical`,
            `Repos Médical`,
            `Assistante Maternelle`,
            autres > 0 ? `Autres` : null
          ].filter(Boolean),
          datasets: [{
            data: autres > 0 ? [consultation, repos, assistante, autres] : [consultation, repos, assistante],
            backgroundColor: autres > 0 ? ["#667eea", "#e74c3c", "#f39c12", "#95a5a6"] : ["#667eea", "#e74c3c", "#f39c12"],
            borderColor: "#fff",
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                font: { size: 11 },
                padding: 12
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.parsed;
                  const percent = totalResultats > 0 ? ((value / totalResultats) * 100).toFixed(1) : 0;
                  return `${value} (${percent}%)`;
                }
              }
            },
            datalabels: {
              color: "#fff",
              font: { weight: "bold", size: 12 },
              formatter: function(value) {
                return value;
              }
            }
          }
        },
        plugins: [{
          id: "textCenter",
          beforeDatasetsDraw(chart) {
            const {datasets} = chart.data;
            const total = datasets[0].data.reduce((a, b) => a + b, 0);
            
            datasets.forEach((dataset, i) => {
              if (!dataset.hidden) {
                for (let d = 0; d < dataset.data.length; d++) {
                  const count = dataset.data[d];
                  const pct = ((count / total) * 100).toFixed(0);
                  
                  const {ctx, chartArea: {left, top, width, height}} = chart;
                  const x = left + width / 2;
                  const y = top + height / 2;
                  
                  ctx.save();
                  ctx.font = "bold 14px sans-serif";
                  ctx.fillStyle = "#fff";
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  
                  const meta = chart.getDatasetMeta(0);
                  const angle = (meta.data[d].startAngle + meta.data[d].endAngle) / 2;
                  const radius = (meta.data[d].outerRadius + meta.data[d].innerRadius) / 2;
                  
                  const textX = x + radius * Math.cos(angle - Math.PI / 2);
                  const textY = y + radius * Math.sin(angle - Math.PI / 2);
                  
                  ctx.fillText(`${count}`, textX, textY);
                  ctx.restore();
                }
              }
            });
          }
        }]
      });
    }

    // Chart Lieu - avec couleurs différentes
    const lieuStats = {};
    consultations.forEach(c => {
      lieuStats[c.lieuConsultation] = (lieuStats[c.lieuConsultation] || 0) + 1;
    });
    const lieus = Object.keys(lieuStats);
    const lieuCounts = Object.values(lieuStats);
    
    // Générer des couleurs distinctes pour chaque lieu
    const lieuColors = [
      "#667eea", "#e74c3c", "#f39c12", "#16a085", "#8e44ad", 
      "#c0392b", "#27ae60", "#2980b9", "#d35400", "#34495e",
      "#1abc9c", "#e67e22", "#f1c40f", "#9b59b6", "#00bcd4"
    ];

    const ctxLieu = document.getElementById("chartReportLieu")?.getContext("2d");
    if (ctxLieu) {
      if (chartReportLieu) chartReportLieu.destroy();

      chartReportLieu = new Chart(ctxLieu, {
        type: "bar",
        data: {
          labels: lieus,
          datasets: [{
            label: "Consultations",
            data: lieuCounts,
            backgroundColor: lieus.map((_, i) => lieuColors[i % lieuColors.length]),
            borderColor: lieus.map((_, i) => lieuColors[i % lieuColors.length]),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          indexAxis: "y",
          scales: {
            x: { beginAtZero: true }
          }
        }
      });
    }

    // Chart Choix (Day off vs En poste)
    // CORRECTION: Utiliser "En poste" au lieu de "Jour"
    const dayoff = consultations.filter(c => c.choix === "Day off").length;
    const enPoste = consultations.filter(c => c.choix === "En poste").length;

    const ctxChoix = document.getElementById("chartReportChoix")?.getContext("2d");
    if (ctxChoix) {
      if (chartReportChoix) chartReportChoix.destroy();
      
      chartReportChoix = new Chart(ctxChoix, {
        type: "pie",
        data: {
          labels: ["Day off", "En poste"],
          datasets: [{
            data: [dayoff, enPoste],
            backgroundColor: ["#e74c3c", "#3498db"],
            borderColor: "#fff",
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" }
          }
        }
      });
    }

    // Chart Shift - Jour (vert) vs Nuit (jaune)
    const shiftStats = {};
    consultations.forEach(c => {
      shiftStats[c.shift] = (shiftStats[c.shift] || 0) + 1;
    });
    const shifts = Object.keys(shiftStats);
    const shiftCounts = Object.values(shiftStats);
    
    // Colorer Jour en vert et Nuit en jaune
    const shiftColors = shifts.map(shift => {
      if (shift === "Jour") return "#27ae60"; // Vert
      if (shift === "Nuit") return "#f1c40f"; // Jaune
      return "#95a5a6"; // Gris par défaut
    });

    const ctxShift = document.getElementById("chartReportShift")?.getContext("2d");
    if (ctxShift) {
      if (chartReportShift) chartReportShift.destroy();
      
      chartReportShift = new Chart(ctxShift, {
        type: "bar",
        data: {
          labels: shifts,
          datasets: [{
            label: "Consultations",
            data: shiftCounts,
            backgroundColor: shiftColors,
            borderColor: shiftColors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // Courbe de Tendance - Consultation vs RM/Assistante par date
    const dateStats = {};
    consultations.forEach(c => {
      const correctedDate = extractAndCorrectDate(c.date);
      if (correctedDate && correctedDate !== "-") {
        if (!dateStats[correctedDate]) {
          dateStats[correctedDate] = { consultation: 0, congé: 0 }; // congé = RM + Assistante maternelle
        }
        if (c.resultat === "Consultation médical") {
          dateStats[correctedDate].consultation++;
        } else if (c.resultat === "Repos médical" || c.resultat === "Assistante maternelle") {
          dateStats[correctedDate].congé++;
        }
      }
    });

    const datesSorted = Object.keys(dateStats).sort();
    const consultationTrend = datesSorted.map(d => dateStats[d].consultation);
    const congéTrend = datesSorted.map(d => dateStats[d].congé);

    const ctxTendance = document.getElementById("chartReportTendance")?.getContext("2d");
    if (ctxTendance && datesSorted.length > 0) {
      if (chartReportTendance) chartReportTendance.destroy();
      
      chartReportTendance = new Chart(ctxTendance, {
        type: "line",
        data: {
          labels: datesSorted,
          datasets: [
            {
              label: "Consultations",
              data: consultationTrend,
              borderColor: "#667eea",
              backgroundColor: "rgba(102, 126, 234, 0.1)",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#667eea",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7
            },
            {
              label: "Repos Médical + Assistante Maternelle",
              data: congéTrend,
              borderColor: "#e74c3c",
              backgroundColor: "rgba(231, 76, 60, 0.1)",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#e74c3c",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          },
          plugins: {
            legend: {
              position: "top"
            }
          }
        }
      });
    }

    // Matrice Rattachement - Consultation vs RM vs Assistante Maternelle
    const rattachementStats = {};
    consultations.forEach(c => {
      if (!rattachementStats[c.rattachement]) {
        rattachementStats[c.rattachement] = { consultation: 0, rm: 0, assistante: 0 };
      }
      if (c.resultat === "Consultation médical") {
        rattachementStats[c.rattachement].consultation++;
      } else if (c.resultat === "Repos médical") {
        rattachementStats[c.rattachement].rm++;
      } else if (c.resultat === "Assistante maternelle") {
        rattachementStats[c.rattachement].assistante++;
      }
    });

    // Générer le tableau matriciel pour Rattachement
    const matrixRattachement = document.getElementById("matrixRattachement");
    if (matrixRattachement) {
      matrixRattachement.innerHTML = generateMatrixTable(rattachementStats);
    }

    // Matrice Fonction - Consultation vs RM vs Assistante Maternelle
    const fonctionStats = {};
    consultations.forEach(c => {
      if (!fonctionStats[c.fonction]) {
        fonctionStats[c.fonction] = { consultation: 0, rm: 0, assistante: 0 };
      }
      if (c.resultat === "Consultation médical") {
        fonctionStats[c.fonction].consultation++;
      } else if (c.resultat === "Repos médical") {
        fonctionStats[c.fonction].rm++;
      } else if (c.resultat === "Assistante maternelle") {
        fonctionStats[c.fonction].assistante++;
      }
    });

    // Générer le tableau matriciel pour Fonction
    const matrixFonction = document.getElementById("matrixFonction");
    if (matrixFonction) {
      matrixFonction.innerHTML = generateMatrixTable(fonctionStats);
    }
  }

  // ================= LOAD AND DISPLAY CONSULTATION RATES =================
  function loadConsultationRates(consultations = null) {
    try {
      // Récupérer les consultations filtrées actuelles
      const filteredConsultations = consultations || getFilteredConsultations();
      
      // Obtenir tous les collaborateurs
      const allCollabByRattachement = {};
      allCollaborateurs.forEach(c => {
        const rattachement = c.rattachement;
        if (rattachement) {
          if (!allCollabByRattachement[rattachement]) {
            allCollabByRattachement[rattachement] = 0;
          }
          allCollabByRattachement[rattachement]++;
        }
      });
      
      // Calculer les personnes uniques avec consultations à partir des données filtrées
      const personnesAvecConsultations = {};
      filteredConsultations.forEach(c => {
        const rattachement = c.rattachement;
        const matricule = c.matricule;
        if (rattachement && matricule) {
          if (!personnesAvecConsultations[rattachement]) {
            personnesAvecConsultations[rattachement] = new Set();
          }
          personnesAvecConsultations[rattachement].add(matricule);
        }
      });
      
      // Construire les données de taux
      const rates = [];
      for (const rattachement in allCollabByRattachement) {
        const total = allCollabByRattachement[rattachement];
        const personnesUniques = personnesAvecConsultations[rattachement]?.size || 0;
        const taux = total > 0 ? Math.round((personnesUniques / total) * 100) : 0;
        
        rates.push({
          rattachement: rattachement,
          totalCollaborateurs: total,
          personnesAvecConsultation: personnesUniques,
          taux: taux
        });
      }
      
      // Trier par rattachement
      rates.sort((a, b) => a.rattachement.localeCompare(b.rattachement));
      
      const container = document.getElementById("consultationRatesContainer");
      
      if (!container) {
        console.warn("⚠️ consultationRatesContainer n'existe pas!");
        return;
      }

      if (rates.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Aucune donnée de taux disponible</p>';
        return;
      }

      container.innerHTML = rates.map(rate => {
        let percentageColor;
        if (rate.taux >= 95) {
          percentageColor = "critical";
        } else if (rate.taux >= 70) {
          percentageColor = "high";
        } else if (rate.taux >= 30) {
          percentageColor = "medium";
        } else {
          percentageColor = "low";
        }
        return `
          <div class="consultation-rate-card">
            <h5>🏢 ${rate.rattachement}</h5>
            <p class="rate-label">Taux de consultation</p>
            <div class="rate-percentage-display ${percentageColor}">${rate.taux}%</div>
            <div class="rate-stats">
              <div class="rate-stat-item">
                <span class="rate-stat-label">Total</span>
                <span class="rate-stat-value">${rate.totalCollaborateurs}</span>
              </div>
              <div class="rate-stat-item">
                <span class="rate-stat-label">Consultation</span>
                <span class="rate-stat-value">${rate.personnesAvecConsultation}</span>
              </div>
            </div>
          </div>
        `;
      }).join("");

    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error("Erreur chargement taux consultation:", e);
      }
      const container = document.getElementById("consultationRatesContainer");
      if (container) {
        container.innerHTML = '<p style="text-align: center; color: red; padding: 20px;">⚠️ Erreur lors du chargement des taux</p>';
      }
    }
  }

  function getFilteredConsultations() {
    const fromDate = filterFromDate.value ? new Date(filterFromDate.value) : null;
    const toDate = filterToDate.value ? new Date(filterToDate.value) : null;
    const selectedRattachement = filterRattachement.value;
    const selectedFonction = filterFonction.value;

    const filtered = allConsultations.filter(c => {
      const correctedDate = extractAndCorrectDate(c.date);
      if (!correctedDate || correctedDate === "-") return false;

      const consultDate = new Date(correctedDate);

      if (fromDate && consultDate < fromDate) return false;
      if (toDate) {
        const toDateEnd = new Date(toDate);
        toDateEnd.setDate(toDateEnd.getDate() + 1);
        if (consultDate >= toDateEnd) return false;
      }

      // Filtrer par rattachement
      if (selectedRattachement && c.rattachement !== selectedRattachement) return false;

      // Filtrer par fonction
      if (selectedFonction && c.fonction !== selectedFonction) return false;

      return true;
    });

    return filtered.sort((a, b) => {
      const dateA = extractAndCorrectDate(a.date);
      const dateB = extractAndCorrectDate(b.date);
      return new Date(dateB) - new Date(dateA); // Plus récentes en premier
    });
  }

  // ================= RAPPORT TABS NAVIGATION =================
  const rapportTabBtns = document.querySelectorAll(".rapport-tab-btn");
  const rapportSections = document.querySelectorAll(".rapport-section-content");

  rapportTabBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");

      // Désactiver tous les boutons et sections
      rapportTabBtns.forEach(b => b.classList.remove("active"));
      rapportSections.forEach(s => {
        s.classList.remove("active");
        s.style.display = "none";
      });

      // Activer le bouton et la section cliqués
      this.classList.add("active");
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add("active");
        targetSection.style.display = "block";
      }
    });
  });

  // ================= SORT TABLE FUNCTION =================
  function sortTableByColumn(table, columnIndex, ascending = true) {
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((a, b) => {
      const cellA = a.querySelectorAll("td")[columnIndex]?.textContent.trim() || "";
      const cellB = b.querySelectorAll("td")[columnIndex]?.textContent.trim() || "";

      // Essayer de trier comme nombres si possible
      const numA = parseFloat(cellA);
      const numB = parseFloat(cellB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return ascending ? numA - numB : numB - numA;
      }

      // Sinon, trier comme texte
      return ascending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
    });

    // Réinsérer les lignes triées
    rows.forEach(row => tbody.appendChild(row));
  }

  // ================= SETUP SORTABLE TABLE HEADERS =================
  const collaboratorsTable = document.getElementById("collaboratorsTable");
  if (collaboratorsTable) {
    const headers = collaboratorsTable.querySelectorAll("th.sortable");
    let currentSort = { column: -1, ascending: true };

    headers.forEach((header, index) => {
      header.addEventListener("click", function () {
        // Réinitialiser les autres headers
        headers.forEach(h => h.classList.remove("asc", "desc"));

        // Basculer l'ordre si on clique sur la même colonne
        if (currentSort.column === index) {
          currentSort.ascending = !currentSort.ascending;
        } else {
          currentSort.column = index;
          currentSort.ascending = true;
        }

        // Ajouter la classe pour l'indicateur visuel
        if (currentSort.ascending) {
          header.classList.add("asc");
        } else {
          header.classList.add("desc");
        }

        // Trier le tableau
        sortTableByColumn(collaboratorsTable, index, currentSort.ascending);
      });
    });
  }

  // Event listeners pour le rapport
  if (btnFilterReport) {
    btnFilterReport.addEventListener("click", function () {
      const filtered = getFilteredConsultations();
      displayReport(filtered);
    });
  }

  if (btnResetReport) {
    btnResetReport.addEventListener("click", function () {
      filterFromDate.value = "";
      filterToDate.value = "";
      filterRattachement.value = "";
      filterFonction.value = "";
      displayReport(filterByDomain(allConsultations));
    });
  }

  // Bouton Jour Précédent
  if (btnPreviousDay) {
    btnPreviousDay.addEventListener("click", function () {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const dateString = yesterday.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      filterFromDate.value = dateString;
      filterToDate.value = dateString;
      
      const filtered = getFilteredConsultations();
      displayReport(filtered);
      
      // Naviguer vers la section rapport
      navBtns.forEach(b => b.classList.remove("active"));
      document.querySelector('[data-section="rapport"]').classList.add("active");
      
      sections.forEach(s => s.classList.remove("active"));
      document.getElementById("rapport").classList.add("active");
    });
  }

  // Bouton Repos History (dans la zone orange)
  // Écouteurs pour les sélects des filtres
  if (filterRattachement) {
    filterRattachement.addEventListener("change", function () {
      const filtered = getFilteredConsultations();
      displayReport(filtered);
    });
  }

  if (filterFonction) {
    filterFonction.addEventListener("change", function () {
      const filtered = getFilteredConsultations();
      displayReport(filtered);
    });
  }

  // ================= FILTRES CONSULTATIONS D'AUJOURD'HUI (DASHBOARD) =================
  const filterTodayFonction = document.getElementById("filterTodayFonction");
  const filterTodayRattachement = document.getElementById("filterTodayRattachement");
  const filterTodayResultat = document.getElementById("filterTodayResultat");
  const btnResetTodayFilters = document.getElementById("btnResetTodayFilters");

  function applyTodayConsultationsFilters() {
    const todayConsultations = getTodayConsultations();
    const filtered = filterByDomain(todayConsultations);
    
    const selectedFonction = filterTodayFonction?.value || "";
    const selectedRattachement = filterTodayRattachement?.value || "";
    const selectedResultat = filterTodayResultat?.value || "";
    
    const result = filtered.filter(c => {
      if (selectedFonction && c.fonction !== selectedFonction) return false;
      if (selectedRattachement && c.rattachement !== selectedRattachement) return false;
      if (selectedResultat && c.resultat !== selectedResultat) return false;
      return true;
    });
    
    updateTodayConsultationsTable(result);
  }

  if (filterTodayFonction) {
    filterTodayFonction.addEventListener("change", applyTodayConsultationsFilters);
  }
  if (filterTodayRattachement) {
    filterTodayRattachement.addEventListener("change", applyTodayConsultationsFilters);
  }
  if (filterTodayResultat) {
    filterTodayResultat.addEventListener("change", applyTodayConsultationsFilters);
  }
  if (btnResetTodayFilters) {
    btnResetTodayFilters.addEventListener("click", function() {
      filterTodayFonction.value = "";
      filterTodayRattachement.value = "";
      filterTodayResultat.value = "";
      applyTodayConsultationsFilters();
    });
  }

  // ================= FILTRES AUTRES SECTIONS RAPPORT =================
  // Ces filtres sont traités dynamiquement lors du clic sur Filter
  const btnFilterTaux = document.getElementById("btnFilterTaux");
  const btnResetTaux = document.getElementById("btnResetTaux");
  const btnFilterCharts = document.getElementById("btnFilterCharts");
  const btnResetCharts = document.getElementById("btnResetCharts");
  const btnFilterCollab = document.getElementById("btnFilterCollab");
  const btnResetCollab = document.getElementById("btnResetCollab");
  const btnFilterSynthese = document.getElementById("btnFilterSynthese");
  const btnResetSynthese = document.getElementById("btnResetSynthese");

  // Filtres TAU
  if (btnFilterTaux) {
    btnFilterTaux.addEventListener("click", function() {
      const fromDate = document.getElementById("filterTauxFromDate")?.value || "";
      const toDate = document.getElementById("filterTauxToDate")?.value || "";
      const rattachement = document.getElementById("filterTauxRattachement")?.value || "";
      const fonction = document.getElementById("filterTauxFonction")?.value || "";
      
      let filtered = allConsultations;
      if (fromDate) {
        filtered = filtered.filter(c => {
          const cDate = extractAndCorrectDate(c.date);
          return cDate >= fromDate;
        });
      }
      if (toDate) {
        filtered = filtered.filter(c => {
          const cDate = extractAndCorrectDate(c.date);
          return cDate <= toDate;
        });
      }
      if (rattachement) {
        filtered = filtered.filter(c => c.rattachement === rattachement);
      }
      if (fonction) {
        filtered = filtered.filter(c => c.fonction === fonction);
      }
      
      loadConsultationRates(filtered);
    });
  }

  if (btnResetTaux) {
    btnResetTaux.addEventListener("click", function() {
      document.getElementById("filterTauxFromDate").value = "";
      document.getElementById("filterTauxToDate").value = "";
      document.getElementById("filterTauxRattachement").value = "";
      document.getElementById("filterTauxFonction").value = "";
      loadConsultationRates(allConsultations);
    });
  }

  // Filtres GRAPHIQUES
  if (btnFilterCharts) {
    btnFilterCharts.addEventListener("click", function() {
      const fromDate = document.getElementById("filterChartsFromDate")?.value || "";
      const toDate = document.getElementById("filterChartsToDate")?.value || "";
      const rattachement = document.getElementById("filterChartsRattachement")?.value || "";
      const fonction = document.getElementById("filterChartsFonction")?.value || "";
      
      let filtered = allConsultations;
      if (fromDate) {
        filtered = filtered.filter(c => {
          const cDate = extractAndCorrectDate(c.date);
          return cDate >= fromDate;
        });
      }
      if (toDate) {
        filtered = filtered.filter(c => {
          const cDate = extractAndCorrectDate(c.date);
          return cDate <= toDate;
        });
      }
      if (rattachement) {
        filtered = filtered.filter(c => c.rattachement === rattachement);
      }
      if (fonction) {
        filtered = filtered.filter(c => c.fonction === fonction);
      }
      
      updateReportCharts(filtered);
    });
  }

  if (btnResetCharts) {
    btnResetCharts.addEventListener("click", function() {
      document.getElementById("filterChartsFromDate").value = "";
      document.getElementById("filterChartsToDate").value = "";
      document.getElementById("filterChartsRattachement").value = "";
      document.getElementById("filterChartsFonction").value = "";
      updateReportCharts(allConsultations);
    });
  }

  // Filtres COLLABORATEURS
  if (btnFilterCollab) {
    btnFilterCollab.addEventListener("click", function() {
      const fromDate = document.getElementById("filterCollabFromDate")?.value || "";
      const toDate = document.getElementById("filterCollabToDate")?.value || "";
      const rattachement = document.getElementById("filterCollabRattachement")?.value || "";
      const fonction = document.getElementById("filterCollabFonction")?.value || "";
      
      let filtered = allConsultations;
      if (fromDate) {
        filtered = filtered.filter(c => {
          const cDate = extractAndCorrectDate(c.date);
          return cDate >= fromDate;
        });
      }
      if (toDate) {
        filtered = filtered.filter(c => {
          const cDate = extractAndCorrectDate(c.date);
          return cDate <= toDate;
        });
      }
      if (rattachement) {
        filtered = filtered.filter(c => c.rattachement === rattachement);
      }
      if (fonction) {
        filtered = filtered.filter(c => c.fonction === fonction);
      }
      
      updateCollaboratorsTable(filtered);
    });
  }

  if (btnResetCollab) {
    btnResetCollab.addEventListener("click", function() {
      document.getElementById("filterCollabFromDate").value = "";
      document.getElementById("filterCollabToDate").value = "";
      document.getElementById("filterCollabRattachement").value = "";
      document.getElementById("filterCollabFonction").value = "";
      updateCollaboratorsTable(allConsultations);
    });
  }

  // Filtres SYNTHÈSES
  if (btnFilterSynthese) {
    btnFilterSynthese.addEventListener("click", function() {
      const fromDate = document.getElementById("filterSyntheseFromDate")?.value || "";
      const toDate = document.getElementById("filterSyntheseToDate")?.value || "";
      const rattachement = document.getElementById("filterSyntheseRattachement")?.value || "";
      const fonction = document.getElementById("filterSyntheseFonction")?.value || "";
      
      let filtered = allConsultations;
      if (fromDate) {
        filtered = filtered.filter(c => {
          const cDate = extractAndCorrectDate(c.date);
          return cDate >= fromDate;
        });
      }
      if (toDate) {
        filtered = filtered.filter(c => {
          const cDate = extractAndCorrectDate(c.date);
          return cDate <= toDate;
        });
      }
      if (rattachement) {
        filtered = filtered.filter(c => c.rattachement === rattachement);
      }
      if (fonction) {
        filtered = filtered.filter(c => c.fonction === fonction);
      }
      
      // Générer les matrices synthèses
      const rattachementStats = {};
      const fonctionStats = {};
      
      filtered.forEach(c => {
        // Stats par rattachement
        if (!rattachementStats[c.rattachement]) {
          rattachementStats[c.rattachement] = { consultation: 0, rm: 0, assistante: 0 };
        }
        if (c.resultat === "Consultation médical") {
          rattachementStats[c.rattachement].consultation++;
        } else if (c.resultat === "Repos médical") {
          rattachementStats[c.rattachement].rm++;
        } else if (c.resultat === "Assistante maternelle") {
          rattachementStats[c.rattachement].assistante++;
        }
        
        // Stats par fonction
        if (!fonctionStats[c.fonction]) {
          fonctionStats[c.fonction] = { consultation: 0, rm: 0, assistante: 0 };
        }
        if (c.resultat === "Consultation médical") {
          fonctionStats[c.fonction].consultation++;
        } else if (c.resultat === "Repos médical") {
          fonctionStats[c.fonction].rm++;
        } else if (c.resultat === "Assistante maternelle") {
          fonctionStats[c.fonction].assistante++;
        }
      });
      
      const matrixRattachement = document.getElementById("matrixRattachement");
      const matrixFonction = document.getElementById("matrixFonction");
      
      if (matrixRattachement) matrixRattachement.innerHTML = generateMatrixTable(rattachementStats);
      if (matrixFonction) matrixFonction.innerHTML = generateMatrixTable(fonctionStats);
    });
  }

  if (btnResetSynthese) {
    btnResetSynthese.addEventListener("click", function() {
      document.getElementById("filterSyntheseFromDate").value = "";
      document.getElementById("filterSyntheseToDate").value = "";
      document.getElementById("filterSyntheseRattachement").value = "";
      document.getElementById("filterSyntheseFonction").value = "";
      
      // Générer les matrices synthèses avec toutes les données
      const rattachementStats = {};
      const fonctionStats = {};
      
      allConsultations.forEach(c => {
        // Stats par rattachement
        if (!rattachementStats[c.rattachement]) {
          rattachementStats[c.rattachement] = { consultation: 0, rm: 0, assistante: 0 };
        }
        if (c.resultat === "Consultation médical") {
          rattachementStats[c.rattachement].consultation++;
        } else if (c.resultat === "Repos médical") {
          rattachementStats[c.rattachement].rm++;
        } else if (c.resultat === "Assistante maternelle") {
          rattachementStats[c.rattachement].assistante++;
        }
        
        // Stats par fonction
        if (!fonctionStats[c.fonction]) {
          fonctionStats[c.fonction] = { consultation: 0, rm: 0, assistante: 0 };
        }
        if (c.resultat === "Consultation médical") {
          fonctionStats[c.fonction].consultation++;
        } else if (c.resultat === "Repos médical") {
          fonctionStats[c.fonction].rm++;
        } else if (c.resultat === "Assistante maternelle") {
          fonctionStats[c.fonction].assistante++;
        }
      });
      
      const matrixRattachement = document.getElementById("matrixRattachement");
      const matrixFonction = document.getElementById("matrixFonction");
      
      if (matrixRattachement) matrixRattachement.innerHTML = generateMatrixTable(rattachementStats);
      if (matrixFonction) matrixFonction.innerHTML = generateMatrixTable(fonctionStats);
    });
  }

  // ================= CHECK ANOMALIES =================
  async function checkAnomaliesManually() {
    // Vérification de permissions: bloquer si mode production (readonly)
    if (userPermissions === "readonly") {
      showMessage("❌ Accès refusé: Mode production en lecture seule", "error");
      return;
    }

    try {
      const btn = document.getElementById("btnCheckAnomalies");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "⏳ Vérification...";
      }

      const res = await fetch(`${API_URL}?action=checkAnomalies`);
      const json = await res.json();

      if (json.success) {
        showMessage("✅ Vérification des anomalies effectuée ! Les consultations non fermées depuis plus de 24h ont été marquées comme 'anomalie'.");
        // Recharger les données
        loadDashboardData();
      } else {
        showMessage("❌ Erreur : " + json.error, "error");
      }
    } catch (e) {
      console.error("Erreur lors de la vérification des anomalies :", e);
      showMessage("❌ Erreur serveur lors de la vérification", "error");
    } finally {
      const btn = document.getElementById("btnCheckAnomalies");
      if (btn) {
        btn.disabled = false;
        btn.textContent = "🔍 Vérifier les anomalies";
      }
    }
  }

  // Ajouter l'event listener si le bouton existe
  const btnCheckAnomalies = document.getElementById("btnCheckAnomalies");
  if (btnCheckAnomalies) {
    btnCheckAnomalies.addEventListener("click", checkAnomaliesManually);
  }

  // ================= CALCULATE AND SET AVERAGE RETURN TIME =================
  // Quand l'utilisateur sélectionne "anomalie" dans le résultat
  // Cette fonction calcule automatiquement l'heure de retour
  //
  // FLUX:
  // 1. Récupérer l'heure de sortie de la personne
  // 2. Calculer la durée moyenne de TOUTES les consultations avec retour
  // 3. Heure de retour = Heure sortie + Durée moyenne
  // 4. Remplir automatiquement le champ "heure de retour"
  function calculateAndSetAverageReturnTime(matricule) {
    // ========== ÉTAPE 1: Récupérer l'heure de sortie ==========
    const pendingItem = document.querySelector(`.pending-item[data-id*="${matricule}"]`);
    if (!pendingItem) return;
    
    const timeRetourInput = pendingItem.querySelector(".time-retour");
    const heureSortieText = pendingItem.querySelector(".pending-details").textContent;
    
    // Extraire l'heure du texte affiché (format: "🕐 Sortie: HH:MM")
    const sortieMatch = heureSortieText.match(/Sortie: (\d{2}:\d{2})/);
    if (!sortieMatch) {
      console.warn("Impossible d'extraire l'heure de sortie");
      return;
    }
    
    const heureSortie = sortieMatch[1];
    console.log("Heure de sortie extraite: " + heureSortie);
    
    // ========== ÉTAPE 2: Calculer la durée moyenne ==========
    // Cette fonction parcourt TOUTES les consultations chargées
    // et calcule la moyenne entre retour et sortie
    const averageMinutes = calculateAverageDurationFromConsultations();
    // ========== ÉTAPE 3: Ajouter la durée à l'heure de sortie ==========
    const heureRetour = addMinutesToTimeString(heureSortie, averageMinutes);
    
    // ========== ÉTAPE 4: Remplir le champ ==========
    timeRetourInput.value = heureRetour;
  }

  // ================= CALCULATE AVERAGE DURATION FROM CONSULTATIONS =================
  // Calcule la durée MOYENNE pour les CONSULTATIONS D'HIER SEULEMENT (J-1)
  //
  // FORMULE:
  // Durée moyenne = Somme(retour - sortie) / Nombre de consultations avec retour HIER
  //
  // EXEMPLE:
  //   Hier (J-1):
  //     Consultation A: Sortie 10:00, Retour 11:30 → Durée = 90 minutes
  //     Consultation B: Sortie 12:00, Retour 12:30 → Durée = 30 minutes
  //   Moyenne = (90 + 30) / 2 = 120 / 2 = 60 minutes = 1h00
  function calculateAverageDurationFromConsultations() {
    // ========== ÉTAPE 1: Calculer la date d'HIER (J-1) ==========
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Formater la date d'hier pour comparaison
    const yesterdayString = yesterday.getFullYear() + "-" + 
                           String(yesterday.getMonth() + 1).padStart(2, "0") + "-" +
                           String(yesterday.getDate()).padStart(2, "0");
    
    console.log("Calcul de la durée moyenne pour: " + yesterdayString);
    
    // ========== ÉTAPE 2: Vérifier si on a des données ==========
    if (allConsultations.length === 0) {
      console.warn("Aucune consultation chargée, utilisant durée par défaut 1h25");
      return 85; // 1h25 par défaut
    }
    
    let totalMinutes = 0;
    let countWithReturn = 0;
    let details = []; // Pour le log
    
    // ========== ÉTAPE 3: Parcourir TOUTES les consultations ==========
    allConsultations.forEach(c => {
      // Extraire la date de la consultation
      let consultationDate = c.date;
      if (!consultationDate) return;
      
      // Harmoniser le format de date pour comparaison
      let dateStr = "";
      if (consultationDate.includes("T")) {
        // Format ISO: "2026-04-03T15:00:00Z"
        dateStr = consultationDate.split("T")[0];
      } else if (consultationDate.includes("-")) {
        // Format "2026-04-03"
        dateStr = consultationDate;
      } else {
        return;
      }
      
      // ========== ÉTAPE 4: Vérifier que la date = HIER ==========
      if (dateStr === yesterdayString) {
        const heureSortie = c.heureSortie;
        const heureRetour = c.heureRetour;
        
        // ========== ÉTAPE 5: Vérifier que SORTIE et RETOUR existent ==========
        // On ne compte QUE les consultations avec un retour enregistré HIER
        if (heureSortie && heureRetour && heureSortie !== "" && heureRetour !== "") {
          // ========== ÉTAPE 6: Convertir en minutes ==========
          const sortieMinutes = timeStringToMinutes(heureSortie);  // Ex: 10:00 → 600
          const retourMinutes = timeStringToMinutes(heureRetour);  // Ex: 11:30 → 690
          
          if (sortieMinutes !== null && retourMinutes !== null) {
            // ========== ÉTAPE 7: Calculer la différence ==========
            let diffMinutes = retourMinutes - sortieMinutes;
            
            // Si résultat négatif, c'est parce que le retour est le lendemain
            if (diffMinutes < 0) {
              diffMinutes += 24 * 60; // Ajouter 24h (1440 minutes)
            }
            
            // ========== ÉTAPE 8: Additionner à la durée totale ==========
            totalMinutes += diffMinutes;
            countWithReturn++;
            
            details.push({
              nom: c.nom,
              sortie: heureSortie,
              retour: heureRetour,
              duree: Math.floor(diffMinutes / 60) + "h" + (diffMinutes % 60)
            });
          }
        }
      }
    });
    
    // ========== ÉTAPE 9: Calculer et retourner la moyenne ==========
    if (countWithReturn > 0) {
      const averageMinutes = Math.round(totalMinutes / countWithReturn);
      console.log("✓ Durée moyenne calculée sur " + countWithReturn + " consultations d'HIER");
      console.log("  Total: " + totalMinutes + " min, Moyenne: " + averageMinutes + " min");
      details.forEach(d => {
        console.log("  - " + d.nom + ": " + d.sortie + " → " + d.retour + " (" + d.duree + ")");
      });
      return averageMinutes;
    } else {
      console.warn("⚠️ Aucune consultation avec retour trouvée HIER, utilisant durée par défaut 1h25");
      return 85; // 1h25 par défaut
    }
  }

  // ================= TIME STRING TO MINUTES HELPER =================
  // Convertit une heure "HH:MM" en nombre de minutes depuis minuit
  // EXEMPLES:
  //   "10:00" → 600 minutes (10*60 + 0)
  //   "11:30" → 690 minutes (11*60 + 30)
  //   "13:45" → 825 minutes (13*60 + 45)
  function timeStringToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== "string") return null;
    
    const parts = timeStr.split(":");
    if (parts.length < 2) return null;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    return hours * 60 + minutes;
  }

  // ================= ADD MINUTES TO TIME STRING HELPER =================
  // Ajoute des minutes à une heure donnée
  // EXEMPLES:
  //   addMinutesToTimeString("10:00", 90) → "11:30"
  //   addMinutesToTimeString("13:30", 85) → "14:55"
  //   addMinutesToTimeString("23:00", 120) → "01:00" (lendemain)
  function addMinutesToTimeString(timeStr, minutesToAdd) {
    if (!timeStr || typeof timeStr !== "string") return "";
    
    const parts = timeStr.split(":");
    if (parts.length < 2) return "";
    
    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) return "";
    
    // ========== ÉTAPE 1: Ajouter les minutes ==========
    minutes += minutesToAdd;
    
    // ========== ÉTAPE 2: Gérer le débordement des minutes ==========
    // Si minutes >= 60, convertir en heures supplémentaires
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
    }
    
    // ========== ÉTAPE 3: Gérer le débordement des heures ==========
    // Si heures >= 24, c'est le lendemain (modulo 24)
    if (hours >= 24) {
      hours = hours % 24;
    }
    
    return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
  }
}); // Fermeture du addEventListener("DOMContentLoaded", function () { ... })