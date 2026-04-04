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

const getMoyenneHeuresParEnseignant = async (req, res) => {
    try {
        const sql = `
            SELECT 
                COUNT(DISTINCT e.idens) AS total_enseignants,
                SUM(e.duree) / COUNT(DISTINCT e.idens) AS moyenne_heures
            FROM enseigner e
            JOIN annee_academique a ON e.idanac = a.idanac
            WHERE a.statut = 'en_cours'
        `;
        const [rows] = await db.query(sql);
        if (rows.length === 0 || rows[0].total_enseignants === 0) {
            return res.status(404).json({ message: "Aucune donnée pour calculer la moyenne" });
        }
        return res.status(200).json({ message: "Moyenne des heures récupérée", data: rows[0] });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getTauxDepassement = async (req, res) => {
    try {
        const sqlTotal = `
            SELECT COUNT(DISTINCT idens) AS total 
            FROM enseigner e 
            JOIN annee_academique a ON e.idanac = a.idanac 
            WHERE a.statut = 'en_cours'
        `;
        const sqlDepassement = `
            SELECT COUNT(DISTINCT sub.idens) AS total_depassement FROM (
                SELECT e.idens,
                    (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                     SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                     SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) AS total_heures_eq,
                    m.volumhor
                FROM enseigner e
                JOIN matiere m ON e.idmat = m.idmat
                JOIN annee_academique a ON e.idanac = a.idanac
                WHERE a.statut = 'en_cours'
                GROUP BY e.idens, m.idmat, m.volumhor, a.equ_cm_td, a.equ_cm_tp
                HAVING total_heures_eq > m.volumhor
            ) AS sub
        `;

        const [rowsTotal] = await db.query(sqlTotal);
        const [rowsDep] = await db.query(sqlDepassement);

        const total_enseignants = rowsTotal[0].total;
        const nb_depassement = rowsDep[0].total_depassement;

        if (total_enseignants === 0) return res.status(404).json({ message: "Aucun enseignant actif trouvé" });

        const taux_depassement = parseFloat(((nb_depassement / total_enseignants) * 100).toFixed(2));

        return res.status(200).json({
            message: "Taux de dépassement calculé",
            data: { nb_depassement, total_enseignants, taux_depassement }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getStatutHeures = async (req, res) => {
    try {
        const sql = `
            SELECT statut, SUM(duree) AS total_heures
            FROM enseigner
            JOIN annee_academique a ON enseigner.idanac = a.idanac
            WHERE a.statut = 'en_cours'
            GROUP BY statut
        `;
        const [rows] = await db.query(sql);
        if (rows.length === 0) return res.status(404).json({ message: "Aucune donnée de statut" });

        const stats = { valide: 0, en_attente: 0, rejete: 0 };
        rows.forEach(r => { stats[r.statut] = parseFloat(r.total_heures); });

        const total_global = stats.valide + stats.en_attente + stats.rejete;
        if (total_global === 0) return res.status(404).json({ message: "Total global nul" });

        const data = {
            heures_valide: stats.valide,
            heures_en_attente: stats.en_attente,
            heures_rejete: stats.rejete,
            pourcentage_valide: parseFloat(((stats.valide / total_global) * 100).toFixed(2)),
            pourcentage_en_attente: parseFloat(((stats.en_attente / total_global) * 100).toFixed(2)),
            pourcentage_rejete: parseFloat(((stats.rejete / total_global) * 100).toFixed(2)),
            total_global
        };

        return res.status(200).json({ message: "Statut des heures récupéré", data });
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
    getEnseignantsEnDepassement,
    getMoyenneHeuresParEnseignant,
    getTauxDepassement,
    getStatutHeures
};