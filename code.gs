// ================= CONFIG =================
const SHEET_ID = "1wuDhND9dj2_sEbnTj_Ui5SUbZY-Yhmj7kfjauBJD91I";
const TIME_ZONE = "Africa/Johannesburg"; // Madagascar timezone (UTC+3)
 
// Note: login/permission logic removed to simplify usage.
// All actions are allowed and no password-based filtering is applied.

// ================= DO GET =================
function doGet(e) {
  // Guard: Si doGet est appelée sans paramètres (test direct), créer un objet vide
  if (!e) {
    e = { parameter: {} };
  }
  
  const action = e.parameter.action;

  try {
    
    if (action === "getCartes") {
      return output({ success: true, data: getCartes() });
    }
    if (action === "getCollaborateurs") {
      return output({ success: true, data: getCollaborateurs() });
    }
    if (action === "saveConsultation") {
      const data = {
        matricule: e.parameter.matricule,
        nom: e.parameter.nom,
        fonction: e.parameter.fonction,
        rattachement: e.parameter.rattachement,
        typeConsultation: e.parameter.typeConsultation,
        lieuConsultation: e.parameter.lieuConsultation,
        choix: e.parameter.choix,
        shift: e.parameter.shift,
        dateSortie: e.parameter.dateSortie,
        heureSortie: e.parameter.heureSortie,
        heureRetour: e.parameter.heureRetour || "",
        retourImmediatelyChecked: e.parameter.retourImmediatelyChecked === "true",
        casGrave: e.parameter.casGrave || "non",
        commentaires: e.parameter.commentaires || ""
      };
      saveConsultation(data);
      return output({ success: true });
    }
    if (action === "getConsultations") {
      return output({ success: true, data: getConsultations() });
    }
    if (action === "setRetour") {
      const data = {
        matricule: e.parameter.matricule,
        rowNumber: e.parameter.rowNumber || "",
        heureRetour: e.parameter.heureRetour,
        resultat: e.parameter.resultat,
        nbJourRM: e.parameter.nbJourRM || "",
        anomalie: e.parameter.anomalie || "",
        casGrave: e.parameter.casGrave || "",
        commentaires: e.parameter.commentaires || "",
        heureEntreeOstie: e.parameter.heureEntreeOstie || "",
        heureSortieOstie: e.parameter.heureSortieOstie || ""
      };
      setRetour(data);
      return output({ success: true });
    }
    if (action === "setTempsOstie") {
      const data = {
        matricule: e.parameter.matricule,
        rowNumber: e.parameter.rowNumber || "",
        heureEntreeOstie: e.parameter.heureEntreeOstie || "",
        heureSortieOstie: e.parameter.heureSortieOstie || ""
      };
      setTempsOstie(data);
      return output({ success: true });
    }
    if (action === "checkAnomalies") {
      checkAndCloseAnomalies();
      return output({ success: true, message: "Vérification anomalies effectuée" });
    }
    if (action === "getConsultationRates") {
      return output({ success: true, data: calculateConsultationRates() });
    }
    if (action === "addToWaiting") {
      const data = {
        matricule: e.parameter.matricule,
        nom: e.parameter.nom,
        fonction: e.parameter.fonction,
        rattachement: e.parameter.rattachement
        // L'heure sera calculée côté serveur (pas du client)
      };
      addToWaitingList(data);
      return output({ success: true });
    }
    if (action === "getWaitingList") {
      return output({ success: true, data: getWaitingList() });
    }
    if (action === "removeFromWaiting") {
      const matricule = e.parameter.matricule;
      removeFromWaitingList(matricule);
      return output({ success: true });
    }
    return output({ success: false, error: "Action inconnue" });
  } catch (err) {
    return output({ success: false, error: err.toString() });
  }
}

// Login validation removed — public access to endpoints

