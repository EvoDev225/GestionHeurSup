require('dotenv').config() // ← PREMIÈRE LIGNE ABSOLUMENT

const express= require('express')
const cors= require('cors')
const { db, TestDbConnexion } = require('./config/db') // ← destructuration correcte

const app  = express()
const PORT = process.env.PORT || 3000
const userRoutes = require('./routes/routeUtilisateur') // ← importer les routes utilisateur
const genererRef = require('./middlewares/genererRef')
app.use(cors())
app.use(express.json())

// Test connexion
TestDbConnexion()
app.use("/user",userRoutes)

// ← utiliser la fonction de génération de référence pour tester

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`)
})