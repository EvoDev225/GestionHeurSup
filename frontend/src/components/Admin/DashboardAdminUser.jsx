import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarAdmin from "./SidebarAdmin.jsx";
import Navbar from "../Navbar.jsx";
import { 
  MdPeople, 
  MdSchool, 
  MdBlock, 
  MdSearch, 
  MdPersonAdd, 
  MdMoreVert, 
  MdEdit, 
  MdDelete, 
  MdLock 
} from "react-icons/md";

const fakeUsers = [
  { id: 1, nom: "Jean", prenom: "François", email: "jean.francois@edu.ci", role: "Admin", statut: "Actif" },
  { id: 2, nom: "Aminata", prenom: "Koné", email: "aminata.kone@edu.ci", role: "RH", statut: "Actif" },
  { id: 3, nom: "Paul", prenom: "Bamba", email: "paul.bamba@edu.ci", role: "RH", statut: "Inactif" },
];

const fakeEnseignants = [
  { id: 1, code: "ENS-001", nom: "Jean", prenom: "François", grade: "Maître de conférence", departement: "Informatique", type: "Permanent", heuresFaites: 248, heuresMax: 192, statut: "Actif" },
  { id: 2, code: "ENS-002", nom: "Konan", prenom: "Charles", grade: "Maître de conférence", departement: "Informatique", type: "Permanent", heuresFaites: 248, heuresMax: 192, statut: "Actif" },
  { id: 3, code: "ENS-003", nom: "Hervé", prenom: "Koffi", grade: "Assistant", departement: "Droit", type: "Vacataire", heuresFaites: 48, heuresMax: 192, statut: "Actif" },
  { id: 4, code: "ENS-004", nom: "Moro", prenom: "Isaac", grade: "Professeur", departement: "Marketing", type: "Permanent", heuresFaites: 90, heuresMax: 192, statut: "Inactif" },
  { id: 5, code: "ENS-005", nom: "Bamba", prenom: "Sory", grade: "Assistant", departement: "Comptabilité", type: "Vacataire", heuresFaites: 144, heuresMax: 192, statut: "Actif" },
];

const departements = ["Tous les départements", "Informatique", "Droit", "Marketing", "Comptabilité"];
const grades = ["Tous les grades", "Professeur", "Maître de conférence", "Assistant"];

// Variants pour les animations (uniformité avec DashboardMain)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const DashboardAdminUser = () => {
  const [activeTab, setActiveTab] = useState("utilisateurs");
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("Tous les départements");
  const [selectedGrade, setSelectedGrade] = useState("Tous les grades");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // État Modale Contextuelle
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const modalRef = useRef(null);

  // Fermeture modale au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
      }
    };
    if (modalOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalOpen]);

  // Logique de filtrage
  const filteredUsers = fakeUsers.filter(u => 
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEnseignants = fakeEnseignants.filter(e => {
    const matchSearch = `${e.nom} ${e.prenom} ${e.code}`.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === "Tous les départements" || e.departement === selectedDept;
    const matchGrade = selectedGrade === "Tous les grades" || e.grade === selectedGrade;
    return matchSearch && matchDept && matchGrade;
  });

  // KPIs
  const totalUsers = fakeUsers.length + fakeEnseignants.length;
  const countPerm = fakeEnseignants.filter(e => e.type === "Permanent").length;
  const countVac = fakeEnseignants.filter(e => e.type === "Vacataire").length;
  const totalInactif = [...fakeUsers, ...fakeEnseignants].filter(x => x.statut === "Inactif").length;

  const handleActionClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const getInitials = (nom, prenom) => `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#000814]">
      <SidebarAdmin isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} role="admin" />
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <motion.main 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mt-16 text-white md:ml-57.5 transition-all duration-300 min-h-[calc(100vh-64px)] p-4 md:p-6"
      >
      
      {/* SECTION 1 — KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <MdPeople className="text-2xl text-[#0097FB]" />
            <span className="text-[#7A8FAD] text-[13px]">Utilisateurs</span>
          </div>
          <h3 className="text-3xl font-bold">{totalUsers}</h3>
          <p className="text-[#0097FB] text-[12px] mt-1 font-medium">Enregistrés</p>
        </div>

        <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <MdSchool className="text-2xl text-[#0097FB]" />
            <span className="text-[#7A8FAD] text-[13px]">Enseignants</span>
          </div>
          <h3 className="text-3xl font-bold">{fakeEnseignants.length}</h3>
          <div className="text-[12px] mt-1 flex gap-2">
            <span className="text-[#10B981]">{countPerm} Permanents</span>
            <span className="text-[#F59E0B]">{countVac} Vacataires</span>
          </div>
        </div>

        <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <MdBlock className="text-2xl text-[#EF4444]" />
            <span className="text-[#7A8FAD] text-[13px]">Inactif</span>
          </div>
          <h3 className="text-3xl font-bold">{totalInactif}</h3>
          <p className="text-[#7A8FAD] text-[12px] mt-1">Ces derniers jours</p>
        </div>
      </div>

      {/* SECTION 2 — TABLEAU CONTAINER */}
      <motion.div variants={itemVariants} className="bg-[#0D1B2A] border border-white/5 rounded-xl p-4 md:p-6 mt-6 relative">
        
        {/* EN-TÊTE DU TABLEAU */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Liste des utilisateurs</h2>
          <button className="bg-[#0097FB] hover:opacity-85 text-white rounded-lg px-4 py-2 text-[13px] flex items-center gap-2 transition-all">
            <MdPersonAdd className="text-lg" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>

        {/* ONGLETS & FILTRES */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 w-fit rounded-lg border border-white/5">
            <button 
              onClick={() => setActiveTab("utilisateurs")}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${activeTab === "utilisateurs" ? "bg-[#0097FB] text-white" : "text-[#7A8FAD] hover:text-white"}`}
            >
              Utilisateurs
            </button>
            <button 
              onClick={() => setActiveTab("enseignants")}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${activeTab === "enseignants" ? "bg-[#0097FB] text-white" : "text-[#7A8FAD] hover:text-white"}`}
            >
              Enseignants
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-50">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8FAD] text-xl" />
              <input 
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-[13px] outline-none focus:border-[#0097FB]/50 transition-all"
              />
            </div>
            
            {activeTab === "enseignants" && (
              <>
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-[#0A1628] border border-white/10 rounded-lg px-3 py-2 text-[13px] outline-none text-white cursor-pointer min-w-40"
                >
                  {departements.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select 
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="bg-[#0A1628] border border-white/10 rounded-lg px-3 py-2 text-[13px] outline-none text-white cursor-pointer min-w-35"
                >
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </>
            )}
          </div>
        </div>

        {/* TABLE WRAPPER */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 text-left border-collapse">
            {/* HEADERS */}
            <thead className="bg-white/5 text-[#7A8FAD] text-[11px] uppercase tracking-wider">
              <tr>
                {activeTab === "utilisateurs" ? (
                  <>
                    <th className="px-4 py-3 font-semibold border-b border-white/5">Nom & Prénom</th>
                    <th className="px-4 py-3 font-semibold border-b border-white/5">Email</th>
                    <th className="px-4 py-3 font-semibold border-b border-white/5">Rôle</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 font-semibold border-b border-white/5">Enseignant</th>
                    <th className="px-4 py-3 font-semibold border-b border-white/5">Grade</th>
                    <th className="px-4 py-3 font-semibold border-b border-white/5">Département</th>
                    <th className="px-4 py-3 font-semibold border-b border-white/5">Heures</th>
                  </>
                )}
                <th className="px-4 py-3 font-semibold border-b border-white/5 text-center">Statut</th>
                <th className="px-4 py-3 font-semibold border-b border-white/5 text-right">Actions</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-white/5">
              {(activeTab === "utilisateurs" ? filteredUsers : filteredEnseignants).map((item) => (
                <tr key={`${activeTab}-${item.id}`} className="hover:bg-white/[0.02] transition-colors group">
                  {/* Col 1 : Identité */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0097FB]/15 text-[#0097FB] flex items-center justify-center font-bold text-[13px]">
                        {getInitials(item.nom, item.prenom)}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium leading-tight">{item.nom} {item.prenom}</p>
                        {activeTab === "enseignants" && (
                          <p className="text-[#7A8FAD] text-[12px]">{item.code}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contenu spécifique par Tab */}
                  {activeTab === "utilisateurs" ? (
                    <>
                      <td className="px-4 py-4 text-[#7A8FAD] text-[13px]">{item.email}</td>
                      <td className="px-4 py-4">
                        <span className="bg-white/10 text-[#94A3B8] text-[11px] px-2.5 py-0.5 rounded-full border border-white/5">
                          {item.role}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4">
                        <span className="bg-white/10 text-[#94A3B8] text-[11px] px-2.5 py-1 rounded-md border border-white/5 uppercase font-medium">
                          {item.grade}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-white font-medium text-[13px]">{item.departement}</td>
                      <td className="px-4 py-4 min-w-35">
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className="font-semibold">{item.heuresFaites}H <span className="text-[#7A8FAD] font-normal">/ {item.heuresMax}H</span></span>
                          {item.heuresFaites > item.heuresMax && (
                            <span className="text-[#EF4444] font-bold">+{item.heuresFaites - item.heuresMax}H</span>
                          )}
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${item.heuresFaites > item.heuresMax ? "bg-[#EF4444]" : "bg-[#0097FB]"}`}
                            style={{ width: `${Math.min((item.heuresFaites / item.heuresMax) * 100, 100)}%` }}
                          />
                        </div>
                      </td>
                    </>
                  )}

                  {/* Statut */}
                  <td className="px-4 py-4 text-center">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                      item.statut === "Actif" 
                        ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20" 
                        : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20"
                    }`}>
                      {item.statut}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-right relative">
                    <button 
                      onClick={() => handleActionClick(item)}
                      className="text-[#7A8FAD] hover:text-white p-1 rounded-full hover:bg-white/5 transition-all"
                    >
                      <MdMoreVert className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODALE CONTEXTUELLE (DROPDOWN) */}
        <AnimatePresence>
          {modalOpen && (
          <motion.div 
            onClick={() => setModalOpen(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-90 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" 
          >
            {/* Overlay invisible pour capter le clic partout */}
            <div 
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute bg-[#0D1B2A] border border-white/10 rounded-[10px] p-2 min-w-45 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-100"
              style={{ 
                top: "50%",
                left: "50%", 
                transform: "translate(-50%, -50%)" // Centré par défaut pour simplifier le responsive
              }}
            >
              <div className="p-2 border-b border-white/5 mb-1">
                <p className="text-[11px] text-[#7A8FAD] uppercase font-bold tracking-tight">Actions utilisateur</p>
                <p className="text-[13px] font-medium truncate">{selectedItem?.nom} {selectedItem?.prenom}</p>
              </div>
              
              <div 
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-md cursor-pointer transition-colors group"
                onClick={() => { console.log("Modifier", selectedItem); setModalOpen(false); }}
              >
                <MdEdit className="text-[#0097FB] text-lg" />
                <span className="text-[13px] text-white">Modifier les infos</span>
              </div>

              <div 
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#EF4444]/10 rounded-md cursor-pointer transition-colors group"
                onClick={() => { console.log("Supprimer", selectedItem); setModalOpen(false); }}
              >
                <MdDelete className="text-[#EF4444] text-lg" />
                <span className="text-[13px] text-[#EF4444]">Supprimer le compte</span>
              </div>

              <div 
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-md cursor-pointer transition-colors group"
                onClick={() => { console.log("Verrouiller", selectedItem); setModalOpen(false); }}
              >
                <MdLock className="text-[#F59E0B] text-lg" />
                <span className="text-[13px] text-[#F59E0B]">Verrouiller l'accès</span>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

      </motion.div>
      </motion.main>
    </div>
  );
};

export default DashboardAdminUser;