const express = require('express');
const { getAllUsers, newUser, getUserById } = require('../controllers/userController');
const r =express.Router();


r.get("/allUser",getAllUsers)
r.get("/specificUser/:id",getUserById)
r.post("/newUser",newUser)

module.exports=r;