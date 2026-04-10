import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FaGraduationCap } from 'react-icons/fa';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md';
import logo from "./assets/login.png"
import { connexion, motdepasseOublie } from './fonctions/utilisateur';
import {useNavigate} from 'react-router-dom';
import toast from 'react-hot-toast';
const Accueil = () => {
  const [login,setLogin]=useState({
    email:"",
    mdp:""
  })
  const navigate=useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin= async()=>{
    const {email,mdp}=login;
    if (!email || !mdp) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    try {
      const res=await connexion(login);
        switch (res.data.role) {
          case "admin": navigate("/dashboard-admin"); break;
          case "enseignant": navigate("/enseignant/dashboard"); break;
          case "rh": navigate("/rh/dashboard"); break;
          default: navigate("/"); break;
        }
      toast.success("Bienvenue, vous êtes connecté !");

    } catch (error) {
      toast.error("Les informations sont incorrectes !");
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setError("Veuillez saisir votre email.");
      return;
    }
    setError("");
    try {
      await motdepasseOublie(resetEmail);
      toast.success("Un lien de réinitialisation a été envoyé à votre adresse email.");
      setResetEmail("");
      setIsForgotPassword(false);
    } catch (err) {
      setError(err?.message || "Aucun compte associé à cet email.");
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

        <AnimatePresence mode="wait">
          {!isForgotPassword ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
            >
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-10">
              Connectez-vous à votre espace personnel pour accéder à la gestion complète
              des charges horaires, des intervenants et des rapports d'activité de votre établissement.
            </p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative flex items-center">
                  <MdEmail className="absolute left-4 text-[#94A3B8] text-xl" />
                  <input
                    type="email"
                    placeholder="Saisissez votre email..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder:text-[#94A3B8]/40 focus:border-[#0097FB]/50 outline-none transition-all"
                    onChange={(e) => setLogin({...login,email:e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mot de passe</label>
                <div className="relative flex items-center">
                  <MdLock className="absolute left-4 text-[#94A3B8] text-xl" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Saisissez votre mot de passe..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-12 text-white placeholder:text-[#94A3B8]/40 focus:border-[#0097FB]/50 outline-none transition-all"
                    value={login.mdp}
                    onChange={(e) => setLogin({...login,mdp:e.target.value})}
                  />
                  <div 
                    className="absolute right-4 cursor-pointer text-[#94A3B8] hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                  <div className={`w-4 h-4 rounded border border-white/20 flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#0097FB] border-[#0097FB]' : 'bg-white/5 group-hover:border-white/40'}`}>
                    {rememberMe && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  <span className="text-[#94A3B8] select-none">Se souvenir de moi</span>
                </div>
                <div 
                  className="text-[#0097FB] cursor-pointer hover:underline font-medium"
                  onClick={() => { setIsForgotPassword(true); setError(""); }}
                >
                  Mot de passe oublié ?
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
                onClick={handleLogin}
                className="w-full bg-[#0097FB] hover:bg-[#0086e0] text-white font-bold py-3.5 rounded-lg transition-all shadow-lg"
              >
                Se connecter
              </motion.button>
            </div>
            </motion.div>
          ) : (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-10">
              Saisissez votre email de récupération pour recevoir un lien de réinitialisation de votre mot de passe.
            </p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email de récupération</label>
                <div className="relative flex items-center">
                  <MdEmail className="absolute left-4 text-[#94A3B8] text-xl" />
                  <input
                    type="email"
                    placeholder="Saisissez votre email..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder:text-[#94A3B8]/40 focus:border-[#0097FB]/50 outline-none transition-all"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
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
                onClick={handleResetPassword}
                className="w-full bg-[#0097FB] hover:bg-[#0086e0] text-white font-bold py-3.5 rounded-lg transition-all shadow-lg"
              >
                Réinitialiser
              </motion.button>

              <div 
                className="flex items-center justify-center gap-2 text-[#94A3B8] hover:text-white cursor-pointer transition-colors text-sm font-medium"
                onClick={() => { setIsForgotPassword(false); setError(""); }}
              >
                <MdArrowBack />
                <span>Retour à la connexion</span>
              </div>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
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

export default Accueil;
