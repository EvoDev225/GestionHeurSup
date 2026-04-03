const { db } = require('../config/db');

const getAllMatieres = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM matiere');
        if (rows.length === 0) {
            return res.status(404).json({ message: "Aucune matière trouvée" });
        }
        return res.status(200).json({ data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getMatiereById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "ID requis" });
    }
    try {
        const [rows] = await db.query('SELECT * FROM matiere WHERE idmat=?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Matière non trouvée" });
        }
        return res.status(200).json({ data: rows[0] });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const newMatiere = async (req, res) => {
    const { intitule, filiere, niveau, volumhor } = req.body;
    if (!intitule || !filiere || !niveau || !volumhor) {
        return res.status(400).json({ message: "Les champs intitule, filiere, niveau et volumhor sont requis" });
    }
    try {
        const [rows] = await db.query(
            'INSERT INTO matiere (intitule, filiere, niveau, volumhor, statut, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [intitule, filiere, niveau, volumhor, 'non_assignee']
        );
        return res.status(201).json({ message: "Matière ajoutée avec succès", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateMatiere = async (req, res) => {
    const { id } = req.params;
    const { intitule, filiere, niveau, volumhor, statut } = req.body;
    if (!id || !intitule || !filiere || !niveau || !volumhor || !statut) {
        return res.status(400).json({ message: "Tous les champs sont requis pour la mise à jour" });
    }
    try {
        const [rows] = await db.query(
            'UPDATE matiere SET intitule=?, filiere=?, niveau=?, volumhor=?, statut=? WHERE idmat=?',
            [intitule, filiere, niveau, volumhor, statut, id]
        );
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: "Matière non trouvée" });
        }
        await logAction("UPDATE", `Mise à jour de la matière id ${id}`, db)
        return res.status(200).json({ message: "Matière mise à jour avec succès", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteMatiere = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "ID requis" });
    }
    try {
        const [rows] = await db.query('DELETE FROM matiere WHERE idmat=?', [id]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: "Matière non trouvée" });
        }
        await logAction("DELETE", `Suppression de la matière id ${id}`, db)
        return res.status(200).json({ message: "Matière supprimée avec succès" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllMatieres,
    getMatiereById,
    newMatiere,
    updateMatiere,
    deleteMatiere
};