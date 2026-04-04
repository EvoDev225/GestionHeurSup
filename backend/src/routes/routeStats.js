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
    getStatutMatieres,
    getStatutAnneesAcademiques,
    getDerniersJournaux,
    getProfilEnseignant,
    getHeuresEnseignant,
    getRemunerationEnseignant,
    getHeuresParMoisEnseignant,
    getHeuresParMatiereEnseignant,
    getStatutSeancesEnseignant,
    getDernieresSeancesEnseignant
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

// ============================================================
// STATS ADMIN UNIQUEMENT
// ============================================================
r.get("/totalUtilisateursParRole", getTotalUtilisateursParRole);
r.get("/totalUtilisateursParStat", getTotalUtilisateursParStat);
r.get("/statutMatieres", getStatutMatieres);
r.get("/statutAnneesAcademiques", getStatutAnneesAcademiques);
r.get("/derniersJournaux", getDerniersJournaux);

// ============================================================
// STATS ENSEIGNANT
// ============================================================
r.get("/profilEnseignant/:id", getProfilEnseignant);
r.get("/heuresEnseignant/:id", getHeuresEnseignant);
r.get("/remunerationEnseignant/:id", getRemunerationEnseignant);
r.get("/heuresParMoisEnseignant/:id", getHeuresParMoisEnseignant);
r.get("/heuresParMatiereEnseignant/:id", getHeuresParMatiereEnseignant);
r.get("/statutSeancesEnseignant/:id", getStatutSeancesEnseignant);
r.get("/dernieresSeancesEnseignant/:id", getDernieresSeancesEnseignant);

module.exports = r;