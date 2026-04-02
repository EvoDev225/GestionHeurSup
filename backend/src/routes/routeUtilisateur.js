const express = require('express');
const { 
    getAllUsers, 
    newUser,
    getUserById, 
    updateUserForAdmin, 
    updateSimpleUser,
    deleteUser} = require('../controllers/userController');
const r =express.Router();

// CRUD des utilisateurs
r.get("/allUser",getAllUsers)
r.get("/specificUser/:id",getUserById)
r.post("/newUser",newUser)
r.put("/updateUserForAdmin/:id",updateUserForAdmin)
r.put("/updateUser/:id",updateSimpleUser)
r.delete("/deleteUser/:id",deleteUser)


module.exports=r;