// ================= CALCULATE CONSULTATION RATES =================
// Calcule le taux de consultation par rattachement
// Taux = Nombre de personnes uniques qui ont eu une consultation / Total de collaborateurs
function calculateConsultationRates() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  // Récupérer les collaborateurs de la feuille "Grande"
  const grandeSheet = ss.getSheetByName("Grande");
  const grandeData = grandeSheet.getDataRange().getValues();
  grandeData.shift(); // enlever header
  
  // Récupérer les consultations de la feuille "OSTIE"
  const ostieSheet = ss.getSheetByName("OSTIE");
  const ostieData = ostieSheet.getDataRange().getValues();
  ostieData.shift(); // enlever header
  
  // Accès public: aucun filtrage par rattachement (liste vide = tous)
  let allowedRattachements = [];
  
  // Créer une map: rattachement -> {totalColaborateurs, uniquePersonnes}
  let ratesMap = {};
  
  // Étape 1: Compter les collaborateurs par rattachement
  grandeData.forEach(row => {
    const rattachement = row[3]; // Colonne D
    if (rattachement && rattachement !== "") {
      if (!ratesMap[rattachement]) {
        ratesMap[rattachement] = {
          totalCollaborateurs: 0,
          uniqueMatricules: new Set(),
          rattachement: rattachement
        };
      }
      ratesMap[rattachement].totalCollaborateurs++;
    }
  });
  
  // Étape 2: Compter les personnes uniques qui ont eu une consultation
  ostieData.forEach(row => {
    const rattachement = row[3]; // Colonne D
    const matricule = row[0];     // Colonne A
    if (rattachement && rattachement !== "" && matricule && matricule !== "") {
      if (ratesMap[rattachement]) {
        ratesMap[rattachement].uniqueMatricules.add(matricule);
      }
    }
  });
  
  // Étape 3: Calculer les taux
  let rates = [];
  for (const rattachement in ratesMap) {
    const data = ratesMap[rattachement];
    const uniqueCount = data.uniqueMatricules.size;
    const percentage = data.totalCollaborateurs > 0 
      ? Math.round((uniqueCount / data.totalCollaborateurs) * 100) 
      : 0;
    
    // Appliquer le filtre si nécessaire
    if (allowedRattachements.length === 0 || allowedRattachements.includes(rattachement)) {
      rates.push({
        rattachement: rattachement,
        totalCollaborateurs: data.totalCollaborateurs,
        personnesAvecConsultation: uniqueCount,
        taux: percentage
      });
    }
  }
  
  // Trier par rattachement
  rates.sort((a, b) => a.rattachement.localeCompare(b.rattachement));
  
  return rates;
}

// ================= GET CARTES (Cartes visuelles pour chaque rattachement) =================
// Génère des cartes visuelles pour chaque rattachement avec statistiques
function getCartes() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("OSTIE");
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return {}; // pas de données
  
  data.shift(); // enlever header
  
  // Accès public: aucun filtrage par rattachement (liste vide = tous)
  let allowedRattachements = [];
  
  // Récupérer tous les rattachements uniques
  let rattachements = new Set();
  data.forEach(r => {
    if (r[3]) { // Colonne D = Rattachement
      rattachements.add(r[3]);
    }
  });
  
  let cartes = {};
  
  // Créer une carte pour chaque rattachement
  rattachements.forEach(rattachement => {
    const consultationsRattachement = data.filter(r => r[3] === rattachement);
    
    // Compter les consultations sans retour (anomalies)
    const sansRetour = consultationsRattachement.filter(r => r[10] === "" || r[10] === null).length;
    const total = consultationsRattachement.length;
    const complete = total - sansRetour;
    
    cartes[rattachement] = {
      name: rattachement,
      total: total,
      complete: complete,
      pending: sansRetour,
      percentComplete: total > 0 ? Math.round((complete / total) * 100) : 0,
      color: sansRetour > 0 ? "#FFA500" : "#4CAF50" // Orange si anomalies, Vert sinon
    };
  });
  
  return cartes;
}

// ================= GET COLLABORATEURS =================
function getCollaborateurs() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Grande");
  const data = sheet.getDataRange().getValues();
  data.shift(); // enlever header

  // A=Matricule, B=Nom et Prénom, C=Fonction, D=Rattachement
  return data.map(r => ({
    matricule: r[0],    // Colonne A
    nom: r[1],          // Colonne B (Nom et Prénom)
    fonction: r[2],     // Colonne C
    rattachement: r[3]  // Colonne D
  }));
}

