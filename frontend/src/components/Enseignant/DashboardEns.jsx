import React, { useState } from 'react';
import SidebarEnseignant from '../../components/Enseignant/SidebarEnseignant';
import Navbar from '../../components/Navbar';
import {
  MdAccessTime,
  MdPieChart,
  MdAttachMoney,
  MdWarning,
  MdCheckCircle,
  MdCalendarToday,
  MdHistory,
  MdPending
} from 'react-icons/md';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
  Filler
);

const enseignant = {
  nom: "Jean François",
  code: "ENS-001",
  grade: "Maître de conférence",
  dept: "Informatique",
  type: "Permanent",
  tauxHoraire: 5000,
  prevues: 192,
  annee: "2025-2026",
};

const moisCourant = "Mars 2026";

const statsPersonnelles = {
  cmTotal: 120,
  tdTotal: 90,
  tpTotal: 68,
  validees: 248,
  enAttente: 30,
  rejetees: 0,
};

const evolutionMensuelle = {
  labels: ["Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar"],
  cm: [18, 22, 20, 8, 24, 20, 8],
  td: [12, 16, 14, 4, 18, 16, 10],
  tp: [8, 10, 10, 2, 12, 10, 16],
};

const dernieresSeances = [
  { id: 1, matiere: "Algorithmique", type: "CM", duree: 3, date: "28/03/2026", salle: "Amphi A", statut: "Validé" },
  { id: 2, matiere: "Base de données", type: "TD", duree: 2, date: "26/03/2026", salle: "Salle 10", statut: "Validé" },
  { id: 3, matiere: "Algorithmique", type: "CM", duree: 4, date: "24/03/2026", salle: "Amphi A", statut: "En attente" },
  { id: 4, matiere: "Base de données", type: "TP", duree: 2, date: "22/03/2026", salle: "Labo 1", statut: "Validé" },
  { id: 5, matiere: "Algorithmique", type: "TD", duree: 2, date: "20/03/2026", salle: "Salle 08", statut: "Validé" },
];

const matieres = [
  { nom: "Algorithmique", cm: 80, td: 40, tp: 28, total: 148 },
  { nom: "Base de données", cm: 40, td: 50, tp: 40, total: 130 },
];

const DashboardEns = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Calculs dérivés
  const totalEffectue = statsPersonnelles.cmTotal + statsPersonnelles.tdTotal + statsPersonnelles.tpTotal;
  const depassement = Math.max(0, totalEffectue - enseignant.prevues);
  const progression = Math.min((totalEffectue / enseignant.prevues) * 100, 100);
  
  const montant = (statsPersonnelles.cmTotal * enseignant.tauxHoraire * 1) + 
                  (statsPersonnelles.tdTotal * enseignant.tauxHoraire * 1.5) + 
                  (statsPersonnelles.tpTotal * enseignant.tauxHoraire * 2);

  // Configuration Graphique Evolution (Line)
  const evolutionData = {
    labels: evolutionMensuelle.labels,
    datasets: [
      { label: "CM", data: evolutionMensuelle.cm, borderColor: "#0097FB", pointBackgroundColor: "#0097FB", tension: 0.4, fill: false, pointRadius: 4 },
      { label: "TD", data: evolutionMensuelle.td, borderColor: "#10B981", pointBackgroundColor: "#10B981", tension: 0.4, fill: false, pointRadius: 4 },
      { label: "TP", data: evolutionMensuelle.tp, borderColor: "#F59E0B", pointBackgroundColor: "#F59E0B", tension: 0.4, fill: false, pointRadius: 4 },
    ],
  };

  // Configuration Graphique Statut (Doughnut)
  const statusData = {
    labels: ["Validées", "En attente", "Rejetées"],
    datasets: [{
      data: [statsPersonnelles.validees, statsPersonnelles.enAttente, statsPersonnelles.rejetees],
      backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
      hoverOffset: 4,
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#7A8FAD", font: { size: 12 }, boxWidth: 12, padding: 16 } }
    },
    scales: {
      x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#7A8FAD", font: { size: 11 } } },
      y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#7A8FAD", font: { size: 11 } } },
    }
  };

  return (
    <div className="bg-[#000814] min-h-screen font-['Inter']">
      <SidebarEnseignant isOpen={isOpen} onClose={() => setIsOpen(false)} role="enseignant" />
      <Navbar onMenuClick={() => setIsOpen(!isOpen)} userName="Jean François" userRole="Enseignant" />

      <main className="md:ml-[230px] pt-[64px] p-6 transition-all duration-300">
        
        {/* EN-TÊTE DE PAGE */}
        <div className="bg-gradient-to-br from-[#10B981]/[0.08] to-[#0097FB]/[0.05] border border-[#10B981]/15 p-6 rounded-[14px] mb-[28px] flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center text-white text-[20px] font-bold">
              JF
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-white text-[22px] font-bold">Bonjour, {enseignant.nom} 👋</h1>
              <div className="flex gap-2 flex-wrap mt-1">
                <span className="bg-white/8 text-[#94A3B8] text-[12px] px-2.5 py-0.5 rounded-full">{enseignant.code}</span>
                <span className="bg-[#0097FB]/12 text-[#0097FB] text-[12px] px-2.5 py-0.5 rounded-full">{enseignant.grade}</span>
                <span className="bg-[#10B981]/12 text-[#10B981] text-[12px] px-2.5 py-0.5 rounded-full">{enseignant.dept}</span>
                <span className="bg-[#7B2FBE]/12 text-[#7B2FBE] text-[12px] px-2.5 py-0.5 rounded-full">{enseignant.type}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[#7A8FAD] text-[13px]">Année {enseignant.annee}</span>
            <div className="bg-[#0097FB]/10 border border-[#0097FB]/20 text-[#0097FB] text-[13px] font-medium px-3.5 py-1.5 rounded-full flex items-center gap-2">
              <MdCalendarToday size={14} />
              {moisCourant}
            </div>
            <span className="text-[#7A8FAD] text-[12px]">{enseignant.tauxHoraire.toLocaleString('fr-FR')} FCFA/H</span>
          </div>
        </div>

        {/* SECTION 1 — KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-[28px]">
          {/* Card 1: Heures effectuées */}
          <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <MdAccessTime className="text-[#10B981]" size={20} />
                <span className="text-[#7A8FAD] text-[13px]">Heures effectuées</span>
              </div>
            </div>
            <div className="text-white text-[28px] font-bold mt-2">{totalEffectue}H</div>
            <div className="mt-3 h-1.5 bg-white/6 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${totalEffectue <= enseignant.prevues ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}
                style={{ width: `${progression}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[#7A8FAD] text-[11px]">{totalEffectue}H / {enseignant.prevues}H</span>
              <span className="text-white text-[11px] font-semibold">{progression.toFixed(0)}%</span>
            </div>
          </div>

          {/* Card 2: Répartition */}
          <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MdPieChart className="text-[#0097FB]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Mes heures par type</span>
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="bg-[#0097FB]/12 text-[#0097FB] px-2 py-0.5 rounded font-bold">CM</span>
                <span className="text-white text-[13px] font-semibold">{statsPersonnelles.cmTotal}H</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="bg-[#10B981]/12 text-[#10B981] px-2 py-0.5 rounded font-bold">TD</span>
                <span className="text-white text-[13px] font-semibold">{statsPersonnelles.tdTotal}H</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="bg-[#F59E0B]/12 text-[#F59E0B] px-2 py-0.5 rounded font-bold">TP</span>
                <span className="text-white text-[13px] font-semibold">{statsPersonnelles.tpTotal}H</span>
              </div>
            </div>
            <div className="flex h-1.5 w-full rounded-full overflow-hidden mt-3 gap-[2px]">
              <div className="bg-[#0097FB]" style={{ width: `${(statsPersonnelles.cmTotal/totalEffectue)*100}%` }} />
              <div className="bg-[#10B981]" style={{ width: `${(statsPersonnelles.tdTotal/totalEffectue)*100}%` }} />
              <div className="bg-[#F59E0B]" style={{ width: `${(statsPersonnelles.tpTotal/totalEffectue)*100}%` }} />
            </div>
          </div>

          {/* Card 3: Montant estimé */}
          <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MdAttachMoney className="text-[#10B981]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Rémunération estimée</span>
            </div>
            <div className="text-[#10B981] text-[18px] font-bold mt-2">
              {montant.toLocaleString('fr-FR')} FCFA
            </div>
            <div className="text-[#7A8FAD] text-[12px] mt-1.5">{enseignant.tauxHoraire.toLocaleString('fr-FR')} FCFA/H</div>
            <p className="text-[#3D5068] text-[11px] italic mt-2">* Estimation avant validation finale</p>
          </div>

          {/* Card 4: Dépassement / Statut */}
          <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl">
            {depassement > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <MdWarning className="text-[#EF4444]" size={20} />
                  <span className="text-[#7A8FAD] text-[13px]">Dépassement détecté</span>
                </div>
                <div className="text-[#EF4444] text-[28px] font-bold mt-2">+{depassement}H</div>
                <div className="text-[#7A8FAD] text-[12px] mt-1">Au-delà des {enseignant.prevues}H prévues</div>
                <div className="inline-block bg-[#EF4444]/12 text-[#EF4444] text-[11px] px-2 py-0.5 rounded-full mt-2">À régulariser</div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <MdCheckCircle className="text-[#10B981]" size={20} />
                  <span className="text-[#7A8FAD] text-[13px]">Volume horaire</span>
                </div>
                <div className="text-[#10B981] text-[22px] font-bold mt-2">En règle ✓</div>
                <div className="text-[#7A8FAD] text-[12px] mt-1">{enseignant.prevues - totalEffectue}H restantes</div>
                <div className="inline-block bg-[#10B981]/12 text-[#10B981] text-[11px] px-2 py-0.5 rounded-full mt-2">Dans les limites</div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 2 — GRAPHIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[28px]">
          {/* Graphique 1: Evolution (Large) */}
          <div className="lg:col-span-2 bg-[#0D1B2A] border border-white/6 p-5 rounded-xl">
            <h4 className="text-white text-[15px] font-semibold">Évolution de mes heures</h4>
            <p className="text-[#7A8FAD] text-[13px] mb-4">CM, TD et TP par mois · {enseignant.annee}</p>
            <div className="h-[220px]">
              <Line data={evolutionData} options={chartOptions} />
            </div>
          </div>

          {/* Graphique 2: Par matière */}
          <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl flex flex-col">
            <h4 className="text-white text-[15px] font-semibold">Heures par matière</h4>
            <p className="text-[#7A8FAD] text-[13px] mb-4">Répartition par matière enseignée</p>
            <div className="flex flex-col gap-4">
              {matieres.map((mat, index) => (
                <div key={index} className={`${index !== matieres.length - 1 ? 'border-b border-white/6 pb-4' : ''}`}>
                  <div className="text-white text-[13px] font-medium mb-3">{mat.nom}</div>
                  <div className="space-y-2">
                    {/* Row CM */}
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-center text-[10px] font-bold py-0.5 rounded-full bg-[#0097FB]/12 text-[#0097FB]">CM</span>
                      <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
                        <div className="bg-[#0097FB] h-full" style={{ width: `${(mat.cm / mat.total) * 100}%` }} />
                      </div>
                      <span className="text-[#7A8FAD] text-[11px] w-8 text-right">{mat.cm}H</span>
                    </div>
                    {/* Row TD */}
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-center text-[10px] font-bold py-0.5 rounded-full bg-[#10B981]/12 text-[#10B981]">TD</span>
                      <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
                        <div className="bg-[#10B981] h-full" style={{ width: `${(mat.td / mat.total) * 100}%` }} />
                      </div>
                      <span className="text-[#7A8FAD] text-[11px] w-8 text-right">{mat.td}H</span>
                    </div>
                    {/* Row TP */}
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-center text-[10px] font-bold py-0.5 rounded-full bg-[#F59E0B]/12 text-[#F59E0B]">TP</span>
                      <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
                        <div className="bg-[#F59E0B] h-full" style={{ width: `${(mat.tp / mat.total) * 100}%` }} />
                      </div>
                      <span className="text-[#7A8FAD] text-[11px] w-8 text-right">{mat.tp}H</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Graphique 3: Statut */}
          <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl flex flex-col">
            <h4 className="text-white text-[15px] font-semibold">Statut de mes séances</h4>
            <p className="text-[#7A8FAD] text-[13px] mb-4">État de validation</p>
            <div className="h-[180px]">
              <Doughnut 
                data={statusData} 
                options={{ 
                  ...chartOptions, 
                  cutout: '65%',
                  plugins: { legend: { position: 'right', labels: { color: "#7A8FAD", font: { size: 12 }, boxWidth: 10 } } }
                }} 
              />
            </div>
            <div className="flex justify-around mt-[14px] text-[11px] text-[#7A8FAD]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                Validées · {statsPersonnelles.validees}H
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                En attente · {statsPersonnelles.enAttente}H
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                Rejetées · {statsPersonnelles.rejetees}H
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — TABLEAUX */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-[20px]">
          <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <MdHistory className="text-[#10B981]" size={18} />
                <h4 className="text-white text-[15px] font-semibold">Dernières séances</h4>
              </div>
              <button 
                onClick={() => console.log("navigate /enseignant/heures")}
                className="text-[#0097FB] text-[12px] font-medium hover:underline"
              >
                Voir tout →
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/3 text-[#7A8FAD] text-[12px] uppercase tracking-wider text-left border-b border-white/6">
                    <th className="px-4 py-3 font-medium">Matière</th>
                    <th className="px-4 py-3 font-medium text-center">Type</th>
                    <th className="px-4 py-3 font-medium text-center">Durée</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Salle</th>
                    <th className="px-4 py-3 font-medium text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {dernieresSeances.map((seance) => (
                    <tr key={seance.id} className="hover:bg-white/2 transition-all duration-150">
                      <td className="px-4 py-4 text-white text-[13px] font-medium">{seance.matiere}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          seance.type === "CM" ? 'bg-[#0097FB]/12 text-[#0097FB]' : 
                          seance.type === "TD" ? 'bg-[#10B981]/12 text-[#10B981]' : 'bg-[#F59E0B]/12 text-[#F59E0B]'
                        }`}>
                          {seance.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-white text-[13px] font-semibold">{seance.duree}</span>
                        <span className="text-[#7A8FAD] text-[12px] ml-0.5">H</span>
                      </td>
                      <td className="px-4 py-4 text-[#7A8FAD] text-[12px] whitespace-nowrap">{seance.date}</td>
                      <td className="px-4 py-4 text-[#7A8FAD] text-[13px]">{seance.salle}</td>
                      <td className="px-4 py-4">
                        <div className={`flex items-center justify-center gap-1.5 text-[11px] font-bold py-1 px-3 rounded-full mx-auto w-fit ${
                          seance.statut === "Validé" ? 'bg-[#10B981]/12 text-[#10B981]' : 'bg-[#F59E0B]/12 text-[#F59E0B]'
                        }`}>
                          {seance.statut === "Validé" ? <MdCheckCircle size={12} /> : <MdPending size={12} />}
                          {seance.statut}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardEns;