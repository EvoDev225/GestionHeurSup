import React from "react";
import { useLocation, Link } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";
import {
  MdDashboard,
  MdPeople,
  MdBook,
  MdSettings,
  MdDescription,
  MdLogout,
} from "react-icons/md";

const navItems = [
  { label: "Tableau de bord", path: "/dashboard-admin", icon: MdDashboard },
  { label: "Utilisateurs", path: "/dashboard-admin-user", icon: MdPeople },
  { label: "Matières", path: "/matieres", icon: MdBook },
  { label: "Paramètres", path: "/parametres", icon: MdSettings },
  { label: "Exports & Documents", path: "/exports", icon: MdDescription },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Overlay mobile : visible uniquement quand isOpen=true sur petit écran */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen w-57.5 bg-[#000814] border-r border-white/10 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex flex-col flex-1 px-4 py-8 overflow-y-auto overflow-x-hidden">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-12 px-2">
            <FaGraduationCap className="text-[#0097FB] text-4xl" />
            <h1 className="text-3xl font-bold tracking-tight text-white">
              EduGest
            </h1>
          </div>

          {/* Navigation Links */}
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
                  <Icon
                    className={`text-2xl ${isActive ? "text-white" : "group-hover:text-white"}`}
                  />
                  <span className="font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-white/10 mb-2">
          <button
            className="flex items-center gap-4 w-full px-4 py-3 text-[#EF4444] font-semibold hover:bg-[#EF4444]/10 rounded-lg transition-all duration-200"
            onClick={() => console.log("Déconnexion...")}
          >
            <MdLogout className="text-2xl" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