// ================= GET CONSULTATIONS =================
// Renvoie toutes les consultations (plus de filtrage par mot de passe)
function getConsultations() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("OSTIE");
  
  // ========== ÉTAPE 1: CRÉER LES COLONNES SI MANQUANTES ==========
  ensureColumnsExist();
  
  const data = sheet.getDataRange().getDisplayValues();  // Utiliser getDisplayValues() pour garder le format texte
  if (data.length <= 1) return []; // pas de données
  
  // Log le nombre de colonnes pour debug
  console.log(`📊 Nombre de colonnes in Sheet: ${data[0].length}`);
  
  data.shift(); // enlever header

  // Accès public: aucun filtrage par rattachement (liste vide = tous)
  let allowedRattachements = [];

  // STRUCTURE RÉELLE DU SPREADSHEET:
  // A=Matricule, B=Nom, C=Fonction, D=Rattachement, 
  // E=Type consultation, F=Lieu consultation, G=Shift,
  // H=Choix, I=Date, J=Heure sortie, K=Heure retour, L=Résultat, M=Jours RM, 
  // N=Anomalie, O=Cas grave, P=Commentaires, Q=Heure Entrée Ostie, R=Heure Sortie Ostie
  let consultations = data.map((r, index) => ({
    rowNumber: index + 2,
    matricule: r[0],
    nom: r[1],
    fonction: r[2],
    rattachement: r[3],
    typeConsultation: r[4] || "",   // Colonne E
    lieuConsultation: r[5] || "",   // Colonne F
    shift: r[6] || "",              // Colonne G
    choix: r[7] || "",              // Colonne H
    date: r[8],                     // Colonne I
    heureSortie: r[9],              // Colonne J
    heureRetour: r[10] || "",       // Colonne K
    resultat: r[11] || "",          // Colonne L
    nbJourRM: r[12] || "",          // Colonne M
    anomalie: r[13] || "",          // Colonne N
    casGrave: r[14] || "",          // Colonne O
    commentaires: r[15] || "",      // Colonne P
    heureEntreeOstie: r[16] || "",  // Colonne Q
    heureSortieOstie: r[17] || ""   // Colonne R
  }));

  // FILTRER par rattachement si la liste n'est pas vide
  // (si liste vide = tous les rattachements)
  if (allowedRattachements.length > 0) {
    consultations = consultations.filter(c => 
      allowedRattachements.includes(c.rattachement)
    );
  }

  return consultations;
}

// ================= ENSURE COLUMNS EXIST =================
// Crée les colonnes Q et R s'ils n'existent pas
function ensureColumnsExist() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("OSTIE");
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Vérifier si les colonnes existent déjà
  const hasHeureEntreeOstie = headerRow.some(h => h === "Heure Entrée Ostie" || h === "heureEntreeOstie");
  const hasHeureSortieOstie = headerRow.some(h => h === "Heure Sortie Ostie" || h === "heureSortieOstie");
  
  // Ajouter les colonnes si manquantes
  if (!hasHeureEntreeOstie) {
    const lastCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, lastCol).setValue("Heure Entrée Ostie");
  }
  
  if (!hasHeureSortieOstie) {
    const lastCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, lastCol).setValue("Heure Sortie Ostie");
  }
}

// ================= SAVE CONSULTATION =================
function saveConsultation(d) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("OSTIE");

  // Récupérer les données du collaborateur depuis "Grande" (recherche ciblée)
  const grandeSheet = ss.getSheetByName("Grande");
  const grandeLastRow = grandeSheet.getLastRow();
  let fonction = "";
  let rattachement = "";

  // Optimisation: éviter de charger toute la feuille Grande à chaque enregistrement
  const matricule = String(d.matricule || "").trim();
  if (grandeLastRow > 1 && matricule !== "") {
    const searchRange = grandeSheet.getRange(2, 1, grandeLastRow - 1, 1); // Colonne A uniquement
    const foundCell = searchRange
      .createTextFinder(matricule)
      .matchEntireCell(true)
      .findNext();

    if (foundCell) {
      const rowIndex = foundCell.getRow();
      const details = grandeSheet.getRange(rowIndex, 3, 1, 2).getValues()[0]; // C,D
      fonction = details[0] || "";
      rattachement = details[1] || "";
    }
  }

  // Si retour immédiat est coché, utiliser l'heureRetour fournie
  const heureRetourVal = d.retourImmediatelyChecked ? (d.heureRetour || "") : "";
  const resultatVal = d.retourImmediatelyChecked ? "Visite d'embauche" : "";

  try {
    const writeRow = sheet.getLastRow() + 1;
    const rowValues = [
      d.matricule,
      d.nom,
      fonction,
      rattachement,
      d.typeConsultation,
      d.lieuConsultation,
      d.shift,
      d.choix,
      d.dateSortie,
      d.heureSortie,
      heureRetourVal,
      resultatVal,
      "",
      "",
      d.casGrave || "non",
      d.commentaires
    ];
    sheet.getRange(writeRow, 1, 1, rowValues.length).setValues([rowValues]);
  } catch (e) {
    // En cas d'erreur, fallback sur appendRow
    console.warn('setValues failed, fallback to appendRow: ' + e);
    sheet.appendRow([
      d.matricule,
      d.nom,
      fonction,
      rattachement,
      d.typeConsultation,
      d.lieuConsultation,
      d.shift,
      d.choix,
      d.dateSortie,
      d.heureSortie,
      heureRetourVal,
      resultatVal,
      "",
      "",
      d.casGrave || "non",
      d.commentaires
    ]);
  }
}

