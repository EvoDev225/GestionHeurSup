const jwt = require('jsonwebtoken')


const verifierToken = (req, res, next) => {
    const roles = ["admin", "rh", "enseignant"];
    let token = null;

    for (const role of roles) {
        if (req.cookies[`token_${role}`]) {
            token = req.cookies[`token_${role}`];
            break;
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Non autorisé, token manquant" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded; // { IdUtilisateur, type }
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré" });
    }
};

module.exports = verifierToken;