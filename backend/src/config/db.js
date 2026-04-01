const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
const TestDbConnexion=async()=>{
    try {
        const connexion = await db.getConnection();
        console.log('Connexion à la base de données réussie'); 
        connexion.release(); 
    } catch (error) {
        console.error('Erreur MySQL ❌ :', error.message)
    }
}
module.exports = {db,TestDbConnexion};