// ================= SET RETOUR =================
function setRetour(d) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("OSTIE");
  
  // ========== ÉTAPE 1: CRÉER LES COLONNES SI MANQUANTES ==========
  ensureColumnsExist();

  const rowNumber = parseInt(d.rowNumber, 10);
  if (Number.isFinite(rowNumber) && rowNumber > 1) {
    const sheetMatricule = String(sheet.getRange(rowNumber, 1).getValue() || "").trim();
    if (!sheetMatricule) {
      throw new Error(`Ligne introuvable: ${rowNumber}`);
    }
    if (String(d.matricule || "").trim() && sheetMatricule !== String(d.matricule).trim()) {
      throw new Error(`Matricule incohérent pour la ligne ${rowNumber}`);
    }
  } else {
    throw new Error("Numéro de ligne invalide");
  }

  const heureRetourCell = sheet.getRange(rowNumber, 11);
  const heureRetourExistante = String(heureRetourCell.getValue() || "").trim();

  if (heureRetourExistante !== "") {
    throw new Error(`Retour déjà enregistré pour ${d.matricule}`);
  }

  // Déterminer les index précis des colonnes Q et R
  const lastCol = sheet.getLastColumn();
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  let heureEntreeOstieCol = 17; // Par défaut Colonne Q = 17
  let heureSortieOstieCol = 18; // Par défaut Colonne R = 18
  
  // Trouver les vraies colonnes
  for (let col = 0; col < headerRow.length; col++) {
    if (headerRow[col] === "Heure Entrée Ostie" || headerRow[col] === "heureEntreeOstie") {
      heureEntreeOstieCol = col + 1;
    }
    if (headerRow[col] === "Heure Sortie Ostie" || headerRow[col] === "heureSortieOstie") {
      heureSortieOstieCol = col + 1;
    }
  }
  
  // Sauvegarder toutes les données avec moins d'appels serveur
  sheet.getRange(rowNumber, 11, 1, 6).setValues([[
    d.heureRetour,
    d.resultat,
    d.nbJourRM,
    d.anomalie || "",
    d.casGrave || "",
    d.commentaires
  ]]);

  if (heureEntreeOstieCol === heureSortieOstieCol - 1) {
    sheet.getRange(rowNumber, heureEntreeOstieCol, 1, 2).setValues([[
      d.heureEntreeOstie || "",
      d.heureSortieOstie || ""
    ]]);
  } else {
    sheet.getRange(rowNumber, heureEntreeOstieCol).setValue(d.heureEntreeOstie || "");
    sheet.getRange(rowNumber, heureSortieOstieCol).setValue(d.heureSortieOstie || "");
  }

  // Marquer la ligne comme validée après écriture réussie pour éviter les doublons d'affichage
  if (sheet.getLastColumn() >= 16) {
    try {
      sheet.getRange(rowNumber, 16).setValue(d.casGrave || "non");
    } catch (e) {
      console.warn("Impossible de mettre à jour le cas grave: " + e);
    }
  }

  console.log(`✅ Retour enregistré pour ${d.matricule}`);
}

