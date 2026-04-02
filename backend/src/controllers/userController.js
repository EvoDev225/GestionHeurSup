const {db} = require('../config/db')
const bcrypt = require('bcrypt')
const genererRef = require('../middlewares/genererRef')

// CRUD
const getAllUsers = async (req,res)=>{
    try {
        const [rows] = await db.query('SELECT * FROM utilisateur')
        if(rows.length===0){
            return res.status(404).json({message:"Aucun utilisateur trouvé"})
        }
        return res.status(200).json({data:rows})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

const newUser = async (req,res)=>{
    const {nom,prenom,sexe,email,contact,role,mdp,grade,statut,departement,tauxh} = req.body
    if(!nom || !prenom || !sexe || !email || !contact || !role || !mdp){
        return res.status(400).json({message:"Tous les champs sont obligatoires"})
    }
    const motdepasseHash = await bcrypt.hash(mdp,10)
    // Si l'utilisateur est l'admistrateur
    if(role === "admin"){
        const refAdmin = genererRef("admin")
        try {
            const [rows] = await db.query(`INSERT INTO utilisateur (nom,prenom,sexe,email,contact,role,mdp,stat)
                VALUES (?,?,?,?,?,?,?,?)`,[nom,prenom,sexe,email,contact,role,motdepasseHash,"actif"])
                const idUser = rows.insertId
            const [rows2]= await db.query(`INSERT INTO administrateur (reference,idutil) VALUES (?,?)`,[refAdmin,idUser])
                return res.status(201).json({message:"Administrateur  ajouté avec succès",data:rows,data_admin:rows2})
        } catch (error) {
            return res.status(500).json({message:error.message})
        }
    }
    // Si l'utilisateur est une ressource humaine
    if(role ==="rh"){
        const refRh = genererRef("rh")
        try {
            const [rows] = await db.query(`INSERT INTO utilisateur (nom,prenom,sexe,email,contact,role,mdp,stat)
                VALUES (?,?,?,?,?,?,?,?)`,[nom,prenom,sexe,email,contact,role,motdepasseHash,"actif"])
                const idUser = rows.insertId
                const [rows2]= await db.query(`INSERT INTO ressource_humaine (reference,idutil) VALUES (?,?)`,[refRh,idUser])
                return res.status(201).json({message:"RH ajouté avec succès",data:rows,data_rh:rows2})
        } catch (error) {
            return res.status(500).json({message:error.message})
        }
    }
    // Si l'utilisateur est un enseignant
    if(role==="enseignant"){
        const refEns = genererRef("enseignant")
        if(!grade || !statut || !departement || !tauxh){
            return res.status(400).json({message:"Tous les champs sont obligatoires pour un enseignant"})
        }
        try {
            const [rows] = await db.query(`INSERT INTO utilisateur (nom,prenom,sexe,email,contact,role,mdp,stat)
                VALUES (?,?,?,?,?,?,?,?)`,[nom,prenom,sexe,email,contact,role,motdepasseHash,"actif"])
                const idUser = rows.insertId
            const [rows2]= await db.query(`INSERT INTO enseignant (referencens,grade,statut,departement,tauxh,idutil) VALUES (?,?,?,?,?,?)`,[refEns,grade,statut,departement,tauxh,idUser])
                return res.status(201).json({message:"Enseignant ajouté avec succès",data:rows,data_ens:rows2})
        } catch (error) {
            return res.status(500).json({message:error.message})
        }
    }
    
}


module.exports = {getAllUsers,newUser}