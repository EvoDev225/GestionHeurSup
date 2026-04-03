const { db } = require('../config/db');
const logAction = require('./journalHelper');

const getAllAnac = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM annee_academique');
        if (rows.length === 0) {
            return res.status(404).json({ message: "Aucune année académique trouvée" });
        }
        return res.status(200).json({ data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getAnacById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "ID utilisateur est requis" });
    }
    try {
        const [rows] = await db.query('SELECT * FROM annee_academique WHERE idanac=?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Année académique non trouvée" });
        }
        return res.status(200).json({ data: rows[0] });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const newAnac = async (req, res) => {
    const { date_debut, date_fin, equ_cm_td, equ_cm_tp } = req.body;
    if (!date_debut || !date_fin || !equ_cm_td || !equ_cm_tp) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }
    try {
        const [rows] = await db.query(
            'INSERT INTO annee_academique (date_debut, date_fin, equ_cm_td, equ_cm_tp, statut) VALUES (?, ?, ?, ?, ?)',
            [date_debut, date_fin, equ_cm_td, equ_cm_tp, 'en_cours']
        );
        await logAction("INSERT", `Ajout de l'année académique ${date_debut}-${date_fin}`, db)
        return res.status(201).json({ message: "Année académique ajoutée avec succès", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateAnac = async (req, res) => {
    const { id } = req.params;
    const { date_debut, date_fin, equ_cm_td, equ_cm_tp, statut } = req.body;
    if ( !date_debut || !date_fin || !equ_cm_td || !equ_cm_tp || !statut) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }
    try {
        const [rows] = await db.query(
            'UPDATE annee_academique SET date_debut=?, date_fin=?, equ_cm_td=?, equ_cm_tp=?, statut=? WHERE idanac=?',
            [date_debut, date_fin, equ_cm_td, equ_cm_tp, statut, id]
        );
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: "Année académique non trouvée" });
        }
        await logAction("UPDATE", `Mise à jour de l'année académique id ${id}`, db)
        return res.status(200).json({ message: "Année académique mise à jour avec succès", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteAnac = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "ID utilisateur est requis" });
    }
    try {
        const [rows] = await db.query('DELETE FROM annee_academique WHERE idanac=?', [id]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: "Année académique non trouvée" });
        }
        await logAction("DELETE", `Suppression de l'année académique id ${id}`, db)
        return res.status(200).json({ message: "Année académique supprimée avec succès" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllAnac, getAnacById, newAnac, updateAnac, deleteAnac };