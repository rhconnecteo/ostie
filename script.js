const API_URL = "https://script.google.com/macros/s/AKfycbzp0YRR4pf-HeGnSz0ZyLQaSYvJgtzf3b3IFcrf7gTyf6dihaYQYbxdIP38UIlZ3IKdMw/exec";

// =====================
// LOAD COLLABORATEURS
// =====================
async function loadCollaborateurs() {

    const res = await fetch(API_URL + "?action=getCollaborateurs");
    const data = await res.json();

    const select = document.getElementById("collaborateur");

    data.forEach(c => {
        const option = document.createElement("option");
        option.value = c.matricule;
        option.text = c.matricule + " - " + c.nom;
        option.dataset.nom = c.nom;
        option.dataset.fonction = c.fonction;
        option.dataset.rattachement = c.rattachement;
        select.add(option);
    });
}

// =====================
// SET DATE & HEURE NOW
// =====================
function setNow() {
    const now = new Date();
    document.getElementById("date").value =
        now.toISOString().split("T")[0];

    document.getElementById("heureSortie").value =
        now.toTimeString().slice(0,5);
}

// =====================
// RETOUR HANDLER
// =====================
document.getElementById("retour").addEventListener("change", function() {

    const retourInput = document.getElementById("heureRetour");

    if (this.value === "oui") {
        retourInput.disabled = false;
        const now = new Date();
        retourInput.value = now.toTimeString().slice(0,5);
    } else {
        retourInput.disabled = true;
        retourInput.value = "";
    }
});

// =====================
// RESULTAT HANDLER
// =====================
document.getElementById("resultat").addEventListener("change", function() {

    const nb = document.getElementById("nbJourRM");

    if (this.value === "Repos médical") {
        nb.disabled = false;
    } else {
        nb.disabled = true;
        nb.value = "";
    }
});

// =====================
// SAVE DATA (GET)
// =====================
document.getElementById("saveBtn").addEventListener("click", async function() {

    const select = document.getElementById("collaborateur");
    const selected = select.options[select.selectedIndex];

    const params = new URLSearchParams({
        action: "saveConsultation",
        matricule: selected.value,
        nom: selected.dataset.nom,
        fonction: selected.dataset.fonction,
        rattachement: selected.dataset.rattachement,
        date: document.getElementById("date").value,
        heureSortie: document.getElementById("heureSortie").value,
        heureRetour: document.getElementById("heureRetour").value,
        resultat: document.getElementById("resultat").value,
        nbJourRM: document.getElementById("nbJourRM").value
    });

    const res = await fetch(API_URL + "?" + params.toString());
    const result = await res.json();

    alert(result.message);
});

// INIT
loadCollaborateurs();
setNow();