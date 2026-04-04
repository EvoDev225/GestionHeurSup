import React from 'react';
import { MdDashboard, MdEventNote, MdReceiptLong, MdLogout } from 'react-icons/md';
import { FaGraduationCap } from 'react-icons/fa';
import { useLocation, Link } from 'react-router-dom';

const navItems = [
  { label: "Tableau de bord", path: "/enseignant/dashboard", icon: MdDashboard },
  { label: "Mes heures", path: "/enseignant/heures", icon: MdEventNote },
  { label: "Mon récapitulatif", path: "/enseignant/recap", icon: MdReceiptLong },
];

const SidebarEnseignant = ({ isOpen, onClose }) => {  const location = useLocation();

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/55 z-[199] md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-[230px] bg-[#000814] border-r border-white/5 flex flex-col z-[200] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* ZONE TOP — LOGO */}
        <div className="p-6 pb-5 flex items-center gap-3 border-b border-white/5 mb-2">
          <div className="w-[42px] h-[42px] bg-gradient-to-br from-[#0097FB] to-[#005fa3] rounded-[11px] flex items-center justify-center shadow-[0_0_18px_rgba(0,151,251,0.3)]">
            <FaGraduationCap size={20} className="text-white" />
          </div>
          <h1 className="text-[21px] font-bold text-white tracking-[-0.5px]">EduGest</h1>
        </div>

        {/* ZONE MIDDLE — NAVIGATION */}
        <div className="flex-1 px-3 py-3 flex flex-col gap-1 overflow-y-auto">
          <p className="text-[#3D5068] text-[10px] uppercase font-bold tracking-[0.1em] px-2 py-2 mb-1">
            NAVIGATION
          </p>
          
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-[11px] rounded-[9px] transition-all duration-200 group no-underline
                    ${
                      isActive
                        ? "bg-[#0097FB] text-white border-l-[3px] border-[#00C8FF] font-semibold shadow-[0_2px_12px_rgba(0,151,251,0.2)]"
                        : "text-[#7A8FAD] border-l-[3px] border-transparent hover:bg-[#0097FB]/10 hover:text-white"
                    }`}
                >
                  <Icon className={`text-[19px] ${isActive ? "text-white" : "text-[#7A8FAD] group-hover:text-white"}`} />
                  <span className="text-[14px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ZONE BOTTOM */}
        <div className="p-3 mt-auto border-t border-white/5 mb-1">
          {/* BOUTON DÉCONNEXION */}
          <div className="pt-2.5 border-t border-white/5 mt-2">
            <button
              className="flex items-center gap-2.5 w-full px-3.5 py-[11px] text-[#EF4444] font-medium hover:bg-[#EF4444]/10 rounded-[9px] transition-all duration-200"
              onClick={() => console.log("Déconnexion...")}
            >
              <MdLogout size={19} />
              <span className="text-[14px]">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarEnseignant;