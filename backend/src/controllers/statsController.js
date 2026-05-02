const { db } = require('../config/db');

const getTotalUtilisateurs = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT COUNT(*) AS total FROM utilisateur WHERE role = 'enseignant'");
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
        return res.status(200).json({ message: "Coût total des heures récupéré", data: { details: rows, cout_global: rows.reduce((acc, curr) => acc + parseFloat(curr.cout_total), 0) } });
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

const getTotalUtilisateursParRole = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT role, COUNT(*) AS total FROM utilisateur GROUP BY role');
        if (rows.length === 0) return res.status(404).json({ message: "Aucun utilisateur trouvé" });
        return res.status(200).json({ message: "Total des utilisateurs par rôle récupéré", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getTotalUtilisateursParStat = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT stat, COUNT(*) AS total FROM utilisateur GROUP BY stat');
        if (rows.length === 0) return res.status(404).json({ message: "Aucun utilisateur trouvé" });
        const result = { total_actifs: 0, total_inactifs: 0 };
        rows.forEach(r => {
            if (r.stat === 'actif') result.total_actifs = r.total;
            else if (r.stat === 'inactif') result.total_inactifs = r.total;
        });
        return res.status(200).json({ message: "Total des utilisateurs par statut récupéré", data: result });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getMatiereMaxVolumeHoraire = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT intitule, filiere, niveau, volumhor 
             FROM matiere 
             ORDER BY volumhor DESC 
             LIMIT 1`
        );
        if (rows.length === 0) return res.status(200).json({ data: null });
        return res.status(200).json({ message: "Matière max volume récupérée", data: rows[0] });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getMatiereParNiveau = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT niveau, COUNT(*) as total 
             FROM matiere 
             GROUP BY niveau 
             ORDER BY total DESC 
             LIMIT 1`
        );
        if (rows.length === 0) return res.status(200).json({ data: null });
        return res.status(200).json({ message: "Niveau le plus chargé récupéré", data: rows[0] });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getStatutAnneesAcademiques = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT statut, COUNT(*) AS total FROM annee_academique GROUP BY statut');
        if (rows.length === 0) return res.status(404).json({ message: "Aucune année académique trouvée" });
        const result = { total_en_cours: 0, total_terminees: 0 };
        rows.forEach(r => {
            if (r.statut === 'en_cours') result.total_en_cours = r.total;
            else if (r.statut === 'terminee') result.total_terminees = r.total;
        });
        return res.status(200).json({ message: "Statut des années académiques récupéré", data: result });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getDerniersJournaux = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM journal ORDER BY created_at DESC LIMIT 20');
        return res.status(200).json({ message: "Derniers journaux récupérés", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ============================================================
// STATS DASHBOARD ENSEIGNANT — fonctions filtrées par idens
// ============================================================
const getProfilEnseignant = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`
            SELECT u.nom, u.prenom, u.email, u.contact, u.sexe, ens.referencens, ens.grade, ens.statut, ens.departement, ens.tauxh
            FROM enseignant ens
            JOIN utilisateur u ON ens.idutil = u.idutil
            WHERE ens.idens = ?`, [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Profil enseignant non trouvé" });
        return res.status(200).json({ message: "Profil enseignant récupéré", data: rows[0] });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getHeuresEnseignant = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT
                SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) AS heures_cm,
                SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) AS heures_td,
                SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) AS heures_tp,
                (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                 SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                 SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) AS total_heures_eq,
                SUM(DISTINCT m.volumhor) AS volumhor,
                GREATEST(0,
                    (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                     SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                     SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) - SUM(DISTINCT m.volumhor)
                ) AS heures_complementaires
            FROM enseigner e
            JOIN matiere m ON e.idmat = m.idmat
            JOIN annee_academique a ON e.idanac = a.idanac
            WHERE e.idens = ? AND a.statut = 'en_cours'
            GROUP BY a.equ_cm_td, a.equ_cm_tp
        `;
        const [rows] = await db.query(sql, [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Aucune heure trouvée pour cet enseignant" });
        return res.status(200).json({ message: "Heures de l'enseignant récupérées", data: rows[0] });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getRemunerationEnseignant = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT
                (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) AS total_heures_eq,
                ens.tauxh,
                ((SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                  SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) * ens.tauxh) AS remuneration_estimee
            FROM enseigner e
            JOIN enseignant ens ON e.idens = ens.idens
            JOIN annee_academique a ON e.idanac = a.idanac
            WHERE e.idens = ? AND a.statut = 'en_cours'
            GROUP BY ens.tauxh, a.equ_cm_td, a.equ_cm_tp
        `;
        const [rows] = await db.query(sql, [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Données de rémunération indisponibles" });
        return res.status(200).json({ message: "Rémunération estimée récupérée", data: rows[0] });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getHeuresParMoisEnseignant = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT
                MONTH(e.date) AS mois,
                MONTHNAME(e.date) AS nom_mois,
                SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) AS heures_cm,
                SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) AS heures_td,
                SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) AS heures_tp,
                SUM(e.duree) AS total_heures
            FROM enseigner e
            JOIN annee_academique a ON e.idanac = a.idanac
            WHERE e.idens = ? AND a.statut = 'en_cours'
            GROUP BY MONTH(e.date), MONTHNAME(e.date)
            ORDER BY mois ASC
        `;
        const [rows] = await db.query(sql, [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Aucune donnée mensuelle pour cet enseignant" });
        return res.status(200).json({ message: "Heures par mois récupérées", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getHeuresParMatiereEnseignant = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT
                m.intitule,
                SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) AS heures_cm,
                SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) AS heures_td,
                SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) AS heures_tp,
                SUM(e.duree) AS total_heures
            FROM enseigner e
            JOIN matiere m ON e.idmat = m.idmat
            JOIN annee_academique a ON e.idanac = a.idanac
            WHERE e.idens = ? AND a.statut = 'en_cours'
            GROUP BY m.idmat, m.intitule
        `;
        const [rows] = await db.query(sql, [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Aucune donnée par matière pour cet enseignant" });
        return res.status(200).json({ message: "Heures par matière récupérées", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getStatutSeancesEnseignant = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `SELECT , SUM(duree) AS total_heures FROM enseigner WHERE idens = ? `;
        const [rows] = await db.query(sql, [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Aucune séance trouvée" });

        const stats = { valide: 0, en_attente: 0, rejete: 0 };
        rows.forEach(r => { 
            if (r.statut === 'valide') stats.valide = parseFloat(r.total_heures);
            if (r.statut === 'en_attente') stats.en_attente = parseFloat(r.total_heures);
            if (r.statut === 'rejete') stats.rejete = parseFloat(r.total_heures);
        });

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

        return res.status(200).json({ message: "Statut des séances récupéré", data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getDernieresSeancesEnseignant = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT e.idenseigner, m.intitule, e.type, e.duree, e.date, e.salle
            FROM enseigner e
            JOIN matiere m ON e.idmat = m.idmat
            WHERE e.idens = ?
            ORDER BY e.date DESC
            LIMIT 10
        `;
        const [rows] = await db.query(sql, [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Aucune séance récente trouvée" });
        return res.status(200).json({ message: "Dernières séances récupérées", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// --- Récapitulatif enseignant par idens ---
const getRecapEnseignantById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`
      SELECT 
        en.idens,
        u.nom,
        u.prenom,
        en.departement,
        m.volumhor,
        SUM(CASE WHEN e.type = 'CM' THEN e.duree ELSE 0 END) AS heures_cm,
        SUM(CASE WHEN e.type = 'TD' THEN e.duree ELSE 0 END) AS heures_td,
        SUM(CASE WHEN e.type = 'TP' THEN e.duree ELSE 0 END) AS heures_tp,
        SUM(e.duree) AS total_heures_eq,
        (SUM(e.duree) - m.volumhor) AS ecart,
        CASE 
          WHEN SUM(e.duree) > m.volumhor THEN 'Dépassement'
          WHEN SUM(e.duree) < m.volumhor THEN 'Sous quota'
          ELSE 'En règle'
        END AS statut
      FROM enseigner e
      JOIN enseignant en ON e.idens = en.idens
      JOIN utilisateur u ON en.idutil = u.idutil
      JOIN matiere m ON e.idmat = m.idmat
      WHERE en.idens = ?
      GROUP BY en.idens, e.idmat, u.nom, u.prenom, en.departement, m.volumhor
      ORDER BY total_heures_eq DESC
    `, [id]);
        return res.status(200).json({ message: "Récapitulatif enseignant récupéré", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getRecapEnseignants = async (req, res) => {
  try {
    const [rows] = await db.query(`
  SELECT 
    en.idens,
    u.nom,
    u.prenom,
    en.departement,
    m.volumhor,
    SUM(CASE WHEN e.type = 'CM' THEN e.duree ELSE 0 END) AS heures_cm,
    SUM(CASE WHEN e.type = 'TD' THEN e.duree ELSE 0 END) AS heures_td,
    SUM(CASE WHEN e.type = 'TP' THEN e.duree ELSE 0 END) AS heures_tp,
    SUM(e.duree) AS total_heures_eq,
    (SUM(e.duree) - m.volumhor) AS ecart,
    CASE 
      WHEN SUM(e.duree) > m.volumhor THEN 'Dépassement'
      WHEN SUM(e.duree) < m.volumhor THEN 'Sous quota'
      ELSE 'En règle'
    END AS statut
  FROM enseigner e
  JOIN enseignant en ON e.idens = en.idens
  JOIN utilisateur u ON en.idutil = u.idutil
  JOIN matiere m ON e.idmat = m.idmat
  GROUP BY en.idens, e.idmat, u.nom, u.prenom, en.departement, m.volumhor
  ORDER BY total_heures_eq DESC
`);
    return res.status(200).json({ message: "Récapitulatif enseignants récupéré", data: rows });
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
    getStatutHeures,
    getTotalUtilisateursParRole,
    getTotalUtilisateursParStat,
    getMatiereMaxVolumeHoraire,
    getMatiereParNiveau,
    getStatutAnneesAcademiques,
    getDerniersJournaux,
    getProfilEnseignant,
    getHeuresEnseignant,
    getRemunerationEnseignant,
    getHeuresParMoisEnseignant,
    getHeuresParMatiereEnseignant,
    getStatutSeancesEnseignant,
    getDernieresSeancesEnseignant,
    getRecapEnseignants,
    getRecapEnseignantById
};