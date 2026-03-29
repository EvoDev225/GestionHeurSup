import React, { useState } from 'react';
import SidebarRH from './SidebarRH';
import Navbar from '../Navbar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  MdEditCalendar,
  MdPeople,
  MdPending,
  MdWarning,
  MdSupervisorAccount,
  MdHistory,
  MdCheckCircle,
} from 'react-icons/md';

// Enregistrement Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const currentMonth = "Mars 2026";

const kpiData = {
  heuresSaisies: { value: 1248, label: `Sur le mois de ${currentMonth}` },
  enseignantsTraites: { value: 87, total: 102, label: "sur 102 enseignants" },
  heuresEnAttente: { value: 34, label: "En attente de validation" },
  depassements: { value: 12, label: "Dépassements ce mois" },
};

const evolutionHebdo = {
  labels: ["Semaine 1", "Semaine 2", "Semaine 3", "Semaine 4"],
  data: [280, 410, 320, 238],
};

const repartitionTypes = { CM: 42, TD: 35, TP: 23 };

const avancementDepts = [
  { dept: "Informatique", fait: 92, total: 100 },
  { dept: "Droit", fait: 61, total: 100 },
  { dept: "Marketing", fait: 45, total: 100 },
  { dept: "Comptabilité", fait: 78, total: 100 },
];

const derniersSaisies = [
  { id: 1, enseignant: "Jean François", matiere: "Algorithmique", type: "CM", heures: 4, date: "28/03/2026", statut: "Validé" },
  { id: 2, enseignant: "Konan Charles", matiere: "Base de données", type: "TD", heures: 2, date: "28/03/2026", statut: "En attente" },
  { id: 3, enseignant: "Hervé Koffi", matiere: "Droit des affaires", type: "CM", heures: 3, date: "27/03/2026", statut: "Validé" },
  { id: 4, enseignant: "Moro Isaac", matiere: "Marketing digital", type: "TP", heures: 2, date: "27/03/2026", statut: "En attente" },
  { id: 5, enseignant: "Bamba Sory", matiere: "Comptabilité générale", type: "CM", heures: 4, date: "26/03/2026", statut: "Validé" },
];

const enseignantsDepassement = [
  { rank: 1, nom: "Konan Charles", dept: "Informatique", prevues: 192, effectuees: 248, depassement: 56, color: "#EF4444" },
  { rank: 2, nom: "Jean François", dept: "Informatique", prevues: 192, effectuees: 210, depassement: 18, color: "#F59E0B" },
  { rank: 3, nom: "Bamba Sory", dept: "Comptabilité", prevues: 192, effectuees: 198, depassement: 6, color: "#10B981" },
];

