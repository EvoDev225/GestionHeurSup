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
    getStatutHeures
} = require('../controllers/statsController');
const r = express.Router();

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

module.exports = r;