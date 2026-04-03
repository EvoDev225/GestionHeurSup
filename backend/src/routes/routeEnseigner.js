const express = require('express');
const { getAllEnseigner, getEnseignerById, newEnseigner, updateEnseigner, deleteEnseigner } = require('../controllers/enseignerController');
const r = express.Router();

r.get("/allEnseigner", getAllEnseigner);
r.get("/specificEnseigner/:id", getEnseignerById);
r.post("/newEnseigner", newEnseigner);
r.put("/updateEnseigner/:id", updateEnseigner);
r.delete("/deleteEnseigner/:id", deleteEnseigner);

module.exports = r;