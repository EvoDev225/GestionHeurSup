import React, { useState, useEffect } from 'react';
import {
  MdSupervisorAccount,
  MdFilterList,
  MdCalendarToday,
  MdDateRange,
  MdBusinessCenter,
  MdInfo,
  MdPeople,
  MdAttachMoney,
  MdWarning,
  MdReceipt,
  MdDownload,
  MdHourglassEmpty,
  MdSearch,
  MdPictureAsPdf,
  MdHistory,
  MdDeleteSweep,
  MdCheckCircle,
  MdError,
  MdRefresh,
  MdSearchOff
} from 'react-icons/md';


import SidebarRH from './SidebarRH';
import Navbar from '../Navbar';
import { deconnexion, verifierAuthentification } from '../../fonctions/utilisateur';
import { useNavigate } from 'react-router-dom';

const moisOptions = [
  "Mars 2026", "Février 2026", "Janvier 2026",
  "Décembre 2025", "Novembre 2025", "Octobre 2025"
];
const anneesOptions = ["2025-2026", "2024-2025", "2023-2024"];
const departements = [
  "Tous les départements", "Informatique", "Droit", "Marketing", "Comptabilité"
];

const enseignantsInitial = [
  { id: 1, code: "ENS-001", nom: "Jean François", dept: "Informatique", grade: "Maître de conférence", type: "Permanent", tauxHoraire: 5000, cm: 120, td: 90, tp: 68, prevues: 192 },
  { id: 2, code: "ENS-002", nom: "Konan Charles", dept: "Informatique", grade: "Maître de conférence", type: "Permanent", tauxHoraire: 5000, cm: 140, td: 100, tp: 72, prevues: 192 },
  { id: 3, code: "ENS-003", nom: "Hervé Koffi", dept: "Droit", grade: "Assistant", type: "Vacataire", tauxHoraire: 3500, cm: 100, td: 80, tp: 48, prevues: 192 },
  { id: 4, code: "ENS-004", nom: "Moro Isaac", dept: "Marketing", grade: "Professeur", type: "Permanent", tauxHoraire: 7000, cm: 90, td: 75, tp: 50, prevues: 192 },
  { id: 5, code: "ENS-005", nom: "Bamba Sory", dept: "Comptabilité", grade: "Assistant", type: "Vacataire", tauxHoraire: 3500, cm: 110, td: 85, tp: 50, prevues: 192 },
  { id: 6, code: "ENS-006", nom: "Aminata Traoré", dept: "Droit", grade: "Maître de conférence", type: "Permanent", tauxHoraire: 5000, cm: 60, td: 40, tp: 20, prevues: 192 },
  { id: 7, code: "ENS-007", nom: "Kacou Grade", dept: "Marketing", grade: "Assistant", type: "Vacataire", tauxHoraire: 3500, cm: 70, td: 55, tp: 30, prevues: 192 },
  { id: 8, code: "ENS-008", nom: "Paul Bamba", dept: "Comptabilité", grade: "Professeur", type: "Permanent", tauxHoraire: 7000, cm: 95, td: 70, tp: 45, prevues: 192 },
];

const historiqueInitial = [
  { id: 1, nom: "Jean François", mois: "Mars 2026", format: "PDF", date: "28/03/2026", heure: "14:55", montant: 892500, statut: "Succès" },
  { id: 2, nom: "Konan Charles", mois: "Mars 2026", format: "PDF", date: "28/03/2026", heure: "14:58", montant: 1050000, statut: "Succès" },
  { id: 3, nom: "Tous (lot)", mois: "Février 2026", format: "PDF", date: "25/02/2026", heure: "10:30", montant: null, statut: "Succès" },
  { id: 4, nom: "Hervé Koffi", mois: "Février 2026", format: "PDF", date: "24/02/2026", heure: "09:15", montant: 630000, statut: "Échec" },
  { id: 5, nom: "Bamba Sory", mois: "Janvier 2026", format: "PDF", date: "22/01/2026", heure: "16:40", montant: 724500, statut: "Succès" },
];

