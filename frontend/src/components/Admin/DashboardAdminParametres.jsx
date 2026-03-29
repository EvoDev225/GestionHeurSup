import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../Sidebar.jsx";
import Navbar from "../Navbar.jsx";
import { 
  MdCalendarToday, 
  MdCheckCircle, 
  MdArrowForward, 
  MdSave, 
  MdInfo, 
  MdSwapHoriz, 
  MdEdit, 
  MdCheck, 
  MdError 
} from "react-icons/md";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const DashboardAdminParametres = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // État Année Académique
  const [anneeDebut, setAnneeDebut] = useState("2025");
  const [anneeFin, setAnneeFin] = useState("2026");
  const [anneeEnregistree, setAnneeEnregistree] = useState(null);

  // État Équivalences
  const initialEquivalences = [
    { id: 1, type: "CM", label: "Cours magistral", multiplicateur: 1.0, editable: false },
    { id: 2, type: "TD", label: "Travaux dirigés", multiplicateur: 1.5, editable: false },
    { id: 3, type: "TP", label: "Travaux pratiques", multiplicateur: 2.0, editable: false },
  ];
  const [equivalences, setEquivalences] = useState(initialEquivalences);
  const [tempEquivalences, setTempEquivalences] = useState(initialEquivalences);
  const [editMode, setEditMode] = useState(false);

  // État Toast
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ ...toast, visible: false }), 3000);
  };

  const handleSaveAnnee = () => {
    const debut = parseInt(anneeDebut);
    const fin = parseInt(anneeFin);

    if (anneeDebut.length === 4 && anneeFin.length === 4 && fin > debut) {
      setAnneeEnregistree({ debut: anneeDebut, fin: anneeFin });
      showToast("Année académique mise à jour avec succès !");
    } else {
      showToast("Veuillez saisir des années valides (ex: 2025 - 2026).", "error");
    }
  };

  const handleStartEdit = () => {
    setTempEquivalences([...equivalences]);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setTempEquivalences([...equivalences]);
    setEditMode(false);
  };

  const handleSaveEquivalences = () => {
    setEquivalences([...tempEquivalences]);
    setEditMode(false);
    showToast("Coefficients d'équivalence sauvegardés.");
  };

  const updateMultiplicateur = (id, val) => {
    setTempEquivalences(prev => prev.map(eq => 
      eq.id === id ? { ...eq, multiplicateur: parseFloat(val) || 0 } : eq
    ));
  };

  return (
    <div className="min-h-screen bg-[#000814]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} userName="John Smith" userRole="Administrateur" />

      <motion.main 
        initial="hidden" animate="visible" variants={containerVariants}
        className="mt-16 text-white md:ml-57.5 transition-all duration-300 min-h-[calc(100vh-64px)] p-4 md:p-6"
      >
        <h1 className="text-[26px] font-bold mb-7">Paramètres</h1>

        {/* SECTION 1 — ANNÉE ACADÉMIQUE */}
        <motion.div variants={itemVariants} className="bg-[#0D1B2A] border border-white/5 p-5 md:p-7 rounded-[14px] mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2.5">
                <MdCalendarToday className="text-[#0097FB] text-xl" />
                <h2 className="text-[17px] font-semibold">Année académique</h2>
              </div>
              {anneeEnregistree && (
                <div className="flex items-center gap-2 bg-[#10B981]/12 text-[#10B981] text-[12px] px-3 py-1 rounded-full border border-[#10B981]/20">
                  <MdCheckCircle size={14} />
                  <span>En cours : {anneeEnregistree.debut}-{anneeEnregistree.fin}</span>
                </div>
              )}
            </div>

            <p className="text-[#7A8FAD] text-[13px] mb-6">Définissez la période de l'année académique en cours.</p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-[#7A8FAD] text-[12px] font-medium">Année de début</label>
                <div className="relative flex items-center">
                  <MdCalendarToday className="absolute left-3 text-[#7A8FAD] text-[16px]" />
                  <input 
                    type="text" placeholder="2025"
                    value={anneeDebut} onChange={e => setAnneeDebut(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-[9px] py-2.5 pl-10 pr-3.5 text-[14px] w-full sm:w-[140px] outline-none focus:border-[#0097FB] transition-colors"
                  />
                </div>
              </div>

              <MdArrowForward className="text-[#7A8FAD] text-xl mb-3 self-center hidden sm:block" />

              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-[#7A8FAD] text-[12px] font-medium">Année de fin</label>
                <div className="relative flex items-center">
                  <MdCalendarToday className="absolute left-3 text-[#7A8FAD] text-[16px]" />
                  <input 
                    type="text" placeholder="2026"
                    value={anneeFin} onChange={e => setAnneeFin(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-[9px] py-2.5 pl-10 pr-3.5 text-[14px] w-full sm:w-[140px] outline-none focus:border-[#0097FB] transition-colors"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveAnnee}
                className="bg-[#0097FB] hover:opacity-85 text-white rounded-[9px] px-5 py-2.5 text-[14px] font-medium flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
              >
                <MdSave size={18} />
                Enregistrer
              </button>
            </div>

            {anneeEnregistree && (
              <div className="flex items-center gap-2 text-[#7A8FAD] text-[13px] mt-4">
                <MdInfo className="text-[#0097FB]" size={18} />
                <span>L'année académique en cours est : <strong className="text-white">{anneeEnregistree.debut} – {anneeEnregistree.fin}</strong></span>
              </div>
            )}
        </motion.div>

        {/* SECTION 2 — ÉQUIVALENCES DES HEURES */}
        <motion.div variants={itemVariants} className="bg-[#0D1B2A] border border-white/5 p-5 md:p-7 rounded-[14px] mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2.5">
                <MdSwapHoriz className="text-[#0097FB] text-xl" />
                <h2 className="text-[17px] font-semibold">Équivalence des heures</h2>
              </div>
              {!editMode ? (
                <button 
                  onClick={handleStartEdit}
                  className="bg-[#0097FB]/12 text-[#0097FB] border border-[#0097FB]/20 rounded-lg px-4 py-2 text-[13px] flex items-center gap-2 hover:bg-[#0097FB]/20 transition-all"
                >
                  <MdEdit size={16} />
                  Modifier
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleCancelEdit} className="text-[#7A8FAD] border border-white/10 rounded-lg px-3.5 py-2 text-[13px] hover:bg-white/5 transition-all">
                    Annuler
                  </button>
                  <button onClick={handleSaveEquivalences} className="bg-[#10B981] text-white rounded-lg px-4 py-2 text-[13px] flex items-center gap-2 transition-all">
                    <MdCheck size={16} />
                    Sauvegarder
                  </button>
                </div>
              )}
            </div>

            <p className="text-[#7A8FAD] text-[13px] mb-6">Définissez les coefficients de conversion entre les types d'heures.</p>

            {/* Explication visuelle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
              {equivalences.filter(e => e.type !== "CM").map(eq => (
                <div key={eq.id} className="bg-[#0097FB]/5 border border-[#0097FB]/10 p-4 rounded-xl flex-1 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#0097FB] text-white text-[11px] font-bold px-2 py-0.5 rounded">1H CM</span>
                    <MdArrowForward className="text-[#7A8FAD]" />
                    <span className={`text-white text-[11px] font-bold px-2 py-0.5 rounded ${eq.type === "TD" ? "bg-[#10B981]" : "bg-[#F59E0B]"}`}>
                      {eq.multiplicateur}H {eq.type}
                    </span>
                  </div>
                  <p className="text-[#7A8FAD] text-[12px] mt-2 font-medium">× {eq.multiplicateur}</p>
                </div>
              ))}
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] border-collapse">
                <thead className="bg-white/5 text-[#7A8FAD] text-[12px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold border-b border-white/5">#</th>
                    <th className="px-4 py-3 text-left font-semibold border-b border-white/5">Type</th>
                    <th className="px-4 py-3 text-left font-semibold border-b border-white/5">Description</th>
                    <th className="px-4 py-3 text-left font-semibold border-b border-white/5">Multiplicateur (x CM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {(editMode ? tempEquivalences : equivalences).map((eq) => (
                    <tr key={eq.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-4 text-[#7A8FAD] text-[13px]">{eq.id}</td>
                      <td className="px-4 py-4">
                        <span className={`text-[12px] px-2.5 py-0.5 rounded-full font-bold border border-white/5 ${
                          eq.type === "CM" ? "bg-[#0097FB]/15 text-[#0097FB]" :
                          eq.type === "TD" ? "bg-[#10B981]/15 text-[#10B981]" :
                          "bg-[#F59E0B]/15 text-[#F59E0B]"
                        }`}>
                          {eq.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[14px]">{eq.label}</td>
                      <td className="px-4 py-4">
                        {!editMode || eq.type === "CM" ? (
                          <span className={`text-[14px] font-semibold ${eq.type === "CM" ? "text-[#7A8FAD]" : "text-white"}`}>
                            × {eq.multiplicateur} {eq.type === "CM" && "(référence)"}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[#7A8FAD] font-bold">×</span>
                            <input 
                              type="number" min="0.5" max="5" step="0.5"
                              value={eq.multiplicateur}
                              onChange={(e) => updateMultiplicateur(eq.id, e.target.value)}
                              className="bg-white/5 border border-[#0097FB]/30 rounded-lg py-1.5 px-3 w-20 text-center text-white text-[14px] font-bold outline-none focus:border-[#0097FB]"
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </motion.div>

        {/* SECTION 3 — RÉCAPITULATIF */}
        <motion.div variants={itemVariants} className="bg-[#0097FB]/[0.03] border border-[#0097FB]/10 p-5 md:p-7 rounded-[14px] shadow-sm">
            <div className="flex items-center gap-2.5 mb-6">
              <MdInfo className="text-[#0097FB] text-xl" />
              <h2 className="text-[17px] font-semibold">Récapitulatif de configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[#7A8FAD] text-[11px] uppercase font-bold tracking-wider">Année en cours</label>
                <div className="mt-2">
                  {anneeEnregistree ? (
                    <p className="text-[18px] font-bold">{anneeEnregistree.debut} – {anneeEnregistree.fin}</p>
                  ) : (
                    <p className="text-[#EF4444] text-[14px] font-medium italic">Non définie</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[#7A8FAD] text-[11px] uppercase font-bold tracking-wider">Coefficients actifs</label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {equivalences.map(eq => (
                    <div key={eq.type} className={`px-2.5 py-1 rounded text-[12px] font-bold ${
                      eq.type === "CM" ? "bg-[#0097FB]/15 text-[#0097FB]" :
                      eq.type === "TD" ? "bg-[#10B981]/15 text-[#10B981]" :
                      "bg-[#F59E0B]/15 text-[#F59E0B]"
                    }`}>
                      {eq.type}×{eq.multiplicateur}
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </motion.div>
      </motion.main>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-[1000] flex items-center gap-3 px-5 py-3 rounded-[10px] text-white text-[14px] font-medium shadow-[0_4px_20px_rgba(0,0,0,0.4)] ${
              toast.type === "success" ? "bg-[#10B981]" : "bg-[#EF4444]"
            }`}
          >
            {toast.type === "success" ? <MdCheckCircle size={18} /> : <MdError size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardAdminParametres;