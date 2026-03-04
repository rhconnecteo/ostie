document.addEventListener("DOMContentLoaded", function () {

  const API_URL = "https://script.google.com/macros/s/AKfycbyK-ftTqAocYh7HI8HDV64Dtj1S2BpxCzphKdIbUP3hvALbnM0Wqvl7oV5Akoev7Eo74w/exec";
  

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

    } catch (e) {
      console.error("Erreur chargement dashboard :", e);
    }
  }

  function updateStatistics() {
    // Obtenir la date d'aujourd'hui
    const todayISO = getTodayMadagascar();
    console.log("Date d'aujourd'hui (ISO):", todayISO);
    console.log("Total consultations en base:", allConsultations.length);
    
    // Filtrer SEULEMENT les consultations d'aujourd'hui (jour J) avec date corrigée
    const todayConsultations = allConsultations.filter(c => {
      const correctedDate = extractAndCorrectDate(c.date);
      return correctedDate === todayISO;
    });
    
    console.log("Consultations d'aujourd'hui:", todayConsultations.length);
    
    const total = todayConsultations.length;
    const enAttente = todayConsultations.filter(c => !c.heureRetour).length;
    const repos = todayConsultations.filter(c => c.resultat === "Repos médical").length;

    statTotal.textContent = total;
    statEnAttente.textContent = enAttente;
    statRepos.textContent = repos;
  }

  function updateCharts() {
    const consultation = allConsultations.filter(c => c.resultat === "Consultation médical").length;
    const repos = allConsultations.filter(c => c.resultat === "Repos médical").length;

    // Chart Camembert
    const ctxCamembert = document.getElementById("chartCamembert").getContext("2d");
    if (chartCamembert) chartCamembert.destroy();
    
    chartCamembert = new Chart(ctxCamembert, {
      type: "doughnut",
      data: {
        labels: ["Consultation Médical", "Repos Médical"],
        datasets: [{
          data: [consultation, repos],
          backgroundColor: ["#667eea", "#e74c3c"],
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

    // Chart Jours
    const consultationParJour = {};
    allConsultations.forEach(c => {
      // Extraire et corriger la date en format ISO (YYYY-MM-DD) depuis c.date
      const correctedDate = extractAndCorrectDate(c.date);
      const dateKey = correctedDate !== "-" ? correctedDate : "";
      consultationParJour[dateKey] = (consultationParJour[dateKey] || 0) + 1;
    });

    const dates = Object.keys(consultationParJour).sort().slice(-7);
    const counts = dates.map(d => consultationParJour[d]);
    // Formater les dates en DD-MM-YYYY
    const formattedDates = dates.map(d => {
      const parts = d.split("-");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
      }
      return d;
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
          y: { beginAtZero: true }
        }
      }
    });
  }

  function updatePendingList() {
    const pending = allConsultations.filter(c => !c.heureRetour);

    if (pending.length === 0) {
      pendingList.innerHTML = '<div class="empty-pending">✓ Tous les collaborateurs sont de retour !</div>';
      return;
    }

    pendingList.innerHTML = pending.map(c => `
      <div class="pending-item" data-id="${c.id || c.matricule}">
        <div class="pending-info">
          <div class="pending-name">👤 ${c.nom} ${c.prenom || ""}</div>
          <div class="pending-details">
            <span>📍 Matricule: ${c.matricule}</span> |
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
            <option value="Repos médical">Repos médical</option>
          </select>
          
          <input type="number" class="input-nbjours" data-matricule="${c.matricule}" min="0.5" step="0.5" placeholder="Jours RM" disabled style="display:none;">
          
          <button class="btn-confirm-retour" data-matricule="${c.matricule}" disabled>OK</button>
        </div>
      </div>
    `).join("");

    // Ajouter les événements
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
        
        if (this.value === "Repos médical") {
          inputJours.style.display = "inline-block";
          inputJours.disabled = false;
          inputJours.focus();
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

        if (selectResultat.value === "Repos médical" && (!inputJours.value || parseFloat(inputJours.value) <= 0)) {
          showMessage("❌ Le nombre de jours RM est obligatoire", "error");
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
    
    if (valid && selectResultat.value === "Repos médical") {
      valid = inputJours.value && parseFloat(inputJours.value) > 0;
    }

    item.disabled = !valid;
  }

});