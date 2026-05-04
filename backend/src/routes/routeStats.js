const express = require('express');
const {
    getTotalUtilisateurs,
    getTotalHeures,
    getCoutTotalHeures,
    getHeuresParEnseignant,
    getHeuresParMois,
    getHeuresParDepartement,
    getRepartitionHeures,
    getEnseignantsEnDepassement,
    getMoyenneHeuresParEnseignant,
    getTauxDepassement,
    getStatutHeures,
    getTotalUtilisateursParRole,
    getTotalUtilisateursParStat,
    getMatiereMaxVolumeHoraire,
    getMatiereParNiveau,
    getStatutAnneesAcademiques,
    getDerniersJournaux,
    getProfilEnseignant,
    getHeuresEnseignant,
    getRemunerationEnseignant,
    getHeuresParMoisEnseignant,
    getHeuresParMatiereEnseignant,
    getStatutSeancesEnseignant,
    getDernieresSeancesEnseignant,
    getRecapEnseignants,
    getRecapEnseignantById,
    getTop5Enseignants
} = require('../controllers/statsController');
const r = express.Router();

// ============================================================
// STATS COMMUNES ADMIN + RH
// ============================================================
r.get("/totalUtilisateurs", getTotalUtilisateurs);
r.get("/totalHeures", getTotalHeures);
r.get("/coutTotalHeures", getCoutTotalHeures);
r.get("/heuresParEnseignant", getHeuresParEnseignant);
r.get("/heuresParMois", getHeuresParMois);
r.get("/heuresParDepartement", getHeuresParDepartement);
r.get("/repartitionHeures", getRepartitionHeures);
r.get("/enseignantsEnDepassement", getEnseignantsEnDepassement);
r.get("/moyenneHeuresParEnseignant", getMoyenneHeuresParEnseignant);
r.get("/tauxDepassement", getTauxDepassement);
r.get("/statutHeures", getStatutHeures);
r.get("/top5Enseignants", getTop5Enseignants);

// ============================================================
// STATS ADMIN UNIQUEMENT
// ============================================================
r.get("/totalUtilisateursParRole", getTotalUtilisateursParRole);
r.get("/totalUtilisateursParStat", getTotalUtilisateursParStat);
r.get("/max-volume", getMatiereMaxVolumeHoraire);
r.get("/par-niveau", getMatiereParNiveau);
r.get("/statutAnneesAcademiques", getStatutAnneesAcademiques);
r.get("/derniersJournaux", getDerniersJournaux);

// --- Stats enseignant (par idens) ---
r.get("/enseignant/:id/profil", getProfilEnseignant);
r.get("/enseignant/:id/heures", getHeuresEnseignant);
r.get("/enseignant/:id/remuneration", getRemunerationEnseignant);
r.get("/enseignant/:id/heures-par-mois", getHeuresParMoisEnseignant);
r.get("/enseignant/:id/heures-par-matiere", getHeuresParMatiereEnseignant);
r.get("/enseignant/:id/statut-seances", getStatutSeancesEnseignant);
r.get("/enseignant/:id/dernieres-seances", getDernieresSeancesEnseignant);
r.get("/enseignant/:id/recap", getRecapEnseignantById);
r.get("/getRecapEnseignants", getRecapEnseignants);

// ============================================================
// STATS ENSEIGNANT
// ============================================================


module.exports = r;