require('dotenv').config() // ← PREMIÈRE LIGNE ABSOLUMENT

const express= require('express')
const cors= require('cors')
const { db, TestDbConnexion } = require('./config/db') // ← destructuration correcte

const app  = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Test connexion
TestDbConnexion()

app.get('/', async (req, res) => {
try {
    const [rows] = await db.query('SELECT * FROM utilisateur')
    if (rows.length === 0) {
    return res.status(404).json({ message: 'Aucun utilisateur trouvé' })
    }
    return res.status(200).json(rows)
} catch (error) {
    console.error('Erreur :', error.message) // ← voir la vraie erreur
    return res.status(500).json({ message: error.message }) // ← voir dans Postman
}
})

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`)
})