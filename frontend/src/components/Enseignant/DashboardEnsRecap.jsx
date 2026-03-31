import React, { useState } from 'react';
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

const enseignant = {
  nom: "Jean François",
  prenom: "Jean",
  code: "ENS-001",
  grade: "Maître de conférence",
  dept: "Informatique",
  type: "Permanent",
  tauxHoraire: 5000,
  prevues: 192,
  annee: "2025-2026",
  etablissement: "Institut Supérieur de Technologie d'Abidjan",
};

const moisOptions = [
  "Toute l'année", "Mars 2026", "Février 2026",
  "Janvier 2026", "Décembre 2025", "Novembre 2025",
  "Octobre 2025", "Septembre 2025"
];

const recapAnnuel = {
  moisDetails: [
    { mois: "Septembre 2025", cm: 18, td: 12, tp: 8, statut: "Clôturé" },
    { mois: "Octobre 2025", cm: 22, td: 16, tp: 10, statut: "Clôturé" },
    { mois: "Novembre 2025", cm: 20, td: 14, tp: 10, statut: "Clôturé" },
    { mois: "Décembre 2025", cm: 8, td: 4, tp: 2, statut: "Clôturé" },
    { mois: "Janvier 2026", cm: 24, td: 18, tp: 12, statut: "Clôturé" },
    { mois: "Février 2026", cm: 20, td: 16, tp: 10, statut: "Clôturé" },
    { mois: "Mars 2026", cm: 8, td: 10, tp: 16, statut: "En cours" },
  ]
};

