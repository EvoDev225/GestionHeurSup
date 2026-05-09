const ExcelJS = require('exceljs');
const { db } = require('../config/db');
const logAction = require('./journalHelper');

const importEnseignant = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu.' });
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
        const sheet = workbook.worksheets[0];
        const results = { success: 0, errors: [] };

        for (let i = 2; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            const referencens = row.getCell(1).value?.toString().trim();
            const grade = row.getCell(2).value?.toString().trim();
            const statut = row.getCell(3).value?.toString().trim();
            const departement = row.getCell(4).value?.toString().trim();
            const tauxh = parseFloat(row.getCell(5).value);

            if (!referencens && !grade) continue;

            const lineErrors = [];
            if (!referencens) lineErrors.push('Référence vide');
            if (!grade) lineErrors.push('Grade vide');
            if (!['permanent', 'vacataire'].includes(statut)) lineErrors.push('Statut invalide (permanent/vacataire)');
            if (!departement) lineErrors.push('Département vide');
            if (isNaN(tauxh) || tauxh < 0) lineErrors.push('Taux horaire invalide');

            if (lineErrors.length > 0) {
                results.errors.push({ ligne: i, referencens: referencens || '—', messages: lineErrors });
                continue;
            }

            const [rows] = await db.query('SELECT idens FROM enseignant WHERE referencens = ?', [referencens]);
            if (rows.length === 0) {
                results.errors.push({ ligne: i, referencens, messages: ['Enseignant introuvable en base'] });
                continue;
            }

            await db.query(
                'UPDATE enseignant SET grade=?, statut=?, departement=?, tauxh=? WHERE referencens=?',
                [grade, statut, departement, tauxh, referencens]
            );
            await logAction('UPDATE', `Mise à jour enseignant ${referencens} via import Excel`, db);
            results.success++;
        }
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const importEnseigner = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu.' });
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
        const sheet = workbook.worksheets[0];
        const results = { success: 0, errors: [] };

        for (let i = 2; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            const referencens = row.getCell(1).value?.toString().trim();
            const intitule_matiere = row.getCell(2).value?.toString().trim();
            const annee_debut = parseInt(row.getCell(3).value);
            const rawDate = row.getCell(4).value;
            const type = row.getCell(5).value?.toString().trim().toUpperCase();
            const duree = parseFloat(row.getCell(6).value);
            const salle = row.getCell(7).value?.toString().trim() || null;
            const observation = row.getCell(8).value?.toString().trim() || null;

            if (!referencens && !intitule_matiere) continue;

            const lineErrors = [];
            if (!referencens) lineErrors.push('Référence enseignant vide');
            if (!intitule_matiere) lineErrors.push('Matière vide');
            if (isNaN(annee_debut)) lineErrors.push('Année début invalide');
            if (!rawDate) lineErrors.push('Date absente');
            if (!['CM', 'TD', 'TP'].includes(type)) lineErrors.push('Type invalide (CM/TD/TP)');
            if (isNaN(duree) || duree <= 0) lineErrors.push('Durée invalide');

            if (lineErrors.length > 0) {
                results.errors.push({ ligne: i, referencens: referencens || '—', messages: lineErrors });
                continue;
            }

            const [[ens], [mat], [anac]] = await Promise.all([
                db.query('SELECT idens FROM enseignant WHERE referencens=?', [referencens]),
                db.query('SELECT idmat FROM matiere WHERE intitule=?', [intitule_matiere]),
                db.query('SELECT idanac FROM annee_academique WHERE date_debut=?', [annee_debut])
            ]);

            if (!ens[0]) lineErrors.push('Enseignant inconnu');
            if (!mat[0]) lineErrors.push('Matière inconnue');
            if (!anac[0]) lineErrors.push('Année académique inconnue');

            if (lineErrors.length > 0) {
                results.errors.push({ ligne: i, referencens: referencens, messages: lineErrors });
                continue;
            }

            const finalDate = rawDate instanceof Date ? rawDate.toISOString().split('T')[0] : rawDate;
            await db.query(
                'INSERT INTO enseigner (idens, idmat, idanac, date, type, duree, salle, observation) VALUES (?,?,?,?,?,?,?,?)',
                [ens[0].idens, mat[0].idmat, anac[0].idanac, finalDate, type, duree, salle, observation]
            );
            await logAction('INSERT', `Import Excel — séance ${type} enseignant ${referencens} matière "${intitule_matiere}"`, db);
            results.success++;
        }
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const importMatiere = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu.' });
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
        const sheet = workbook.worksheets[0];
        const results = { success: 0, errors: [] };

        for (let i = 2; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            const idmat = parseInt(row.getCell(1).value);
            const intitule = row.getCell(2).value?.toString().trim();
            const filiere = row.getCell(3).value?.toString().trim();
            const niveau = row.getCell(4).value?.toString().trim();
            const volumhor = parseFloat(row.getCell(5).value);

            if (!intitule) continue;

            const lineErrors = [];
            if (!filiere) lineErrors.push('Filière vide');
            if (!['L1', 'L2', 'L3', 'M1', 'M2'].includes(niveau)) lineErrors.push('Niveau invalide');
            if (isNaN(volumhor) || volumhor < 0) lineErrors.push('Volume horaire invalide');

            if (lineErrors.length > 0) {
                results.errors.push({ ligne: i, referencens: intitule, messages: lineErrors });
                continue;
            }

            if (!isNaN(idmat) && idmat > 0) {
                const [upd] = await db.query('UPDATE matiere SET intitule=?, filiere=?, niveau=?, volumhor=? WHERE idmat=?', [intitule, filiere, niveau, volumhor, idmat]);
                if (upd.affectedRows === 0) {
                    results.errors.push({ ligne: i, referencens: intitule, messages: ['idmat introuvable'] });
                    continue;
                }
                await logAction('UPDATE', `Import Excel — mise à jour matière id ${idmat}`, db);
            } else {
                await db.query('INSERT INTO matiere (intitule, filiere, niveau, volumhor) VALUES (?,?,?,?)', [intitule, filiere, niveau, volumhor]);
                await logAction('INSERT', `Import Excel — ajout matière "${intitule}"`, db);
            }
            results.success++;
        }
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { importEnseignant, importEnseigner, importMatiere };