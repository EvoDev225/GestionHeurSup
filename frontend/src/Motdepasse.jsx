import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FaGraduationCap } from 'react-icons/fa';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md';
import logo from "./assets/login.png"
import { changerMotdepasse } from './fonctions/utilisateur';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
const Motdepasse = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmMdp, setConfirmMdp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    if (!nouveauMdp || !confirmMdp) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (nouveauMdp !== confirmMdp) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (nouveauMdp.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await changerMotdepasse(token, nouveauMdp);
      toast.success("Mot de passe réinitialisé avec succès !");
      navigate("/");
    } catch (err) {
      setError(err?.message || "Lien invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full font-['Inter'] text-white bg-[#000814] overflow-hidden">
      {/* Colonne Gauche - Formulaire (100% mobile, 45% desktop) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full md:w-[45%] h-full flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-6 md:py-0 relative overflow-hidden"
      >
        {/* Dégradé décoratif bleu avec flou et ombre portée */}
        <motion.div 
          animate={{ 
            opacity: [0.4, 0.6, 0.4],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-120 h-100 bg-linear-to-bl from-[#0097FB]/80 to-transparent blur-[100px] shadow-[0_0_100px_#0097FB] rounded-full pointer-events-none" 
        />

        {/* Logo & Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <FaGraduationCap className="text-[#0097FB] text-4xl" />
          <h1 className="text-3xl font-bold tracking-tight">EduGest</h1>
        </motion.div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-2">Nouveau mot de passe</h2>
          <p className="text-[#94A3B8] text-sm">Choisissez un mot de passe sécurisé pour votre compte.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nouveau mot de passe</label>
            <div className="relative flex items-center">
              <MdLock className="absolute left-4 text-[#94A3B8] text-xl" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Saisissez votre nouveau mot de passe..."
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-12 text-white placeholder:text-[#94A3B8]/40 focus:border-[#0097FB]/50 outline-none transition-all"
                value={nouveauMdp}
                onChange={(e) => setNouveauMdp(e.target.value)}
              />
              <div 
                className="absolute right-4 cursor-pointer text-[#94A3B8] hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmer le mot de passe</label>
            <div className="relative flex items-center">
              <MdLock className="absolute left-4 text-[#94A3B8] text-xl" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmez votre mot de passe..."
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-12 text-white placeholder:text-[#94A3B8]/40 focus:border-[#0097FB]/50 outline-none transition-all"
                value={confirmMdp}
                onChange={(e) => setConfirmMdp(e.target.value)}
              />
              <div 
                className="absolute right-4 cursor-pointer text-[#94A3B8] hover:text-white transition-colors"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </div>
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs font-semibold"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-[#0097FB] hover:bg-[#0086e0] text-white font-bold py-3.5 rounded-lg transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </motion.button>

          <div 
            className="flex items-center justify-center gap-2 text-[#94A3B8] hover:text-white cursor-pointer transition-colors text-sm font-medium"
            onClick={() => navigate("/")}
          >
            <MdArrowBack />
            <span>Retour à la connexion</span>
          </div>
        </div>
      </motion.div>

      {/* Colonne Droite - Image (Masquée sur mobile, 55% desktop) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="hidden md:block md:w-[55%] relative h-full p-8"
      >
        <div className="absolute inset-0 bg-[#000814]/30 z-10" />
        <img
          src={logo}
          alt="Professionnels africains autour d'un bureau"
          className="w-full h-full object-cover rounded-2xl md:rounded-r-2xl md:rounded-l-none"
        />
      </motion.div>
    </div>
  );
};

export default Motdepasse;