const DashboardEnsRecap = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMois, setMois] = useState("Toute l'année");
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingMois, setLoadingMois] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  // --- CALCULS DYNAMIQUES ---
  const moisDetails = recapAnnuel.moisDetails;
  const cmTotal = moisDetails.reduce((a, m) => a + m.cm, 0);
  const tdTotal = moisDetails.reduce((a, m) => a + m.td, 0);
  const tpTotal = moisDetails.reduce((a, m) => a + m.tp, 0);
  const totalH = cmTotal + tdTotal + tpTotal;
  const depassement = Math.max(0, totalH - enseignant.prevues);

  const montantCM = cmTotal * enseignant.tauxHoraire * 1;
  const montantTD = tdTotal * enseignant.tauxHoraire * 1.5;
  const montantTP = tpTotal * enseignant.tauxHoraire * 2;
  const montantTotal = montantCM + montantTD + montantTP;
  const montantDepassement = depassement * enseignant.tauxHoraire * 1.5;

  // --- SIMULATIONS ---
  const simulerExportAnnuel = () => {
    setLoadingPDF(true);
    setTimeout(() => {
      setLoadingPDF(false);
      showToast(`Fiche annuelle générée avec succès · ${enseignant.annee}`, "success");
    }, 2500);
  };

  const simulerExportMois = (mois) => {
    setLoadingMois(mois);
    setTimeout(() => {
      setLoadingMois(null);
      showToast(`Fiche de paiement de ${mois} téléchargée`, "success");
    }, 2000);
  };

  const filteredMoisDetails = selectedMois === "Toute l'année"
    ? moisDetails
    : moisDetails.filter(m => m.mois === selectedMois);

  return (
    <div className="bg-[#000814] min-h-screen font-['Inter']">
      <SidebarEnseignant isOpen={isOpen} onClose={() => setIsOpen(false)} role="enseignant" />
      <Navbar onMenuClick={() => setIsOpen(!isOpen)} userName="Jean François" userRole="Enseignant" />

      <main className="md:ml-57.5 pt-16 p-4 md:p-6 transition-all duration-300 min-h-screen">

        {/* EN-TÊTE DE PAGE */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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
                JF
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-white text-[20px] font-bold">{enseignant.nom}</h2>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-white/8 text-[#94A3B8] text-[12px] px-2.5 py-0.5 rounded-full">{enseignant.code}</span>
                  <span className="bg-[#0097FB]/12 text-[#0097FB] text-[12px] px-2.5 py-0.5 rounded-full">{enseignant.grade}</span>
                  <span className="bg-[#10B981]/12 text-[#10B981] text-[12px] px-2.5 py-0.5 rounded-full">{enseignant.dept}</span>
                  <span className="bg-[#7B2FBE]/12 text-[#7B2FBE] text-[12px] px-2.5 py-0.5 rounded-full">{enseignant.type}</span>
                </div>
                <p className="text-[#7A8FAD] text-[13px] mt-0.5">{enseignant.etablissement}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <span className="text-[#7A8FAD] text-[11px] uppercase tracking-wider">Année académique</span>
              <span className="text-white text-[18px] font-bold">{enseignant.annee}</span>
              <div className="w-full border-b border-white/5 my-1" />
              <span className="text-[#7A8FAD] text-[11px] uppercase tracking-wider">Taux horaire</span>
              <span className="text-[#10B981] text-[16px] font-semibold">{enseignant.tauxHoraire.toLocaleString('fr-FR')} FCFA/H</span>
              <span className="text-[#7A8FAD] text-[12px]">Volume prévu : {enseignant.prevues}H</span>
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
            <div className="text-white text-[28px] font-bold mt-2">{totalH}H</div>
            <div className="mt-3 h-1.5 bg-white/6 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${totalH <= enseignant.prevues ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}
                style={{ width: `${Math.min((totalH / enseignant.prevues) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[#7A8FAD] text-[11px]">{totalH}H / {enseignant.prevues}H</span>
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
                <span className="text-white text-[13px] font-semibold">{cmTotal}H</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-[#10B981]/12 text-[#10B981] text-[10px] px-2 py-0.5 rounded-full font-bold">TD</span>
                <span className="text-white text-[13px] font-semibold">{tdTotal}H</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-[#F59E0B]/12 text-[#F59E0B] text-[10px] px-2 py-0.5 rounded-full font-bold">TP</span>
                <span className="text-white text-[13px] font-semibold">{tpTotal}H</span>
              </div>
            </div>
            <div className="flex h-1.5 w-full rounded-full overflow-hidden mt-3 gap-0.5">
              <div style={{ width: `${(cmTotal / totalH) * 100}%` }} className="bg-[#0097FB] rounded-l-full" />
              <div style={{ width: `${(tdTotal / totalH) * 100}%` }} className="bg-[#10B981]" />
              <div style={{ width: `${(tpTotal / totalH) * 100}%` }} className="bg-[#F59E0B] rounded-r-full" />
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
                <div className="text-[#7A8FAD] text-[12px] mt-1.5">{enseignant.prevues - totalH}H restantes</div>
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
                <p className="text-[#7A8FAD] text-[13px]">Récapitulatif complet · {enseignant.annee}</p>
                <div className="flex gap-2 mt-1">
                  <span className="bg-[#EF4444]/12 text-[#EF4444] text-[10px] px-2 py-0.5 rounded-full font-bold tracking-tight">PDF</span>
                  <span className="bg-[#10B981]/12 text-[#10B981] text-[10px] px-2 py-0.5 rounded-full">Toutes les séances validées</span>
                </div>
              </div>
            </div>
            <button 
              onClick={simulerExportAnnuel}
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
                  <th className="px-4 py-3.5 font-semibold">Statut</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMoisDetails.map((m, idx) => {
                  const totalMois = m.cm + m.td + m.tp;
                  const montantMois = (m.cm * enseignant.tauxHoraire) + (m.td * enseignant.tauxHoraire * 1.5) + (m.tp * enseignant.tauxHoraire * 2);
                  
                  return (
                    <tr key={idx} className="border-b border-white/4 hover:bg-white/2 transition-all">
                      <td className="px-4 py-4 text-white text-[13px] font-medium whitespace-nowrap">{m.mois}</td>
                      <td className="px-4 py-4 text-white text-[13px]">{m.cm}<span className="text-[#7A8FAD] text-[12px] ml-0.5">H</span></td>
                      <td className="px-4 py-4 text-white text-[13px]">{m.td}<span className="text-[#7A8FAD] text-[12px] ml-0.5">H</span></td>
                      <td className="px-4 py-4 text-white text-[13px]">{m.tp}<span className="text-[#7A8FAD] text-[12px] ml-0.5">H</span></td>
                      <td className="px-4 py-4 text-white text-[14px] font-bold">{totalMois}<span className="text-[#7A8FAD] text-[12px] font-normal ml-0.5">H</span></td>
                      <td className="px-4 py-4 text-[#10B981] text-[13px] font-bold whitespace-nowrap">{montantMois.toLocaleString('fr-FR')} FCFA</td>
                      <td className="px-4 py-4">
                        <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${m.statut === "Clôturé" ? "bg-[#10B981]/12 text-[#10B981]" : "bg-[#F59E0B]/12 text-[#F59E0B]"}`}>
                          {m.statut === "Clôturé" ? <MdLock size={12} /> : <MdPending size={12} />}
                          {m.statut}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {m.statut === "Clôturé" ? (
                          <button 
                            onClick={() => simulerExportMois(m.mois)}
                            disabled={loadingMois === m.mois}
                            className={`inline-flex items-center gap-1.5 bg-[#EF4444]/12 text-[#EF4444] border border-[#EF4444]/20 rounded-md px-3 py-1.5 text-[11px] font-bold hover:bg-[#EF4444]/20 transition-all ${loadingMois === m.mois ? 'opacity-70 pointer-events-none' : ''}`}
                          >
                            {loadingMois === m.mois ? <MdHourglassEmpty className="animate-spin" size={14} /> : <MdPictureAsPdf size={14} />}
                            PDF
                          </button>
                        ) : (
                          <span className="bg-white/4 text-[#7A8FAD] text-[11px] px-2.5 py-1.5 rounded-md">En cours</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {selectedMois === "Toute l'année" && (
                <tfoot>
                  <tr className="bg-white/4 border-t-2 border-white/10">
                    <td className="px-4 py-4 text-[#7A8FAD] text-[12px] font-bold uppercase tracking-tight">TOTAL ANNUEL</td>
                    <td className="px-4 py-4 text-white text-[13px] font-bold">{cmTotal}H</td>
                    <td className="px-4 py-4 text-white text-[13px] font-bold">{tdTotal}H</td>
                    <td className="px-4 py-4 text-white text-[13px] font-bold">{tpTotal}H</td>
                    <td className="px-4 py-4 text-white text-[14px] font-bold">{totalH}H</td>
                    <td className="px-4 py-4 text-[#10B981] text-[13px] font-bold">{montantTotal.toLocaleString('fr-FR')} FCFA</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </main>

      {/* TOAST NOTIFICATION */}
      {toast.visible && (
        <div className={`fixed bottom-6 right-6 z-1000 flex items-center gap-3 px-5 py-3.5 rounded-xl text-white text-[14px] font-medium shadow-2xl transition-all ${toast.type === "success" ? "bg-[#10B981]" : "bg-[#EF4444]"}`}>
          {toast.type === "success" ? <MdCheckCircle size={20} /> : <MdError size={20} />}
          {toast.message}
        </div>
      )}

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