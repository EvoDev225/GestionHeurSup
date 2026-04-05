import React, { useEffect, useState } from "react";
import { MdMenu } from "react-icons/md";
import { verifierAuthentification } from "../fonctions/utilisateur";
import toast from "react-hot-toast";

const Navbar = ({ onMenuClick }) => {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await verifierAuthentification();
        setUser(res.data);
      } catch (error) {
        toast.error("Une erreur est survenue lors de la vérification de l'authentification.");
      }
    };
    fetchUserData();
  }, []);

  const nomComplet = user ? `${user.prenom} ${user.nom}` : "...";
  const roleLabel = user?.role === "admin" ? "Administrateur"
    : user?.role === "rh" ? "Responsable RH"
    : user?.role === "enseignant" ? "Enseignant"
    : "";
  const initiales = user ? `${user.prenom[0]}${user.nom[0]}` : "?";

  return (
    <nav className="fixed top-0 right-0 h-16 w-full md:w-[calc(100%-230px)] bg-[#000814] border-b border-white/5 border-l-2 border-[#7B2FBE] z-50 flex items-center justify-between px-6 transition-all duration-300">
      {/* CÔTÉ GAUCHE : Hamburger Mobile */}
      <div className="flex items-center">
        <button
          className="md:hidden text-white text-2xl hover:bg-white/5 p-2 rounded-lg transition-colors"
          onClick={onMenuClick}
        >
          <MdMenu />
        </button>
      </div>

      {/* CÔTÉ DROIT : Profil Utilisateur */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-white text-[14px] font-medium leading-tight">
            {nomComplet}
          </p>
          <p className="text-[#7A8FAD] text-[12px] leading-tight">
            {roleLabel}
          </p>
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#0097FB] flex items-center justify-center text-white font-bold shadow-lg shadow-[#0097FB]/20 border border-white/10">
          {initiales}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;