import React, { useEffect, useState } from 'react';
import SidebarEnseignant from '../../components/Enseignant/SidebarEnseignant';
import Navbar from '../../components/Navbar';
import {
  MdVisibility,
  MdAccessTime,
  MdBarChart,
  MdAttachMoney,
  MdWarning,
  MdVerified,
  MdPictureAsPdf,
  MdDownload,
  MdHourglassEmpty,
  MdCalendarMonth,
  MdLock,
  MdPending,
  MdCheckCircle,
  MdError
} from 'react-icons/md';
import { deconnexion, verifierAuthentification } from '../../fonctions/utilisateur';
import { useNavigate } from 'react-router-dom';
import { 
  getProfilEnseignant, 
  getHeuresEnseignant, 
  getRemunerationEnseignant, 
  getHeuresParMoisEnseignant, 
  getRecapEnseignantById 
} from '../../fonctions/Stats';
import { exportFicheEnseignantPDF } from '../../fonctions/Export';
import toast from 'react-hot-toast';

const DashboardEnsRecap = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMois, setMois] = useState("Toute l'année");
  const [user, setUser] = useState(null);
  const [heures, setHeures] = useState(null);
  const [remuneration, setRemuneration] = useState(null);
  const [heuresParMois, setHeuresParMois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPDF, setLoadingPDF] = useState(false);

  // --- CALCULS DYNAMIQUES ---
  const heures_cm = parseFloat(heures?.heures_cm || 0);
  const heures_td = parseFloat(heures?.heures_td || 0);
  const heures_tp = parseFloat(heures?.heures_tp || 0);
  const totalH = parseFloat(heures?.total_heures_eq || 0);
  const volumhor = parseFloat(heures?.volumhor || 0);
  const tauxh = parseFloat(user?.tauxh || 0);
  const depassement = Math.max(0, totalH - volumhor);
  const montantCM = heures_cm * tauxh;
  const montantTD = heures_td * tauxh;
  const montantTP = heures_tp * tauxh;
  const montantTotal = parseFloat(remuneration?.remuneration_estimee || 0);
  const montantDepassement = depassement * tauxh * 1.5;

  const moisOptions = ["Toute l'année", ...heuresParMois.map(m => m.nom_mois)];

  const handleExportPDF = async () => {
    if (!user?.idens) return;
    setLoadingPDF(true);
    try {
      await exportFicheEnseignantPDF(user.idens);
      toast.success("Fiche annuelle générée avec succès.");
    } catch {
      toast.error("Erreur lors de la génération PDF.");
    } finally {
      setLoadingPDF(false);
    }
  };

  const filteredMoisDetails = selectedMois === "Toute l'année"
    ? heuresParMois
    : heuresParMois.filter(m => m.nom_mois === selectedMois);

     useEffect(() => {
        const fetchUserData = async () => {
          try {
            const res = await verifierAuthentification();
            if(res.data.role !=="enseignant"){
              if(typeof toast.error === 'function') toast.error("Accès refusé. Redirection vers la page d'accueil.");
              await deconnexion()
              navigate("/")
              return;
            }
            setUser(res.data);
            const idens = res.data.idens;

            const [r1, r2, r3] = await Promise.all([
              getHeuresEnseignant(idens),
              getRemunerationEnseignant(idens),
              getHeuresParMoisEnseignant(idens),
            ]);
            setHeures(r1.data);
            setRemuneration(r2.data);
            setHeuresParMois(r3.data);
          } catch (error) {
            if(typeof toast.error === 'function') toast.error("Une erreur est survenue lors de la récupération des données.");
          } finally {
            setLoading(false);
          }
        };
        fetchUserData();
      },[navigate]);

  return (
    <div className="bg-[#000814] min-h-screen font-['Inter']">
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
        <div className="flex flex-wrap items-center my-12 justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-white">Mon récapitulatif</h1>
            <p className="text-[#7A8FAD] text-sm mt-1">Bilan annuel et téléchargement de votre fiche de paiement</p>
          </div>
          <div className="bg-white/5 border border-white/10 text-[#7A8FAD] text-[12px] py-1.5 px-4 rounded-full flex items-center gap-2">
            <MdVisibility size={16} />
            <span>Lecture seule</span>
          </div>
        </div>

        {/* SECTION 1 — CARTE IDENTITÉ ENSEIGNANT */}
        <div className="bg-linear-to-br from-[#10B981]/6 to-[#0097FB]/4 border border-[#10B981]/12 p-6 rounded-[14px] mb-6">
          <div className="flex flex-wrap justify-between items-start gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center text-white text-[22px] font-bold">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-white text-[20px] font-bold">{user?.prenom} {user?.nom}</h2>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-white/8 text-[#94A3B8] text-[12px] px-2.5 py-0.5 rounded-full">{user?.referencens}</span>
                  <span className="bg-[#0097FB]/12 text-[#0097FB] text-[12px] px-2.5 py-0.5 rounded-full">{user?.grade}</span>
                  <span className="bg-[#10B981]/12 text-[#10B981] text-[12px] px-2.5 py-0.5 rounded-full">{user?.departement}</span>
                  <span className="bg-[#7B2FBE]/12 text-[#7B2FBE] text-[12px] px-2.5 py-0.5 rounded-full">{user?.statut}</span>
                </div>
                <p className="text-[#7A8FAD] text-[13px] mt-0.5">EduGest Academic Portal</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <span className="text-[#7A8FAD] text-[11px] uppercase tracking-wider">Année académique</span>
              <span className="text-white text-[18px] font-bold">{user?.annee || "2025-2026"}</span>
              <div className="w-full border-b border-white/5 my-1" />
              <span className="text-[#7A8FAD] text-[11px] uppercase tracking-wider">Taux horaire</span>
              <span className="text-[#10B981] text-[16px] font-semibold">{tauxh.toLocaleString('fr-FR')} FCFA/H</span>
              <span className="text-[#7A8FAD] text-[12px]">Volume prévu : {volumhor}H</span>
            </div>
          </div>
        </div>

        {/* SECTION 2 — KPI BILAN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card 1: Total */}
          <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl">
            <div className="flex justify-between items-center">
              <MdAccessTime className="text-[#10B981]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Heures effectuées</span>
            </div>
            <div className="text-white text-[28px] font-bold mt-2">{totalH.toFixed(1)}H</div>
            <div className="mt-3 h-1.5 bg-white/6 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${totalH <= volumhor ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}
                style={{ width: `${Math.min((totalH / volumhor) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[#7A8FAD] text-[11px]">{totalH.toFixed(1)}H / {volumhor}H</span>
              {depassement > 0 && <span className="text-[#EF4444] text-[11px] font-bold">+{depassement}H dépassement</span>}
            </div>
          </div>

          {/* Card 2: Split */}
          <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl">
            <div className="flex justify-between items-center">
              <MdBarChart className="text-[#0097FB]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Répartition types</span>
            </div>
            <div className="space-y-2 mt-2.5">
              <div className="flex justify-between items-center">
                <span className="bg-[#0097FB]/12 text-[#0097FB] text-[10px] px-2 py-0.5 rounded-full font-bold">CM</span>
                <span className="text-white text-[13px] font-semibold">{heures_cm}H</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-[#10B981]/12 text-[#10B981] text-[10px] px-2 py-0.5 rounded-full font-bold">TD</span>
                <span className="text-white text-[13px] font-semibold">{heures_td}H</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-[#F59E0B]/12 text-[#F59E0B] text-[10px] px-2 py-0.5 rounded-full font-bold">TP</span>
                <span className="text-white text-[13px] font-semibold">{heures_tp}H</span>
              </div>
            </div>
            <div className="flex h-1.5 w-full rounded-full overflow-hidden mt-3 gap-0.5">
              <div style={{ width: `${(heures_cm / totalH) * 100}%` }} className="bg-[#0097FB] rounded-l-full" />
              <div style={{ width: `${(heures_td / totalH) * 100}%` }} className="bg-[#10B981]" />
              <div style={{ width: `${(heures_tp / totalH) * 100}%` }} className="bg-[#F59E0B] rounded-r-full" />
            </div>
          </div>

          {/* Card 3: Montant */}
          <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl">
            <div className="flex justify-between items-center">
              <MdAttachMoney className="text-[#10B981]" size={20} />
              <span className="text-[#7A8FAD] text-[13px]">Rémunération estimée</span>
            </div>
            <div className="text-[#10B981] text-[18px] font-bold mt-2 uppercase">
              {montantTotal.toLocaleString('fr-FR')} FCFA
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[#7A8FAD] text-[11px]">CM : {montantCM.toLocaleString('fr-FR')} FCFA</span>
              <span className="text-[#7A8FAD] text-[11px]">TD : {montantTD.toLocaleString('fr-FR')} FCFA</span>
              <span className="text-[#7A8FAD] text-[11px]">TP : {montantTP.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <p className="text-[#3D5068] text-[11px] italic mt-2">* Estimation avant validation RH</p>
          </div>

          {/* Card 4: Statut */}
          <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl">
            {depassement > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <MdWarning className="text-[#EF4444]" size={20} />
                  <span className="text-[#7A8FAD] text-[13px]">Dépassement</span>
                </div>
                <div className="text-[#EF4444] text-[28px] font-bold mt-2">+{depassement}H</div>
                <div className="text-[#7A8FAD] text-[12px] mt-1.5">Montant dépassement :</div>
                <div className="text-[#EF4444] text-[14px] font-bold">+{montantDepassement.toLocaleString('fr-FR')} FCFA</div>
                <span className="inline-block bg-[#EF4444]/12 text-[#EF4444] text-[11px] px-2.5 py-0.5 rounded-full mt-2 font-bold">À régulariser</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <MdVerified className="text-[#10B981]" size={20} />
                  <span className="text-[#7A8FAD] text-[13px]">Statut volume</span>
                </div>
                <div className="text-[#10B981] text-[22px] font-bold mt-2">En règle ✓</div>
                <div className="text-[#7A8FAD] text-[12px] mt-1.5">{volumhor - totalH}H restantes</div>
                <span className="inline-block bg-[#10B981]/12 text-[#10B981] text-[11px] px-2.5 py-0.5 rounded-full mt-2 font-bold">Dans les limites</span>
              </>
            )}
          </div>
        </div>

        {/* SECTION 3 — EXPORT FICHE ANNUELLE */}
        <div className="bg-linear-to-br from-[#0097FB]/6 to-[#7B2FBE]/4 border border-[#0097FB]/15 p-7 rounded-[14px] mb-6">
          <div className="flex flex-wrap justify-between items-center gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-linear-to-br from-[#0097FB] to-[#005fa3] rounded-[14px] flex items-center justify-center shadow-[0_4px_20px_rgba(0,151,251,0.3)]">
                <MdPictureAsPdf className="text-white text-[28px]" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-white text-[17px] font-semibold">Fiche de paiement annuelle</h3>
                <p className="text-[#7A8FAD] text-[13px]">Récapitulatif complet · {user?.annee || "2025-2026"}</p>
                <div className="flex gap-2 mt-1">
                  <span className="bg-[#EF4444]/12 text-[#EF4444] text-[10px] px-2 py-0.5 rounded-full font-bold tracking-tight">PDF</span>
                  <span className="bg-[#10B981]/12 text-[#10B981] text-[10px] px-2 py-0.5 rounded-full">Toutes les séances validées</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleExportPDF}
              disabled={loadingPDF}
              className={`flex items-center gap-2.5 bg-linear-to-r from-[#0097FB] to-[#0077cc] text-white px-6 py-3 rounded-xl font-semibold shadow-[0_4px_16px_rgba(0,151,251,0.3)] hover:opacity-90 transition-all ${loadingPDF ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loadingPDF ? (
                <>
                  <MdHourglassEmpty className="animate-spin" size={18} />
                  <span>Génération en cours...</span>
                </>
              ) : (
                <>
                  <MdDownload size={18} />
                  <span>Télécharger ma fiche PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 4 — DÉTAIL PAR MOIS */}
        <div className="bg-[#0D1B2A] border border-white/6 p-5 rounded-xl shadow-sm mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <MdCalendarMonth className="text-[#0097FB]" size={18} />
              <h2 className="text-white text-[15px] font-semibold">Détail mensuel</h2>
            </div>
            <select 
              value={selectedMois} onChange={(e) => setMois(e.target.value)}
              className="bg-white/4 border border-white/8 text-white rounded-lg py-2 px-3.5 text-[13px] outline-none focus:border-[#0097FB] cursor-pointer min-w-60"
            >
              {moisOptions.map(m => <option key={m} value={m} className="bg-[#0D1B2A]">{m}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/3 text-[#7A8FAD] text-[11px] uppercase tracking-[0.05em] text-left border-b border-white/6">
                  <th className="px-4 py-3.5 font-semibold">Mois</th>
                  <th className="px-4 py-3.5 font-semibold">CM</th>
                  <th className="px-4 py-3.5 font-semibold">TD</th>
                  <th className="px-4 py-3.5 font-semibold">TP</th>
                  <th className="px-4 py-3.5 font-semibold">Total</th>
                  <th className="px-4 py-3.5 font-semibold">Montant estimé</th>
                  {/* <th className="px-4 py-3.5 font-semibold">Statut</th> */}
                  {/* <th className="px-4 py-3.5 font-semibold text-right">Action</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredMoisDetails.map((m, idx) => {
                  const h_cm = parseFloat(m.heures_cm || 0);
                  const h_td = parseFloat(m.heures_td || 0);
                  const h_tp = parseFloat(m.heures_tp || 0);
                  const totalMois = parseFloat(m.total_heures || 0);
                  const montantMois = (h_cm * tauxh) + (h_td * tauxh) + (h_tp * tauxh);
                  const estMoisEnCours = parseInt(m.mois) === new Date().getMonth() + 1;
                  const statusLabel = estMoisEnCours ? "En cours" : "Clôturé";
                  
                  return (
                    <tr key={idx} className="border-b border-white/4 hover:bg-white/2 transition-all">
                      <td className="px-4 py-4 text-white text-[13px] font-medium whitespace-nowrap">{m.nom_mois}</td>
                      <td className="px-4 py-4 text-white text-[13px]">{h_cm}<span className="text-[#7A8FAD] text-[12px] ml-0.5">H</span></td>
                      <td className="px-4 py-4 text-white text-[13px]">{h_td}<span className="text-[#7A8FAD] text-[12px] ml-0.5">H</span></td>
                      <td className="px-4 py-4 text-white text-[13px]">{h_tp}<span className="text-[#7A8FAD] text-[12px] ml-0.5">H</span></td>
                      <td className="px-4 py-4 text-white text-[14px] font-bold">{totalMois}<span className="text-[#7A8FAD] text-[12px] font-normal ml-0.5">H</span></td>
                      <td className="px-4 py-4 text-[#10B981] text-[13px] font-bold whitespace-nowrap">{montantMois.toLocaleString('fr-FR')} FCFA</td>
                      {/* <td className="px-4 py-4">
                        <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${!estMoisEnCours ? "bg-[#10B981]/12 text-[#10B981]" : "bg-[#F59E0B]/12 text-[#F59E0B]"}`}>
                          {!estMoisEnCours ? <MdLock size={12} /> : <MdPending size={12} />}
                          {statusLabel}
                        </div>
                      </td> */}
                      {/* <td className="px-4 py-4 text-right">
                        {!estMoisEnCours ? (
                          <button 
                            onClick={handleExportPDF}
                            className="inline-flex items-center gap-1.5 bg-[#EF4444]/12 text-[#EF4444] border border-[#EF4444]/20 rounded-md px-3 py-1.5 text-[11px] font-bold hover:bg-[#EF4444]/20 transition-all"
                          >
                            <MdPictureAsPdf size={14} />
                            PDF
                          </button>
                        ) : (
                          <span className="bg-white/4 text-[#7A8FAD] text-[11px] px-2.5 py-1.5 rounded-md">Verrouillé</span>
                        )}
                      </td> */}
                    </tr>
                  );
                })}
              </tbody>
              {selectedMois === "Toute l'année" && (
                <tfoot>
                  <tr className="bg-white/4 border-t-2 border-white/10">
                    <td className="px-4 py-4 text-[#7A8FAD] text-[12px] font-bold uppercase tracking-tight">TOTAL ANNUEL</td>
                    <td className="px-4 py-4 text-white text-[13px] font-bold">{heures_cm}H</td>
                    <td className="px-4 py-4 text-white text-[13px] font-bold">{heures_td}H</td>
                    <td className="px-4 py-4 text-white text-[13px] font-bold">{heures_tp}H</td>
                    <td className="px-4 py-4 text-white text-[14px] font-bold">{totalH.toFixed(1)}H</td>
                    <td className="px-4 py-4 text-[#10B981] text-[13px] font-bold">{montantTotal.toLocaleString('fr-FR')} FCFA</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
        
        </>
        )}
      </main>

      {/* ANIMATION CSS */}
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

export default DashboardEnsRecap;