// ================= SET TEMPS OSTIE =================
function setTempsOstie(d) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("OSTIE");
  
  // ========== ÉTAPE 1: CRÉER LES COLONNES SI MANQUANTES ==========
  ensureColumnsExist();

  const rowNumber = parseInt(d.rowNumber, 10);
  if (Number.isFinite(rowNumber) && rowNumber > 1) {
    const sheetMatricule = String(sheet.getRange(rowNumber, 1).getValue() || "").trim();
    if (!sheetMatricule) {
      throw new Error(`Ligne introuvable: ${rowNumber}`);
    }
    if (String(d.matricule || "").trim() && sheetMatricule !== String(d.matricule).trim()) {
      throw new Error(`Matricule incohérent pour la ligne ${rowNumber}`);
    }
  } else {
    throw new Error("Numéro de ligne invalide");
  }

  // Déterminer les index précis des colonnes Q et R
  const lastCol = sheet.getLastColumn();
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  let heureEntreeOstieCol = 17; // Par défaut Colonne Q = 17
  let heureSortieOstieCol = 18; // Par défaut Colonne R = 18
  
  // Trouver les vraies colonnes
  for (let col = 0; col < headerRow.length; col++) {
    if (headerRow[col] === "Heure Entrée Ostie" || headerRow[col] === "heureEntreeOstie") {
      heureEntreeOstieCol = col + 1;
    }
    if (headerRow[col] === "Heure Sortie Ostie" || headerRow[col] === "heureSortieOstie") {
      heureSortieOstieCol = col + 1;
    }
  }
  
  if (heureEntreeOstieCol === heureSortieOstieCol - 1) {
    sheet.getRange(rowNumber, heureEntreeOstieCol, 1, 2).setValues([[
      d.heureEntreeOstie || "",
      d.heureSortieOstie || ""
    ]]);
  } else {
    sheet.getRange(rowNumber, heureEntreeOstieCol).setValue(d.heureEntreeOstie || "");
    sheet.getRange(rowNumber, heureSortieOstieCol).setValue(d.heureSortieOstie || "");
  }
  
  console.log(`✅ Temps Ostie enregistrés pour ${d.matricule} - Entrée: ${d.heureEntreeOstie}, Sortie: ${d.heureSortieOstie}`);
}

// ================= CALCULATE AVERAGE DURATION =================
// Calcule la durée MOYENNE pour les consultations d'HIER SEULEMENT (J-1)
// 
// EXEMPLE:
//   Hier (J-1):
//     A: Sortie 10:00, Retour 11:30 → Durée = 1h30
//     B: Sortie 12:00, Retour 12:30 → Durée = 0h30
//   Moyenne = (1h30 + 0h30) / 2 = 1h00
//
// Cette moyenne s'utilise pour les anomalies:
//   Si C est anomalie aujourd'hui et sort à 13:30
//   Alors retour estimé = 13:30 + 1h = 14:30
function calculateAverageDuration() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("OSTIE");
  const data = sheet.getDataRange().getValues();
  
  // ========== ÉTAPE 1: Calculer la date d'HIER (J-1) ==========
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const tomorrowStart = new Date(yesterday);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1); // Début du jour J
  
  let totalMinutes = 0;
  let countWithReturn = 0;
  
  // ========== ÉTAPE 2: Parcourir TOUTES les lignes ==========
  for (let i = 1; i < data.length; i++) {
    const dateSortie = new Date(data[i][8]);     // Colonne I - Date de sortie
    dateSortie.setHours(0, 0, 0, 0);
    const heureSortie = data[i][9];   // Colonne J - Heure de sortie
    const heureRetour = data[i][10];  // Colonne K - Heure de retour
    
    // ========== ÉTAPE 3: Vérifier que la date = HIER ==========
    if (dateSortie < tomorrowStart && dateSortie >= yesterday) {
      
      // ========== ÉTAPE 4: Vérifier que SORTIE et RETOUR existent ==========
      // On ne compte QUE les consultations avec un retour enregistré
      if (heureSortie && heureRetour && heureSortie !== "" && heureRetour !== "") {
        
        // ========== ÉTAPE 5: Extraire l'heure HH:MM:SS (au cas où ce serait des Date objects) ==========
        const heureSortieStr = extractTimeFromDateOrString(heureSortie);
        const heureRetourStr = extractTimeFromDateOrString(heureRetour);
        
        // ========== ÉTAPE 6: Convertir les heures en minutes ==========
        const sortieMinutes = parseTimeToMinutes(heureSortieStr);   // Ex: 10:00 → 600 min
        const retourMinutes = parseTimeToMinutes(heureRetourStr);   // Ex: 11:30 → 690 min
        
        // Vérifier que la conversion a réussi
        if (sortieMinutes !== null && retourMinutes !== null) {
          
          // ========== ÉTAPE 7: Calculer la différence ==========
          let durationMinutes = retourMinutes - sortieMinutes;
          
          // Si le résultat est négatif, c'est parce que le retour est le lendemain
          if (durationMinutes < 0) {
            durationMinutes += 24 * 60; // Ajouter 24h (1440 minutes)
          }
          
          // ========== ÉTAPE 8: Additionner à la durée totale ==========
          totalMinutes += durationMinutes;
          countWithReturn++;
        }
      }
    }
  }
  
  // ========== ÉTAPE 8: Calculer la moyenne ==========
  if (countWithReturn > 0) {
    const averageMinutes = Math.round(totalMinutes / countWithReturn);
    // Durée moyenne calculée
    return averageMinutes;
  } else {
    // Si aucune donnée, retourner 1h25 (85 min) par défaut
    const defaultMinutes = 85; // 1h25
    // Utilisant durée par défaut
    return defaultMinutes;
  }
}

// ================= PARSE TIME TO MINUTES =================
// Convertit une heure au format "HH:MM" en nombres de minutes
// EXEMPLE: "11:30" → 690 minutes (11*60 + 30)
function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes)) return null;
  
  return hours * 60 + minutes;
}

// ================= MINUTES TO TIME STRING =================
// Convertit des minutes en format "HH:MM"
// EXEMPLE: 85 minutes → "1:25"
function minutesToTimeString(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return String(hours).padStart(2, "0") + ":" + String(mins).padStart(2, "0");
}

// ================= EXTRACT TIME FROM DATE OBJECT =================
// Extrait HH:MM:SS d'un objet Date ou d'une string
// Accepte aussi les formats Google Sheets
function extractTimeFromDateOrString(value) {
  if (!value) {
    Logger.log("  ⚠️ extractTime: value est null/undefined");
    return "";
  }
  
  // DEBUG: Logger le type et la valeur
  // Debug: type de valeur
  
  // Si c'est un objet Date
  if (value instanceof Date) {
    // Ajouter 3 heures pour Madagascar (UTC+3)
    let adjusted = new Date(value.getTime() + 3 * 60 * 60 * 1000);
    const timeStr = String(adjusted.getUTCHours()).padStart(2, "0") + ":" + 
                    String(adjusted.getUTCMinutes()).padStart(2, "0");
    // Date object convertie (HH:MM)
    return timeStr;
  }
  
  // Si c'est une string
  if (typeof value === "string") {
    // String passthrough
    return value;
  }
  
  // Essayer de convertir en string et extraire l'heure
  const strValue = String(value);
  // Conversion en string
  
  // Chercher un pattern HH:MM ou HH:MM:SS dans la string
  const match = strValue.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    const result = String(match[1]).padStart(2, "0") + ":" + String(match[2]).padStart(2, "0");
    // Regex match (HH:MM)
    return result;
  }
  
  // Impossible d'extraire l'heure
  return "";
}

// ================= ADD TIME TO HOUR STRING =================
// Ajoute des minutes à une heure donnée
// Accepte les formats "HH:MM" ou "HH:MM:SS"
// EXEMPLE: addMinutesToTime("13:30:00", 85) → "14:55"
function addMinutesToTime(timeStr, minutesToAdd) {
  if (!timeStr || typeof timeStr !== "string") return "";
  
  const parts = timeStr.split(":");
  if (parts.length < 2) return "";
  
  let hours = parseInt(parts[0], 10);
  let mins = parseInt(parts[1], 10);
  
  if (isNaN(hours) || isNaN(mins)) return "";
  
  // ========== ÉTAPE 1: Ajouter les minutes ==========
  mins += minutesToAdd;
  
  // ========== ÉTAPE 2: Gérer le débordement des minutes ==========
  if (mins >= 60) {
    hours += Math.floor(mins / 60);
    mins = mins % 60;
  }
  
  // ========== ÉTAPE 3: Gérer le débordement des heures ==========
  if (hours >= 24) {
    hours = hours % 24;
  }
  
  return String(hours).padStart(2, "0") + ":" + String(mins).padStart(2, "0");
}

// ================= CHECK AND CLOSE ANOMALIES WITH DURATION =================
// Détecte et marque automatiquement les anomalies
// 
// LOGIQUE:
// 1. Calculer la durée MOYENNE entre sortie et retour (sur TOUS les retours)
// 2. Pour chaque consultation:
//    - Si PAS de retour ET date dans le passé ET pas encore fermée
//    - Alors: Résultat = "anomalie"
//            Heure retour = Heure sortie + Durée moyenne
//            Durée = Durée moyenne
//
// EXEMPLE:
// - Durée moyenne calculée = 1h25 (85 minutes)
// - Consultation C: Sortie à 13:30, pas de retour, date = hier
// - Résultat:     Heure retour = 13:30 + 1h25 = 14:55
//                 Résultat = "anomalie"
//                 Durée = 1:25
function checkAndCloseAnomalies() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("OSTIE");
  const data = sheet.getDataRange().getValues();
  
  // ========== ÉTAPE 1: Déterminer la date d'aujourd'hui ==========
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Mettre à 00:00:00
  // Checkng today's date
  
  // ========== ÉTAPE 2: Calculer la DURÉE MOYENNE ==========
  const averageDurationMinutes = calculateAverageDuration();
  // Average duration computed
  
  let anomaliesCount = 0;
  let anomaliesDetail = [];
  let debugInfo = [];
  
  // ========== ÉTAPE 3: Parcourir toutes les consultations ==========
  const pendingUpdates = [];
  for (let i = 1; i < data.length; i++) {
    const heureRetour = data[i][10];      // Colonne K - Heure de retour
    const resultat = data[i][11];         // Colonne L - Résultat
    const heureSortie = data[i][9];       // Colonne J - Heure de sortie
    const nom = data[i][1];               // Colonne B - Nom pour le log
    const dateValue = data[i][8];         // Colonne I - Date de sortie (peut être Date ou string)
    
    let dateSortie;
    
    // Parser la date correctement - Google Sheets retourne les dates comme Date objects
    if (dateValue instanceof Date) {
      dateSortie = new Date(dateValue);
    } else if (typeof dateValue === "number") {
      // Si c'est un nombre (jours depuis 1900), convertir en Date
      dateSortie = new Date((dateValue - 25569) * 86400 * 1000);
    } else {
      // Sinon essayer de parser comme string
      dateSortie = new Date(dateValue);
    }
    
    // S'assurer que la date est normalisée à 00:00:00
    dateSortie.setHours(0, 0, 0, 0);
    
    // ========== DEBUG: Logger chaque ligne ==========
    debugInfo.push({
      ligne: i + 1,
      nom: nom,
      dateSortie: dateSortie.toDateString(),
      heureSortie: heureSortie,
      heureRetour: heureRetour,
      resultat: resultat,
      heureRetourVide: (heureRetour === "" || heureRetour === null),
      dateAncienne: (dateSortie < today),
      estAnomalieCandidate: ((heureRetour === "" || heureRetour === null) && dateSortie < today)
    });
    
    // ========== ÉTAPE 4: Vérifier si c'est une anomalie ==========
    if ((heureRetour === "" || heureRetour === null) && 
        dateSortie < today && 
        (resultat === "" || resultat === null || resultat === "anomalie")) {
      
      // ========== ÉTAPE 5: Extraire l'heure HH:MM:SS de heureSortie ==========
      // heureSortie peut être une Date object ou une string
      const heureSortieFormatee = extractTimeFromDateOrString(heureSortie);
      
      // ========== ÉTAPE 6: Calculer l'heure de retour estimée ==========
      const heureRetourEstimee = addMinutesToTime(heureSortieFormatee, averageDurationMinutes);
      
      // Processing line
      
      // Collecter les mises à jour pour limiter les appels au service
      // On mettra à jour les colonnes K,L,M,N (11..14) en une seule opération par ligne
      pendingUpdates.push({
        row: i + 1,
        values: [heureRetourEstimee, "Consultation médical", "", "anomalie"]
      });

      anomaliesCount++;
      anomaliesDetail.push({ nom: nom, sortie: heureSortieFormatee, retourEstime: heureRetourEstimee });
    }
  }
  // Appliquer les mises à jour collectées en minimisant les appels
  for (let u = 0; u < pendingUpdates.length; u++) {
    const upd = pendingUpdates[u];
    sheet.getRange(upd.row, 11, 1, upd.values.length).setValues([upd.values]);
  }

  // Anomalies processing complete
}

// ================= WAITING LIST MANAGEMENT =================
// Ajouter quelqu'un à la liste d'attente
function addToWaitingList(data) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName("Attentes");
    
    // Créer la feuille si elle n'existe pas
    if (!sheet) {
      sheet = ss.insertSheet("Attentes");
      // Ajouter les headers
      sheet.appendRow(["Matricule", "Nom", "Fonction", "Rattachement", "Heure d'ajout", "Date d'ajout"]);
    }
    
    // Vérifier que les données sont valides
    if (!data.matricule || !data.nom) {
      throw new Error("Données invalides: matricule et nom requis");
    }
    
    // Calculer l'heure et la date côté serveur avec décalage UTC+3 (Madagascar)
    // Google Apps Script utilise UTC, donc on ajoute 3 heures manuellement
    let now = new Date();
    now = new Date(now.getTime() + 3 * 60 * 60 * 1000); // Ajouter 3 heures
    
    const heureAjout = String(now.getUTCHours()).padStart(2, "0") + "h" + String(now.getUTCMinutes()).padStart(2, "0"); // FORMAT: 06h59 (pas 06:59 pour éviter que Google Sheets le transforme)
    const day = String(now.getUTCDate()).padStart(2, "0");
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const year = now.getUTCFullYear();
    const today = day + "/" + month + "/" + year;
    
    // Ajouter la ligne à la liste d'attente
    // IMPORTANT: Préfixer avec ' pour forcer Google Sheets à traiter comme du texte
    const row = [
      String(data.matricule),
      String(data.nom),
      String(data.fonction || ""),
      String(data.rattachement || ""),
      "'" + heureAjout,  // ' force le format texte
      "'" + today        // ' force le format texte
    ];
    sheet.appendRow(row);
    
    // Également forcer le format de la colonne E et F en texte
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 5, 1, 2).setNumberFormat("@");  // @ = format texte dans Google Sheets
    
    // Personne ajoutée
  } catch (err) {
    console.error("Erreur addToWaitingList: " + err.toString());
    throw err; // Relancer l'erreur pour que doGet la capture
  }
}

// Récupérer la liste d'attente
function getWaitingList() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Attentes");
  
  // Si la feuille n'existe pas, retourner un tableau vide
  if (!sheet) {
    return [];
  }
  
  // Utiliser getDisplayValues() pour obtenir les DONNÉES AFFICHÉES (texte pur)
  // Pas getValues() qui retourne des objets Date!
  const data = sheet.getDataRange().getDisplayValues();
  
  // Enlever le header
  if (data.length > 1) {
    data.shift();
  }
  
  // Convertir en objets avec nettoyage des heures
  return data.map(row => {
    let heureAjout = row[4] || "";
    
    // Nettoyer les heures au format ISO cassé (1899-12-30T...)
    if (heureAjout.includes("1899") || heureAjout.includes("T")) {
      // Format ISO : extraire que l'heure
      try {
        const date = new Date(heureAjout);
        const h = String(date.getUTCHours()).padStart(2, "0");
        const m = String(date.getUTCMinutes()).padStart(2, "0");
        heureAjout = h + ":" + m;
      } catch (e) {
        // Si parsing échoue, garder tel quel
      }
    }
    
    return {
      matricule: row[0] || "",
      nom: row[1] || "",
      fonction: row[2] || "",
      rattachement: row[3] || "",
      heureAjout: heureAjout,
      dateAjout: row[5] || ""
    };
  });
}

// Supprimer quelqu'un de la liste d'attente
function removeFromWaitingList(matricule) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Attentes");
  
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  
  // Chercher et supprimer la ligne avec le matricule
  for (let i = data.length - 1; i >= 1; i--) { // Commencer à la fin et ignorer le header
    if (data[i][0] === matricule) {
      sheet.deleteRow(i + 1); // +1 car les index des données commencent à 0 mais les lignes à 1
      break;
    }
  }
}

// ================= FUNCTION DE TEST (Cliquez sur "Exécuter" pour celle-ci) =================
// Pour tester directement sans erreur, cliquez sur "Exécuter" avec cette fonction
// sélectionnée dans le menu déroulant en haut
function testCheckAnomalies() {
  checkAndCloseAnomalies();
  // Test completed
}

// ================= AUTO CLOSE ANOMALIES (Trigger schedulé) =================
function autoCloseAnomalies() {
  // Cette fonction s'exécute automatiquement chaque jour via un trigger
  checkAndCloseAnomalies();
}

// ================= JSON OUTPUT =================
function output(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
