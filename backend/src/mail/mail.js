require("dotenv").config();
const nodemailer = require("nodemailer");
const { emailReinitialisation, emailConfirmationTemplate } = require("./template"); // ✅

const createTransporter = () => nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

const oublierMotdepasse = async (email, lienReinitialisation) => {
    try {
        const info = await createTransporter().sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Réinitialisation de votre mot de passe",
            html: emailReinitialisation(email, lienReinitialisation), // ✅
        });
        return info;
    } catch (error) {
        console.error("Erreur envoi email:", error);
        throw error;
    }
};

const motdepasseReintialiser = async (email) => {
    try {
        const info = await createTransporter().sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Mot de passe modifié avec succès",
            html: emailConfirmationTemplate(email), // ✅
        });
        return info;
    } catch (error) {
        console.error("Erreur envoi email:", error);
        throw error;
    }
};

module.exports = { oublierMotdepasse, motdepasseReintialiser };