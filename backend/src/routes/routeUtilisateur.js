const express = require('express');
const { 
    getAllUsers, 
    newUser,
    getUserById, 
    updateUserForAdmin, 
    updateSimpleUser,
    deleteUser,
    Connexion,
    Deconnexion} = require('../controllers/userController');
const verifierToken = require('../middlewares/verificationJeton');
const r =express.Router();

// CRUD des utilisateurs
r.get("/allUser",getAllUsers)
r.get("/specificUser/:id",getUserById)
r.post("/newUser",newUser)
r.put("/updateUserForAdmin/:id",updateUserForAdmin)
r.put("/updateUser/:id",updateSimpleUser)
r.delete("/deleteUser",deleteUser)


// Authentification et gestion de session
r.post("/connexion",Connexion)
r.post("/deconnexion",verifierToken,Deconnexion)

module.exports=r;