const {db} = require('../config/db')
const bcrypt = require('bcrypt')
const genererRef = require('../middlewares/genererRef')
const genererJeton = require('../middlewares/generateJWT')


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
const getUserById  = async (req,res)=>{
    const {id}= req.params
    if(!id){
        return res.status(400).json({message:"ID utilisateur est requis"})
    }
    try {
        const [rows] = await db.query(`SELECT * FROM utilisateur 
            LEFT JOIN administrateur ON utilisateur.idutil=administrateur.idutil 
            LEFT JOIN ressource_humaine ON utilisateur.idutil=ressource_humaine.idutil 
            LEFT JOIN enseignant ON utilisateur.idutil=enseignant.idutil
            WHERE utilisateur.idutil=?`
            ,[id])
        if(rows.length===0){
            return res.status(404).json({message:"Utilisateur non trouvé"})
        }
        return res.status(200).json({data:rows[0]})
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
const updateUserForAdmin = async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, sexe, email, contact, role, mdp, grade, stat, statut, departement, tauxh } = req.body;

    if (!id) {
        return res.status(400).json({ message: "ID utilisateur est requis" });
    }

    let motdepasseHashed;
    if (mdp) {
        motdepasseHashed = await bcrypt.hash(mdp, 10);
    }
    if(role==="admin" || role==="rh"){
        try {
        const [rows] = await db.query(
        `UPDATE utilisateur 
        SET nom=?, prenom=?, sexe=?, email=?, contact=?, role=?, mdp=?, stat=?
        WHERE utilisateur.idutil=?`,
        [nom, prenom, sexe, email, contact, role, motdepasseHashed, stat, id]
        );
        return res.status(200).json({ message: "Les informations ont été mises à jour avec succès", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    }
    if(role==="enseignant"){
        try {
        const [rows] = await db.query(
        `UPDATE utilisateur 
        SET nom=?, prenom=?, sexe=?, email=?, contact=?, role=?, mdp=?, stat=?
        WHERE utilisateur.idutil=?`,
        [nom, prenom, sexe, email, contact, role, motdepasseHashed, stat, id]
        );
        const [rows2]= await db.query(`
            UPDATE enseignant SET grade=?, statut=?, departement=?, tauxh=?
            WHERE enseignant.idutil=?`,[grade,statut,departement,tauxh,id])
        return res.status(200).json({ message: "Les informations ont été mises à jour avec succès", data: rows, data_ens: rows2 });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
}
const updateSimpleUser = async (req,res)=>{
    const { id } = req.params;
    const { nom, prenom, sexe, email, contact, mdp} = req.body;

    if (!id) {
        return res.status(400).json({ message: "ID utilisateur est requis" });
    }

    let motdepasseHashed;
    if (mdp) {
        motdepasseHashed = await bcrypt.hash(mdp, 10);
    }
    try {
        const [rows] = await db.query(
        `UPDATE utilisateur 
        SET nom=?, prenom=?, sexe=?, email=?, contact=?, mdp=?
        WHERE utilisateur.idutil=?`,
        [nom, prenom, sexe, email, contact, motdepasseHashed, id]
        );
        return res.status(200).json({ message: "Les informations ont été mises à jour avec succès", data: rows });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    
}
const deleteUser = async (req,res)=>{
    const {id} = req.params
        if (!id) {  
        return res.status(400).json({ message: "ID utilisateur est requis" });
        }
        try {
            const [rows] = await db.query(`DELETE FROM utilisateur WHERE idutil=?`,[id])
            if(rows.affectedRows===0){
                return res.status(404).json({message:"Utilisateur non trouvé"})
            }
            return res.status(200).json({message:"Utilisateur supprimé avec succès"})
        } catch (error) {
            return res.status(500).json({message:error.message})
        }
}

// Authentification et gestion de session

const Connexion =async (req,res)=>{
    const {email,mdp} = req.body
    if(!email || !mdp){
        return res.status(400).json({message:"Veuillez remplir tous les champs"})
    }
    try{
        const [rows] = await db.query(`SELECT * FROM utilisateur WHERE email=?`,[email])
        if(rows.length === 0){
            return res.status(404).json({message:"Utilisateur non trouvé"})
        }
        const verifierMotDePasse = await bcrypt.compare(mdp,rows[0].mdp)
        if(!verifierMotDePasse){
            return res.status(401).json({message:"Mot de passe incorrect"})
        }
        await  genererJeton(res,rows)
        return res.status(200).json({message:"Connexion réussie"})
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

const Deconnexion = async (req,res)=>{
    try {
        const role = req.user.type
        await res.clearCookie(`token_${role}`)
    return res.status(200).json({message:"Déconnexion réussie"})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}
const VerifierAuthentification = async (req,res)=>{
    try {
        const [rows] = await db.query(`SELECT * FROM utilisateur
        LEFT JOIN administrateur ON utilisateur.idutil=administrateur.idutil
        LEFT JOIN ressource_humaine ON utilisateur.idutil=ressource_humaine.idutil
        LEFT JOIN enseignant ON utilisateur.idutil=enseignant.idutil    
        WHERE utilisateur.idutil=?`,[req.user.IdUtilisateur])
        return res.status(200).json({data:rows[0]}) 
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}



module.exports = {
    getAllUsers,
    newUser,
    getUserById,
    updateUserForAdmin,
    updateSimpleUser,
    deleteUser,
    Connexion,
    Deconnexion,
    VerifierAuthentification
}