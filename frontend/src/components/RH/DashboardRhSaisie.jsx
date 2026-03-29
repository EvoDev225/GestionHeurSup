import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  MdSupervisorAccount,
  MdAccessTime,
  MdEventNote,
  MdPieChart,
  MdAdd,
  MdSearch,
  MdMoreVert,
  MdEdit,
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdDelete,
  MdClose,
  MdSave,
  MdSearchOff
} from 'react-icons/md';
import SidebarRH from './SidebarRH';
import Navbar from '../Navbar';

const moisCourant = "Mars 2026";

const enseignants = [
  { id: 1, code: "ENS-001", nom: "Jean François", dept: "Informatique" },
  { id: 2, code: "ENS-002", nom: "Konan Charles", dept: "Informatique" },
  { id: 3, code: "ENS-003", nom: "Hervé Koffi", dept: "Droit" },
  { id: 4, code: "ENS-004", nom: "Moro Isaac", dept: "Marketing" },
  { id: 5, code: "ENS-005", nom: "Bamba Sory", dept: "Comptabilité" },
];

const matieres = [
  { id: 1, intitule: "Algorithmique", enseignantId: 1 },
  { id: 2, intitule: "Base de données", enseignantId: 1 },
  { id: 3, intitule: "Réseaux informatiques", enseignantId: 2 },
  { id: 4, intitule: "Droit des affaires", enseignantId: 3 },
  { id: 5, intitule: "Droit constitutionnel", enseignantId: 3 },
  { id: 6, intitule: "Marketing digital", enseignantId: 4 },
  { id: 7, intitule: "Comptabilité générale", enseignantId: 5 },
  { id: 8, intitule: "Comptabilité analytique", enseignantId: 5 },
];

const moisOptions = ["Mars 2026", "Février 2026", "Janvier 2026"];
const typeOptions = ["Tous les types", "CM", "TD", "TP"];
const statutOptions = ["Tous les statuts", "Validé", "En attente", "Rejeté"];

const DashboardRhSaisie = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [seances, setSeances] = useState([
    { id: 1, enseignantId: 1, nom: "Jean François", code: "ENS-001", matiere: "Algorithmique", date: "2026-03-28", type: "CM", duree: 3, salle: "Amphi A", observations: "Chapitre 3 terminé", statut: "Validé" },
    { id: 2, enseignantId: 2, nom: "Konan Charles", code: "ENS-002", matiere: "Réseaux informatiques", date: "2026-03-28", type: "TD", duree: 2, salle: "Salle 12", observations: "", statut: "En attente" },
    { id: 3, enseignantId: 3, nom: "Hervé Koffi", code: "ENS-003", matiere: "Droit des affaires", date: "2026-03-27", type: "CM", duree: 4, salle: "Amphi B", observations: "Examen partiel", statut: "Validé" },
    { id: 4, enseignantId: 4, nom: "Moro Isaac", code: "ENS-004", matiere: "Marketing digital", date: "2026-03-27", type: "TP", duree: 2, salle: "Labo 2", observations: "Travaux sur cas", statut: "En attente" },
    { id: 5, enseignantId: 5, nom: "Bamba Sory", code: "ENS-005", matiere: "Comptabilité générale", date: "2026-03-26", type: "CM", duree: 3, salle: "Salle 08", observations: "", statut: "Rejeté" },
    { id: 6, enseignantId: 1, nom: "Jean François", code: "ENS-001", matiere: "Base de données", date: "2026-03-25", type: "TD", duree: 2, salle: "Salle 10", observations: "TP reporté", statut: "Validé" },
    { id: 7, enseignantId: 2, nom: "Konan Charles", code: "ENS-002", matiere: "Réseaux informatiques", date: "2026-03-24", type: "TP", duree: 3, salle: "Labo 1", observations: "", statut: "Validé" },
    { id: 8, enseignantId: 3, nom: "Hervé Koffi", code: "ENS-003", matiere: "Droit constitutionnel", date: "2026-03-22", type: "TD", duree: 2, salle: "Salle 05", observations: "Groupe B", statut: "En attente" },
  ]);

  // États Filtres
  const [search, setSearch] = useState("");
  const [filterMois, setFilterMois] = useState("Mars 2026");
  const [filterType, setFilterType] = useState("Tous les types");
  const [filterStatut, setFilterStatut] = useState("Tous les statuts");

  // États Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [editSeance, setEditSeance] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [selectedSeance, setSelectedSeance] = useState(null);
  const actionMenuRef = useRef(null);

  // État Formulaire
  const [form, setForm] = useState({
    enseignantId: "",
    matiereId: "",
    date: "",
    type: "CM",
    duree: "",
    salle: "",
    observations: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // État Toast
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  // Fermeture menu action clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActionMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetForm = () => {
    setForm({ enseignantId: "", matiereId: "", date: "", type: "CM", duree: "", salle: "", observations: "" });
    setFormErrors({});
  };

  // Calculs KPIs
  const totalHeures = seances.reduce((acc, s) => acc + Number(s.duree), 0);
  const cmH = seances.filter(s => s.type === 'CM').reduce((a, s) => a + Number(s.duree), 0);
  const tdH = seances.filter(s => s.type === 'TD').reduce((a, s) => a + Number(s.duree), 0);
  const tpH = seances.filter(s => s.type === 'TP').reduce((a, s) => a + Number(s.duree), 0);
  
  const getDominantType = () => {
    if (cmH >= tdH && cmH >= tpH) return "CM dominant";
    if (tdH >= cmH && tdH >= tpH) return "TD dominant";
    return "TP dominant";
  };

  // Filtrage
  const filteredSeances = seances.filter(s => {
    const matchSearch = `${s.nom} ${s.matiere} ${s.salle}`.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "Tous les types" || s.type === filterType;
    const matchStatut = filterStatut === "Tous les statuts" || s.statut === filterStatut;
    return matchSearch && matchType && matchStatut;
  });

  // Actions CRUD
  const handleUpdateStatut = (id, newStatut) => {
    setSeances(seances.map(s => s.id === id ? { ...s, statut: newStatut } : s));
    showToast(`Séance ${newStatut.toLowerCase()} avec succès`);
    setActionMenuOpen(false);
  };

  const handleDelete = (id) => {
    setSeances(seances.filter(s => s.id !== id));
    showToast("Séance supprimée", "error");
    setActionMenuOpen(false);
  };

  const handleSave = () => {
    const errors = {};
    if (!form.enseignantId) errors.enseignantId = true;
    if (!form.matiereId) errors.matiereId = true;
    if (!form.date) errors.date = true;
    if (!form.duree) errors.duree = true;
    if (!form.salle) errors.salle = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const selectedEns = enseignants.find(e => e.id === Number(form.enseignantId));
    const selectedMat = matieres.find(m => m.id === Number(form.matiereId));

    const seanceData = {
      id: editSeance ? editSeance.id : Date.now(),
      enseignantId: Number(form.enseignantId),
      nom: selectedEns.nom,
      code: selectedEns.code,
      matiere: selectedMat.intitule,
      date: form.date,
      type: form.type,
      duree: Number(form.duree),
      salle: form.salle,
      observations: form.observations,
      statut: editSeance ? editSeance.statut : "En attente"
    };

    if (editSeance) {
      setSeances(seances.map(s => s.id === editSeance.id ? seanceData : s));
      showToast("Séance modifiée avec succès");
    } else {
      setSeances([seanceData, ...seances]);
      showToast("Nouvelle séance enregistrée");
    }

    setModalOpen(false);
    resetForm();
  };

  const getInitials = (name) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <div className="bg-[#000814] min-h-screen font-['Inter']">
      <SidebarRH isOpen={isOpen} onClose={() => setIsOpen(false)} role="rh" />
      <Navbar onMenuClick={() => setIsOpen(!isOpen)} userName="Aminata Koné" userRole="Responsable RH" />

      <main className="md:ml-[230px] pt-16 p-6 transition-all duration-300 min-h-screen">
        
        {/* EN-TÊTE DE PAGE */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
          <div>
            <h1 className="text-[26px] font-bold text-white">Saisie des heures</h1>
            <p className="text-[#7A8FAD] text-sm mt-1">Enregistrement et validation des séances · {moisCourant}</p>
          </div>
          <div className="bg-[#7B2FBE]/15 border border-[#7B2FBE]/30 text-[#7B2FBE] text-[13px] font-bold py-1.5 px-4 rounded-full flex items-center gap-2">
            <MdSupervisorAccount size={16} />
            <span>RH</span>
          </div>
        </div>

        {/* SECTION 1 — KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MdAccessTime className="text-[#0097FB]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Total heures saisies</span>
            </div>
            <div className="text-white text-[28px] font-bold">{totalHeures}H</div>
            <div className="text-[#7A8FAD] text-[12px]">Sur {moisCourant}</div>
            <div className="mt-3 w-full bg-white/5 h-[3px] rounded-full overflow-hidden">
              <div className="bg-[#0097FB] h-full rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>

          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MdEventNote className="text-[#0097FB]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Séances ce mois</span>
            </div>
            <div className="text-white text-[28px] font-bold">{seances.length}</div>
            <div className="flex gap-2 mt-2">
              <span className="bg-[#10B981]/12 text-[#10B981] text-[11px] px-2 py-0.5 rounded-full font-bold">Validées : {seances.filter(s=>s.statut==='Validé').length}</span>
              <span className="bg-[#F59E0B]/12 text-[#F59E0B] text-[11px] px-2 py-0.5 rounded-full font-bold">En attente : {seances.filter(s=>s.statut==='En attente').length}</span>
            </div>
          </div>

          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MdPieChart className="text-[#7B2FBE]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Répartition types</span>
            </div>
            <div className="text-white text-[20px] font-bold uppercase">{getDominantType()}</div>
            <div className="flex h-2 w-full rounded-full overflow-hidden mt-3">
              <div style={{ width: `${(cmH/totalHeures)*100}%` }} className="bg-[#0097FB] h-full" />
              <div style={{ width: `${(tdH/totalHeures)*100}%` }} className="bg-[#10B981] h-full" />
              <div style={{ width: `${(tpH/totalHeures)*100}%` }} className="bg-[#F59E0B] h-full" />
            </div>
            <div className="flex gap-3 mt-2 text-[11px] text-[#7A8FAD]">
              <span className="flex items-center gap-1"><i className="w-1.5 h-1.5 rounded-full bg-[#0097FB]" /> CM {cmH}H</span>
              <span className="flex items-center gap-1"><i className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> TD {tdH}H</span>
              <span className="flex items-center gap-1"><i className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /> TP {tpH}H</span>
            </div>
          </div>
        </div>

        {/* SECTION 2 — TABLEAU */}
        <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-white text-[17px] font-semibold">Liste des séances</h2>
            <button 
              onClick={() => { setEditSeance(null); resetForm(); setModalOpen(true); }}
              className="bg-[#0097FB] text-white text-[13px] font-medium py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-85 transition-all"
            >
              <MdAdd size={18} />
              Ajouter une séance
            </button>
          </div>

          {/* FILTRES */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8FAD] text-xl" />
              <input 
                type="text"
                placeholder="Rechercher enseignant, matière, salle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all"
              />
            </div>
            <select 
              value={filterMois} onChange={(e) => setFilterMois(e.target.value)}
              className="bg-[#0D1B2A] border border-white/10 text-white rounded-lg py-2 px-3 text-[13px] min-w-[150px] outline-none"
            >
              {moisOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select 
              value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#0D1B2A] border border-white/10 text-white rounded-lg py-2 px-3 text-[13px] min-w-[140px] outline-none"
            >
              {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select 
              value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}
              className="bg-[#0D1B2A] border border-white/10 text-white rounded-lg py-2 px-3 text-[13px] min-w-[150px] outline-none"
            >
              {statutOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <p className="text-[#7A8FAD] text-[13px] mb-3">{filteredSeances.length} séance(s) trouvée(s)</p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] border-collapse">
              <thead>
                <tr className="bg-white/[0.03] text-[#7A8FAD] text-[12px] uppercase tracking-wider text-left">
                  <th className="px-4 py-3 font-medium border-b border-white/5">Enseignant</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Matière</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Date</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5 text-center">Type</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5 text-center">Durée</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Salle</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Observations</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5 text-center">Statut</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSeances.length > 0 ? (
                  filteredSeances.map((s) => (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#7B2FBE]/15 text-[#7B2FBE] flex items-center justify-center text-[12px] font-bold">
                            {getInitials(s.nom)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white text-[13px] font-medium">{s.nom}</span>
                            <span className="text-[#7A8FAD] text-[11px]">{s.code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[#7A8FAD] text-[13px] max-w-[130px] truncate" title={s.matiere}>{s.matiere}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-white text-[13px]">{s.date}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          s.type === "CM" ? 'bg-[#0097FB]/12 text-[#0097FB]' : s.type === "TD" ? 'bg-[#10B981]/12 text-[#10B981]' : 'bg-[#F59E0B]/12 text-[#F59E0B]'
                        }`}>{s.type}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-white text-[13px] font-bold">{s.duree}<span className="text-[#7A8FAD] text-[12px] ml-0.5">H</span></span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[#7A8FAD] text-[13px]">{s.salle}</span>
                      </td>
                      <td className="px-4 py-4">
                        {s.observations ? (
                          <span className="text-[#7A8FAD] text-[12px] max-w-[120px] truncate block" title={s.observations}>{s.observations}</span>
                        ) : (
                          <span className="text-[#3D5068]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className={`flex items-center justify-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          s.statut === "Validé" ? 'bg-[#10B981]/12 text-[#10B981]' : 
                          s.statut === "En attente" ? 'bg-[#F59E0B]/12 text-[#F59E0B]' : 'bg-[#EF4444]/12 text-[#EF4444]'
                        }`}>
                          {s.statut === "Validé" && <MdCheckCircle size={14} />}
                          {s.statut === "En attente" && <MdPending size={14} />}
                          {s.statut === "Rejeté" && <MdCancel size={14} />}
                          {s.statut}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button 
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setSelectedSeance(s);
                            setActionMenuOpen(true);
                          }}
                          className="text-[#7A8FAD] hover:text-white p-1 transition-colors"
                        >
                          <MdMoreVert size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-[#7A8FAD]">
                        <MdSearchOff size={40} className="mb-2" />
                        <p className="text-white text-[15px] font-medium">Aucune séance trouvée</p>
                        <p className="text-[13px]">Modifiez vos filtres ou ajoutez une nouvelle séance</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODALE ACTIONS (3 POINTS) */}
      <AnimatePresence>
        {actionMenuOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20" onClick={() => setActionMenuOpen(false)} />
            <motion.div 
              ref={actionMenuRef}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0D1B2A] border border-white/10 rounded-xl p-2 min-w-[190px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-10"
            >
              <button 
                onClick={() => {
                  setEditSeance(selectedSeance);
                  setForm({
                    enseignantId: selectedSeance.enseignantId.toString(),
                    matiereId: matieres.find(m => m.intitule === selectedSeance.matiere)?.id.toString() || "",
                    date: selectedSeance.date,
                    type: selectedSeance.type,
                    duree: selectedSeance.duree.toString(),
                    salle: selectedSeance.salle,
                    observations: selectedSeance.observations
                  });
                  setModalOpen(true);
                  setActionMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-white hover:bg-white/5 rounded-lg text-[13px] transition-colors"
              >
                <MdEdit className="text-[#0097FB]" size={18} /> Modifier
              </button>
              {selectedSeance?.statut !== "Validé" && (
                <button 
                  onClick={() => handleUpdateStatut(selectedSeance.id, "Validé")}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-[#10B981] hover:bg-[#10B981]/10 rounded-lg text-[13px] transition-colors"
                >
                  <MdCheckCircle size={18} /> Valider
                </button>
              )}
              {selectedSeance?.statut !== "Rejeté" && (
                <button 
                  onClick={() => handleUpdateStatut(selectedSeance.id, "Rejeté")}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg text-[13px] transition-colors"
                >
                  <MdCancel size={18} /> Rejeter
                </button>
              )}
              <button 
                onClick={() => handleDelete(selectedSeance.id)}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg text-[13px] transition-colors"
              >
                <MdDelete size={18} /> Supprimer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODALE SAISIE / MODIFICATION */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-[#0D1B2A] border border-white/10 rounded-2xl p-7 w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg font-semibold">{editSeance ? "Modifier la séance" : "Nouvelle séance"}</h3>
                <button onClick={() => { setModalOpen(false); resetForm(); }} className="text-[#7A8FAD] hover:text-white transition-colors">
                  <MdClose size={22} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">Enseignant</label>
                  <select 
                    value={form.enseignantId}
                    onChange={(e) => setForm({ ...form, enseignantId: e.target.value, matiereId: "" })}
                    className={`bg-white/[0.04] border ${formErrors.enseignantId ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all`}
                  >
                    <option value="">Sélectionner un enseignant</option>
                    {enseignants.map(e => <option key={e.id} value={e.id}>{e.nom} ({e.code})</option>)}
                  </select>
                  {formErrors.enseignantId && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">Matière</label>
                  <select 
                    disabled={!form.enseignantId}
                    value={form.matiereId}
                    onChange={(e) => setForm({ ...form, matiereId: e.target.value })}
                    className={`bg-white/[0.04] border ${formErrors.matiereId ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">{form.enseignantId ? "Sélectionner une matière" : "Sélectionnez un enseignant"}</option>
                    {matieres.filter(m => m.enseignantId === Number(form.enseignantId)).map(m => (
                      <option key={m.id} value={m.id}>{m.intitule}</option>
                    ))}
                  </select>
                  {formErrors.matiereId && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">Date du cours</label>
                  <input 
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={`bg-white/[0.04] border ${formErrors.date ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all [color-scheme:dark]`}
                  />
                  {formErrors.date && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">Durée (heures)</label>
                  <input 
                    type="number" min="1" max="8" step="0.5" placeholder="Ex: 2"
                    value={form.duree}
                    onChange={(e) => setForm({ ...form, duree: e.target.value })}
                    className={`bg-white/[0.04] border ${formErrors.duree ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all`}
                  />
                  {formErrors.duree && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">Type d'heure</label>
                  <div className="flex gap-2">
                    {["CM", "TD", "TP"].map(type => (
                      <button 
                        key={type}
                        onClick={() => setForm({ ...form, type })}
                        className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all border ${
                          form.type === type 
                            ? 'bg-[#0097FB] text-white border-[#0097FB]' 
                            : 'bg-white/[0.04] border-white/10 text-[#7A8FAD] hover:bg-[#0097FB]/10 hover:text-[#0097FB]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">Salle</label>
                  <input 
                    type="text" placeholder="Ex: Amphi A, Salle 12"
                    value={form.salle}
                    onChange={(e) => setForm({ ...form, salle: e.target.value })}
                    className={`bg-white/[0.04] border ${formErrors.salle ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all`}
                  />
                  {formErrors.salle && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">Observations (optionnel)</label>
                  <textarea 
                    rows={3} placeholder="Remarques, notes particulières..."
                    value={form.observations}
                    onChange={(e) => setForm({ ...form, observations: e.target.value })}
                    className="bg-white/[0.04] border border-white/10 rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => { setModalOpen(false); resetForm(); }}
                  className="bg-transparent border border-white/10 text-[#7A8FAD] hover:text-white hover:border-white/20 rounded-lg px-6 py-2.5 text-[14px] font-medium transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-[#0097FB] text-white rounded-lg px-7 py-2.5 text-[14px] font-medium flex items-center gap-2 hover:opacity-85 transition-all"
                >
                  <MdSave size={18} /> {editSeance ? "Modifier" : "Enregistrer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-[1000] flex items-center gap-3 px-5 py-3.5 rounded-xl text-white text-[14px] font-medium shadow-2xl ${
              toast.type === "success" ? "bg-[#10B981]" : "bg-[#EF4444]"
            }`}
          >
            {toast.type === "success" ? <MdCheckCircle size={20} /> : <MdCancel size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardRhSaisie;