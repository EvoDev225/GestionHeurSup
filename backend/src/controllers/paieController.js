const { db } = require('../config/db');

const getAllPaie = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM paiement');
        if (rows.length === 0) {
            return res.status(404).json({ message: "Aucun paiement trouvé" });
        }
        return res.status(200).json({ data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getPaieById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "ID requis" });
    }
    try {
        const [rows] = await db.query('SELECT * FROM paiement WHERE idpaie=?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Paiement non trouvé" });
        }
        return res.status(200).json({ data: rows[0] });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const newPaie = async (req, res) => {
    const { idens, idanac, datepaie, montpaie, mois } = req.body;
    if (!idens || !idanac || !datepaie || !montpaie || !mois) {
        return res.status(400).json({ message: "Les champs idens, idanac, datepaie, montpaie et mois sont requis" });
    }
    try {
        const [rows] = await db.query(
            'INSERT INTO paiement (idens, idanac, datepaie, montpaie, mois, statut, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [idens, idanac, datepaie, montpaie, mois, 'genere']
        );
        return res.status(201).json({ message: "Paiement ajouté avec succès", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updatePaie = async (req, res) => {
    const { id } = req.params;
    const { datepaie, montpaie, mois, statut } = req.body;
    if ( !datepaie || !montpaie || !mois || !statut) {
        return res.status(400).json({ message: "Tous les champs sont requis pour la mise à jour" });
    }
    try {
        const [rows] = await db.query(
            'UPDATE paiement SET datepaie=?, montpaie=?, mois=?, statut=? WHERE idpaie=?',
            [datepaie, montpaie, mois, statut, id]
        );
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: "Paiement non trouvé" });
        }
        return res.status(200).json({ message: "Paiement mis à jour avec succès", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deletePaie = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "ID requis" });
    }
    try {
        const [rows] = await db.query('DELETE FROM paiement WHERE idpaie=?', [id]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: "Paiement non trouvé" });
        }
        return res.status(200).json({ message: "Paiement supprimé avec succès" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllPaie,
    getPaieById,
    newPaie,
    updatePaie,
    deletePaie
};