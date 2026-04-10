import React, { useState, useEffect } from 'react';
import {
  MdPerson,
  MdAccessTime,
  MdAttachMoney,
  MdWarning,
  MdCalendarToday,
  MdBarChart,
  MdBook,
  MdHistory,
  MdSearchOff,
  MdHourglassEmpty,
  MdCheckCircle,
  MdError,
  MdRefresh
} from 'react-icons/md';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import SidebarEnseignant from './SidebarEnseignant';
import Navbar from '../Navbar';
import { deconnexion, verifierAuthentification } from '../../fonctions/Utilisateur';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  getHeuresEnseignant,
  getRemunerationEnseignant,
  getHeuresParMoisEnseignant,
  getHeuresParMatiereEnseignant,
  getDernieresSeancesEnseignant
} from '../../fonctions/Stats';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#7A8FAD',
        font: {
          size: 12,
          family: 'Inter'
        }
      }
    },
    tooltip: {
      backgroundColor: '#0D1B2A',
      titleColor: '#FFFFFF',
      bodyColor: '#E0E6ED',
      borderColor: '#1E2D3D',
      borderWidth: 1,
      cornerRadius: 4,
      titleFont: {
        size: 14,
        family: 'Inter',
        weight: 'bold'
      },
      bodyFont: {
        size: 12,
        family: 'Inter'
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#7A8FAD',
        font: {
          size: 11,
          family: 'Inter'
        }
      },
      grid: {
        color: '#1E2D3D',
        borderColor: '#1E2D3D'
      }
    },
    y: {
      ticks: {
        color: '#7A8FAD',
        font: {
          size: 11,
          family: 'Inter'
        }
      },
      grid: {
        color: '#1E2D3D',
        borderColor: '#1E2D3D'
      }
    }
  }
};

const DashboardEns = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [heures, setHeures] = useState(null);
  const [remuneration, setRemuneration] = useState(null);
  const [heuresParMois, setHeuresParMois] = useState([]);
  const [heuresParMatiere, setHeuresParMatiere] = useState([]);
  const [dernieresSeances, setDernieresSeances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const authRes = await verifierAuthentification();
        if (authRes.data.role !== "enseignant") {
          toast.error("Accès refusé. Redirection vers la page d'accueil.");
          await deconnexion();
          navigate("/");
          return;
        }
        setUser(authRes.data);
        const idens = authRes.data.idens;

        if (idens) {
          const [r1, r2, r3, r4, r5] = await Promise.all([
            getHeuresEnseignant(idens),
            getRemunerationEnseignant(idens),
            getHeuresParMoisEnseignant(idens),
            getHeuresParMatiereEnseignant(idens),
            getDernieresSeancesEnseignant(idens)
          ]);
          setHeures(r1.data);
          setRemuneration(r2.data);
          setHeuresParMois(r3.data);
          setHeuresParMatiere(r4.data);
          setDernieresSeances(r5.data);
        } else {
          toast.error("ID enseignant non trouvé.");
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation du tableau de bord:", error);
        toast.error(error.message || "Une erreur est survenue lors du chargement des données.");
         
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [navigate]);

  // Derived calculations
  const heures_cm = parseFloat(heures?.heures_cm || 0);
  const heures_td = parseFloat(heures?.heures_td || 0);
  const heures_tp = parseFloat(heures?.heures_tp || 0);
  const totalEffectue = parseFloat(heures?.total_heures_eq || 0);
  const volumhor = parseFloat(heures?.volumhor || 0);
  const depassement = Math.max(0, totalEffectue - volumhor);
  const progression = volumhor > 0 ? Math.min((totalEffectue / volumhor) * 100, 100) : 0;
  const montant = parseFloat(remuneration?.remuneration_estimee || 0);
  const tauxh = parseFloat(user?.tauxh || 0);

  const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "??";

  const formatHeures = (valeur) => {
    const total = parseFloat(valeur || 0);
    const h = Math.floor(total);
    const min = Math.round((total - h) * 60);
    return `${h}H${min.toString().padStart(2, '0')}`;
  };

  const evolutionData = {
    labels: heuresParMois.map(m => m.nom_mois.substring(0, 3)),
    datasets: [
      { label: "CM", data: heuresParMois.map(m => parseFloat(m.heures_cm)), borderColor: "#0097FB", pointBackgroundColor: "#0097FB", tension: 0.4, fill: false, pointRadius: 4 },
      { label: "TD", data: heuresParMois.map(m => parseFloat(m.heures_td)), borderColor: "#10B981", pointBackgroundColor: "#10B981", tension: 0.4, fill: false, pointRadius: 4 },
      { label: "TP", data: heuresParMois.map(m => parseFloat(m.heures_tp)), borderColor: "#F59E0B", pointBackgroundColor: "#F59E0B", tension: 0.4, fill: false, pointRadius: 4 },
    ],
  };

  return (
    <div className="min-h-screen bg-[#000814]">
      <SidebarEnseignant isOpen={isOpen} onClose={() => setIsOpen(false)} role="enseignant" />
      <Navbar onMenuClick={() => setIsOpen(!isOpen)} userName={user ? `${user.prenom} ${user.nom}` : "..."} userRole="Enseignant" />

      <main className="md:ml-57.5 pt-16 p-4 md:p-6 transition-all duration-300 min-h-screen">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* EN-TÊTE DE PAGE */}
            <div className="flex flex-wrap my-12 items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-[26px] font-bold text-white">Tableau de bord</h1>
                <p className="text-[#7A8FAD] text-sm mt-1">Vue d'ensemble de vos activités et statistiques</p>
              </div>
              <div className="bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[13px] font-bold py-1.5 px-4 rounded-full flex items-center gap-2">
                <MdPerson size={16} />
                <span>Enseignant</span>
              </div>
            </div>

            {/* SECTION 1 — PROFIL ENSEIGNANT */}
            <div className="bg-[#0D1B2A] border border-white/5 p-6 rounded-[14px] mb-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#0097FB]/15 text-[#0097FB] flex items-center justify-center rounded-full text-2xl font-bold shrink-0">
                  {getInitials(`${user?.prenom} ${user?.nom}`)}
                </div>
                <div>
                  <h2 className="text-white text-xl font-bold">{user ? `${user.prenom} ${user.nom}` : "..."}</h2>
                  <p className="text-[#7A8FAD] text-sm mt-1">
                    {user?.referencens} · {user?.grade} · {user?.departement} · {user?.statut}
                  </p>
                  <p className="text-[#7A8FAD] text-xs mt-0.5">
                    Année académique: {user?.annee || "2025-2026"} · Taux horaire: {tauxh.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 2 — KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* KPI 1: Heures effectuées */}
              <div className="bg-[#0D1B2A] border border-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <MdAccessTime className="text-[#0097FB]" size={18} />
                  <span className="text-[#7A8FAD] text-[12px]">Heures effectuées</span>
                </div>
                <div className="text-white text-[22px] font-bold">{totalEffectue.toFixed(1)}H</div>
                <div className="text-[#7A8FAD] text-[11px]">{volumhor}H prévues</div>
              </div>

              {/* KPI 2: Répartition des heures */}
              <div className="bg-[#0D1B2A] border border-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <MdBarChart className="text-[#10B981]" size={18} />
                  <span className="text-[#7A8FAD] text-[12px]">Répartition des heures</span>
                </div>
                <div className="text-[#10B981] text-[18px] font-bold uppercase">
                  CM: {heures_cm}H · TD: {heures_td}H · TP: {heures_tp}H
                </div>
                <div className="text-[#7A8FAD] text-[11px]">Total: {totalEffectue.toFixed(1)}H</div>
              </div>

              {/* KPI 3: Rémunération estimée */}
              <div className="bg-[#0D1B2A] border border-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <MdAttachMoney className="text-[#F59E0B]" size={18} />
                  <span className="text-[#7A8FAD] text-[12px]">Rémunération estimée</span>
                </div>
                <div className="text-[#F59E0B] text-[18px] font-bold uppercase">{montant.toLocaleString('fr-FR')} FCFA</div>
                <div className="text-[#7A8FAD] text-[11px]">{tauxh.toLocaleString('fr-FR')} FCFA/H</div>
              </div>

              {/* KPI 4: Dépassement */}
              <div className="bg-[#0D1B2A] border border-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <MdWarning className="text-[#EF4444]" size={18} />
                  <span className="text-[#7A8FAD] text-[12px]">Dépassement</span>
                </div>
                <div className="text-[#EF4444] text-[22px] font-bold">{depassement.toFixed(1)}H</div>
                <div className="text-[#7A8FAD] text-[11px]">{volumhor}H quota</div>
              </div>
            </div>

            {/* SECTION 3 — GRAPHIQUES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Card: Évolution mensuelle des heures */}
              <div className="bg-[#0D1B2A] border border-white/5 p-6 rounded-[14px] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MdCalendarToday className="text-[#0097FB] text-[18px]" />
                  <h2 className="text-white text-[15px] font-semibold">Évolution mensuelle des heures</h2>
                </div>
                <div className="h-64">
                  <Line data={evolutionData} options={chartOptions} />
                </div>
              </div>

              {/* Card: Heures par matière */}
              <div className="bg-[#0D1B2A] border border-white/5 p-6 rounded-[14px] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MdBook className="text-[#10B981] text-[18px]" />
                  <h2 className="text-white text-[15px] font-semibold">Heures par matière</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {heuresParMatiere.length > 0 ? (
                    heuresParMatiere.map((mat, index) => (
                      <div key={index} className="flex flex-col">
                        <div className="flex justify-between text-sm text-white mb-1">
                          <span>{mat.intitule}</span>
                          <span>{formatHeures(mat.total_heures)}</span>
                        </div>
                        <div className="w-full bg-[#1E2D3D] rounded-full h-2.5">
                          <div
                            className="bg-[#0097FB] h-2.5 rounded-full"
                            style={{ width: `${(parseFloat(mat.total_heures) / totalEffectue) * 100 || 0}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-[#7A8FAD] mt-1">
                          <span>CM: {formatHeures(parseFloat(mat.heures_cm))}</span>
                          <span>TD: {formatHeures(parseFloat(mat.heures_td))}</span>
                          <span>TP: {formatHeures(parseFloat(mat.heures_tp))}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-[#7A8FAD] text-sm py-4">Aucune matière enseignée.</div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 4 — STATUT DES SÉANCES & DERNIÈRES SÉANCES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Card: Statut de mes séances */}
              <div className="bg-[#0D1B2A] border border-white/5 p-6 rounded-[14px] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MdCheckCircle className="text-[#F59E0B] text-[18px]" />
                  <h2 className="text-white text-[15px] font-semibold">Statut de mes heures</h2>
                </div>
                <div className="flex flex-col gap-2 text-white text-sm">
                  <p>Heures CM: <span className="font-bold text-[#0097FB]">{formatHeures(heures_cm)}</span></p>
                  <p>Heures TD: <span className="font-bold text-[#10B981]">{formatHeures(heures_td)}</span></p>
                  <p>Heures TP: <span className="font-bold text-[#F59E0B]">{formatHeures(heures_tp)}</span></p>
                  <p className="mt-2">Total heures équivalentes: <span className="font-bold text-lg text-white">{formatHeures(totalEffectue)}</span></p>
                </div>
              </div>

              {/* Card: Dernières séances */}
              <div className="bg-[#0D1B2A] border border-white/5 p-6 rounded-[14px] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MdHistory className="text-[#EF4444] text-[18px]" />
                  <h2 className="text-white text-[15px] font-semibold">Dernières séances</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[400px] border-collapse">
                    <thead>
                      <tr className="bg-white/3 text-[#7A8FAD] text-[12px] uppercase tracking-wider text-left border-bottom border-white/5">
                        <th className="px-3 py-2 font-medium">Matière</th>
                        <th className="px-3 py-2 font-medium">Type</th>
                        <th className="px-3 py-2 font-medium">Durée</th>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Salle</th>
                        <th className="px-3 py-2 font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dernieresSeances.length > 0 ? (
                        dernieresSeances.map((seance) => (
                          <tr key={seance.idenseigner} className="border-b border-white/4 hover:bg-white/2 transition-all">
                            <td className="px-3 py-2 text-[13px] font-medium text-white">{seance.intitule}</td>
                            <td className="px-3 py-2 text-[13px] text-[#7A8FAD]">{seance.type}</td>
                            <td className="px-3 py-2 text-[13px] text-white">{formatHeures(parseFloat(seance.duree))}</td>
                            <td className="px-3 py-2 text-[13px] text-[#7A8FAD]">{new Date(seance.date).toLocaleDateString('fr-FR')}</td>
                            <td className="px-3 py-2 text-[13px] text-[#7A8FAD]">{seance.salle}</td>
                            <td className="px-3 py-2">
                              <span className="bg-[#7A8FAD]/15 text-[#7A8FAD] text-[11px] px-2 py-0.5 rounded-full font-medium">
                                {seance.statut || "—"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-10 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <MdSearchOff className="text-4xl text-[#7A8FAD]" />
                              <p className="text-white text-[14px] font-medium">Aucune séance récente</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardEns;