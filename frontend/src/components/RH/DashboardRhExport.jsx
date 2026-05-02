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
import { getAllEnseignant, deconnexion, verifierAuthentification } from '../../fonctions/Utilisateur';
import { getCoutTotalHeures, getEnseignantsEnDepassement } from '../../fonctions/Stats.jsx';
import { useNavigate } from 'react-router-dom';
import { getRecapEnseignants } from '../../fonctions/Stats.jsx';
import { exportFicheEnseignantPDF } from '../../fonctions/Export';
import toast from 'react-hot-toast';

const moisOptions = [
  "Mars 2026", "Février 2026", "Janvier 2026",
  "Décembre 2025", "Novembre 2025", "Octobre 2025"
];
const anneesOptions = ["2025-2026", "2024-2025", "2023-2024"];


const DashboardRhExport = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [selectedAnnee, setSelectedAnnee] = useState("2025-2026");
  const [selectedMois, setSelectedMois] = useState("Mars 2026");
  const [selectedDept, setSelectedDept] = useState("Tous les départements");
  const [searchEns, setSearchEns] = useState("");

  // Données API
  const [nbConcernes, setNbConcernes] = useState(0);
  const [coutTotal, setCoutTotal] = useState(0);
  const [nbDepassements, setNbDepassements] = useState(0);
  const [recapEnseignants, setRecapEnseignants] = useState([]);

  // Export
  const [exportingId, setExportingId] = useState(null);

  const formatHeures = (valeur) => {
    const total = parseFloat(valeur || 0);
    const h = Math.floor(total);
    const min = Math.round((total - h) * 60);
    return `${h}H${min.toString().padStart(2, '0')}`;
  };

  const getInitials = (name) => name?.split(" ").map(n => n[0]).join("").toUpperCase() || "??";

  const departements = [
    "Tous les départements",
    ...Array.from(new Set(recapEnseignants.map(e => e.departement).filter(Boolean)))
  ];

  const filteredEnseignants = recapEnseignants.filter(e => {
    const matchSearch = `${e.prenom} ${e.nom}`.toLowerCase().includes(searchEns.toLowerCase());
    const matchDept = selectedDept === "Tous les départements" || e.departement === selectedDept;
    return matchSearch && matchDept;
  });

  useEffect(() => {

    const init = async () => {
      try {
        const res = await verifierAuthentification();
        if (res.data.role !== "rh") {
          toast.error("Accès refusé.");
          await deconnexion();
          navigate("/");
          return;
        }
      } catch {
        navigate("/");
        return;
      }

      try { const res = await getAllEnseignant(); setNbConcernes(res.data.length); }
      catch { toast.error("Erreur nombre enseignants."); }

      try { const res = await getCoutTotalHeures(); setCoutTotal(res.data.cout_global); }
      catch { toast.error("Erreur coût total."); }

      try { const res = await getEnseignantsEnDepassement(); setNbDepassements(res.data.length); }
      catch { toast.error("Erreur dépassements."); }

      try { const res = await getRecapEnseignants(); setRecapEnseignants(res.data); console.log(res.data) }
      catch { toast.error("Erreur récapitulatif."); }

      setLoading(false);
    };
    init();
  }, [navigate]);


  return (
    <div className="bg-[#000814] min-h-screen font-['Inter']">
      <SidebarRH isOpen={isOpen} onClose={() => setIsOpen(false)} role="rh" />
      <Navbar onMenuClick={() => setIsOpen(!isOpen)} userName="Aminata Koné" userRole="Responsable RH" />

      <main className="md:ml-57.5 pt-16 p-4 md:p-6 transition-all duration-300 min-h-screen">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#0097FB] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
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
                  value={selectedAnnee} onChange={(e) => setSelectedAnnee(e.target.value)}
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
                  value={selectedMois} onChange={(e) => setSelectedMois(e.target.value)}
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
                  value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}
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
            <div className="text-white text-[22px] font-bold">{nbConcernes}</div>
            <div className="text-[#7A8FAD] text-[11px] truncate">{selectedDept} · {selectedMois}</div>
          </div>

          <div className="bg-[#0D1B2A] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <MdAttachMoney className="text-[#10B981]" size={18} />
              <span className="text-[#7A8FAD] text-[12px]">Masse salariale</span>
            </div>
            <div className="text-[#10B981] text-[18px] font-bold uppercase">{Number(coutTotal).toLocaleString('fr-FR')} FCFA</div>
            <div className="text-[#7A8FAD] text-[11px]">Heures validées incluses</div>
          </div>

          <div className="bg-[#0D1B2A] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <MdWarning className="text-[#F59E0B]" size={18} />
              <span className="text-[#7A8FAD] text-[12px]">Dépassements</span>
            </div>
            <div className="text-[#F59E0B] text-[22px] font-bold">{nbDepassements}</div>
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
            {/* Bouton "Tout exporter (PDF)" supprimé */}
          </div>

          <div className="relative mb-3">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8FAD]" size={16} />
            <input 
              type="text" placeholder="Rechercher un enseignant..."
              value={searchEns} onChange={(e) => setSearchEns(e.target.value)}
              className="w-full bg-white/4 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all"
            />
          </div>
          <p className="text-[#7A8FAD] text-[13px] mb-4">{filteredEnseignants.length} fiche(s) disponible(s)</p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-205 border-collapse">
              <thead>
                <tr className="bg-white/3 text-[#7A8FAD] text-[12px] uppercase tracking-wider text-left border-bottom border-white/5">
                  <th className="px-4 py-3 font-medium">Enseignant</th>
                  <th className="px-4 py-3 font-medium">Département</th>
                  <th className="px-4 py-3 font-medium">CM</th>
                  <th className="px-4 py-3 font-medium">TD</th>
                  <th className="px-4 py-3 font-medium">TP</th>
                  <th className="px-4 py-3 font-medium">Total H</th>
                  <th className="px-4 py-3 font-medium">Volume prévu</th>
                  <th className="px-4 py-3 font-medium">Écart</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnseignants.length > 0 ? (
                  filteredEnseignants.map((e) => {
                    // const totalH = e.cm + e.td + e.tp; // Remplacé par e.total_heures_eq
                    // const montant = (e.cm * e.tauxHoraire) + (e.td * e.tauxHoraire * 1.5) + (e.tp * e.tauxHoraire * 2); // Logique de calcul de montant à revoir si nécessaire
                    // const depassH = Math.max(0, totalH - e.prevues); // Remplacé par e.ecart
                    // const montantDep = depassH * e.tauxHoraire * 1.5; // Logique de calcul de montant à revoir si nécessaire

                    return (
                      <tr key={e.ref_utilisateur} className="border-b border-white/4 hover:bg-white/2 transition-all">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8.5 h-8.5 bg-[#7B2FBE]/15 text-[#7B2FBE] flex items-center justify-center rounded-full text-[12px] font-bold">
                              {getInitials(`${e.prenom} ${e.nom}`)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white text-[13px] font-medium leading-tight">{e.prenom} {e.nom}</span>
                              <span className="text-[#7A8FAD] text-[11px]">{e.ref_utilisateur}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#7A8FAD] text-[13px]">{e.departement}</td>
                        <td className="px-4 py-4 text-white text-[13px]">{formatHeures(e.heures_cm)}</td>
                        <td className="px-4 py-4 text-white text-[13px]">{formatHeures(e.heures_td)}</td>
                        <td className="px-4 py-4 text-white text-[13px]">{formatHeures(e.heures_tp)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <span className="text-white text-[14px] font-bold">{formatHeures(e.total_heures_eq)}</span>
                            {/* La logique de dépassement visuel ici est gérée par la colonne "Écart" */}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#7A8FAD] text-[13px] whitespace-nowrap">{formatHeures(e.volumhor)}</td>
                        <td className="px-4 py-4">
                          {parseFloat(e.ecart) > 0 ? (
                            <span className="text-[#EF4444] font-semibold">+{formatHeures(e.ecart)}</span>
                          ) : parseFloat(e.ecart) < 0 ? (
                            <span className="text-[#10B981] font-semibold">{formatHeures(e.ecart)}</span>
                          ) : (
                            <span className="text-[#3D5068]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full w-fit ${
                            e.statut === "En règle" ? 'bg-[#10B981]/12 text-[#10B981]' :
                            e.statut === "Dépassement" ? 'bg-[#EF4444]/12 text-[#EF4444]' : 'bg-[#F59E0B]/12 text-[#F59E0B]'
                          }`}>
                            {e.statut === "Dépassement" && <MdWarning size={12} />}
                            {e.statut}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            onClick={async () => {
                              setExportingId(e.idens);
                              try {
                                await exportFicheEnseignantPDF(e.idens);
                                console.log(e.idens)
                                toast.success("Fiche PDF générée avec succès.");
                              } catch (err) {
                                toast.error(err.message || "Erreur lors de l'export PDF.");
                              } finally {
                                setExportingId(null);
                              }
                            }}
                            disabled={exportingId === e.idens}
                            className="flex items-center gap-1.5 ml-auto bg-[#EF4444]/12 text-[#EF4444] border border-[#EF4444]/20 rounded-md px-3 py-1.5 text-[12px] hover:bg-[#EF4444]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {exportingId === e.idens ? (
                              <div className="w-3 h-3 border border-[#EF4444] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <MdPictureAsPdf size={16} />
                            )}
                            <span>{exportingId === e.idens ? "..." : "PDF"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" className="py-20 text-center"> {/* Colspan ajusté */}
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

        
        </>
        )}
      </main>

    </div>
  );
};
export default DashboardRhExport;