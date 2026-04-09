const { db } = require('../config/db');
const logAction = require('./journalHelper');

const getAllEnseigner = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                e.idenseigner,
                e.idens,
                u.nom,
                u.prenom,
                ens.referencens,
                e.idmat,
                m.intitule,
                e.idanac,
                e.date,
                e.type,
                e.duree,
                e.salle,
                e.observation
            FROM enseigner e
            JOIN enseignant ens ON e.idens = ens.idens
            JOIN utilisateur u ON ens.idutil = u.idutil
            JOIN matiere m ON e.idmat = m.idmat
        `);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Aucun enregistrement trouvé" });
        }
        return res.status(200).json({ data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getEnseignerById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "ID requis" });
    }
    try {
        const [rows] = await db.query('SELECT * FROM enseigner WHERE idenseigner=?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Enregistrement non trouvé" });
        }
        return res.status(200).json({ data: rows[0] });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const newEnseigner = async (req, res) => {
    const { idens, idmat, idanac, date, type, duree, salle, observation } = req.body;
    if (!idens || !idmat || !idanac || !date || !type || !duree || !salle) {
        return res.status(400).json({ message: "Les champs idens, idmat, idanac, date, type, duree et salle sont requis" });
    }
    try {
        const [rows] = await db.query(
            'INSERT INTO enseigner (idens, idmat, idanac, date, type, duree, salle, observation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [idens, idmat, idanac, date, type, duree, salle, observation || null]
        );
        await logAction("INSERT", `Ajout d'une séance ${type} pour l'enseignant id ${idens} — matière id ${idmat}`, db)
        return res.status(201).json({ message: "Enregistrement ajouté avec succès", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateEnseigner = async (req, res) => {
    const { id } = req.params;
    const { date, type, duree, salle, observation } = req.body;
    if ( !date || !type || !duree || !salle || !statut) {
        return res.status(400).json({ message: "Tous les champs (date, type, duree, salle) sont requis pour la mise à jour" });
    }
    try {
        const [rows] = await db.query(
            'UPDATE enseigner SET date=?, type=?, duree=?, salle=?, observation=? WHERE idenseigner=?',
            [date, type, duree, salle, observation || null, id]
        );
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: "Enregistrement non trouvé" });
        }
        await logAction("UPDATE", `Mise à jour de la séance id ${id}`, db)
        return res.status(200).json({ message: "Enregistrement mis à jour avec succès", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteEnseigner = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "ID requis" });
    }
    try {
        const [rows] = await db.query('DELETE FROM enseigner WHERE idenseigner=?', [id]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: "Enregistrement non trouvé" });
        }
        await logAction("DELETE", `Suppression de la séance id ${id}`, db)
        return res.status(200).json({ message: "Enregistrement supprimé avec succès" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllEnseigner,
    getEnseignerById,
    newEnseigner,
    updateEnseigner,
    deleteEnseigner
};