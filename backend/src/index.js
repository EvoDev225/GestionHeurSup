require('dotenv').config() // ← PREMIÈRE LIGNE ABSOLUMENT
const cookie_parser = require('cookie-parser')
const express= require('express')
const cors= require('cors')
const {TestDbConnexion } = require('./config/db') // ← destructuration correcte

const app  = express()
const PORT = process.env.PORT || 3000
const userRoutes = require('./routes/routeUtilisateur') // ← importer les routes utilisateur
const anacRoutes = require('./routes/routeAnac') // ← importer les routes année académique
const matiereRoutes = require('./routes/routeMatiere') // ← importer les routes matière
app.use(cors())
app.use(express.json())
app.use(cookie_parser())

// Test connexion
TestDbConnexion()
app.use("/user",userRoutes)
app.use("/anac",anacRoutes)
app.use("/matiere",matiereRoutes)

// ← utiliser la fonction de génération de référence pour tester

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`)
})