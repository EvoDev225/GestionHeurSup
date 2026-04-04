const express = require('express');
const r = express.Router();
const { 
    exportFicheEnseignant, 
    exportEtatGlobalHeures, 
    exportEtatComptabilite,
    exportFicheEnseignantExcel,
    exportEtatGlobalHeuresExcel,
    exportEtatComptabiliteExcel
} = require('../controllers/exportController');

// ============================================================
// EXPORT PDF
// ============================================================
r.get("/pdf/ficheEnseignant/:id", exportFicheEnseignant);
r.get("/pdf/etatGlobalHeures", exportEtatGlobalHeures);
r.get("/pdf/etatComptabilite", exportEtatComptabilite);

// ============================================================
// EXPORT EXCEL
// ============================================================
r.get("/excel/ficheEnseignant/:id", exportFicheEnseignantExcel);
r.get("/excel/etatGlobalHeures", exportEtatGlobalHeuresExcel);
r.get("/excel/etatComptabilite", exportEtatComptabiliteExcel);

module.exports = r;