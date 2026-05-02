import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { MdPeople, MdAccessTime, MdAttachMoney, MdWarning } from 'react-icons/md';
import { deconnexion, verifierAuthentification } from '../../fonctions/utilisateur';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  getTotalUtilisateurs, 
  getTotalHeures, 
  getCoutTotalHeures,
  getEnseignantsEnDepassement, 
  getHeuresParMois, 
  getHeuresParDepartement, 
  getRepartitionHeures,
  getDerniersJournaux 
} from '../../fonctions/Stats.jsx';


// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

// Variants pour les animations en cascade
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const DashboardMain = () => {
  const [totalUsers, setTotalUsers] = useState(null);
  const [totalHeures, setTotalHeures] = useState(null);
  const [coutTotal, setCoutTotal] = useState(null);
  const [depassements, setDepassements] = useState([]);
  const [heuresParMois, setHeuresParMois] = useState([]);
  const [heuresParDept, setHeuresParDept] = useState([]);
  const [repartition, setRepartition] = useState([]);
  const [journaux, setJournaux] = useState([]);

  const navigate = useNavigate();

  // Définition des KPIs dynamiques
  const kpiData = [
    { id: 1, label: "Enseignants", value: totalUsers?.total ?? "...", sub: "Enregistrés", icon: MdPeople, color: "#0097FB" },
    { id: 2, label: "Heures totales", value: `${totalHeures?.total_heures ?? "..."}H`, sub: "Effectuées", icon: MdAccessTime, color: "#0097FB" },
    { id: 3, label: "Coût total", value: `${coutTotal?.cout_global?.toLocaleString('fr-FR') ?? "..."} FCFA`, sub: "Global", icon: MdAttachMoney, color: "#0097FB" },
    { id: 4, label: "Dépassements", value: depassements?.length ?? "...", sub: "Détectés", icon: MdWarning, color: "#EF4444" },
  ];

  // Configuration Graphique Line
  const lineData = {
    labels: heuresParMois?.map(m => m.mois) ?? [],
    datasets: [{
      fill: true,
      label: 'Heures',
      data: heuresParMois?.map(m => m.total_heures) ?? [],
      borderColor: '#0097FB',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(0, 151, 251, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 151, 251, 0)');
        return gradient;
      },
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#0097FB',
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#7A8FAD' } },
      x: { grid: { display: false }, ticks: { color: '#7A8FAD' } }
    }
  };

  // Configuration Doughnut
  const doughnutData = {
    labels: ['CM', 'TD', 'TP'],
    datasets: [{      data: [
        parseFloat(repartition.find(r => r.type === 'CM')?.total_heures ?? 0),
        parseFloat(repartition.find(r => r.type === 'TD')?.total_heures ?? 0),
        parseFloat(repartition.find(r => r.type === 'TP')?.total_heures ?? 0)
      ],
      backgroundColor: ['#0097FB', '#EF4444', '#10B981'],
      borderWidth: 0,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#7A8FAD', font: { size: 12 }, padding: 20 }
      }
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

      const fetchStats = async () => {
        try {
          const [u, h, c, dep, mois, dept, rep, logs] = await Promise.allSettled([
            getTotalUtilisateurs(),
            getTotalHeures(),
            getCoutTotalHeures(),
            getEnseignantsEnDepassement(),
            getHeuresParMois(),
            getHeuresParDepartement(),
            getRepartitionHeures(),
            getDerniersJournaux(),
          ]);

          if (u.status === 'fulfilled') setTotalUsers(u.value.data);
          if (h.status === 'fulfilled') setTotalHeures(h.value.data);
          if (c.status === 'fulfilled') setCoutTotal(c.value.data);
          if (dep.status === 'fulfilled') setDepassements(dep.value.data ?? []);
          if (mois.status === 'fulfilled') setHeuresParMois(mois.value.data ?? []);
          if (dept.status === 'fulfilled') setHeuresParDept(dept.value.data ?? []);
          if (rep.status === 'fulfilled') setRepartition(rep.value.data ?? []);
          if (logs.status === 'fulfilled') setJournaux(logs.value.data ?? []);

        } catch (error) {
          console.error("Erreur fetchStats :", error);
        }
      };

    fetchUserData();
      fetchStats()
  },[]);
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-8 p-4 md:p-6 bg-[#000814] min-h-full"
    >
      
      {/* SECTION 1 — KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((kpi) => (
          <motion.div 
            key={kpi.id} 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl flex flex-col gap-2 shadow-sm cursor-default"
          >
            <div className="flex items-center justify-between">
              <kpi.icon className="text-2xl" style={{ color: kpi.color }} />
              <span className="text-[#7A8FAD] text-[13px]">{kpi.label}</span> 
            </div>
            <h3 className="text-2xl font-bold text-white font-['JetBrains_Mono'] tracking-tighter">{kpi.value}</h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[#7A8FAD] text-[12px] opacity-70">↑ {kpi.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* SECTION 2 — GRAPHIQUES */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Card 1: Line Chart (Wide) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-[#0D1B2A] border border-white/5 p-5 rounded-xl min-h-75 flex flex-col"
        >
          <h4 className="text-[15px] font-semibold text-white mb-4">Heures par mois</h4>
          <div className="flex-1">
            <Line data={lineData} options={lineOptions} />
          </div>
        </motion.div>

        {/* Card 2: Progress Bars */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl min-h-75"
        >
          <h4 className="text-[15px] font-semibold text-white mb-6">Heures par département</h4>
          <div className="space-y-5">
            {heuresParDept?.map((item, idx) => {
              const maxHeuresDept = Math.max(...heuresParDept.map(x => parseFloat(x.total_heures) || 0));
              return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#7A8FAD]">{item.departement}</span>
                  <span className="text-white font-medium font-['JetBrains_Mono']">{parseFloat(item.total_heures)}H</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0097FB] h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(parseFloat(item.total_heures) / maxHeuresDept) * 100}%` }}
                  />
                </div>
              </div>
            )})};
          </div>
        </motion.div>

        {/* Card 3: Doughnut */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl min-h-75 flex flex-col"
        >
          <h4 className="text-[15px] font-semibold text-white mb-4">Répartition des heures</h4>
          <div className="flex-1">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </motion.div>
      </div>

      {/* SECTION 3 — TABLEAUX & LISTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Journal des logs */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#0A1628] border border-white/5 p-5 rounded-xl"
        >
          <h4 className="text-xl font-bold text-white mb-5">Journal des logs</h4>
          <div className="space-y-0">
            {journaux?.map((log, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0"
              >
                <span className="text-[#0097FB] font-mono text-[12px] shrink-0">{new Date(log.created_at).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</span>
                <span className="text-[#7A8FAD] text-[11px] shrink-0 hidden sm:block">{new Date(log.created_at).toLocaleDateString('fr-FR')}</span>
                <span className="text-white text-[13px] truncate">{log.description}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enseignants en dépassement */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#0A1628] border border-white/5 p-5 rounded-xl"
        >
          <h4 className="text-xl font-bold text-white mb-5">Enseignants en dépassement</h4>
          <div className="space-y-0">
            {depassements?.map((ens, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[#7A8FAD] font-medium text-sm">{idx + 1}</span>
                  <div>
                    <p className="text-white text-[14px] font-medium">{ens.nom}</p>
                    <p className="text-[#7A8FAD] text-[12px]">{ens.departement ?? ens.dept}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold text-sm font-['JetBrains_Mono']">{ens.total_heures ?? ens.heures}H</span>
                  <span 
                    className="px-2 py-1 rounded-md text-[11px] font-bold shadow-sm font-['JetBrains_Mono']"
                    style={{ backgroundColor: `${ens.color ?? '#EF4444'}15`, color: ens.color ?? '#EF4444', border: `1px solid ${ens.color ?? '#EF4444'}30` }}
                  >
                    +{ens.heures_depassement ?? ens.depassement ?? 0}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default DashboardMain;
