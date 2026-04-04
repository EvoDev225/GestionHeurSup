const { db } = require('../config/db');
const PDFDocument = require('pdfkit-table');
const ExcelJS = require('exceljs');

const exportFicheEnseignant = async (req, res) => {
    try {
        const { id } = req.params;

        const [anneeRows] = await db.query("SELECT CONCAT(date_debut, '-', date_fin) AS label FROM annee_academique WHERE statut = 'en_cours' LIMIT 1");
        const anneeLabel = anneeRows.length > 0 ? anneeRows[0].label : "";

        const [profilRows] = await db.query(`
            SELECT u.nom, u.prenom, u.email, u.contact, ens.referencens, ens.grade, ens.statut, ens.departement, ens.tauxh
            FROM enseignant ens
            JOIN utilisateur u ON ens.idutil = u.idutil
            WHERE ens.idens = ?
        `, [id]);

        if (profilRows.length === 0) throw new Error("Enseignant non trouvé");
        const profil = profilRows[0];

        const [heuresRows] = await db.query(`
            SELECT
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
            JOIN matiere m ON e.idmat = m.idmat
            JOIN annee_academique a ON e.idanac = a.idanac
            WHERE e.idens = ? AND a.statut = 'en_cours'
            GROUP BY m.idmat, m.intitule, m.volumhor, a.equ_cm_td, a.equ_cm_tp
        `, [id]);

        const [remunRows] = await db.query(`
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
        `, [id]);

        const remun = remunRows.length > 0 ? remunRows[0] : { total_heures_eq: 0, tauxh: profil.tauxh, remuneration_estimee: 0 };

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=fiche_enseignant_${profil.referencens}.pdf`);

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        doc.pipe(res);

        doc.fontSize(18).text("Fiche Individuelle Enseignant", { align: 'center' });
        doc.fontSize(12).text(`Année Académique : ${anneeLabel}`, { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`Nom : ${profil.nom}`);
        doc.text(`Prénom : ${profil.prenom}`);
        doc.text(`Référence : ${profil.referencens}`);
        doc.text(`Grade : ${profil.grade}`);
        doc.text(`Statut : ${profil.statut}`);
        doc.text(`Département : ${profil.departement}`);
        doc.text(`Taux horaire : ${profil.tauxh} FCFA`);
        doc.moveDown();

        doc.fontSize(14).text("Récapitulatif des heures par matière", { underline: true });
        doc.moveDown(0.5);

        const table = {
            headers: ["Matière", "CM", "TD", "TP", "Total Eq.", "Vol. Prévu", "H. Compl."],
            rows: heuresRows.map(h => [
                h.intitule,
                h.heures_cm,
                h.heures_td,
                h.heures_tp,
                parseFloat(h.total_heures_eq).toFixed(2),
                h.volumhor,
                parseFloat(h.heures_complementaires).toFixed(2)
            ])
        };
        await doc.table(table, { prepareHeader: () => doc.fontSize(10).font('Helvetica-Bold'), prepareRow: () => doc.fontSize(10).font('Helvetica') });

        doc.moveDown();
        doc.fontSize(14).text("Rémunération estimée", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Total heures équivalentes : ${parseFloat(remun.total_heures_eq).toFixed(2)} H`);
        doc.text(`Taux horaire : ${remun.tauxh} FCFA`);
        doc.fontSize(13).font('Helvetica-Bold').text(`Montant estimé : ${parseFloat(remun.remuneration_estimee).toFixed(2)} FCFA`);

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const exportEtatGlobalHeures = async (req, res) => {
    try {
        const [anneeRows] = await db.query("SELECT CONCAT(date_debut, '-', date_fin) AS label FROM annee_academique WHERE statut = 'en_cours' LIMIT 1");
        const anneeLabel = anneeRows.length > 0 ? anneeRows[0].label : "";

        const [rows] = await db.query(`
            SELECT
                u.nom, u.prenom,
                ens.departement,
                SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) AS heures_cm,
                SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) AS heures_td,
                SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) AS heures_tp,
                (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                 SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                 SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) AS total_heures_eq,
                GREATEST(0,
                    (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                     SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                     SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) - SUM(DISTINCT m.volumhor)
                ) AS heures_complementaires
            FROM enseigner e
            JOIN enseignant ens ON e.idens = ens.idens
            JOIN utilisateur u ON ens.idutil = u.idutil
            JOIN matiere m ON e.idmat = m.idmat
            JOIN annee_academique a ON e.idanac = a.idanac
            WHERE a.statut = 'en_cours'
            GROUP BY ens.idens, u.nom, u.prenom, ens.departement, a.equ_cm_td, a.equ_cm_tp
        `);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=etat_global_heures.pdf');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        doc.pipe(res);

        doc.fontSize(18).text("État Global des Heures", { align: 'center' });
        doc.fontSize(12).text(`Année Académique : ${anneeLabel}`, { align: 'center' });
        doc.moveDown();

        const totals = rows.reduce((acc, curr) => {
            acc.cm += parseFloat(curr.heures_cm);
            acc.td += parseFloat(curr.heures_td);
            acc.tp += parseFloat(curr.heures_tp);
            acc.eq += parseFloat(curr.total_heures_eq);
            acc.comp += parseFloat(curr.heures_complementaires);
            return acc;
        }, { cm: 0, td: 0, tp: 0, eq: 0, comp: 0 });

        const tableRows = rows.map(r => [
            r.nom, r.prenom, r.departement, r.heures_cm, r.heures_td, r.heures_tp, 
            parseFloat(r.total_heures_eq).toFixed(2), 
            parseFloat(r.heures_complementaires).toFixed(2)
        ]);

        tableRows.push([
            "TOTAL", "", "", totals.cm.toFixed(2), totals.td.toFixed(2), totals.tp.toFixed(2), 
            totals.eq.toFixed(2), totals.comp.toFixed(2)
        ]);

        const table = {
            headers: ["Nom", "Prénom", "Département", "CM", "TD", "TP", "Total Eq.", "H. Compl."],
            rows: tableRows
        };

        await doc.table(table, { prepareHeader: () => doc.fontSize(9).font('Helvetica-Bold'), prepareRow: () => doc.fontSize(9).font('Helvetica') });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const exportEtatComptabilite = async (req, res) => {
    try {
        const [anneeRows] = await db.query("SELECT CONCAT(date_debut, '-', date_fin) AS label FROM annee_academique WHERE statut = 'en_cours' LIMIT 1");
        const anneeLabel = anneeRows.length > 0 ? anneeRows[0].label : "";

        const [rows] = await db.query(`
            SELECT
                u.nom, u.prenom,
                ens.grade, ens.statut, ens.tauxh,
                (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                 SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                 SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) AS total_heures_eq,
                ((SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                  SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                  SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) * ens.tauxh) AS montant
            FROM enseigner e
            JOIN enseignant ens ON e.idens = ens.idens
            JOIN utilisateur u ON ens.idutil = u.idutil
            JOIN annee_academique a ON e.idanac = a.idanac
            WHERE a.statut = 'en_cours'
            GROUP BY ens.idens, u.nom, u.prenom, ens.grade, ens.statut, ens.tauxh, a.equ_cm_td, a.equ_cm_tp
        `);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=etat_comptabilite.pdf');

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        doc.pipe(res);

        doc.fontSize(18).text("État pour la Comptabilité", { align: 'center' });
        doc.fontSize(12).text(`Année Académique : ${anneeLabel}`, { align: 'center' });
        doc.moveDown();

        const totalGeneral = rows.reduce((acc, curr) => acc + parseFloat(curr.montant), 0);

        const tableRows = rows.map(r => [
            r.nom, r.prenom, r.grade, r.statut, r.tauxh, 
            parseFloat(r.total_heures_eq).toFixed(2), 
            parseFloat(r.montant).toFixed(2)
        ]);

        tableRows.push(["TOTAL GÉNÉRAL", "", "", "", "", "", totalGeneral.toFixed(2) + " FCFA"]);

        const table = {
            headers: ["Nom", "Prénom", "Grade", "Statut", "Taux H.", "Total Eq.", "Montant (FCFA)"],
            rows: tableRows
        };

        await doc.table(table, { prepareHeader: () => doc.fontSize(9).font('Helvetica-Bold'), prepareRow: () => doc.fontSize(9).font('Helvetica') });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const exportFicheEnseignantExcel = async (req, res) => {
    try {
        const { id } = req.params;

        const [profilRows] = await db.query(`
            SELECT u.nom, u.prenom, u.email, u.contact, ens.referencens, ens.grade, ens.statut, ens.departement, ens.tauxh
            FROM enseignant ens
            JOIN utilisateur u ON ens.idutil = u.idutil
            WHERE ens.idens = ?
        `, [id]);

        if (profilRows.length === 0) throw new Error("Enseignant non trouvé");
        const profil = profilRows[0];

        const [heuresRows] = await db.query(`
            SELECT
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
            JOIN matiere m ON e.idmat = m.idmat
            JOIN annee_academique a ON e.idanac = a.idanac
            WHERE e.idens = ? AND a.statut = 'en_cours'
            GROUP BY m.idmat, m.intitule, m.volumhor, a.equ_cm_td, a.equ_cm_tp
        `, [id]);

        const [remunRows] = await db.query(`
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
        `, [id]);

        const remun = remunRows.length > 0 ? remunRows[0] : { total_heures_eq: 0, tauxh: profil.tauxh, remuneration_estimee: 0 };

        const workbook = new ExcelJS.Workbook();
        
        const sheet1 = workbook.addWorksheet('Profil');
        sheet1.columns = [
            { header: 'Nom', key: 'nom' }, { header: 'Prénom', key: 'prenom' }, { header: 'Email', key: 'email' },
            { header: 'Contact', key: 'contact' }, { header: 'Référence', key: 'referencens' }, { header: 'Grade', key: 'grade' },
            { header: 'Statut', key: 'statut' }, { header: 'Département', key: 'departement' }, { header: 'Taux Horaire', key: 'tauxh' }
        ];
        sheet1.addRow(profil);
        sheet1.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0097FB' } };
        sheet1.getRow(1).alignment = { horizontal: 'center' };

        const sheet2 = workbook.addWorksheet('Heures par matière');
        sheet2.columns = [
            { header: 'Matière', key: 'intitule' }, { header: 'CM', key: 'heures_cm' }, { header: 'TD', key: 'heures_td' },
            { header: 'TP', key: 'heures_tp' }, { header: 'Total Eq.', key: 'total_heures_eq' }, 
            { header: 'Volume Prévu', key: 'volumhor' }, { header: 'H. Complémentaires', key: 'heures_complementaires' }
        ];
        heuresRows.forEach(h => sheet2.addRow({
            ...h, 
            total_heures_eq: parseFloat(h.total_heures_eq).toFixed(2), 
            heures_complementaires: parseFloat(h.heures_complementaires).toFixed(2)
        }));
        const totals = heuresRows.reduce((acc, curr) => {
            acc.cm += parseFloat(curr.heures_cm); acc.td += parseFloat(curr.heures_td); acc.tp += parseFloat(curr.heures_tp);
            acc.eq += parseFloat(curr.total_heures_eq); acc.vol += parseFloat(curr.volumhor); acc.comp += parseFloat(curr.heures_complementaires);
            return acc;
        }, { cm: 0, td: 0, tp: 0, eq: 0, vol: 0, comp: 0 });
        const rowTot = sheet2.addRow(['TOTAL', totals.cm, totals.td, totals.tp, totals.eq.toFixed(2), totals.vol, totals.comp.toFixed(2)]);
        rowTot.font = { bold: true };
        sheet2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0097FB' } };
        sheet2.getRow(1).alignment = { horizontal: 'center' };

        const sheet3 = workbook.addWorksheet('Rémunération');
        sheet3.columns = [
            { header: 'Total Heures Eq.', key: 'total_heures_eq' }, { header: 'Taux Horaire (FCFA)', key: 'tauxh' },
            { header: 'Rémunération Estimée (FCFA)', key: 'remuneration_estimee' }
        ];
        sheet3.addRow({
            total_heures_eq: parseFloat(remun.total_heures_eq).toFixed(2),
            tauxh: remun.tauxh,
            remuneration_estimee: parseFloat(remun.remuneration_estimee).toFixed(2)
        });
        sheet3.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet3.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0097FB' } };
        sheet3.getRow(1).alignment = { horizontal: 'center' };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=fiche_enseignant_${profil.referencens}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const exportEtatGlobalHeuresExcel = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                u.nom, u.prenom,
                ens.departement,
                SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) AS heures_cm,
                SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) AS heures_td,
                SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) AS heures_tp,
                (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                 SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                 SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) AS total_heures_eq,
                GREATEST(0,
                    (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                     SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                     SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) - SUM(DISTINCT m.volumhor)
                ) AS heures_complementaires
            FROM enseigner e
            JOIN enseignant ens ON e.idens = ens.idens
            JOIN utilisateur u ON ens.idutil = u.idutil
            JOIN matiere m ON e.idmat = m.idmat
            JOIN annee_academique a ON e.idanac = a.idanac
            WHERE a.statut = 'en_cours'
            GROUP BY ens.idens, u.nom, u.prenom, ens.departement, a.equ_cm_td, a.equ_cm_tp
        `);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('État Global des Heures');
        sheet.columns = [
            { header: 'Nom', key: 'nom' }, { header: 'Prénom', key: 'prenom' }, { header: 'Département', key: 'departement' },
            { header: 'CM', key: 'heures_cm' }, { header: 'TD', key: 'heures_td' }, { header: 'TP', key: 'heures_tp' },
            { header: 'Total Eq.', key: 'total_heures_eq' }, { header: 'H. Complémentaires', key: 'heures_complementaires' }
        ];
        rows.forEach(r => sheet.addRow({
            ...r, total_heures_eq: parseFloat(r.total_heures_eq).toFixed(2), heures_complementaires: parseFloat(r.heures_complementaires).toFixed(2)
        }));
        const totals = rows.reduce((acc, curr) => {
            acc.cm += parseFloat(curr.heures_cm); acc.td += parseFloat(curr.heures_td); acc.tp += parseFloat(curr.heures_tp);
            acc.eq += parseFloat(curr.total_heures_eq); acc.comp += parseFloat(curr.heures_complementaires);
            return acc;
        }, { cm: 0, td: 0, tp: 0, eq: 0, comp: 0 });
        const rowTot = sheet.addRow(['TOTAL', '', '', totals.cm, totals.td, totals.tp, totals.eq.toFixed(2), totals.comp.toFixed(2)]);
        rowTot.font = { bold: true };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0097FB' } };
        sheet.getRow(1).alignment = { horizontal: 'center' };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=etat_global_heures.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const exportEtatComptabiliteExcel = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                u.nom, u.prenom,
                ens.grade, ens.statut, ens.tauxh,
                (SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                 SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                 SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) AS total_heures_eq,
                ((SUM(CASE WHEN e.type='CM' THEN e.duree ELSE 0 END) * 1 +
                  SUM(CASE WHEN e.type='TD' THEN e.duree ELSE 0 END) / a.equ_cm_td +
                  SUM(CASE WHEN e.type='TP' THEN e.duree ELSE 0 END) / a.equ_cm_tp) * ens.tauxh) AS montant
            FROM enseigner e
            JOIN enseignant ens ON e.idens = ens.idens
            JOIN utilisateur u ON ens.idutil = u.idutil
            JOIN annee_academique a ON e.idanac = a.idanac
            WHERE a.statut = 'en_cours'
            GROUP BY ens.idens, u.nom, u.prenom, ens.grade, ens.statut, ens.tauxh, a.equ_cm_td, a.equ_cm_tp
        `);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Comptabilité');
        sheet.columns = [
            { header: 'Nom', key: 'nom' }, { header: 'Prénom', key: 'prenom' }, { header: 'Grade', key: 'grade' },
            { header: 'Statut', key: 'statut' }, { header: 'Taux H. (FCFA)', key: 'tauxh' },
            { header: 'Total Eq.', key: 'total_heures_eq' }, { header: 'Montant (FCFA)', key: 'montant' }
        ];
        rows.forEach(r => sheet.addRow({
            ...r, total_heures_eq: parseFloat(r.total_heures_eq).toFixed(2), montant: parseFloat(r.montant).toFixed(2)
        }));
        const totalGeneral = rows.reduce((acc, curr) => acc + parseFloat(curr.montant), 0);
        const rowTot = sheet.addRow(['TOTAL GÉNÉRAL', '', '', '', '', '', totalGeneral.toFixed(2)]);
        rowTot.font = { bold: true };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0097FB' } };
        sheet.getRow(1).alignment = { horizontal: 'center' };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=etat_comptabilite.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    exportFicheEnseignant,
    exportEtatGlobalHeures,
    exportEtatComptabilite,
    exportFicheEnseignantExcel,
    exportEtatGlobalHeuresExcel,
    exportEtatComptabiliteExcel
};