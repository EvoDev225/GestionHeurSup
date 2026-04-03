const express = require('express');
const { getAllMatieres, getMatiereById, newMatiere, updateMatiere, deleteMatiere } = require('../controllers/matiereController');
const r = express.Router();

r.get("/allMatieres", getAllMatieres);
r.get("/specificMatiere/:id", getMatiereById);
r.post("/newMatiere", newMatiere);
r.put("/updateMatiere/:id", updateMatiere);
r.delete("/deleteMatiere/:id", deleteMatiere);

module.exports = r;