import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import Accueil from "./Accueil.jsx"
import Dashboard from "./components/Admin/Dashboard.jsx"
import DashboardAdminUser from "./components/Admin/DashboardAdminUser.jsx";
import DashboardAdminMatiere from "./components/Admin/DashboardAdminMatiere.jsx";
import DashboardAdminParametres from "./components/Admin/DashboardAdminParametres.jsx";
import DashboardAdminExports from "./components/Admin/DashboardAdminExports.jsx";
import SidebarRH from "./components/RH/SidebarRH.jsx";
import Navbar from "./components/Navbar.jsx";
import { MdConstruction } from "react-icons/md";
import DashboardRH from "./components/RH/DashboardRH.jsx";
import DashboardRhSaisie from "./components/RH/DashboardRhSaisie.jsx";
import DashboardRHStatistique from "./components/RH/DashboardRHStatistique.jsx";
import DashboardRhExport from "./components/RH/DashboardRhExport.jsx";
import SidebarEnseignant from "./components/Enseignant/SidebarEnseignant.jsx";
import DashboardEns from "./components/Enseignant/DashboardEns.jsx";
// import DashboardEnsHeures from "./components/Enseignant/DashboardEnsHeures.jsx";
import DashboardEnsRecap from "./components/Enseignant/DashboardEnsRecap.jsx";

import { Toaster } from "react-hot-toast";
const RHPlaceholder = ({ title }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-[#000814] min-h-screen">
      <SidebarRH isOpen={isOpen} onClose={() => setIsOpen(false)} role="rh" />
      <Navbar onMenuClick={() => setIsOpen(!isOpen)} userName="John Smith" userRole="Responsable RH" />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center p-6 md:ml-57.5 transition-all">
        <MdConstruction className="text-[#7A8FAD] text-6xl mb-4" />
        <h2 className="text-white text-2xl font-bold">{title} — à venir</h2>
        <p className="text-[#7A8FAD] mt-2">Page en cours de développement</p>
      </div>
    </div>
  );
};

const EnseignantPlaceholder = ({ title }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-[#000814] min-h-screen">
      <SidebarEnseignant isOpen={isOpen} onClose={() => setIsOpen(false)} role="enseignant" />
      <Navbar onMenuClick={() => setIsOpen(!isOpen)} userName="Jean Dupont" userRole="Enseignant" />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center p-6 md:ml-[230px] transition-all gap-3">
        <MdConstruction className="text-[#7A8FAD] text-[48px]" />
        <h2 className="text-white text-[20px] font-semibold">{title} — à venir</h2>
        <p className="text-[#7A8FAD] text-[14px]">Page en cours de développement</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="bg-[#000814] min-h-screen font-['Inter']">
      <Toaster position="top-center" reverseOrder={false}></Toaster>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/dashboard-admin" element={<Dashboard />} />
          <Route path="/dashboard-admin-user" element={<DashboardAdminUser />} />
          <Route path="/dashboard-admin-matiere" element={<DashboardAdminMatiere />} />
          <Route path="/dashboard-admin-parametres" element={<DashboardAdminParametres />} />
          <Route path="/dashboard-admin-export" element={<DashboardAdminExports />} />
          
          {/* Routes RH */}
          <Route path="/rh/dashboard" element={<DashboardRH />} />
          <Route path="/rh/heures" element={<DashboardRhSaisie/>} />
          <Route path="/rh/statistiques" element={<DashboardRHStatistique title="Statistiques" />} />
          <Route path="/rh/paiements" element={<DashboardRhExport />} />

          {/* Routes Enseignant */}
          <Route path="/enseignant/dashboard" element={<DashboardEns title="Dashboard Enseignant" />} />
          {/* <Route path="/enseignant/heures" element={<DashboardEnsHeures title="Mes heures" />} /> */}
          <Route path="/enseignant/recap" element={<DashboardEnsRecap title="Mon récapitulatif" />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
