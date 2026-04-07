const express = require('express');
const { 
    getAllUsers, 
    newUser,
    getUserById, 
    updateUserForAdmin, 
    updateSimpleUser,
    deleteUser,
    Connexion,
    Deconnexion,
    VerifierAuthentification,
    changerMotdepasse,
    motdepasseOublie,
    toggleStatutUser} = require('../controllers/userController');
const verifierToken = require('../middlewares/verificationJeton');
const r =express.Router();

// CRUD des utilisateurs
r.get("/allUser",getAllUsers)
r.get("/specificUser/:id",getUserById)
r.post("/newUser",newUser)
r.put("/updateUserForAdmin/:id",updateUserForAdmin)
r.put("/updateUser/:id",updateSimpleUser)
r.put("/changeStatutUser/:id",toggleStatutUser)
r.delete("/deleteUser/:id",deleteUser)


// Authentification et gestion de session
r.post("/connexion",Connexion)
r.post("/deconnexion",verifierToken,Deconnexion)
r.get("/verifierAuthentification",verifierToken,VerifierAuthentification)
r.post("/motdepasseOublie",motdepasseOublie)
r.put("/reinitialiserMotdepasse/:token",changerMotdepasse)

module.exports=r;