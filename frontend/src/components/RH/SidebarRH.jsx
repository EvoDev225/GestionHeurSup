import React from "react";
import { useLocation, Link } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";
import {
  MdDashboard,
  MdEditCalendar,
  MdBarChart,
  MdReceipt,
  MdLogout,
} from "react-icons/md";

const navItems = [
  { label: "Tableau de bord", path: "/rh/dashboard", icon: MdDashboard },
  { label: "Saisie des heures", path: "/rh/heures", icon: MdEditCalendar },
  { label: "Statistiques", path: "/rh/statistiques", icon: MdBarChart },
  { label: "États de paiement", path: "/rh/paiements", icon: MdReceipt },
];

const SidebarRH = ({ isOpen, onClose}) => {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-57.5 bg-[#000814] border-r border-white/10 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex flex-col flex-1 px-4 py-8 overflow-y-auto overflow-x-hidden">
          <div className="flex items-center gap-3 mb-12 px-2">
            <FaGraduationCap className="text-[#0097FB] text-4xl" />
            <h1 className="text-3xl font-bold tracking-tight text-white">EduGest</h1>
          </div>

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 transition-all duration-200 group rounded-lg
                    ${
                      isActive
                        ? "bg-[#0097FB] text-white border-l-[3px] border-[#00C8FF] shadow-[0_4px_12px_rgba(0,151,251,0.3)]"
                        : "text-[#7A8FAD] hover:bg-[#0097FB]/10 hover:text-white"
                    }`}
                >
                  <Icon className={`text-2xl ${isActive ? "text-white" : "group-hover:text-white"}`} />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-4 py-4 border-t border-white/5 space-y-4">
          {/* Switch Block */}

          {/* Logout Section */}
          <div className="pt-2 border-t border-white/5">
            <button
              className="flex items-center gap-4 w-full px-4 py-3 text-[#EF4444] font-semibold hover:bg-[#EF4444]/10 rounded-lg transition-all duration-200"
              onClick={() => console.log("Déconnexion...")}
            >
              <MdLogout className="text-2xl" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarRH;