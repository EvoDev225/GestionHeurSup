import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarAdmin from "./SidebarAdmin.jsx";
import Navbar from "../Navbar.jsx";
import { 
  MdFilterList, MdCalendarToday, MdDateRange, MdBusinessCenter, 
  MdPerson, MdAssessment, MdAccountBalance, MdGridOn, 
  MdPictureAsPdf, MdTableChart, MdHistory, MdDeleteSweep, 
  MdDescription, MdDownload, MdCheckCircle, MdError, 
  MdHourglassEmpty 
} from "react-icons/md";
import { 
  exportFicheEnseignantPDF,
  exportEtatGlobalHeuresPDF,
  exportEtatComptabilitePDF,
  exportEtatGlobalHeuresExcel,
  exportEtatComptabiliteExcel
} from "../../fonctions/Export.jsx";
import { getAllEnseignant, deconnexion, verifierAuthentification } from "../../fonctions/Utilisateur.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAnnee, setAnnee] = useState("2025-2026");
  const [selectedMois, setMois] = useState("Mars");
  const [enseignants, setEnseignants] = useState([]);
  const [selectedEnseignant, setEnseignant] = useState(""); // idens de l'enseignant sélectionné
  const [loadingId, setLoadingId] = useState(null);

  const simulerExport = (id, format, nom) => {
    const uniqueId = id + format;
    setLoadingId(uniqueId);
    setTimeout(() => {
      setLoadingId(null);
      toast.success(`${nom} exporté en ${format} avec succès`);
    }, 2000);
  };

  const handleExportFichePDF = async () => {
    if (!selectedEnseignant) return;
    setLoadingId("1PDF");
    try {
      await exportFicheEnseignantPDF(selectedEnseignant);
      toast.success("Fiche individuelle exportée en PDF !");
    } catch (error) {
      toast.error("Erreur lors de l'export PDF.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleExportEtatGlobalPDF = async () => {
    setLoadingId("2PDF");
    try {
      await exportEtatGlobalHeuresPDF();
      toast.success("État global exporté en PDF !");
    } catch (error) {
      toast.error("Erreur lors de l'export PDF.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleExportEtatGlobalExcel = async () => {
    setLoadingId("2Excel");
    try {
      await exportEtatGlobalHeuresExcel();
      toast.success("État global exporté en Excel !");
    } catch (error) {
      toast.error("Erreur lors de l'export Excel.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleExportComptaPDF = async () => {
    setLoadingId("3PDF");
    try {
      await exportEtatComptabilitePDF();
      toast.success("État comptabilité exporté en PDF !");
    } catch (error) {
      toast.error("Erreur lors de l'export PDF.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleExportComptaExcel = async () => {
    setLoadingId("3Excel");
    try {
      await exportEtatComptabiliteExcel();
      toast.success("État comptabilité exporté en Excel !");
    } catch (error) {
      toast.error("Erreur lors de l'export Excel.");
    } finally {
      setLoadingId(null);
    }
  };

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const res = await verifierAuthentification();
          if(res.data.role !=="admin"){
            toast.error("Accès refusé. Redirection vers la page d'accueil.");
            await deconnexion()
            navigate('/')
          }
          
        } catch (error) {
          navigate("/")
          toast.error("Une erreur est survenue lors de la vérification de l'authentification.");
        }
      };
      const fetchEnseignants = async () => {
        try {
          const res = await getAllEnseignant();
          const liste = (res.data ?? []).filter(u => u.role === "enseignant");
          
          setEnseignants(liste);
        } catch (error) {
          console.error("Erreur lors de la récupération des enseignants :", error);
        }
      };

      fetchUserData();
      fetchEnseignants();
    },[]);

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
            <option key={opt.id || opt} value={opt.id || opt} className="bg-[#0D1B2A]">
              {opt.nom || opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const ActionButton = ({ type, onClick, disabled, loading }) => {
    const isPdf = type === "PDF";
    const baseStyles = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all border w-full sm:w-auto min-w-[140px]";
    const themeStyles = isPdf 
      ? "bg-[#EF4444]/12 text-[#EF4444] border-[#EF4444]/20 hover:bg-[#EF4444]/20" 
      : "bg-[#10B981]/12 text-[#10B981] border-[#10B981]/20 hover:bg-[#10B981]/20";
    const disabledStyles = (disabled || loading) ? "opacity-40 cursor-not-allowed" : "cursor-pointer";
    
    return (
      <button 
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseStyles} ${themeStyles} ${disabledStyles}`}
      >
        {loading ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FilterSelect label="Année académique" icon={MdCalendarToday} value={selectedAnnee} onChange={e => setAnnee(e.target.value)} options={annees} />
            <FilterSelect label="Mois" icon={MdDateRange} value={selectedMois} onChange={e => setMois(e.target.value)} options={mois} />
            <FilterSelect 
              label="Enseignant" 
              icon={MdPerson} 
              value={selectedEnseignant} 
              onChange={e => setEnseignant(e.target.value)} 
              options={enseignants.map(e => ({ id: e.idens, nom: `${e.prenom} ${e.nom}` }))} 
              placeholder="Tous les enseignants" 
            />
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
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <ActionButton 
                  type="PDF" 
                  onClick={handleExportFichePDF} 
                  disabled={!selectedEnseignant}
                  loading={loadingId === "1PDF"}
                />
                {!selectedEnseignant && (
                  <p className="text-[#7A8FAD] text-[11px] italic mt-1">Sélectionnez un enseignant pour activer cet export</p>
                )}
              </div>
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
              <ActionButton type="PDF" onClick={handleExportEtatGlobalPDF} loading={loadingId === "2PDF"} />
              <ActionButton type="Excel" onClick={handleExportEtatGlobalExcel} loading={loadingId === "2Excel"} />
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
              <ActionButton type="PDF" onClick={handleExportComptaPDF} loading={loadingId === "3PDF"} />
              <ActionButton type="Excel" onClick={handleExportComptaExcel} loading={loadingId === "3Excel"} />
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
              <ActionButton type="Excel" onClick={() => simulerExport(4, "Excel", "Export complet")} loading={loadingId === "4Excel"} />
            </div>
          </motion.div>
        </div>

        
      </motion.main>
    </div>
  );
};

export default DashboardAdminExports;