import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarAdmin from "./SidebarAdmin.jsx";
import Navbar from "../Navbar.jsx";
import { 
  MdAccountTree, 
  MdLayers, 
  MdWarning, 
  MdAdd, 
  MdSearch, 
  MdMoreVert, 
  MdEdit, 
  MdDelete, 
  MdPersonAdd, 
  MdSearchOff 
} from "react-icons/md";

const fakeMatieres = [
  { id: 1, intitule: "Algorithmique", filiere: "Informatique", niveau: "L1", enseignant: "Jean François", statut: "Assignée" },
  { id: 2, intitule: "Base de données", filiere: "Informatique", niveau: "L2", enseignant: "Konan Charles", statut: "Assignée" },
  { id: 3, intitule: "Réseaux informatiques", filiere: "Informatique", niveau: "L3", enseignant: "Hervé Koffi", statut: "Assignée" },
  { id: 4, intitule: "Droit des affaires", filiere: "Droit", niveau: "L2", enseignant: "Moro Isaac", statut: "Assignée" },
  { id: 5, intitule: "Droit constitutionnel", filiere: "Droit", niveau: "L1", enseignant: null, statut: "Non assignée" },
  { id: 6, intitule: "Marketing digital", filiere: "Marketing", niveau: "M1", enseignant: "Bamba Sory", statut: "Assignée" },
  { id: 7, intitule: "Stratégie marketing", filiere: "Marketing", niveau: "M2", enseignant: null, statut: "Non assignée" },
  { id: 8, intitule: "Comptabilité générale", filiere: "Comptabilité", niveau: "L1", enseignant: "Aminata Koné", statut: "Assignée" },
  { id: 9, intitule: "Comptabilité analytique", filiere: "Comptabilité", niveau: "L3", enseignant: null, statut: "Non assignée" },
  { id: 10, intitule: "Mathématiques financières", filiere: "Comptabilité", niveau: "M1", enseignant: "Paul Bamba", statut: "Assignée" },
];

const filieres = ["Toutes les filières", "Informatique", "Droit", "Marketing", "Comptabilité"];
const niveaux = ["Tous les niveaux", "L1", "L2", "L3", "M1", "M2"];
const statuts = ["Tous les statuts", "Assignée", "Non assignée"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const DashboardAdminMatiere = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFiliere, setSelectedFiliere] = useState("Toutes les filières");
  const [selectedNiveau, setSelectedNiveau] = useState("Tous les niveaux");
  const [selectedStatut, setSelectedStatut] = useState("Tous les statuts");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
      }
    };
    if (modalOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalOpen]);

  // Calculs KPIs
  const countFilieres = [...new Set(fakeMatieres.map(m => m.filiere))].length;
  
  const niveauStats = fakeMatieres.reduce((acc, m) => {
    acc[m.niveau] = (acc[m.niveau] || 0) + 1;
    return acc;
  }, {});
  const topNiveau = Object.keys(niveauStats).reduce((a, b) => niveauStats[a] > niveauStats[b] ? a : b, "—");
  
  const countSansEnseignant = fakeMatieres.filter(m => m.statut === "Non assignée").length;

  // Filtrage
  const filteredMatieres = fakeMatieres.filter(m => {
    const matchSearch = `${m.intitule} ${m.filiere}`.toLowerCase().includes(search.toLowerCase());
    const matchFiliere = selectedFiliere === "Toutes les filières" || m.filiere === selectedFiliere;
    const matchNiveau = selectedNiveau === "Tous les niveaux" || m.niveau === selectedNiveau;
    const matchStatut = selectedStatut === "Tous les statuts" || m.statut === selectedStatut;
    return matchSearch && matchFiliere && matchNiveau && matchStatut;
  });

  const handleActionClick = (matiere) => {
    setSelectedMatiere(matiere);
    setModalOpen(true);
  };

  const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "??";

  return (
    <div className="min-h-screen bg-[#000814]">
      <SidebarAdmin isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} role="admin" />
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} userName="John Smith" userRole="Administrateur" />

      <motion.main 
        initial="hidden" animate="visible" variants={containerVariants}
        className="mt-16 text-white md:ml-57.5 transition-all duration-300 min-h-[calc(100vh-64px)] p-4 md:p-6"
      >
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <MdAccountTree className="text-2xl text-[#0097FB]" />
                <span className="text-[#7A8FAD] text-[13px]">Filières</span>
              </div>
              <h3 className="text-3xl font-bold">{countFilieres}</h3>
              <p className="text-[#7A8FAD] text-[12px] mt-1">Filières actives</p>
            </div>

            <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <MdLayers className="text-2xl text-[#0097FB]" />
                <span className="text-[#7A8FAD] text-[13px]">Niveau le plus chargé</span>
              </div>
              <h3 className="text-3xl font-bold">{topNiveau}</h3>
              <p className="text-[#7A8FAD] text-[12px] mt-1">{niveauStats[topNiveau]} matières · niveau le plus chargé</p>
            </div>

            <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <MdWarning className="text-2xl text-[#F59E0B]" />
                <span className="text-[#7A8FAD] text-[13px]">Sans enseignant</span>
              </div>
              <h3 className="text-3xl font-bold">{countSansEnseignant}</h3>
              <p className="text-[#7A8FAD] text-[12px] mt-1">Sans enseignant attribué</p>
            </div>
        </div>

        {/* TABLE SECTION */}
        <motion.div variants={itemVariants} className="bg-[#0D1B2A] border border-white/5 rounded-xl p-4 md:p-6 mt-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold">Liste des matières</h2>
              <button className="bg-[#0097FB] hover:opacity-85 text-white rounded-lg px-4 py-2.5 text-[13px] flex items-center justify-center gap-2 transition-all w-full sm:w-auto">
                <MdAdd className="text-lg" />
                <span className="hidden sm:inline">Ajouter une matière</span>
              </button>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-full lg:min-w-[200px]">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8FAD] text-xl" />
                <input 
                  type="text" placeholder="Rechercher une matière, une filière..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-[13px] outline-none focus:border-[#0097FB] transition-all"
                />
              </div>
              <select value={selectedFiliere} onChange={(e) => setSelectedFiliere(e.target.value)} className="bg-[#0D1B2A] border border-white/10 rounded-lg px-3 py-2 text-[13px] flex-1 min-w-[140px] outline-none cursor-pointer">
                {filieres.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <select value={selectedNiveau} onChange={(e) => setSelectedNiveau(e.target.value)} className="bg-[#0D1B2A] border border-white/10 rounded-lg px-3 py-2 text-[13px] flex-1 min-w-[140px] outline-none cursor-pointer">
                {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <select value={selectedStatut} onChange={(e) => setSelectedStatut(e.target.value)} className="bg-[#0D1B2A] border border-white/10 rounded-lg px-3 py-2 text-[13px] flex-1 min-w-[140px] outline-none cursor-pointer">
                {statuts.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <p className="text-[13px] text-[#7A8FAD] mb-4">{filteredMatieres.length} matière(s) trouvée(s)</p>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead className="bg-white/[0.03] text-[#7A8FAD] text-[12px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Intitulé</th>
                    <th className="px-4 py-3 text-left font-medium">Filière</th>
                    <th className="px-4 py-3 text-left font-medium">Niveau</th>
                    <th className="px-4 py-3 text-left font-medium">Enseignant</th>
                    <th className="px-4 py-3 text-center font-medium">Statut</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredMatieres.length > 0 ? (
                    filteredMatieres.map((m) => (
                      <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 py-4 text-[14px] font-medium text-white">{m.intitule}</td>
                        <td className="px-4 py-4 text-[13px] text-[#7A8FAD]">{m.filiere}</td>
                        <td className="px-4 py-4">
                          <span className="bg-[#0097FB]/10 text-[#0097FB] text-[12px] px-2.5 py-0.5 rounded-full font-medium">{m.niveau}</span>
                        </td>
                        <td className="px-4 py-4">
                          {m.enseignant ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#0097FB]/15 text-[#0097FB] flex items-center justify-center font-bold text-[11px]">
                                {getInitials(m.enseignant)}
                              </div>
                              <span className="text-[13px]">{m.enseignant}</span>
                            </div>
                          ) : (
                            <span className="bg-[#EF4444]/10 text-[#EF4444] text-[12px] px-3 py-1 rounded-full">Non assigné</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-[12px] px-3 py-1 rounded-full font-medium ${
                            m.statut === "Assignée" ? "bg-[#10B981]/15 text-[#10B981]" : "bg-[#EF4444]/15 text-[#EF4444]"
                          }`}>
                            {m.statut}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button onClick={() => handleActionClick(m)} className="text-[#7A8FAD] hover:text-white transition-colors">
                            <MdMoreVert className="text-xl" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <MdSearchOff className="text-5xl text-[#7A8FAD]" />
                          <p className="text-[15px] font-medium">Aucune matière trouvée</p>
                          <p className="text-[#7A8FAD] text-[13px]">Modifiez vos filtres ou ajoutez une nouvelle matière</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        </motion.div>
      </motion.main>

      {/* CONTEXTUAL MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0D1B2A] border border-white/10 rounded-xl p-2 min-w-[190px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            >
              <div className="p-3 border-b border-white/5 mb-1">
                <p className="text-[11px] text-[#7A8FAD] uppercase font-bold">Actions matière</p>
                <p className="text-[13px] font-medium truncate">{selectedMatiere?.intitule}</p>
              </div>

              <div 
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04] rounded-lg cursor-pointer transition-colors"
                onClick={() => { console.log("Modifier", selectedMatiere); setModalOpen(false); }}
              >
                <MdEdit className="text-[#0097FB] text-lg" />
                <span className="text-[13px]">Modifier</span>
              </div>

              {selectedMatiere?.statut === "Non assignée" && (
                <div 
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04] rounded-lg cursor-pointer transition-colors"
                  onClick={() => { console.log("Assigner", selectedMatiere); setModalOpen(false); }}
                >
                  <MdPersonAdd className="text-[#10B981] text-lg" />
                  <span className="text-[13px] text-[#10B981]">Assigner enseignant</span>
                </div>
              )}

              <div 
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04] rounded-lg cursor-pointer transition-colors"
                onClick={() => { console.log("Supprimer", selectedMatiere); setModalOpen(false); }}
              >
                <MdDelete className="text-[#EF4444] text-lg" />
                <span className="text-[13px] text-[#EF4444]">Supprimer</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardAdminMatiere;