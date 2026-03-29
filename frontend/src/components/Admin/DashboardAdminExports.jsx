import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarAdmin from "../SidebarAdmin.jsx";
import Navbar from "../Navbar.jsx";
import { 
  MdFilterList, MdCalendarToday, MdDateRange, MdBusinessCenter, 
  MdPerson, MdAssessment, MdAccountBalance, MdGridOn, 
  MdPictureAsPdf, MdTableChart, MdHistory, MdDeleteSweep, 
  MdDescription, MdDownload, MdCheckCircle, MdError, 
  MdHourglassEmpty 
} from "react-icons/md";

const enseignants = [
  { id: 1, nom: "Jean François", dept: "Informatique" },
  { id: 2, nom: "Konan Charles", dept: "Informatique" },
  { id: 3, nom: "Hervé Koffi", dept: "Droit" },
  { id: 4, nom: "Moro Isaac", dept: "Marketing" },
  { id: 5, nom: "Bamba Sory", dept: "Comptabilité" },
];

const departements = ["Tous les départements", "Informatique", "Droit", "Marketing", "Comptabilité"];
const mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const annees = ["2023-2024", "2024-2025", "2025-2026"];

const historiqueExports = [
  { id: 1, document: "Fiche individuelle — Jean François", format: "PDF", date: "28/03/2026", heure: "14:55", statut: "Succès" },
  { id: 2, document: "État global des heures — Mars 2026", format: "Excel", date: "27/03/2026", heure: "10:12", statut: "Succès" },
  { id: 3, document: "État pour la comptabilité — Fév 2026", format: "PDF", date: "25/03/2026", heure: "09:30", statut: "Succès" },
  { id: 4, document: "Export Excel — Tous les enseignants", format: "Excel", date: "20/03/2026", heure: "16:45", statut: "Succès" },
  { id: 5, document: "Fiche individuelle — Moro Isaac", format: "PDF", date: "18/03/2026", heure: "11:20", statut: "Échec" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const DashboardAdminExports = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAnnee, setAnnee] = useState("2025-2026");
  const [selectedMois, setMois] = useState("Mars");
  const [selectedDept, setDept] = useState("Tous les départements");
  const [selectedEnseignant, setEnseignant] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const simulerExport = (id, format, nom) => {
    const uniqueId = id + format;
    setLoadingId(uniqueId);
    setTimeout(() => {
      setLoadingId(null);
      showToast(`${nom} exporté en ${format} avec succès`, "success");
    }, 2000);
  };

  const filteredEnseignants = selectedDept === "Tous les départements" 
    ? enseignants 
    : enseignants.filter(e => e.dept === selectedDept);

  const FilterSelect = ({ label, icon: Icon, value, onChange, options, placeholder }) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[#7A8FAD] text-[12px] font-medium uppercase tracking-wider">{label}</label>
      <div className="relative flex items-center">
        <Icon className="absolute left-3.5 text-[#7A8FAD] text-[18px]" />
        <select 
          value={value} 
          onChange={onChange}
          className="w-full bg-white/[0.04] border border-white/10 rounded-lg py-2.5 pl-11 pr-4 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all cursor-pointer appearance-none"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.id || opt} value={opt.nom || opt} className="bg-[#0D1B2A]">
              {opt.nom || opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const ActionButton = ({ type, onClick, id, docName }) => {
    const isPdf = type === "PDF";
    const currentLoading = loadingId === id + type;
    const baseStyles = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all border w-full sm:w-auto min-w-[140px]";
    const themeStyles = isPdf 
      ? "bg-[#EF4444]/12 text-[#EF4444] border-[#EF4444]/20 hover:bg-[#EF4444]/20" 
      : "bg-[#10B981]/12 text-[#10B981] border-[#10B981]/20 hover:bg-[#10B981]/20";
    
    return (
      <button 
        onClick={() => onClick(id, type, docName)}
        disabled={loadingId !== null}
        className={`${baseStyles} ${themeStyles} ${loadingId !== null ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {currentLoading ? (
          <>
            <MdHourglassEmpty className="animate-spin text-lg" />
            <span>Génération...</span>
          </>
        ) : (
          <>
            {isPdf ? <MdPictureAsPdf className="text-lg" /> : <MdTableChart className="text-lg" />}
            <span>{isPdf ? "Exporter PDF" : "Exporter Excel"}</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#000814]">
      <SidebarAdmin isOpen={isOpen} onClose={() => setIsOpen(false)} role="admin" />
      <Navbar onMenuClick={() => setIsOpen(!isOpen)} userName="John Smith" userRole="Administrateur" />

      <motion.main 
        initial="hidden" animate="visible" variants={containerVariants}
        className="mt-16 text-white md:ml-57.5 transition-all duration-300 min-h-[calc(100vh-64px)] p-4 md:p-6"
      >
        <div className="mb-7">
          <h1 className="text-[26px] font-bold">Export & Documents</h1>
          <p className="text-[#7A8FAD] text-sm mt-1">Génération et téléchargement des documents officiels</p>
        </div>

        {/* SECTION 1 — FILTRES */}
        <motion.div variants={itemVariants} className="bg-[#0D1B2A] border border-white/5 p-6 rounded-[14px] mb-7 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <MdFilterList className="text-[#0097FB] text-[18px]" />
            <h2 className="text-[15px] font-semibold">Paramètres d'export</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FilterSelect label="Année académique" icon={MdCalendarToday} value={selectedAnnee} onChange={e => setAnnee(e.target.value)} options={annees} />
            <FilterSelect label="Mois" icon={MdDateRange} value={selectedMois} onChange={e => setMois(e.target.value)} options={mois} />
            <FilterSelect label="Département" icon={MdBusinessCenter} value={selectedDept} onChange={e => { setDept(e.target.value); setEnseignant(""); }} options={departements} />
            <FilterSelect label="Enseignant" icon={MdPerson} value={selectedEnseignant} onChange={e => setEnseignant(e.target.value)} options={filteredEnseignants} placeholder="Tous les enseignants" />
          </div>
        </motion.div>

        {/* SECTION 2 — CARDS DOCUMENTS */}
        <h3 className="text-[17px] font-semibold mb-4">Documents disponibles</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="bg-[#0D1B2A] border border-white/5 p-6 rounded-[14px] flex flex-col gap-4 hover:border-[#0097FB]/25 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-[#0097FB]/12 rounded-lg flex items-center justify-center shrink-0">
                  <MdPerson className="text-[#0097FB] text-xl" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold">Fiche individuelle enseignant</h4>
                  <p className="text-[#7A8FAD] text-[12px] leading-relaxed mt-1">Rapport détaillé des heures effectuées par enseignant (CM, TD, TP, total, dépassements)</p>
                </div>
              </div>
              <span className="bg-[#EF4444]/15 text-[#EF4444] text-[11px] px-2 py-0.5 rounded-full font-bold">PDF</span>
            </div>
            <div className="flex gap-3 mt-auto">
              <ActionButton type="PDF" id={1} docName="Fiche individuelle" onClick={simulerExport} />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="bg-[#0D1B2A] border border-white/5 p-6 rounded-[14px] flex flex-col gap-4 hover:border-[#0097FB]/25 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-[#0097FB]/12 rounded-lg flex items-center justify-center shrink-0">
                  <MdAssessment className="text-[#0097FB] text-xl" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold">État global des heures</h4>
                  <p className="text-[#7A8FAD] text-[12px] leading-relaxed mt-1">Synthèse globale de toutes les heures effectuées par département et par mois</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <span className="bg-[#EF4444]/15 text-[#EF4444] text-[11px] px-2 py-0.5 rounded-full font-bold">PDF</span>
                <span className="bg-[#10B981]/15 text-[#10B981] text-[11px] px-2 py-0.5 rounded-full font-bold">Excel</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-auto">
              <ActionButton type="PDF" id={2} docName="État global des heures" onClick={simulerExport} />
              <ActionButton type="Excel" id={2} docName="État global des heures" onClick={simulerExport} />
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="bg-[#0D1B2A] border border-white/5 p-6 rounded-[14px] flex flex-col gap-4 hover:border-[#0097FB]/25 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-[#0097FB]/12 rounded-lg flex items-center justify-center shrink-0">
                  <MdAccountBalance className="text-[#0097FB] text-xl" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold">État pour la comptabilité</h4>
                  <p className="text-[#7A8FAD] text-[12px] leading-relaxed mt-1">Document comptable récapitulatif des coûts horaires et paiements à effectuer en FCFA</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <span className="bg-[#EF4444]/15 text-[#EF4444] text-[11px] px-2 py-0.5 rounded-full font-bold">PDF</span>
                <span className="bg-[#10B981]/15 text-[#10B981] text-[11px] px-2 py-0.5 rounded-full font-bold">Excel</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-auto">
              <ActionButton type="PDF" id={3} docName="État comptabilité" onClick={simulerExport} />
              <ActionButton type="Excel" id={3} docName="État comptabilité" onClick={simulerExport} />
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={itemVariants} className="bg-[#0D1B2A] border border-white/5 p-6 rounded-[14px] flex flex-col gap-4 hover:border-[#0097FB]/25 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-[#10B981]/12 rounded-lg flex items-center justify-center shrink-0">
                  <MdGridOn className="text-[#10B981] text-xl" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold">Export Excel complet</h4>
                  <p className="text-[#7A8FAD] text-[12px] leading-relaxed mt-1">Export brut de toutes les données (enseignants, heures, matières, départements) au format Excel</p>
                </div>
              </div>
              <span className="bg-[#10B981]/15 text-[#10B981] text-[11px] px-2 py-0.5 rounded-full font-bold">Excel</span>
            </div>
            <div className="flex gap-3 mt-auto">
              <ActionButton type="Excel" id={4} docName="Export complet" onClick={simulerExport} />
            </div>
          </motion.div>
        </div>

        {/* SECTION 3 — HISTORIQUE */}
        <h3 className="text-[17px] font-semibold mb-4">Historique des exports</h3>
        <motion.div variants={itemVariants} className="bg-[#0D1B2A] border border-white/5 rounded-[14px] p-5 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 px-1">
            <div className="flex items-center gap-2">
              <MdHistory className="text-[#0097FB] text-[18px]" />
              <span className="text-[#7A8FAD] text-[13px]">5 derniers exports</span>
            </div>
            <button 
              onClick={() => console.log("Effacer historique")}
              className="flex items-center gap-2 text-[#7A8FAD] text-[12px] border border-white/10 rounded-lg px-3 py-1.5 hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-all shrink-0"
            >
              <MdDeleteSweep className="text-base" />
              Effacer l'historique
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead className="bg-white/5 text-[#7A8FAD] text-[12px] uppercase tracking-wider text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold border-b border-white/5">Document</th>
                  <th className="px-4 py-3 font-semibold border-b border-white/5">Format</th>
                  <th className="px-4 py-3 font-semibold border-b border-white/5">Date & Heure</th>
                  <th className="px-4 py-3 font-semibold border-b border-white/5">Statut</th>
                  <th className="px-4 py-3 font-semibold border-b border-white/5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {historiqueExports.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <MdDescription className="text-[#7A8FAD] text-[16px]" />
                        <span className="text-[13px] font-medium text-white">{item.document}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.format === "PDF" ? "bg-[#EF4444]/12 text-[#EF4444]" : "bg-[#10B981]/12 text-[#10B981]"
                      }`}>
                        {item.format}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#7A8FAD] text-[13px]">
                      {item.date} <span className="opacity-50 mx-1">à</span> {item.heure}
                    </td>
                    <td className="px-4 py-4">
                      <div className={`flex items-center gap-1.5 text-[12px] px-2.5 py-0.5 rounded-full font-medium w-fit ${
                        item.statut === "Succès" ? "bg-[#10B981]/12 text-[#10B981]" : "bg-[#EF4444]/12 text-[#EF4444]"
                      }`}>
                        {item.statut === "Succès" ? <MdCheckCircle size={14} /> : <MdError size={14} />}
                        {item.statut}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button 
                        onClick={() => console.log("Re-télécharger", item.document)}
                        className="text-[#0097FB] hover:text-white transition-colors p-1"
                      >
                        <MdDownload size={19} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.main>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-[1000] flex items-center gap-3 px-5 py-3 rounded-[10px] text-white text-[14px] font-medium shadow-[0_4px_24px_rgba(0,0,0,0.4)] ${
              toast.type === "success" ? "bg-[#10B981]" : "bg-[#EF4444]"
            }`}
          >
            {toast.type === "success" ? <MdCheckCircle size={18} /> : <MdError size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation de rotation pour l'icône de chargement */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}} />
    </div>
  );
};

export default DashboardAdminExports;