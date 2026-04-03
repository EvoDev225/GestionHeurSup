const express = require('express');
const { getAllPaie, getPaieById, newPaie, updatePaie, deletePaie } = require('../controllers/paieController');
const r = express.Router();

r.get("/allPaie", getAllPaie);
r.get("/specificPaie/:id", getPaieById);
r.post("/newPaie", newPaie);
r.put("/updatePaie/:id", updatePaie);
r.delete("/deletePaie/:id", deletePaie);

module.exports = r;