const DashboardRH = () => {
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (name) => name.split(" ").map((n) => n[0]).join("").toUpperCase();

  // Config Line Chart
  const lineData = {
    labels: evolutionHebdo.labels,
    datasets: [{
      label: "Heures saisies",
      data: evolutionHebdo.data,
      borderColor: "#7B2FBE",
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(123, 47, 190, 0.15)');
        gradient.addColorStop(1, 'rgba(123, 47, 190, 0)');
        return gradient;
      },
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: "#7B2FBE",
      fill: true,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: "rgba(255, 255, 255, 0.04)" }, ticks: { color: "#7A8FAD" } },
      y: { grid: { color: "rgba(255, 255, 255, 0.04)" }, ticks: { color: "#7A8FAD" } },
    },
  };

  // Config Doughnut
  const doughnutData = {
    labels: ["CM", "TD", "TP"],
    datasets: [{
      data: [repartitionTypes.CM, repartitionTypes.TD, repartitionTypes.TP],
      backgroundColor: ["#0097FB", "#EF4444", "#10B981"],
      borderWidth: 0,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: { position: "right", labels: { color: "#7A8FAD", font: { size: 12 }, boxWidth: 12 } },
    },
  };

  return (
    <div className="bg-[#000814] min-h-screen">
      <SidebarRH isOpen={isOpen} onClose={() => setIsOpen(false)} role="rh" />
      <Navbar onMenuClick={() => setIsOpen(!isOpen)} userName="Aminata Koné" userRole="Responsable RH" />

      <main className="md:ml-[230px] pt-16 p-6 min-h-screen transition-all duration-300">
        {/* EN-TÊTE */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
          <div>
            <h1 className="text-2xl md:text-[26px] font-bold text-white">Tableau de bord</h1>
            <p className="text-[#7A8FAD] text-sm mt-1">Bienvenue, Aminata · {currentMonth}</p>
          </div>
          <div className="bg-[#7B2FBE]/15 border border-[#7B2FBE]/30 text-[#7B2FBE] text-[13px] font-bold py-1.5 px-4 rounded-full flex items-center gap-2">
            <MdSupervisorAccount size={16} />
            <span>RH</span>
          </div>
        </div>

        {/* SECTION 1 — KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {/* Heures saisies */}
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MdEditCalendar className="text-[#0097FB]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Heures saisies</span>
            </div>
            <div className="text-white text-[28px] font-bold">{kpiData.heuresSaisies.value}H</div>
            <div className="text-[#7A8FAD] text-[12px]">{kpiData.heuresSaisies.label}</div>
            <div className="mt-3 w-full bg-white/5 h-[3px] rounded-full overflow-hidden">
              <div className="bg-[#0097FB] h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          {/* Enseignants traités */}
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MdPeople className="text-[#0097FB]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Enseignants traités</span>
            </div>
            <div className="text-white text-[28px] font-bold">{kpiData.enseignantsTraites.value}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="bg-white/5 h-1.5 rounded-full w-24 overflow-hidden">
                <div className="bg-[#0097FB] h-full" style={{ width: `${(kpiData.enseignantsTraites.value / kpiData.enseignantsTraites.total) * 100}%` }}></div>
              </div>
              <span className="text-[#7A8FAD] text-[12px]">{kpiData.enseignantsTraites.value} sur {kpiData.enseignantsTraites.total} enseignants</span>
            </div>
          </div>

          {/* En attente */}
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MdPending className="text-[#F59E0B]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">En attente</span>
            </div>
            <div className="text-[#F59E0B] text-[28px] font-bold">{kpiData.heuresEnAttente.value}</div>
            <div className="text-[#7A8FAD] text-[12px]">{kpiData.heuresEnAttente.label}</div>
            {kpiData.heuresEnAttente.value > 0 && (
              <div className="mt-2 inline-block bg-[#F59E0B]/12 text-[#F59E0B] text-[11px] font-bold px-2 py-0.5 rounded-full">À traiter</div>
            )}
          </div>

          {/* Dépassements */}
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MdWarning className="text-[#EF4444]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Dépassements</span>
            </div>
            <div className="text-[#EF4444] text-[28px] font-bold">{kpiData.depassements.value}</div>
            <div className="text-[#7A8FAD] text-[12px]">{kpiData.depassements.label}</div>
            {kpiData.depassements.value > 0 && (
              <div className="mt-2 inline-block bg-[#EF4444]/12 text-[#EF4444] text-[11px] font-bold px-2 py-0.5 rounded-full">Attention requise</div>
            )}
          </div>
        </div>

        {/* SECTION 2 — GRAPHIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-7">
          {/* Évolution */}
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl min-h-[280px]">
            <h4 className="text-white text-[15px] font-semibold mb-4">Évolution des saisies — {currentMonth}</h4>
            <div className="h-[200px]">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>

          {/* Répartition */}
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl min-h-[280px] relative">
            <h4 className="text-white text-[15px] font-semibold mb-4">Répartition CM / TD / TP</h4>
            <div className="h-[200px]">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute top-[58%] left-[34%] transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-white text-lg font-bold leading-tight">{repartitionTypes.CM + repartitionTypes.TD + repartitionTypes.TP}%</div>
                <div className="text-[#7A8FAD] text-[11px]">total</div>
              </div>
            </div>
          </div>

          {/* Avancement Dept */}
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl min-h-[280px]">
            <h4 className="text-white text-[15px] font-semibold mb-2">Avancement par département</h4>
            <p className="text-[#7A8FAD] text-[13px] mb-5">Taux de saisie ce mois</p>
            <div className="space-y-4">
              {avancementDepts.map((d, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-white text-[13px] font-medium">{d.dept}</span>
                    <span className="text-white text-[13px] font-bold">{d.fait}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-in-out ${d.fait >= 80 ? 'bg-[#10B981]' : d.fait >= 50 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'}`}
                      style={{ width: `${d.fait}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3 — TABLEAUX */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Dernières saisies */}
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <MdHistory className="text-[#0097FB]" size={18} />
                <h4 className="text-white text-[15px] font-semibold">Dernières saisies</h4>
              </div>
              <button className="text-[#0097FB] text-[12px] font-medium hover:underline" onClick={() => console.log("navigate /rh/heures")}>Voir tout →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px] border-collapse">
                <thead className="bg-white/[0.03] text-[#7A8FAD] text-[12px] uppercase text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium border-b border-white/5">Enseignant</th>
                    <th className="px-4 py-3 font-medium border-b border-white/5">Matière</th>
                    <th className="px-4 py-3 font-medium border-b border-white/5 text-center">Type</th>
                    <th className="px-4 py-3 font-medium border-b border-white/5 text-center">Heures</th>
                    <th className="px-4 py-3 font-medium border-b border-white/5">Statut</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {derniersSaisies.map((s) => (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-[30px] h-[30px] bg-[#7B2FBE]/15 text-[#7B2FBE] flex items-center justify-center rounded-full text-[11px] font-bold">{getInitials(s.enseignant)}</div>
                          <span className="text-[13px] truncate">{s.enseignant}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[#7A8FAD] text-[13px] truncate max-w-[120px]">{s.matiere}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          s.type === "CM" ? 'bg-[#0097FB]/12 text-[#0097FB]' : s.type === "TD" ? 'bg-[#10B981]/12 text-[#10B981]' : 'bg-[#F59E0B]/12 text-[#F59E0B]'
                        }`}>{s.type}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-[13px] font-bold">
                        {s.heures}<span className="text-[#7A8FAD] font-normal ml-0.5">H</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full w-fit ${
                          s.statut === "Validé" ? 'bg-[#10B981]/12 text-[#10B981]' : 'bg-[#F59E0B]/12 text-[#F59E0B]'
                        }`}>
                          {s.statut === "Validé" ? <MdCheckCircle size={12}/> : <MdPending size={12}/>}
                          {s.statut}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dépassements */}
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <MdWarning className="text-[#EF4444]" size={18} />
                <h4 className="text-white text-[15px] font-semibold">Dépassements</h4>
              </div>
              <div className="bg-[#EF4444]/12 text-[#EF4444] text-[12px] font-bold px-2.5 py-1 rounded-full">{enseignantsDepassement.length} détectés</div>
            </div>
            <div className="space-y-4">
              {enseignantsDepassement.map((e, i) => (
                <div key={i} className="pb-4 border-b border-white/[0.04] last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-white/5 text-[#7A8FAD] text-[12px] font-bold flex items-center justify-center rounded-full">{e.rank}</div>
                      <div>
                        <div className="text-white text-sm font-medium">{e.nom}</div>
                        <div className="text-[#7A8FAD] text-[12px]">{e.dept}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-[13px] font-bold">{e.effectuees}H / {e.prevues}H</div>
                      <div className="text-[11px] font-bold px-2 py-0.5 rounded-full inline-block mt-1" style={{ backgroundColor: `${e.color}20`, color: e.color }}>
                        +{e.depassement}H
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-600 ease-in-out" 
                      style={{ backgroundColor: e.color, width: `${Math.min((e.effectuees / e.prevues) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardRH;