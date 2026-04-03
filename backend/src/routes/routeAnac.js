const express = require('express');
const { getAllAnac, getAnacById, newAnac, updateAnac, deleteAnac } = require('../controllers/anneeController');
const r = express.Router();

r.get("/allAnac", getAllAnac);
r.get("/specificAnac/:id", getAnacById);
r.post("/newAnac", newAnac);
r.put("/updateAnac/:id", updateAnac);
r.delete("/deleteAnac/:id", deleteAnac);

module.exports = r;