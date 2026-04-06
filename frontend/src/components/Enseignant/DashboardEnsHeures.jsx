import React, { useEffect, useState } from 'react';


import {
  MdVisibility,
  MdAccessTime,
  MdPieChart,
  MdFactCheck,
  MdTableRows,
  MdSearch,
  MdFilterAltOff,
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdInfo,
  MdSearchOff
} from 'react-icons/md';
import SidebarEnseignant from './SidebarEnseignant';
import Navbar from '../Navbar';
import { deconnexion, verifierAuthentification } from '../../fonctions/utilisateur';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const enseignant = {
  nom: "Jean François",
  code: "ENS-001",
  grade: "Maître de conférence",
  dept: "Informatique",
  prevues: 192,
  tauxHoraire: 5000,
};

const moisOptions = [
  "Tous les mois", "Mars 2026", "Février 2026",
  "Janvier 2026", "Décembre 2025", "Novembre 2025",
  "Octobre 2025", "Septembre 2025"
];
const typeOptions = ["Tous les types", "CM", "TD", "TP"];
const statutOptions = ["Tous les statuts", "Validé", "En attente", "Rejeté"];
const matiereOptions = [
  "Toutes les matières", "Algorithmique", "Base de données"
];

const seances = [
  { id: 1, matiere: "Algorithmique", type: "CM", duree: 3, date: "28/03/2026", salle: "Amphi A", observations: "Chapitre 3 terminé", statut: "Validé" },
  { id: 2, matiere: "Base de données", type: "TD", duree: 2, date: "26/03/2026", salle: "Salle 10", observations: "", statut: "Validé" },
  { id: 3, matiere: "Algorithmique", type: "CM", duree: 4, date: "24/03/2026", salle: "Amphi A", observations: "Examen partiel", statut: "En attente" },
  { id: 4, matiere: "Base de données", type: "TP", duree: 2, date: "22/03/2026", salle: "Labo 1", observations: "Travaux sur cas", statut: "Validé" },
  { id: 5, matiere: "Algorithmique", type: "TD", duree: 2, date: "20/03/2026", salle: "Salle 08", observations: "", statut: "Validé" },
  { id: 6, matiere: "Algorithmique", type: "CM", duree: 4, date: "18/03/2026", salle: "Amphi A", observations: "", statut: "Validé" },
  { id: 7, matiere: "Base de données", type: "CM", duree: 3, date: "15/03/2026", salle: "Amphi B", observations: "Groupe complet", statut: "Validé" },
  { id: 8, matiere: "Base de données", type: "TD", duree: 2, date: "12/03/2026", salle: "Salle 10", observations: "", statut: "Rejeté" },
  { id: 9, matiere: "Algorithmique", type: "TP", duree: 3, date: "10/03/2026", salle: "Labo 2", observations: "TP noté", statut: "Validé" },
  { id: 10, matiere: "Base de données", type: "TP", duree: 2, date: "08/03/2026", salle: "Labo 1", observations: "", statut: "En attente" },
  { id: 11, matiere: "Algorithmique", type: "CM", duree: 3, date: "28/02/2026", salle: "Amphi A", observations: "", statut: "Validé" },
  { id: 12, matiere: "Base de données", type: "TD", duree: 2, date: "25/02/2026", salle: "Salle 10", observations: "Rattrappage", statut: "Validé" },
];

const DashboardEnsHeures = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  // États Filtres
  const [search, setSearch] = useState("");
  const [filterMois, setFilterMois] = useState("Tous les mois");
  const [filterType, setFilterType] = useState("Tous les types");
  const [filterStatut, setFilterStatut] = useState("Tous les statuts");
  const [filterMatiere, setFilterMatiere] = useState("Toutes les matières");

  const resetFilters = () => {
    setSearch("");
    setFilterMois("Tous les mois");
    setFilterType("Tous les types");
    setFilterStatut("Tous les statuts");
    setFilterMatiere("Toutes les matières");
  };

  // --- CALCULS KPIs (Sur l'ensemble des données) ---
  const totalH = seances.reduce((a, s) => a + s.duree, 0);
  const cmH = seances.filter(s => s.type === "CM").reduce((a, s) => a + s.duree, 0);
  const tdH = seances.filter(s => s.type === "TD").reduce((a, s) => a + s.duree, 0);
  const tpH = seances.filter(s => s.type === "TP").reduce((a, s) => a + s.duree, 0);
  const validees = seances.filter(s => s.statut === "Validé").reduce((a, s) => a + s.duree, 0);
  const enAttente = seances.filter(s => s.statut === "En attente").reduce((a, s) => a + s.duree, 0);
  const depassement = Math.max(0, totalH - enseignant.prevues);

  // --- FILTRAGE ET TRI ---
  const filteredSeances = seances.filter(s => {
    const matchSearch = s.matiere.toLowerCase().includes(search.toLowerCase()) || 
                        s.salle.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "Tous les types" || s.type === filterType;
    const matchStatut = filterStatut === "Tous les statuts" || s.statut === filterStatut;
    const matchMatiere = filterMatiere === "Toutes les matières" || s.matiere === filterMatiere;
    
    let matchMois = true;
    if (filterMois !== "Tous les mois") {
      const [m, y] = filterMois.split(" ");
      const monthsMap = { "Janvier": "01", "Février": "02", "Mars": "03", "Avril": "04", "Mai": "05", "Juin": "06", "Juillet": "07", "Août": "08", "Septembre": "09", "Octobre": "10", "Novembre": "11", "Décembre": "12" };
      matchMois = s.date.includes(`${monthsMap[m]}/${y}`);
    }

    return matchSearch && matchType && matchStatut && matchMatiere && matchMois;
  }).sort((a, b) => {
    const parseDate = (d) => {
      const [day, month, year] = d.split('/');
      return new Date(year, month - 1, day);
    };
    return parseDate(b.date) - parseDate(a.date);
  });

  const totalAffiche = filteredSeances.reduce((a, s) => a + s.duree, 0);
  useEffect(() => {
        const fetchUserData = async () => {
          try {
            const res = await verifierAuthentification();
            if(res.data.role !=="enseignant"){
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
      <SidebarEnseignant isOpen={isOpen} onClose={() => setIsOpen(false)} role="enseignant" />
      <Navbar onMenuClick={() => setIsOpen(!isOpen)} userName="Jean François" userRole="Enseignant" />

      <main className="md:ml-[230px] pt-16 p-4 md:p-6 transition-all duration-300 min-h-screen">
        
        {/* EN-TÊTE DE PAGE */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-white leading-tight">Mes heures</h1>
            <p className="text-[#7A8FAD] text-sm mt-1">Consultation de vos séances enregistrées · Lecture seule</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 text-[#7A8FAD] text-[12px] py-1.5 px-4 rounded-full">
            <MdVisibility size={16} />
            <span>Lecture seule</span>
          </div>
        </div>

        {/* SECTION 1 — KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
          {/* Total Heures */}
          <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl">
            <div className="flex justify-between items-center">
              <MdAccessTime className="text-[#10B981]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Total heures</span>
            </div>
            <div className="text-white text-[28px] font-bold mt-2">{totalH}H</div>
            <div className="mt-3 h-1.5 bg-white/6 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ease-out ${totalH <= enseignant.prevues ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}
                style={{ width: `${Math.min((totalH / enseignant.prevues) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[#7A8FAD] text-[11px] font-medium">{totalH}H effectuées / {enseignant.prevues}H prévues</span>
              {depassement > 0 && <span className="text-[#EF4444] text-[11px] font-bold">+{depassement}H</span>}
            </div>
          </div>

          {/* Répartition */}
          <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl">
            <div className="flex justify-between items-center">
              <MdPieChart className="text-[#0097FB]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">CM / TD / TP</span>
            </div>
            <div className="space-y-2 mt-2.5">
              <div className="flex justify-between items-center">
                <span className="bg-[#0097FB] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">CM</span>
                <span className="text-white text-[13px] font-semibold">{cmH}H</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-[#10B981] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">TD</span>
                <span className="text-white text-[13px] font-semibold">{tdH}H</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-[#F59E0B] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">TP</span>
                <span className="text-white text-[13px] font-semibold">{tpH}H</span>
              </div>
            </div>
            <div className="flex h-1.5 w-full rounded-full overflow-hidden mt-3 gap-0.5">
              <div style={{ width: `${(cmH / totalH) * 100}%` }} className="bg-[#0097FB]" />
              <div style={{ width: `${(tdH / totalH) * 100}%` }} className="bg-[#10B981]" />
              <div style={{ width: `${(tpH / totalH) * 100}%` }} className="bg-[#F59E0B]" />
            </div>
          </div>

          {/* Statut / Validation */}
          <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <MdFactCheck className="text-[#10B981]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Validation</span>
            </div>
            <div className="flex gap-2 flex-wrap mt-1">
              <div className="flex items-center gap-1.5 bg-[#10B981]/12 text-[#10B981] text-[12px] font-medium py-1.5 px-3 rounded-full">
                <MdCheckCircle size={14} /> Validées · {validees}H
              </div>
              <div className="flex items-center gap-1.5 bg-[#F59E0B]/12 text-[#F59E0B] text-[12px] font-medium py-1.5 px-3 rounded-full">
                <MdPending size={14} /> En attente · {enAttente}H
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[#7A8FAD] text-[12px] font-medium">{Math.round((validees / totalH) * 100)}% des heures validées</div>
              <div className="mt-1.5 h-[3px] bg-white/6 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full" style={{ width: `${(validees / totalH) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* BANNIÈRE INFO */}
        <div className="flex items-center gap-3 bg-[#0097FB]/6 border border-[#0097FB]/15 p-3 px-4 rounded-xl mb-4">
          <MdInfo className="text-[#0097FB]" size={18} />
          <p className="text-[#7A8FAD] text-[13px] leading-relaxed">
            Ces données sont enregistrées par le service RH. Pour toute correction, contactez votre responsable RH.
          </p>
        </div>

        {/* SECTION 2 — TABLEAU */}
        <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl shadow-sm">
          
          {/* EN-TÊTE TABLEAU */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <MdTableRows className="text-[#10B981]" size={18} />
              <h2 className="text-white text-[15px] font-semibold">Liste de mes séances</h2>
            </div>
            <span className="bg-[#10B981]/10 text-[#10B981] text-[12px] font-medium px-3 py-1 rounded-full">
              {seances.length} séances au total
            </span>
          </div>

          {/* FILTRES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="md:col-span-2 relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8FAD] text-base" />
              <input 
                type="text" 
                placeholder="Rechercher une matière, une salle..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/4 border border-white/8 rounded-lg py-2.5 pl-10 pr-4 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:col-span-2">
              <div>
                <label className="text-[#7A8FAD] text-[11px] font-bold uppercase tracking-wider block mb-1.5 ml-1">MOIS</label>
                <select 
                  value={filterMois} onChange={(e) => setFilterMois(e.target.value)}
                  className="bg-white/4 border border-white/8 text-white rounded-lg py-2.5 px-3 text-[13px] w-full outline-none focus:border-[#0097FB] cursor-pointer"
                >
                  {moisOptions.map(m => <option key={m} value={m} className="bg-[#0D1B2A]">{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#7A8FAD] text-[11px] font-bold uppercase tracking-wider block mb-1.5 ml-1">TYPE</label>
                <select 
                  value={filterType} onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white/4 border border-white/8 text-white rounded-lg py-2.5 px-3 text-[13px] w-full outline-none focus:border-[#0097FB] cursor-pointer"
                >
                  {typeOptions.map(t => <option key={t} value={t} className="bg-[#0D1B2A]">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#7A8FAD] text-[11px] font-bold uppercase tracking-wider block mb-1.5 ml-1">STATUT</label>
                <select 
                  value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}
                  className="bg-white/4 border border-white/8 text-white rounded-lg py-2.5 px-3 text-[13px] w-full outline-none focus:border-[#0097FB] cursor-pointer"
                >
                  {statutOptions.map(s => <option key={s} value={s} className="bg-[#0D1B2A]">{s}</option>)}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[#7A8FAD] text-[11px] font-bold uppercase tracking-wider block mb-1.5 ml-1">MATIÈRE</label>
              <select 
                value={filterMatiere} onChange={(e) => setFilterMatiere(e.target.value)}
                className="bg-white/4 border border-white/8 text-white rounded-lg py-2.5 px-3 text-[13px] w-full md:w-auto md:min-w-[200px] outline-none focus:border-[#0097FB] cursor-pointer"
              >
                {matiereOptions.map(mat => <option key={mat} value={mat} className="bg-[#0D1B2A]">{mat}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 mb-4">
            <p className="text-[#7A8FAD] text-[13px]">{filteredSeances.length} séance(s) trouvée(s)</p>
            {(search || filterMois !== "Tous les mois" || filterType !== "Tous les types" || filterStatut !== "Tous les statuts" || filterMatiere !== "Toutes les matières") && (
              <button 
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-[#7A8FAD] hover:text-[#0097FB] text-[12px] font-medium transition-all"
              >
                <MdFilterAltOff size={14} />
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr className="bg-white/3 text-[#7A8FAD] text-[11px] uppercase tracking-[0.05em] text-left border-b border-white/6">
                  <th className="px-4 py-3.5 font-semibold">#</th>
                  <th className="px-4 py-3.5 font-semibold">Matière</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Type</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Durée</th>
                  <th className="px-4 py-3.5 font-semibold">Date</th>
                  <th className="px-4 py-3.5 font-semibold">Salle</th>
                  <th className="px-4 py-3.5 font-semibold">Observations</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredSeances.length > 0 ? (
                  filteredSeances.map((s, index) => (
                    <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-all">
                      <td className="px-4 py-4 text-[#3D5068] text-[12px] font-mono tracking-tighter">#{index + 1}</td>
                      <td className="px-4 py-4 text-white text-[13px] font-medium">{s.matiere}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          s.type === 'CM' ? 'bg-[#0097FB]/12 text-[#0097FB]' : 
                          s.type === 'TD' ? 'bg-[#10B981]/12 text-[#10B981]' : 'bg-[#F59E0B]/12 text-[#F59E0B]'
                        }`}>
                          {s.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-white text-[13px] font-bold">{s.duree}</span>
                        <span className="text-[#7A8FAD] text-[12px] ml-0.5">H</span>
                      </td>
                      <td className="px-4 py-4 text-[#7A8FAD] text-[12px] whitespace-nowrap">{s.date}</td>
                      <td className="px-4 py-4 text-[#7A8FAD] text-[13px]">{s.salle}</td>
                      <td className="px-4 py-4">
                        {s.observations ? (
                          <div className="max-w-[150px] text-[#7A8FAD] text-[12px] truncate" title={s.observations}>
                            {s.observations}
                          </div>
                        ) : (
                          <span className="text-[#3D5068] text-[13px]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          s.statut === "Validé" ? "bg-[#10B981]/12 text-[#10B981]" : 
                          s.statut === "En attente" ? "bg-[#F59E0B]/12 text-[#F59E0B]" : "bg-[#EF4444]/12 text-[#EF4444]"
                        }`}>
                          {s.statut === "Validé" && <MdCheckCircle size={12} />}
                          {s.statut === "En attente" && <MdPending size={12} />}
                          {s.statut === "Rejeté" && <MdCancel size={12} />}
                          {s.statut}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <MdSearchOff className="text-[#7A8FAD]" size={44} />
                        <h3 className="text-white text-[15px] font-semibold">Aucune séance trouvée</h3>
                        <p className="text-[#7A8FAD] text-[13px]">Modifiez vos filtres pour afficher des résultats</p>
                        <button 
                          onClick={resetFilters}
                          className="mt-4 bg-[#0097FB]/10 text-[#0097FB] hover:bg-[#0097FB]/20 text-[13px] font-medium py-2 px-6 rounded-lg transition-all"
                        >
                          Réinitialiser
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredSeances.length > 0 && (
                <tfoot>
                  <tr className="bg-white/3 border-t-2 border-white/10">
                    <td colSpan="3" className="px-4 py-3 text-[#7A8FAD] text-[12px] font-bold">Total affiché :</td>
                    <td className="px-4 py-3 text-center text-white text-[13px] font-bold whitespace-nowrap">
                      {totalAffiche}H
                    </td>
                    <td colSpan="4"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardEnsHeures;