// genererRef.js
const genererRef = async (role, db) => {
    let prefix;
    let table;

    switch (role) {
        case 'admin':
            prefix = 'ADM';
            table = 'administrateur';
            break;
        case 'rh':
            prefix = 'RH';
            table = 'ressource_humaine';
            break;
        case 'enseignant':
            prefix = 'ENS';
            table = 'enseignant';
            break;
    }

    // Compte le nombre d'enregistrements existants
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM ${table}`);
    const num = rows[0].total + 1;

    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

    return `${prefix}-${dateStr}-${String(num).padStart(4, '0')}`;
};

module.exports = genererRef;