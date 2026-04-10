import React, { useEffect, useState } from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  DoughnutController,
  BarController,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  MdSupervisorAccount,
  MdFilterList,
  MdAccessTime,
  MdPeople,
  MdWarning,
  MdSearch,
  MdTableChart,
  MdSearchOff
} from 'react-icons/md';
import SidebarRH from './SidebarRH';
import Navbar from '../Navbar';
import { useNavigate } from 'react-router-dom';
import { deconnexion, verifierAuthentification } from '../../fonctions/Utilisateur';
import {
  getTotalHeures,
  getMoyenneHeuresParEnseignant,
  getTauxDepassement,
  getHeuresParMois,
  getRepartitionHeures,
  getHeuresParDepartement,
  getTop5Enseignants,
  getRecapEnseignants
} from '../../fonctions/Stats';
import toast from 'react-hot-toast';

// Enregistrement Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  DoughnutController,
  BarController,
  Tooltip,
  Legend,
  Filler
);

const anneesOptions = ["2025-2026", "2024-2025", "2023-2024"];
const moisOptions = [
  "Toute l'année", "Janvier", "Février", "Mars", "Avril",
  "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];
const departements = ["Tous les départements", "Informatique", "Droit", "Marketing", "Comptabilité"]; // Keep for filters
const statutsFiltres = ["Tous les statuts", "En règle", "Dépassement", "Sous quota"]; // Keep for filters

const DashboardRHStatistique = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAnnee, setAnnee] = useState("2025-2026");
  const [selectedMois, setMois] = useState("Toute l'année");
  
  // Données API
  const [totalHeures, setTotalHeures] = useState("0");
  const [moyenne, setMoyenne] = useState({ total_enseignants: 0, moyenne_heures: "0" });
  const [tauxDepassement, setTauxDepassement] = useState({ nb_depassement: 0, total_enseignants: 0, taux_depassement: 0 });
  const [heuresParMois, setHeuresParMois] = useState([]);
  const [repartition, setRepartition] = useState([]);
  const [heuresDept, setHeuresDept] = useState([]);
  const [top5, setTop5] = useState([]);
  const [recapEnseignants, setRecapEnseignants] = useState([]);
  
  // Filtres tableau récapitulatif
  const [searchRecap, setSearchRecap] = useState("");
  const [filterDept, setFilterDept] = useState("Tous les départements");
  const [filterStatut, setFilterStatut] = useState("Tous les statuts");

  const formatHeures = (valeur) => {
    const total = parseFloat(valeur || 0);
    const h = Math.floor(total);
    const min = Math.round((total - h) * 60);
    return `${h}H${min.toString().padStart(2, '0')}`;
  };
  const getInitials = (name) => name?.split(" ").map(n => n[0]).join("").toUpperCase() || "??";

  const filteredRecap = recapEnseignants.filter(e => {
    const matchSearch = `${e.prenom} ${e.nom}`.toLowerCase().includes(searchRecap.toLowerCase());
    const matchDept = filterDept === "Tous les départements" || e.departement === filterDept;
    const matchStatut = filterStatut === "Tous les statuts" || e.statut === filterStatut;
    return matchSearch && matchDept && matchStatut;
  });

  // --- CONFIG CHARTS ---
  
  const evolutionData = {
    labels: heuresParMois.map(m => m.nom_mois),
    datasets: [{
      label: "Heures saisies",
      data: heuresParMois.map(m => parseFloat(m.total_heures)),
      borderColor: "#0097FB",
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 220);
        gradient.addColorStop(0, 'rgba(0, 151, 251, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 151, 251, 0)');
        return gradient;
      },
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: "#0097FB",
      fill: true,
    }],
  };

  const doughnutData = {
    labels: repartition.map(r => r.type),
    datasets: [{
      data: repartition.map(r => parseFloat(r.total_heures)),
      backgroundColor: ["#0097FB", "#10B981", "#F59E0B"],
      borderWidth: 0,
    }],
  };

  const deptData = {
    labels: heuresDept.map(d => d.departement),
    datasets: [{
      data: heuresDept.map(d => parseFloat(d.total_heures)),
      backgroundColor: "rgba(0, 151, 251, 0.7)",
      borderColor: "#0097FB",
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const top5Data = {
    labels: top5.map(e => `${e.prenom} ${e.nom}`),
    datasets: [
      {
        label: "Heures effectuées",
        data: top5.map(e => parseFloat(e.total_heures)),
        backgroundColor: top5.map(e =>
          parseFloat(e.total_heures) > parseFloat(e.volumhor)
            ? "rgba(239, 68, 68, 0.7)"
            : "rgba(0, 151, 251, 0.7)"
        ),
        borderRadius: 4,
      },
      {
        label: "Volume prévu",
        data: top5.map(e => parseFloat(e.volumhor)),
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        borderRadius: 4,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: "rgba(255, 255, 255, 0.04)" }, ticks: { color: "#7A8FAD", font: { size: 11 } } },
      y: { grid: { color: "rgba(255, 255, 255, 0.04)" }, ticks: { color: "#7A8FAD", font: { size: 11 } } },
    },
  };

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

      try { const res = await getTotalHeures(); setTotalHeures(res.data.total_heures); }
      catch { toast.error("Erreur heures totales."); }

      try { const res = await getMoyenneHeuresParEnseignant(); setMoyenne(res.data); }
      catch { toast.error("Erreur moyenne."); }

      try { const res = await getTauxDepassement(); setTauxDepassement(res.data); }
      catch { toast.error("Erreur taux dépassement."); }

      try { const res = await getHeuresParMois(); setHeuresParMois(res.data); }
      catch { toast.error("Erreur heures par mois."); }

      try { const res = await getRepartitionHeures(); setRepartition(res.data); }
      catch { toast.error("Erreur répartition."); }

      try { const res = await getHeuresParDepartement(); setHeuresDept(res.data); }
      catch { toast.error("Erreur départements."); }

      try { const res = await getTop5Enseignants(); setTop5(res.data); }
      catch { toast.error("Erreur top 5."); }

      try { const res = await getRecapEnseignants(); setRecapEnseignants(res.data); }
      catch { toast.error("Erreur récapitulatif."); }

      setLoading(false);
    };
    init();
  }, [navigate]);

  return (
    <div className="bg-[#000814] min-h-screen">
      <SidebarRH isOpen={isOpen} onClose={() => setIsOpen(false)} role="rh" />
      <Navbar onMenuClick={() => setIsOpen(!isOpen)} userName="Aminata Koné" userRole="Responsable RH" />

      <main className="md:ml-57.5 pt-16 p-6 transition-all duration-300 min-h-screen">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#0097FB] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
        
        {/* EN-TÊTE */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-white">Statistiques</h1>
            <p className="text-[#7A8FAD] text-sm mt-1">Analyse et suivi des heures · Lecture seule</p>
          </div>    
          <div className="bg-[#7B2FBE]/15 border border-[#7B2FBE]/30 text-[#7B2FBE] text-[13px] font-bold py-1.5 px-4 rounded-full flex items-center gap-2">
            <MdSupervisorAccount size={16} />
            <span>RH</span>
          </div>
        </div>

        {/* SÉLECTEUR PÉRIODE */}
        <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <MdFilterList className="text-[#0097FB] text-lg" />
            <span className="text-white text-sm font-medium">Période d'analyse :</span>
            
            <select 
              value={selectedAnnee} onChange={(e) => setAnnee(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-lg py-2 px-3.5 text-[13px] min-w-35 outline-none focus:border-[#0097FB] cursor-pointer"
            >
              {anneesOptions.map(a => <option key={a} value={a} className="bg-[#0D1B2A]">{a}</option>)}
            </select>

            <select 
              value={selectedMois} onChange={(e) => setMois(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-lg py-2 px-3.5 text-[13px] min-w-40 outline-none focus:border-[#0097FB] cursor-pointer"
            >
              {moisOptions.map(m => <option key={m} value={m} className="bg-[#0D1B2A]">{m}</option>)}
            </select>

            <div className="sm:ml-auto bg-[#0097FB]/10 border border-[#0097FB]/20 rounded-lg px-4 py-1.5 text-[#0097FB] text-[13px] font-medium">
              Affichage : {selectedAnnee} · {selectedMois}
            </div>
          </div>
        </div>

        {/* SECTION 1 — KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MdAccessTime className="text-[#0097FB]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Heures effectuées</span>
            </div>
            <div className="text-white text-[28px] font-bold">{formatHeures(totalHeures)}</div>
            <div className="text-[#7A8FAD] text-[12px]">Sur l'année {selectedAnnee}</div>
            <div className="mt-3 w-full bg-white/5 h-[3px] rounded-full overflow-hidden">
              <div className="bg-[#0097FB] h-full rounded-full" style={{ width: '88%' }}></div>
            </div>
          </div>

          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MdPeople className="text-[#0097FB]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Moyenne / enseignant</span>
            </div>
            <div className="text-white text-[28px] font-bold">{formatHeures(moyenne.moyenne_heures)}</div>
            <div className="flex items-center gap-1.5 mt-2 text-[#7A8FAD] text-[12px]">
              <MdPeople size={14} />
              <span>{moyenne.total_enseignants} enseignants</span>
            </div>
          </div>

          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MdWarning className="text-[#EF4444]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Taux dépassement</span>
            </div>
            <div className="text-[#EF4444] text-[28px] font-bold">{tauxDepassement.taux_depassement}%</div>
            <div className="text-[#7A8FAD] text-[12px]">{tauxDepassement.nb_depassement} enseignants en dépassement</div>
            {tauxDepassement.nb_depassement > 0 && (
              <div className="mt-2 inline-block bg-[#EF4444]/12 text-[#EF4444] text-[11px] px-2 py-0.5 rounded-full">
                Attention
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2 — GRAPHIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
          {/* Évolution Mensuelle */}
          <div className="lg:col-span-2 bg-[#0D1B2A] border border-white/5 p-5 rounded-xl min-h-[300px]">
            <div className="mb-4">
              <h4 className="text-white text-[15px] font-semibold">Évolution mensuelle des heures</h4>
              <p className="text-[#7A8FAD] text-[13px]">Heures totales saisies par mois · {selectedAnnee}</p>
            </div>
            <div className="h-[220px]">
              <Line data={evolutionData} options={chartOptions} />
            </div>
          </div>

          {/* Répartition Types */}
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl min-h-[340px] flex flex-col">
            <div className="mb-4">
              <h4 className="text-white text-[15px] font-semibold">Répartition CM / TD / TP</h4>
              <p className="text-[#7A8FAD] text-[13px]">Distribution globale des types d'heures</p>
            </div>
            <div className="relative h-[200px] flex-1">
              <Doughnut 
                data={doughnutData} 
                options={{ ...chartOptions, cutout: '62%', plugins: { legend: { position: 'right', labels: { color: '#7A8FAD', boxWidth: 10 } } } }} 
              />
              <div className="absolute top-[50%] left-[34%] transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-white text-base font-bold">
                  {formatHeures(repartition.reduce((acc, r) => acc + parseFloat(r.total_heures), 0))}
                </div>
                <div className="text-[#7A8FAD] text-[11px]">total</div>
              </div>
            </div>
            <div className="flex justify-around mt-4 pt-4 border-t border-white/5 text-[12px] text-[#7A8FAD]">
              {repartition.map((r, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <i className="w-2 h-2 rounded-full" style={{ backgroundColor: i === 0 ? "#0097FB" : i === 1 ? "#10B981" : "#F59E0B" }} />
                  {r.type} · {formatHeures(r.total_heures)}
                </span>
              ))}
            </div>
          </div>

          {/* Heures par Dept */}
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl min-h-[340px]">
            <div className="mb-4">
              <h4 className="text-white text-[15px] font-semibold">Heures par département</h4>
              <p className="text-[#7A8FAD] text-[13px]">Volume total par département</p>
            </div>
            <div className="h-[220px]">
              <Bar 
                data={deptData} 
                options={{ ...chartOptions, indexAxis: 'y', scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, grid: { display: false } } } }} 
              />
            </div>
          </div>

          {/* Top 5 Enseignants */}
          <div className="lg:col-span-2 bg-[#0D1B2A] border border-white/5 p-5 rounded-xl min-h-[300px]">
            <div className="mb-4">
              <h4 className="text-white text-[15px] font-semibold">Top 5 enseignants les plus chargés</h4>
              <p className="text-[#7A8FAD] text-[13px]">Comparaison heures effectuées vs prévues</p>
            </div>
            <div className="h-[220px]">
              <Bar 
                data={top5Data} 
                options={{ ...chartOptions, plugins: { legend: { display: true, labels: { color: '#7A8FAD', font: { size: 12 } } } } }} 
              />
            </div>
          </div>
        </div>

        {/* SECTION 3 — TABLEAU RÉCAPITULATIF */}
        <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2.5">
              <MdTableChart className="text-[#0097FB]" size={18} />
              <h2 className="text-white text-[15px] font-semibold">Récapitulatif par enseignant</h2>
            </div>
            <div className="bg-[#0097FB]/10 text-[#0097FB] text-[12px] px-3 py-1 rounded-full font-medium">
              {filteredRecap.length} enseignants
            </div>
          </div>

          {/* FILTRES TABLEAU */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[180px]">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8FAD] text-xl" />
              <input 
                type="text" placeholder="Rechercher un enseignant..."
                value={searchRecap} onChange={(e) => setSearchRecap(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all"
              />
            </div>
            <select 
              value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
              className="bg-[#0D1B2A] border border-white/10 text-white rounded-lg py-2 px-3 text-[13px] min-w-[180px] outline-none focus:border-[#0097FB] cursor-pointer"
            >
              {departements.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select 
              value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}
              className="bg-[#0D1B2A] border border-white/10 text-white rounded-lg py-2 px-3 text-[13px] min-w-40 outline-none focus:border-[#0097FB] cursor-pointer"
            >
              {statutsFiltres.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <p className="text-[#7A8FAD] text-[13px] mb-4">{filteredRecap.length} résultat(s)</p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="bg-white/[0.03] text-[#7A8FAD] text-[12px] uppercase tracking-wider text-left">
                  <th className="px-4 py-3 font-medium border-b border-white/5">Enseignant</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Département</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">CM</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">TD</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">TP</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Total effectué</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Volume prévu</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Écart</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecap.length > 0 ? (
                  filteredRecap.map((e, index) => {
                    return (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#7B2FBE]/15 text-[#7B2FBE] flex items-center justify-center text-[12px] font-bold">
                              {getInitials(`${e.prenom} ${e.nom}`)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white text-[13px] font-medium">{e.prenom} {e.nom}</span>
                              <span className="text-[#7A8FAD] text-[11px]">{e.departement}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#7A8FAD] text-[13px]">{e.dept}</td>
                        <td className="px-4 py-4 text-white text-[13px]">{formatHeures(e.heures_cm)}</td>
                        <td className="px-4 py-4 text-white text-[13px]">{formatHeures(e.heures_td)}</td>
                        <td className="px-4 py-4 text-white text-[13px]">{formatHeures(e.heures_tp)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-white text-[14px] font-bold">{formatHeures(e.total_heures_eq)}</span>
                        </td>
                        <td className="px-4 py-4 text-[#7A8FAD] text-[13px]">{formatHeures(e.volumhor)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {parseFloat(e.ecart) > 0 ? (
                            <span className="text-[#EF4444] font-semibold">+{formatHeures(e.ecart)}</span>
                          ) : parseFloat(e.ecart) < 0 ? (
                            <span className="text-[#10B981] font-semibold">{formatHeures(e.ecart)}</span>
                          ) : (
                            <span className="text-[#7A8FAD]">= 0H</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full w-fit ${
                            e.statut === "En règle" ? "bg-[#10B981]/12 text-[#10B981]" : 
                            e.statut === "Dépassement" ? "bg-[#EF4444]/12 text-[#EF4444]" : "bg-[#F59E0B]/12 text-[#F59E0B]"
                          }`}>
                            {e.statut === "Dépassement" && <MdWarning size={12} />}
                            {e.statut}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-[#7A8FAD]">
                        <MdSearchOff size={40} className="mb-2" />
                        <p className="text-white text-[15px] font-medium">Aucun enseignant trouvé</p>
                        <p className="text-[13px]">Modifiez vos filtres</p>
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

export default DashboardRHStatistique;