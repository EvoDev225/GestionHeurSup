const express = require('express');
const { 
    getAllUsers, 
    newUser,
    getUserById, 
    updateUserForAdmin } = require('../controllers/userController');
const r =express.Router();

// CRUD des utilisateurs
r.get("/allUser",getAllUsers)
r.get("/specificUser/:id",getUserById)
r.post("/newUser",newUser)
r.put("/updateUserForAdmin/:id",updateUserForAdmin)


module.exports=r;