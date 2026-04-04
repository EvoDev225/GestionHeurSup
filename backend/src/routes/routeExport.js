const express = require('express');
const r = express.Router();
const { 
    exportFicheEnseignant, 
    exportEtatGlobalHeures, 
    exportEtatComptabilite 
} = require('../controllers/exportController');

// ============================================================
// EXPORT PDF
// ============================================================
r.get("/pdf/ficheEnseignant/:id", exportFicheEnseignant);
r.get("/pdf/etatGlobalHeures", exportEtatGlobalHeures);
r.get("/pdf/etatComptabilite", exportEtatComptabilite);

module.exports = r;