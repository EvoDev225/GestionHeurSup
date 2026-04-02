const express = require('express');
const { getAllUsers, newUser } = require('../controllers/userController');
const r =express.Router();


r.get("/allUser",getAllUsers)
r.post("/newUser",newUser)

module.exports=r;