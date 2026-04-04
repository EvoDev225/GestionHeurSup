const { db } = require('../config/db');

const getTotalUtilisateurs = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) AS total FROM utilisateur');
        if (rows.length === 0) return res.status(404).json({ message: "Aucun utilisateur trouvé" });
        return res.status(200).json({ message: "Total des utilisateurs récupéré", data: rows[0] });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getTotalHeures = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT SUM(duree) AS total_heures FROM enseigner');
        if (rows.length === 0 || rows[0].total_heures === null) {
            return res.status(404).json({ message: "Aucune heure enregistrée" });
        }
        return res.status(200).json({ message: "Total des heures récupéré", data: rows[0] });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getCoutTotalHeures = async (req, res) => {
    try {
        const sql = `
            SELECT 
                u.nom, u.prenom,
                SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) AS heures_cm,
                SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) AS heures_td,
                SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) AS heures_tp,
                (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                 SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                 SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) AS total_heures_eq,
                ens.tauxh,
                ((SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                  SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                  SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) * ens.tauxh) AS cout_total
            FROM enseigner e
            JOIN enseignant ens ON e.idens = ens.idens
            JOIN utilisateur u ON ens.idutil = u.idutil
            JOIN annee_academique a ON e.idanac = a.idanac
            WHERE a.statut = 'en_cours'
            GROUP BY ens.idens, u.nom, u.prenom, ens.tauxh, a.equ_cm_td, a.equ_cm_tp
        `;
        const [rows] = await db.query(sql);
        if (rows.length === 0) return res.status(404).json({ message: "Aucune donnée de coût disponible" });
        
        const cout_global = rows.reduce((acc, curr) => acc + parseFloat(curr.cout_total), 0);
        
        return res.status(200).json({ 
            message: "Coût total des heures récupéré", 
            data: { details: rows, cout_global } 
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getHeuresParEnseignant = async (req, res) => {
    try {
        const sql = `
            SELECT
                u.nom, u.prenom,
                m.intitule,
                SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) AS heures_cm,
                SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) AS heures_td,
                SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) AS heures_tp,
                (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                 SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                 SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) AS total_heures_eq,
                m.volumhor,
                GREATEST(0,
                    (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                     SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                     SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) - m.volumhor
                ) AS heures_complementaires
            FROM enseigner e
            JOIN enseignant ens ON e.idens = ens.idens
            JOIN utilisateur u ON ens.idutil = u.idutil
            JOIN matiere m ON e.idmat = m.idmat
            JOIN annee_academique a ON e.idanac = a.idanac
            WHERE a.statut = 'en_cours'
            GROUP BY ens.idens, u.nom, u.prenom, m.idmat, m.intitule, m.volumhor, a.equ_cm_td, a.equ_cm_tp
        `;
        const [rows] = await db.query(sql);
        if (rows.length === 0) return res.status(404).json({ message: "Aucune heure par enseignant trouvée" });
        return res.status(200).json({ message: "Heures par enseignant récupérées", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getHeuresParMois = async (req, res) => {
    try {
        const sql = `
            SELECT MONTH(date) AS mois, MONTHNAME(date) AS nom_mois, SUM(duree) AS total_heures
            FROM enseigner
            GROUP BY MONTH(date), MONTHNAME(date)
            ORDER BY mois ASC
        `;
        const [rows] = await db.query(sql);
        if (rows.length === 0) return res.status(404).json({ message: "Aucune donnée mensuelle trouvée" });
        return res.status(200).json({ message: "Heures par mois récupérées", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getHeuresParDepartement = async (req, res) => {
    try {
        const sql = `
            SELECT ens.departement, SUM(e.duree) AS total_heures
            FROM enseigner e
            JOIN enseignant ens ON e.idens = ens.idens
            GROUP BY ens.departement
            ORDER BY total_heures DESC
        `;
        const [rows] = await db.query(sql);
        if (rows.length === 0) return res.status(404).json({ message: "Aucune donnée par département trouvée" });
        return res.status(200).json({ message: "Heures par département récupérées", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getRepartitionHeures = async (req, res) => {
    try {
        const sql = `
            SELECT type, SUM(duree) AS total_heures
            FROM enseigner
            GROUP BY type
        `;
        const [rows] = await db.query(sql);
        if (rows.length === 0) return res.status(404).json({ message: "Aucune répartition trouvée" });
        return res.status(200).json({ message: "Répartition des heures récupérée", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getEnseignantsEnDepassement = async (req, res) => {
    try {
        const sql = `
            SELECT
                u.nom, u.prenom,
                m.intitule,
                (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) AS total_heures_eq,
                m.volumhor,
                GREATEST(0,
                    (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                    SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                    SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) - m.volumhor
                ) AS heures_complementaires
            FROM enseigner e
            JOIN enseignant ens ON e.idens = ens.idens
            JOIN utilisateur u ON ens.idutil = u.idutil
            JOIN matiere m ON e.idmat = m.idmat
            JOIN annee_academique a ON e.idanac = a.idanac
            WHERE a.statut = 'en_cours'
            GROUP BY ens.idens, u.nom, u.prenom, m.idmat, m.intitule, m.volumhor, a.equ_cm_td, a.equ_cm_tp
            HAVING total_heures_eq > m.volumhor
        `;
        const [rows] = await db.query(sql);
        if (rows.length === 0) return res.status(404).json({ message: "Aucun enseignant en dépassement trouvé" });
        return res.status(200).json({ message: "Enseignants en dépassement récupérés", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTotalUtilisateurs,
    getTotalHeures,
    getCoutTotalHeures,
    getHeuresParEnseignant,
    getHeuresParMois,
    getHeuresParDepartement,
    getRepartitionHeures,
    getEnseignantsEnDepassement
};