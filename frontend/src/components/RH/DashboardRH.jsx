import React, { useEffect, useState, useMemo } from 'react';
import SidebarRH from './SidebarRH';
import Navbar from '../Navbar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  MdPeople,
  MdWarning,
  MdSupervisorAccount,
  MdAccessTime,
} from 'react-icons/md';
import { deconnexion, verifierAuthentification } from '../../fonctions/utilisateur';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  getTotalHeures,
  getTotalUtilisateurs,
  getEnseignantsEnDepassement,
  getRepartitionHeures,
  getHeuresParDepartement
} from '../../fonctions/Stats';

// Enregistrement Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
);

const DashboardRH = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const getInitials = (name) => name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const [totalHeures, setTotalHeures] = useState("0");
  const [nbEnseignants, setNbEnseignants] = useState(0);
  const [depassements, setDepassements] = useState([]);
  const [repartition, setRepartition] = useState([]);
  const [heuresDept, setHeuresDept] = useState([]);

  // Définition des KPIs dynamiques
  const kpiData = useMemo(() => [
    { id: 1, label: "Heures saisies", value: `${totalHeures}H`, sub: "Total global", icon: MdAccessTime, color: "#0097FB" },
    { id: 2, label: "Enseignants traités", value: nbEnseignants, sub: "Actifs", icon: MdPeople, color: "#0097FB" },
    { id: 3, label: "Dépassements", value: depassements.length, sub: "Alertes", icon: MdWarning, color: "#EF4444" },
  ], [totalHeures, nbEnseignants, depassements]);

  // Config Doughnut
  const doughnutData = {
    labels: ["CM", "TD", "TP"],
    datasets: [{
      data: [
        parseFloat(repartition.find(r => r.type === 'CM')?.total_heures ?? 0),
        parseFloat(repartition.find(r => r.type === 'TD')?.total_heures ?? 0),
        parseFloat(repartition.find(r => r.type === 'TP')?.total_heures ?? 0)
      ],
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await verifierAuthentification();
        if(res.data.role !== "rh"){
          toast.error("Accès refusé. Redirection vers la page d'accueil.");
          await deconnexion()
          navigate("/")
        }
      } catch (error) {
        navigate("/")
        toast.error("Une erreur est survenue lors de la vérification de l'authentification.");
      }
    };

    const fetchStats = async () => {
      try {
        const res = await getTotalHeures();
        setTotalHeures(res.data.total_heures);
      } catch (e) { toast.error("Erreur heures totales."); }

      try {
        const res = await getTotalUtilisateurs();
        const enseignants = res.data.filter(u => u.role === "enseignant");
        setNbEnseignants(enseignants.length);
      } catch (e) { toast.error("Erreur utilisateurs."); }

      try {
        const res = await getEnseignantsEnDepassement();
        setDepassements(res.data);
      } catch (e) { toast.error("Erreur dépassements."); }

      try {
        const res = await getRepartitionHeures();
        setRepartition(res.data);
      } catch (e) { toast.error("Erreur répartition."); }

      try {
        const res = await getHeuresParDepartement();
        setHeuresDept(res.data);
      } catch (e) { toast.error("Erreur départements."); }
    };

    fetchUserData();
    fetchStats();
  }, []);

  // Calcul pour les barres de progression
  const totalHeuresSomme = heuresDept.reduce((acc, curr) => acc + parseFloat(curr.total_heures || 0), 0);
  const totalRepartitionHeures = repartition.reduce((acc, curr) => acc + parseFloat(curr.total_heures || 0), 0);

  return (
    <div className="bg-[#000814] min-h-screen">
      <SidebarRH isOpen={isOpen} onClose={() => setIsOpen(false)} role="rh" />
      <Navbar onMenuClick={() => setIsOpen(!isOpen)} userName="Aminata Koné" userRole="Responsable RH" />

      <main className="md:ml-[230px] pt-16 p-6 min-h-screen transition-all duration-300">
        {/* EN-TÊTE */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
          <div>
            <h1 className="text-2xl md:text-[26px] font-bold text-white">Tableau de bord RH</h1>
            <p className="text-[#7A8FAD] text-sm mt-1">Bienvenue, Aminata</p>
          </div>
          <div className="bg-[#7B2FBE]/15 border border-[#7B2FBE]/30 text-[#7B2FBE] text-[13px] font-bold py-1.5 px-4 rounded-full flex items-center gap-2">
            <MdSupervisorAccount size={16} />
            <span>RH</span>
          </div>
        </div>

        {/* SECTION 1 — KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.id} className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="text-2xl" style={{ color: kpi.color }} />
                  <span className="text-[#7A8FAD] text-[13px]">{kpi.label}</span>
                </div>
                <div className={`text-[28px] font-bold ${index === 2 ? 'text-[#EF4444]' : 'text-white'}`}>
                  {kpi.value}
                </div>
                <div className="text-[#7A8FAD] text-[12px]">{kpi.sub}</div>
                {index === 0 && (
                  <div className="mt-3 w-full bg-white/5 h-[3px] rounded-full overflow-hidden">
                    <div className="bg-[#0097FB] h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>
                )}
                {index === 2 && kpi.value > 0 && (
                  <div className="mt-2 inline-block bg-[#EF4444]/12 text-[#EF4444] text-[11px] font-bold px-2 py-0.5 rounded-full">
                    Attention requise
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SECTION 2 — GRAPHIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
          {/* Répartition */}
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl min-h-[280px] relative">
            <h4 className="text-white text-[15px] font-semibold mb-4">Répartition CM / TD / TP</h4>
            <div className="h-[200px]">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-white text-lg font-bold leading-tight">
                  {totalRepartitionHeures.toFixed(1)}H
                </div>
                <div className="text-[#7A8FAD] text-[11px]">total</div>
              </div>
            </div>
          </div>

          {/* Avancement Dept */}
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl min-h-[280px]">
            <h4 className="text-white text-[15px] font-semibold mb-2">Avancement par département</h4>
            <p className="text-[#7A8FAD] text-[13px] mb-5">Taux de saisie ce mois</p>
            <div className="space-y-5">
              {heuresDept.map((d, i) => {
                const percentage = totalHeuresSomme > 0 ? (parseFloat(d.total_heures) / totalHeuresSomme) * 100 : 0;
                let barColor = "#EF4444";
                if (percentage > 75) barColor = "#10B981";
                else if (percentage >= 40) barColor = "#F59E0B";

                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-white text-[13px] font-medium">{d.departement}</span>
                      <div className="flex gap-2">
                        <span className="text-white/40 text-[11px]">{parseFloat(d.total_heures).toFixed(1)}H</span>
                        <span className="text-white text-[13px] font-bold">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full">
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-in-out"
                        style={{ width: `${percentage}%`, backgroundColor: barColor }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 3 — DÉPASSEMENTS */}
        <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <MdWarning className="text-[#EF4444]" size={18} />
              <h4 className="text-white text-[15px] font-semibold">Dépassements</h4>
            </div>
            <div className="bg-[#EF4444]/12 text-[#EF4444] text-[12px] font-bold px-2.5 py-1 rounded-full">
              {depassements.length} détectés
            </div>
          </div>
          <div className="space-y-4">
            {depassements.length > 0 ? (
              depassements.map((e, i) => (
                <div key={i} className="pb-4 border-b border-white/[0.04] last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-white/5 text-[#7A8FAD] text-[12px] font-bold flex items-center justify-center rounded-full">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{e.nom} {e.prenom}</div>
                        <div className="text-[#7A8FAD] text-[12px]">{e.intitule}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-[13px] font-bold">{parseInt(e.total_heures_eq)}H / {parseInt(e.volumhor)}H</div>
                      <div className="text-[11px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 bg-[#EF4444]/12 text-[#EF4444] border border-[#EF4444]/20">
                        +{parseInt(e.heures_complementaires)}H sup.
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-600 ease-in-out" 
                      style={{ backgroundColor: '#EF4444', width: `${Math.min((e.total_heures_eq / e.volumhor) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#7A8FAD]">
                Aucun dépassement détecté
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardRH;