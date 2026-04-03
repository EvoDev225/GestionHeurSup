

const logAction = async (action, description, db) => {
    try {
        await db.query(
            'INSERT INTO journal (action, description, created_at) VALUES (?,?,NOW())',
            [action, description]
        )
    } catch (error) {
        console.error("Erreur journal:", error.message)
    }
}
module.exports = logAction