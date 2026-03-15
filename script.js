document.addEventListener("DOMContentLoaded", function () {

  const API_URL = "https://script.google.com/macros/s/AKfycbyAC_2REMBxsH6YWYYDcNUAN7lPu4tF4wauOR4gKosPPiauO6DXTP04Mcm99VQTywNenw/exec";
  
  
  // ================= STATE =================
  let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  let allCollaborateurs = [];
  let allConsultations = [];
  let chartCamembert = null;
  let chartJours = null;

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
  const btnSave = document.getElementById("btnSave");
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
  const btnReposHistory = document.getElementById("btnReposHistory");
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
  let waitingPersonnes = []; // Stocke les personnes en attente

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
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    console.log("Tentative de login:", {username, password});

    if (username === "admin" && password === "ostie") {
      isLoggedIn = true;
      localStorage.setItem("isLoggedIn", "true");
      loginError.textContent = "";
      loginPage.classList.remove("active");
      appPage.classList.add("active");
      usernameInput.value = "";
      passwordInput.value = "";
      showMessage("✅ Connecté avec succès!");
      loadCollaborateurs();
    } else {
      console.warn("Login échoué - identifiants incorrects");
      loginError.textContent = "❌ Identifiant ou mot de passe incorrect (admin/ostie)";
    }
  });

  logoutBtn.addEventListener("click", function () {
    isLoggedIn = false;
    localStorage.setItem("isLoggedIn", "false");
    loginPage.classList.add("active");
    appPage.classList.remove("active");
    resetForm();
  });

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
        // Charger tous les consultations du rapport
        displayReport(allConsultations);
      }
    });
  });

  // ================= LOAD COLLABORATEURS =================
  async function loadCollaborateurs() {
    try {
      console.log("Chargement des collaborateurs...");
      const res = await fetch(`${API_URL}?action=getCollaborateurs`);
      console.log("Réponse reçue:", res);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const json = await res.json();
      console.log("Données JSON:", json);

      if (!json.success) throw new Error(json.error);

      allCollaborateurs = json.data;
      populateSelect("");
      console.log("Collaborateurs chargés avec succès:", allCollaborateurs.length);

    } catch (e) {
      console.error("Erreur chargement collaborateurs :", e);
      showMessage("⚠️ Erreur lors du chargement des collaborateurs : " + e.message, "error");
      collaborateurSelect.innerHTML = "<option>❌ Erreur chargement: " + e.message + "</option>";
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
  // Désactivé - force l'utilisateur à se reconnecter à chaque fois
  // if (isLoggedIn) {
  //   loginPage.classList.remove("active");
  //   appPage.classList.add("active");
  //   loadCollaborateurs();
  // }

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

    formConsultation.style.display = "block";
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

  // ================= AJOUTER À LA LISTE D'ATTENTE =================
  if (btnAddToWaiting) {
    btnAddToWaiting.addEventListener("click", function () {
      if (!collaborateurSelect.value) {
        showMessage("❌ Sélectionnez un collaborateur", "error");
        return;
      }

      const c = JSON.parse(collaborateurSelect.value);
      
      // Vérifier si déjà en attente
      if (waitingPersonnes.some(p => p.matricule === c.matricule)) {
        showMessage("⚠️ Cette personne est déjà en attente", "error");
        return;
      }

      waitingPersonnes.push(c);
      updateWaitingList();
      showMessage("✅ Ajouté à la liste d'attente");
      collaborateurSelect.value = "";
      searchInput.value = "";
    });
  }

  function updateWaitingList() {
    waitingCount.textContent = waitingPersonnes.length;
    waitingList.innerHTML = "";

    if (waitingPersonnes.length === 0) {
      waitingSection.style.display = "none";
      return;
    }

    waitingSection.style.display = "block";

    waitingPersonnes.forEach((personne, index) => {
      const item = document.createElement("div");
      item.className = "waiting-item";
      item.innerHTML = `
        <input type="checkbox" class="waiting-checkbox" data-index="${index}">
        <div class="waiting-item-info">
          <div class="waiting-item-matricule">${personne.matricule}</div>
          <div class="waiting-item-nom">${personne.nom}</div>
        </div>
      `;

      const checkbox = item.querySelector(".waiting-checkbox");
      checkbox.addEventListener("change", function () {
        if (this.checked) {
          selectFromWaiting(index);
        }
      });

      waitingList.appendChild(item);
    });
  }

  function selectFromWaiting(index) {
    const personne = waitingPersonnes[index];
    
    // Remplir le formulaire
    collaborateurSelect.value = JSON.stringify(personne);
    
    // Afficher les détails
    matriculeSpan.textContent = personne.matricule;
    nomPrenomSpan.textContent = personne.nom;
    fonctionSpan.textContent = personne.fonction || "-";
    rattachementSpan.textContent = personne.rattachement || "-";
    
    // Remplir heure de sortie automatiquement
    const todayISO = getTodayMadagascar(); // Format YYYY-MM-DD
    const now = new Date();
    const time = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    
    dateInput.value = todayISO;
    heureSortieInput.value = time;

    // Retirer de la liste d'attente
    waitingPersonnes.splice(index, 1);
    updateWaitingList();

    showMessage("✅ Personne sélectionnée, veuillez compléter le formulaire");
  }

  // ================= SAVE CONSULTATION =================
  formConsultation.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!validateForm()) return;

    const c = JSON.parse(collaborateurSelect.value);

    const params = new URLSearchParams({
      action: "saveConsultation",
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
      retourImmediatelyChecked: retourImmediatelyCheckbox.checked
    });

    try {
      btnSave.disabled = true;
      btnSave.textContent = "⏳ Enregistrement...";

      const res = await fetch(`${API_URL}?${params}`);
      const json = await res.json();

      if (json.success) {
        showMessage("✅ Enregistré avec succès !");
        resetForm();
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
    btnSave.disabled = false;
    btnSave.textContent = "✓ Enregistrer";
  }

  // ================= DASHBOARD =================
  async function loadDashboardData() {
    try {
      const res = await fetch(`${API_URL}?action=getConsultations`);
      const json = await res.json();

      if (!json.success) throw new Error(json.error);

      allConsultations = json.data || [];
      
      updateStatistics();
      updateCharts();
      updatePendingList();
      updateDashboardInfo(); // Mettre à jour l'indicateur de période
      populateFilterSelects(); // Remplir les sélects des filtres
      displayReport(allConsultations); // Afficher le rapport initial

    } catch (e) {
      console.error("Erreur chargement dashboard :", e);
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
    const total = todayConsultations.length;
    
    // ========== EN ATTENTE: Consultations d'AUJOURD'HUI sans retour ==========
    const enAttente = todayConsultations.filter(c => !c.heureRetour || c.heureRetour === "").length;
    
    // ========== REPOS MÉDICAL: Compter "Repos médical" d'AUJOURD'HUI ==========
    const repos = todayConsultations.filter(c => c.resultat === "Repos médical").length;
    
    // ========== JOURS RM: Somme des jours de repos médical d'AUJOURD'HUI ==========
    const joursRM = todayConsultations.reduce((sum, c) => {
      const jours = parseInt(c.nbJourRM) || 0;
      return sum + jours;
    }, 0);

    statTotal.textContent = total;
    statEnAttente.textContent = enAttente;
    statRepos.textContent = repos;
    
    // Si le stat pour jours RM existe, le remplir
    const statJoursRM = document.getElementById("statJoursRM");
    if (statJoursRM) {
      statJoursRM.textContent = joursRM;
    }
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
      // CORRECTION: >= 3 au lieu de > 3
      const isAlert = collab.count >= 3;
      
      if (isAlert) {
        row.style.backgroundColor = "#ffebee";
        row.style.color = "#c62828";
        row.style.fontWeight = "bold";
      }
      
      row.innerHTML = `
        <td>${collab.nom}</td>
        <td style="text-align: center;">
          <span style="display: inline-block; min-width: 30px; padding: 4px 8px; border-radius: 12px; ${isAlert ? 'background-color: #ef5350; color: white;' : 'background-color: #e3f2fd; color: #1976d2;'} font-weight: bold;">
            ${collab.count}
          </span>
        </td>
        <td style="text-align: center;">${collab.joursRM}</td>
        <td style="text-align: center;">${collab.shiftNuit}</td>
        <td>${collab.fonction || "-"}</td>
        <td>${collab.rattachement || "-"}</td>
      `;
      
      tbody.appendChild(row);
    });
  }

  function updateCharts() {
    // ========== UTILISER LES CONSULTATIONS D'AUJOURD'HUI SEULEMENT ==========
    const todayConsultations = getTodayConsultations();
    
    const consultation = todayConsultations.filter(c => c.resultat === "Consultation médical").length;
    const repos = todayConsultations.filter(c => c.resultat === "Repos médical").length;
    const assistante = todayConsultations.filter(c => c.resultat === "Assistante maternelle").length;
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

    // Chart Jours - Consultations totales par jour
    const consultationParJour = {};
    allConsultations.forEach(c => {
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

  /**
   * Obtient les consultations en attente de retour
   * @returns {Array} Consultations sans heure de retour enregistrée
   */
  function getPendingConsultations() {
    return allConsultations.filter(c => !c.heureRetour);
  }

  function updatePendingList() {
    const pending = getPendingConsultations();
    let allPendingItems = pending; // Garder la liste complète pour la recherche

    if (pending.length === 0) {
      pendingList.innerHTML = '<div class="empty-pending">✓ Tous les collaborateurs sont de retour !</div>';
      return;
    }

    // Fonction pour afficher/filtrer la liste
    function displayPendingList(itemsToDisplay) {
      pendingList.innerHTML = itemsToDisplay.map(c => `
        <div class="pending-item" data-id="${c.id || c.matricule}" data-search="${(c.nom + ' ' + c.matricule).toLowerCase()}">
          <div class="pending-info">
            <div class="pending-name">👤 ${c.nom}</div>
            <div class="pending-details">
              <span>📍 Matricule: <strong>${c.matricule}</strong></span> |
              <span>🕐 Sortie: ${extractTimeFromISO(c.heureSortie)}</span> |
              <span>🏥 ${c.typeConsultation}</span> |
              <span>📍 ${c.lieuConsultation}</span> |
              <span>🌙 ${c.shift}</span>
            </div>
          </div>
          <div class="pending-actions">
            <input type="checkbox" class="checkbox-retour" data-matricule="${c.matricule}">
            <input type="time" class="time-retour" data-matricule="${c.matricule}" placeholder="Heure retour" disabled>
            
            <select class="select-resultat" data-matricule="${c.matricule}" disabled>
              <option value="">-- Résultat --</option>
              <option value="Consultation médical">Consultation médical</option>
              <option value="Assistante maternelle">Assistante maternelle</option>
              <option value="Repos médical">Repos médical</option>
              <option value="anomalie">anomalie</option>
            </select>
            
            <input type="number" class="input-nbjours" data-matricule="${c.matricule}" min="0.5" step="0.5" placeholder="Nombre de jours" disabled style="display:none;">
            
            <button class="btn-confirm-retour" data-matricule="${c.matricule}" disabled>OK</button>
          </div>
        </div>
      `).join("");

      // Ajouter les événements
      attachPendingEventListeners();
    }

    // Afficher la liste initiale
    displayPendingList(pending);

    // ========== AJOUTER LA RECHERCHE ==========
    const searchPending = document.getElementById("searchPending");
    if (searchPending) {
      searchPending.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase();
        
        if (searchTerm === "") {
          displayPendingList(allPendingItems);
        } else {
          const filtered = allPendingItems.filter(c => {
            return (c.nom.toLowerCase().includes(searchTerm) || c.matricule.toLowerCase().includes(searchTerm));
          });
          displayPendingList(filtered);
        }
      });
    }
  }

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
          matricule: matricule,
          heureRetour: timeInput.value,
          resultat: selectResultat.value,
          nbJourRM: inputJours.value
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

    // Compter le nombre de jours uniques dans les données
    const uniqueDates = new Set();
    allConsultations.forEach(c => {
      const correctedDate = extractAndCorrectDate(c.date);
      if (correctedDate !== "-") uniqueDates.add(correctedDate);
    });

    const dateCount = uniqueDates.size;
    if (dateCount === 0) {
      dashboardSubtitle.innerHTML = 'Vue d\'ensemble de <strong>toutes les consultations</strong>';
    } else if (dateCount === 1) {
      const date = Array.from(uniqueDates)[0];
      dashboardSubtitle.innerHTML = `Vue d'ensemble de <strong>${dateCount} jour</strong> (${date})`;
    } else {
      const dates = Array.from(uniqueDates).sort();
      dashboardSubtitle.innerHTML = `Vue d'ensemble de <strong>${dateCount} jours</strong> (${dates[0]} à ${dates[dates.length - 1]})`;
    }
  }

  /**
   * Remplir les sélects des filtres (Rattachement et Fonction)
   */
  function populateFilterSelects() {
    // Extraire les valeurs uniques de rattachement
    const rattachements = new Set();
    allConsultations.forEach(c => {
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
  }

  // ================= UPDATE DASHBOARD INFO INDICATORS =================

  // ================= RAPPORT CONSULTATIONS PASSÉES =================
  function displayReport(consultations) {
    reportTableBody.innerHTML = "";

    if (consultations.length === 0) {
      reportTableBody.innerHTML = '<tr><td colspan="12" style="text-align: center; padding: 20px;">Aucune consultation trouvée</td></tr>';
    } else {
      consultations.forEach(c => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${c.matricule}</td>
          <td>${c.nom}</td>
          <td>${c.fonction}</td>
          <td>${extractAndCorrectDate(c.date)}</td>
          <td>${c.typeConsultation}</td>
          <td>${c.lieuConsultation}</td>
          <td>${c.choix || "-"}</td>
          <td>${c.shift}</td>
          <td>${extractTimeFromISO(c.heureSortie)}</td>
          <td>${c.heureRetour ? extractTimeFromISO(c.heureRetour) : "-"}</td>
          <td>${c.resultat || "-"}</td>
          <td>${c.nbJourRM || "-"}</td>
        `;
        reportTableBody.appendChild(row);
      });
    }
    
    updateCollaboratorsTable(consultations);
    updateReportStatistics(consultations);
    updateReportCharts(consultations);
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
      displayReport(allConsultations);
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
  if (btnReposHistory) {
    btnReposHistory.addEventListener("click", function () {
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

  // ================= CHECK ANOMALIES =================
  async function checkAnomaliesManually() {
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
    console.log("Durée moyenne calculée: " + averageMinutes + " minutes (" + 
                Math.floor(averageMinutes / 60) + "h" + (averageMinutes % 60) + ")");
    
    // ========== ÉTAPE 3: Ajouter la durée à l'heure de sortie ==========
    // Formule: Heure retour = Heure sortie + Durée moyenne
    const heureRetour = addMinutesToTimeString(heureSortie, averageMinutes);
    console.log("Heure de retour calculée: " + heureRetour);
    
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

});