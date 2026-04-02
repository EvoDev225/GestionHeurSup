const jwt = require('jsonwebtoken')

const genererJeton =async (res,utilisateur)=>{
    const token = jwt.sign(
    { IdUtilisateur: utilisateur[0].idutil, type: utilisateur[0].role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
);

const cookieName = `token_${utilisateur[0].role}`;   

res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

return token;
}

module.exports = genererJeton