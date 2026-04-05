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
import { getAllUsers } from '../../fonctions/utilisateur';

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

const fakeData = {
  kpis: [
    { id: 1, label: "Enseignants", value: 102, sub: "ce mois", icon: MdPeople, color: "#0097FB" },
    { id: 2, label: "Heures totales", value: "44 598H", sub: "Effectués", icon: MdAccessTime, color: "#0097FB" },
    { id: 3, label: "Coût total", value: "14 587 353 FCFA", sub: "ce mois", icon: MdAttachMoney, color: "#0097FB" },
    { id: 4, label: "Dépassements", value: 42, sub: "Détecté ce mois", icon: MdWarning, color: "#EF4444" },
  ],
  heuresParMois: {
    labels: ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"],
    data: [3200, 4100, 3800, 4600, 5100, 4800, 5300, 4700, 5000, 4400, 4900, 5600],
  },
  heuresParDept: [
    { dept: "Informatique", heures: 1400, max: 1600 },
    { dept: "Droit", heures: 1400, max: 1600 },
    { dept: "Marketing", heures: 750, max: 1600 },
    { dept: "Comptabilité", heures: 800, max: 1600 },
  ],
  repartitionHeures: {
    CM: 45,
    TD: 35,
    TP: 20,
  },
  logs: [
    { time: "14:55", date: "28/03/2026", message: "Nouvel heure enregistré - Jean François" },
    { time: "08:12", date: "28/03/2026", message: "Modification des informations de Jean François" },
    { time: "10:24", date: "28/03/2026", message: "Modification des informations de Hervé Koffi" },
    { time: "15:31", date: "28/03/2026", message: "Suppression des heures de Kacou Grade" },
    { time: "09:45", date: "27/03/2026", message: "Nouvel enseignant ajouté - Bamba Sory" },
  ],
  depassements: [
    { rank: 1, nom: "Konan Charles", dept: "Informatique", heures: 192, depassement: 12, color: "#10B981" },
    { rank: 2, nom: "Konan Charles", dept: "Marketing", heures: 192, depassement: 75, color: "#EF4444" },
    { rank: 3, nom: "Moro Isaac", dept: "Droit", heures: 144, depassement: 4, color: "#F59E0B" },
  ],
};




const DashboardMain = () => {
  const [data,setData] = useState([])
  useEffect(()=>{
    const allUser= async()=>{
      try {
      const res = await getAllUsers();
      setData(res)
      console.log(res)
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
    }
    }
    allUser()
  },[])
  // Configuration Graphique Line
  const lineData = {
    labels: fakeData.heuresParMois.labels,
    datasets: [{
      fill: true,
      label: 'Heures',
      data: fakeData.heuresParMois.data,
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
    datasets: [{
      data: [fakeData.repartitionHeures.CM, fakeData.repartitionHeures.TD, fakeData.repartitionHeures.TP],
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

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-8 p-4 md:p-6 bg-[#000814] min-h-full"
    >
      
      {/* SECTION 1 — KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {fakeData.kpis.map((kpi) => (
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
            {fakeData.heuresParDept.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#7A8FAD]">{item.dept}</span>
                  <span className="text-white font-medium font-['JetBrains_Mono']">{item.heures}H</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0097FB] h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(item.heures / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
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
            {fakeData.logs.map((log, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0"
              >
                <span className="text-[#0097FB] font-mono text-[12px] shrink-0">{log.time}</span>
                <span className="text-[#7A8FAD] text-[11px] shrink-0 hidden sm:block">{log.date}</span>
                <span className="text-white text-[13px] truncate">{log.message}</span>
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
            {fakeData.depassements.map((ens, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[#7A8FAD] font-medium text-sm">{ens.rank}</span>
                  <div>
                    <p className="text-white text-[14px] font-medium">{ens.nom}</p>
                    <p className="text-[#7A8FAD] text-[12px]">{ens.dept}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold text-sm font-['JetBrains_Mono']">{ens.heures}H</span>
                  <span 
                    className="px-2 py-1 rounded-md text-[11px] font-bold shadow-sm font-['JetBrains_Mono']"
                    style={{ backgroundColor: `${ens.color}15`, color: ens.color, border: `1px solid ${ens.color}30` }}
                  >
                    +{ens.depassement}
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
