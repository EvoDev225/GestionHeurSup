const express = require('express');
const { getAllJournal, deleteJournal } = require('../controllers/journalController');
const r = express.Router();

r.get("/allJournal", getAllJournal)
r.delete("/deleteJournal/:id", deleteJournal)

module.exports = r;