const { db } = require('../config/db')

const getAllJournal = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM journal ORDER BY created_at DESC LIMIT 5')
        if (rows.length === 0) {
            return res.status(404).json({ message: "Aucun enregistrement de journal trouvé" })
        }
        return res.status(200).json({ data: rows })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const deleteJournal = async (req, res) => {
    const { id } = req.params
    if (!id) {
        return res.status(400).json({ message: "ID journal est requis" })
    }
    try {
        const [rows] = await db.query('DELETE FROM journal WHERE idjourn=?', [id])
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: "Enregistrement non trouvé" })
        }
        return res.status(200).json({ message: "Journal supprimé avec succès" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = {
    getAllJournal,
    deleteJournal
}