const DashboardRhExport = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAnnee, setAnnee] = useState("2025-2026");
  const [selectedMois, setMois] = useState("Mars 2026");
  const [selectedDept, setDept] = useState("Tous les départements");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  const simulerExport = (id, nom) => {
    setLoadingId(id);
    setTimeout(() => {
      setLoadingId(null);
      showToast(
        id === "all"
          ? "Toutes les fiches exportées en PDF"
          : `Fiche de ${nom} générée en PDF`,
        "success"
      );
    }, 2000);
  };

  const getInitials = (name) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  const filteredEnseignants = enseignantsInitial.filter(e => {
    const matchDept = selectedDept === "Tous les départements" || e.dept === selectedDept;
    const matchSearch = e.nom.toLowerCase().includes(search.toLowerCase()) || e.code.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  // Calculs KPIs
  const stats = filteredEnseignants.reduce((acc, e) => {
    const totalH = e.cm + e.td + e.tp;
    const montant = (e.cm * e.tauxHoraire * 1) + (e.td * e.tauxHoraire * 1.5) + (e.tp * e.tauxHoraire * 2);
    acc.masseSalariale += montant;
    if (totalH > e.prevues) acc.depassements++;
    return acc;
  }, { masseSalariale: 0, depassements: 0 });
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await verifierAuthentification();
        if(res.data.role !=="rh"){
          toast.error("Accès refusé. Redirection vers la page d'accueil.");
          await deconnexion()
          navigate("/")
          
        }
      } catch (error) {
        navigate("/")
        toast.error("Une erreur est survenue lors de la vérification de l'authentification.");
      }
    };
    fetchUserData();
  },[]);


  return (
    <div className="bg-[#000814] min-h-screen font-['Inter']">
      <SidebarRH isOpen={isOpen} onClose={() => setIsOpen(false)} role="rh" />
      <Navbar onMenuClick={() => setIsOpen(!isOpen)} userName="Aminata Koné" userRole="Responsable RH" />

      <main className="md:ml-57.5 pt-16 p-4 md:p-6 transition-all duration-300 min-h-screen">
        
        {/* EN-TÊTE DE PAGE */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-white">États de paiement</h1>
            <p className="text-[#7A8FAD] text-sm mt-1">Génération des fiches de paiement PDF des enseignants</p>
          </div>
          <div className="bg-[#7B2FBE]/15 border border-[#7B2FBE]/30 text-[#7B2FBE] text-[13px] font-bold py-1.5 px-4 rounded-full flex items-center gap-2">
            <MdSupervisorAccount size={16} />
            <span>RH</span>
          </div>
        </div>

        {/* SECTION 1 — FILTRES GLOBAUX */}
        <div className="bg-[#0D1B2A] border border-white/5 p-6 rounded-[14px] mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <MdFilterList className="text-[#0097FB] text-[18px]" />
            <h2 className="text-[15px] font-semibold text-white">Paramètres de génération</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-[#7A8FAD] text-[11px] uppercase font-bold tracking-[0.06em] mb-1.5">ANNÉE ACADÉMIQUE</label>
              <div className="relative flex items-center">
                <MdCalendarToday className="absolute left-3 text-[#7A8FAD]" size={16} />
                <select 
                  value={selectedAnnee} onChange={(e) => setAnnee(e.target.value)}
                  className="w-full bg-white/4 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all cursor-pointer"
                >
                  {anneesOptions.map(a => <option key={a} value={a} className="bg-[#0D1B2A]">{a}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[#7A8FAD] text-[11px] uppercase font-bold tracking-[0.06em] mb-1.5">MOIS</label>
              <div className="relative flex items-center">
                <MdDateRange className="absolute left-3 text-[#7A8FAD]" size={16} />
                <select 
                  value={selectedMois} onChange={(e) => setMois(e.target.value)}
                  className="w-full bg-white/4 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all cursor-pointer"
                >
                  {moisOptions.map(m => <option key={m} value={m} className="bg-[#0D1B2A]">{m}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[#7A8FAD] text-[11px] uppercase font-bold tracking-[0.06em] mb-1.5">DÉPARTEMENT</label>
              <div className="relative flex items-center">
                <MdBusinessCenter className="absolute left-3 text-[#7A8FAD]" size={16} />
                <select 
                  value={selectedDept} onChange={(e) => setDept(e.target.value)}
                  className="w-full bg-white/4 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all cursor-pointer"
                >
                  {departements.map(d => <option key={d} value={d} className="bg-[#0D1B2A]">{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-[#7A8FAD] text-[13px] italic">
            <MdInfo className="text-[#0097FB]" size={16} />
            <span>Les montants sont calculés sur la base des taux horaires et équivalences configurés.</span>
          </div>
        </div>

        {/* SECTION 2 — KPI RÉSUMÉ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0D1B2A] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <MdPeople className="text-[#0097FB]" size={18} />
              <span className="text-[#7A8FAD] text-[12px]">Concernés</span>
            </div>
            <div className="text-white text-[22px] font-bold">{filteredEnseignants.length}</div>
            <div className="text-[#7A8FAD] text-[11px] truncate">{selectedDept} · {selectedMois}</div>
          </div>

          <div className="bg-[#0D1B2A] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <MdAttachMoney className="text-[#10B981]" size={18} />
              <span className="text-[#7A8FAD] text-[12px]">Masse salariale</span>
            </div>
            <div className="text-[#10B981] text-[18px] font-bold uppercase">{stats.masseSalariale.toLocaleString('fr-FR')} FCFA</div>
            <div className="text-[#7A8FAD] text-[11px]">Heures validées incluses</div>
          </div>

          <div className="bg-[#0D1B2A] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <MdWarning className="text-[#F59E0B]" size={18} />
              <span className="text-[#7A8FAD] text-[12px]">Dépassements</span>
            </div>
            <div className="text-[#F59E0B] text-[22px] font-bold">{stats.depassements}</div>
            <div className="text-[#7A8FAD] text-[11px]">Heures hors quota</div>
          </div>
        </div>

        {/* SECTION 3 — TABLEAU FICHES DE PAIEMENT */}
        <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <MdReceipt className="text-[#0097FB]" size={18} />
              <h2 className="text-white text-[15px] font-semibold">Fiches de paiement · {selectedMois}</h2>
            </div>
            <button 
              onClick={() => simulerExport("all", "Toutes les fiches")}
              disabled={loadingId === "all"}
              className={`flex items-center gap-2 bg-[#EF4444]/12 text-[#EF4444] border border-[#EF4444]/20 rounded-lg px-4 py-2 text-[13px] font-medium hover:bg-[#EF4444]/20 transition-all ${loadingId === "all" ? 'opacity-70 pointer-events-none' : ''}`}
            >
              {loadingId === "all" ? (
                <>
                  <MdHourglassEmpty className="animate-spin" size={16} />
                  Génération...
                </>
              ) : (
                <>
                  <MdDownload size={18} />
                  Tout exporter (PDF)
                </>
              )}
            </button>
          </div>

          <div className="relative mb-3">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8FAD]" size={16} />
            <input 
              type="text" placeholder="Rechercher un enseignant..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/4 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all"
            />
          </div>
          <p className="text-[#7A8FAD] text-[13px] mb-4">{filteredEnseignants.length} fiche(s) disponible(s)</p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-205 border-collapse">
              <thead>
                <tr className="bg-white/3 text-[#7A8FAD] text-[12px] uppercase tracking-wider text-left border-bottom border-white/5">
                  <th className="px-4 py-3 font-medium">Enseignant</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">CM</th>
                  <th className="px-4 py-3 font-medium">TD</th>
                  <th className="px-4 py-3 font-medium">TP</th>
                  <th className="px-4 py-3 font-medium">Total H</th>
                  <th className="px-4 py-3 font-medium">Taux/H</th>
                  <th className="px-4 py-3 font-medium">Montant FCFA</th>
                  <th className="px-4 py-3 font-medium">Dépassement</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnseignants.length > 0 ? (
                  filteredEnseignants.map((e) => {
                    const totalH = e.cm + e.td + e.tp;
                    const montant = (e.cm * e.tauxHoraire) + (e.td * e.tauxHoraire * 1.5) + (e.tp * e.tauxHoraire * 2);
                    const depassH = Math.max(0, totalH - e.prevues);
                    const montantDep = depassH * e.tauxHoraire * 1.5;

                    return (
                      <tr key={e.id} className="border-b border-white/4 hover:bg-white/2 transition-all">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8.5 h-8.5 bg-[#7B2FBE]/15 text-[#7B2FBE] flex items-center justify-center rounded-full text-[12px] font-bold">
                              {getInitials(e.nom)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white text-[13px] font-medium leading-tight">{e.nom}</span>
                              <span className="text-[#7A8FAD] text-[11px]">{e.code}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="bg-white/5 text-[#94A3B8] text-[11px] px-2.5 py-0.5 rounded-full border border-white/5">{e.grade}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${e.type === "Permanent" ? 'bg-[#0097FB]/12 text-[#0097FB]' : 'bg-[#7B2FBE]/12 text-[#7B2FBE]'}`}>
                            {e.type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-white text-[13px]">{e.cm}<span className="text-[#7A8FAD] text-[11px] ml-0.5">H</span></td>
                        <td className="px-4 py-4 text-white text-[13px]">{e.td}<span className="text-[#7A8FAD] text-[11px] ml-0.5">H</span></td>
                        <td className="px-4 py-4 text-white text-[13px]">{e.tp}<span className="text-[#7A8FAD] text-[11px] ml-0.5">H</span></td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <span className="text-white text-[14px] font-bold">{totalH}<span className="text-[#7A8FAD] font-normal ml-0.5 text-[11px]">H</span></span>
                            {totalH > e.prevues && (
                              <span className="ml-2 bg-[#EF4444]/12 text-[#EF4444] text-[10px] px-1.5 py-0.5 rounded-full font-bold">+{depassH}H</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#7A8FAD] text-[12px] whitespace-nowrap">{e.tauxHoraire.toLocaleString('fr-FR')} FCFA</td>
                        <td className="px-4 py-4 text-[#10B981] text-[13px] font-bold whitespace-nowrap">{montant.toLocaleString('fr-FR')} FCFA</td>
                        <td className="px-4 py-4">
                          {depassH > 0 ? (
                            <div className="flex flex-col leading-tight">
                              <span className="text-[#EF4444] text-[12px] font-semibold">+{depassH}H</span>
                              <span className="text-[#EF4444] text-[11px]">+{montantDep.toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          ) : (
                            <span className="text-[#3D5068]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            onClick={() => simulerExport(e.id, e.nom)}
                            className={`flex items-center gap-1.5 ml-auto bg-[#EF4444]/12 text-[#EF4444] border border-[#EF4444]/20 rounded-md px-3 py-1.5 text-[12px] hover:bg-[#EF4444]/20 transition-all ${loadingId === e.id ? 'opacity-70 pointer-events-none' : ''}`}
                          >
                            {loadingId === e.id ? <MdHourglassEmpty className="animate-spin" size={14} /> : <MdPictureAsPdf size={16} />}
                            <span>{loadingId === e.id ? "..." : "PDF"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <MdSearchOff className="text-[#7A8FAD]" size={40} />
                        <p className="text-white text-[15px] font-medium">Aucun enseignant trouvé</p>
                        <p className="text-[#7A8FAD] text-[13px]">Modifiez vos filtres de recherche</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 4 — HISTORIQUE DES EXPORTS */}
        <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl shadow-sm mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MdHistory className="text-[#0097FB]" size={18} />
              <h2 className="text-white text-[15px] font-semibold">Historique des exports</h2>
            </div>
            <button className="flex items-center gap-2 bg-transparent text-[#7A8FAD] border border-white/10 rounded-lg px-3 py-1.5 text-[12px] hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-all">
              <MdDeleteSweep size={16} />
              Effacer
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="bg-white/3 text-[#7A8FAD] text-[12px] uppercase tracking-wider text-left border-bottom border-white/5">
                  <th className="px-4 py-3 font-medium">Enseignant</th>
                  <th className="px-4 py-3 font-medium">Mois</th>
                  <th className="px-4 py-3 font-medium text-center">Format</th>
                  <th className="px-4 py-3 font-medium">Date & Heure</th>
                  <th className="px-4 py-3 font-medium">Montant</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {historiqueInitial.map((item) => (
                  <tr key={item.id} className="border-b border-white/4 hover:bg-white/2 transition-all">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-[13px]">{item.nom}</span>
                        {item.nom === "Tous (lot)" && (
                          <span className="bg-[#7B2FBE]/12 text-[#7B2FBE] text-[10px] px-2 py-0.5 rounded-full font-bold">Export groupé</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#7A8FAD] text-[12px]">{item.mois}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-[#EF4444]/12 text-[#EF4444] text-[11px] px-2 py-0.5 rounded-full font-bold">{item.format}</span>
                    </td>
                    <td className="px-4 py-3 text-[#7A8FAD] text-[12px] whitespace-nowrap">{item.date} à {item.heure}</td>
                    <td className="px-4 py-3">
                      {item.montant ? (
                        <span className="text-white text-[12px] font-medium">{item.montant.toLocaleString('fr-FR')} FCFA</span>
                      ) : (
                        <span className="text-[#3D5068]">1—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full w-fit ${item.statut === "Succès" ? 'bg-[#10B981]/12 text-[#10B981]' : 'bg-[#EF4444]/12 text-[#EF4444]'}`}>
                        {item.statut === "Succès" ? <MdCheckCircle size={12} /> : <MdError size={12} />}
                        {item.statut}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.statut === "Succès" ? (
                        <button className="text-[#0097FB] hover:text-white transition-all"><MdDownload size={18} /></button>
                      ) : (
                        <button className="text-[#F59E0B] hover:text-white transition-all"><MdRefresh size={18} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* TOAST */}
      {toast.visible && (
        <div className={`fixed bottom-6 right-6 z-[1000] flex items-center gap-2 px-5 py-3 rounded-xl text-white text-[14px] font-medium shadow-2xl transition-all ${toast.type === "success" ? "bg-[#10B981]" : "bg-[#EF4444]"}`}>
          {toast.type === "success" ? <MdCheckCircle size={18} /> : <MdError size={18} />}
          {toast.message}
        </div>
      )}

      {/* STYLE POUR L'ANIMATION DE ROTATION */}
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

export default DashboardRhExport;