import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdSupervisorAccount, MdAccessTime, MdCalendarToday,
  MdPieChart, MdAdd, MdMoreVert, MdEdit, MdDelete,
  MdClose, MdSave, MdSearchOff
} from 'react-icons/md';
import SidebarRH from './SidebarRH';
import Navbar from '../Navbar';
import { useNavigate } from 'react-router-dom';
import { deconnexion, verifierAuthentification } from '../../fonctions/utilisateur';
import { getTotalHeures, getHeuresParMois, getRepartitionHeures, getHeuresParEnseignant } from '../../fonctions/Stats';
import { getAllEnseigner, newEnseigner, updateEnseigner, deleteEnseigner } from '../../fonctions/Enseigner';
import axios from 'axios';
import toast from 'react-hot-toast';

const DashboardRhSaisie = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Données API
  const [totalHeures, setTotalHeures] = useState("0");
  const [heuresParMois, setHeuresParMois] = useState([]);
  const [repartition, setRepartition] = useState([]);
  const [seances, setSeances] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);

  // UI
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const actionMenuRef = useRef(null);

  // État Formulaire
  const [formData, setFormData] = useState({
    id_utilisateur: '',
    id_matiere: '',
    date_cours: '',
    nb_heures: '',
    type_heure: 'CM',
    salle: '',
    observations: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Helper format
  const formatHeures = (valeur) => {
    const total = parseFloat(valeur || 0);
    const h = Math.floor(total);
    const min = Math.round((total - h) * 60);
    return `${h}H${min.toString().padStart(2, '0')}`;
  };

  // Calcul répartition
  const totalRepartitionHeures = repartition.reduce((acc, curr) => acc + parseFloat(curr.total_heures || 0), 0);
  
  // Initiales
  const getInitials = (name) => name?.split(" ").map(n => n[0]).join("").toUpperCase() || "??";
  
  // Reset formulaire
  const resetForm = () => {
    setFormData({ id_utilisateur: '', id_matiere: '', date_cours: '', nb_heures: '', type_heure: 'CM', salle: '', observations: '' });
    setFormErrors({});
    setEditTarget(null);
    setShowModal(false);
  };

  // Handlers CRUD
  const handleSubmit = async () => {
    const errors = {};
    if (!formData.id_utilisateur) errors.id_utilisateur = true;
    if (!formData.id_matiere) errors.id_matiere = true;
    if (!formData.date_cours) errors.date_cours = true;
    if (!formData.nb_heures) errors.nb_heures = true;
    if (!formData.salle) errors.salle = true;
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    try {
      if (editTarget) {
        await updateEnseigner(editTarget.id_enseigner, formData);
        toast.success("Séance mise à jour avec succès.");
      } else {
        await newEnseigner(formData);
        toast.success("Séance ajoutée avec succès.");
      }
      const res = await getHeuresParEnseignant();
      setSeances(res.data);
      resetForm();
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'opération.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEnseigner(id);
      toast.success("Séance supprimée.");
      const res = await getHeuresParEnseignant();
      setSeances(res.data);
    } catch (err) {
      toast.error(err.message || "Erreur lors de la suppression.");
    }
  };

  useEffect(() => {
    const init = async () => { 
      // Vérification auth
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

      // Chargement données — blocs indépendants
      try { 
        const res = await getTotalHeures();
        setTotalHeures(res.data.total_heures);
      } catch { toast.error("Erreur heures totales."); }

      try { 
        const res = await getHeuresParMois();
        setHeuresParMois(res.data);
      } catch { toast.error("Erreur heures par mois."); }

      try { 
        const res = await getRepartitionHeures();
        setRepartition(res.data);
      } catch { toast.error("Erreur répartition."); }

      try { 
        const res = await getHeuresParEnseignant();
        setSeances(res.data);
      } catch { toast.error("Erreur séances."); }

      try { 
        const res = await getAllEnseigner();
        setEnseignants(res.data);
      } catch { toast.error("Erreur enseignants."); }

      try { 
        const res = await axios.get('http://localhost:3000/matiere/allMatiere');
        setMatieres(res.data.data);
      } catch { toast.error("Erreur matières."); }
      
      setLoading(false);
    };

    init();
  }, []);


  return (
    <>
      <div className="bg-[#000814] min-h-screen font-['Inter']">
        <SidebarRH isOpen={isOpen} onClose={() => setIsOpen(false)} role="rh" />
        <Navbar onMenuClick={() => setIsOpen(!isOpen)} userName="Aminata Koné" userRole="Responsable RH" />

        <main className="md:ml-[230px] pt-16 p-6 transition-all duration-300 min-h-screen">
        {loading ? (
          <div className="flex items-center justify-center h-64"> 
            <div className="w-8 h-8 border-2 border-[#0097FB] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
        
        {/* EN-TÊTE DE PAGE */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
          <div>
            <h1 className="text-2xl md:text-[26px] font-bold text-white">Saisie des heures</h1> 
            <p className="text-[#7A8FAD] text-sm mt-1">Enregistrement et gestion des séances</p>
          </div>
          <div className="bg-[#7B2FBE]/15 border border-[#7B2FBE]/30 text-[#7B2FBE] text-[13px] font-bold py-1.5 px-4 rounded-full flex items-center gap-2">
            <MdSupervisorAccount size={16} />
            <span>RH</span>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-[#0097FB] text-white text-[13px] font-medium py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-85 transition-all ml-auto"
          >
            <MdAdd size={18} />
            Ajouter une séance
          </button>
        </div>

        {/* SECTION 1 — KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2"> 
              <MdAccessTime className="text-[#0097FB] text-2xl" />
              <span className="text-[#7A8FAD] text-[13px]">Heures saisies</span>
            </div>
            <div className="text-white text-[28px] font-bold">{formatHeures(totalHeures)}</div>
            <div className="text-[#7A8FAD] text-[12px]">Total global</div>
            <div className="mt-3 w-full bg-white/5 h-[3px] rounded-full overflow-hidden">
              <div className="bg-[#0097FB] h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2"> 
              <MdCalendarToday className="text-[#0097FB] text-2xl" />
              <span className="text-[#7A8FAD] text-[13px]">Heures par mois</span>
            </div>
            <div className="space-y-1 mt-2">
              {heuresParMois.length > 0 ? (
                heuresParMois.map((mois, index) => (
                  <div key={index} className="flex justify-between items-center text-white text-[13px]">
                    <span>{mois.nom_mois}</span>
                    <span className="font-bold">{formatHeures(mois.total_heures)}</span>
                  </div>
                ))
              ) : (
                <span className="text-[#7A8FAD] text-[13px]">Aucune donnée</span>
              )}
            </div>
          </div>

          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2"> 
              <MdPieChart className="text-[#7B2FBE] text-2xl" />
              <span className="text-[#7A8FAD] text-[13px]">Répartition types</span>
            </div>
            <div className="space-y-2 mt-3">
              {repartition.map((type, index) => {
                const percentage = totalRepartitionHeures > 0 ? (parseFloat(type.total_heures) / totalRepartitionHeures) * 100 : 0;
                let barColor = "#0097FB";
                if (type.type === "TD") barColor = "#EF4444";
                if (type.type === "TP") barColor = "#10B981";

                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white text-[13px] font-medium">{type.type}</span>
                      <span className="text-[#7A8FAD] text-[11px]">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percentage}%`, backgroundColor: barColor }}
                      ></div>
                    </div>
                    <span className="text-[#7A8FAD] text-[11px] mt-1 block">{formatHeures(type.total_heures)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2 — TABLEAU */}
        <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5"> 
            <h2 className="text-white text-[17px] font-semibold">Liste des séances</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] border-collapse">
              <thead>
                <tr className="bg-white/[0.03] text-[#7A8FAD] text-[12px] uppercase tracking-wider text-left">
                  <th className="px-4 py-3 font-medium border-b border-white/5">Enseignant</th> 
                  <th className="px-4 py-3 font-medium border-b border-white/5">Matière</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">CM</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">TD</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">TP</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Total Éq.</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Vol. Hor.</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">H. Comp.</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {seances.length > 0 ? (
                  seances.map((s) => ( 
                    <tr key={s.id_enseigner} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#7B2FBE]/15 text-[#7B2FBE] flex items-center justify-center text-[12px] font-bold">
                            {getInitials(`${s.prenom} ${s.nom}`)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white text-[13px] font-medium">{s.prenom} {s.nom}</span>
                            <span className="text-[#7A8FAD] text-[11px]">{s.ref_utilisateur}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[#7A8FAD] text-[13px] max-w-[130px] truncate" title={s.intitule}>{s.intitule}</div>
                      </td>
                      <td className="px-4 py-4 text-white text-[13px]">{formatHeures(s.heures_cm)}</td>
                      <td className="px-4 py-4 text-white text-[13px]">{formatHeures(s.heures_td)}</td>
                      <td className="px-4 py-4 text-white text-[13px]">{formatHeures(s.heures_tp)}</td>
                      <td className="px-4 py-4 text-white text-[13px] font-bold">{formatHeures(s.total_heures_eq)}</td>
                      <td className="px-4 py-4 text-[#7A8FAD] text-[13px]">{formatHeures(s.volumhor)}</td>
                      <td className="px-4 py-4">
                        {s.heures_complementaires > 0 ? (
                          <span className="bg-[#10B981]/12 text-[#10B981] text-[11px] px-2 py-0.5 rounded-full font-bold">
                            +{formatHeures(s.heures_complementaires)}
                          </span>
                        ) : s.heures_complementaires < 0 ? (
                          <span className="bg-[#EF4444]/12 text-[#EF4444] text-[11px] px-2 py-0.5 rounded-full font-bold">
                            {formatHeures(s.heures_complementaires)}
                          </span>
                        ) : (
                          <span className="text-[#7A8FAD] text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button 
                          onClick={(e) => {
                            setOpenMenuId(openMenuId === s.id_enseigner ? null : s.id_enseigner);
                          }}
                          className="text-[#7A8FAD] hover:text-white p-1 transition-colors relative"
                        >
                          <MdMoreVert size={20} />
                          {openMenuId === s.id_enseigner && (
                            <div ref={actionMenuRef} className="absolute right-0 mt-2 w-48 bg-[#0D1B2A] border border-white/10 rounded-md shadow-lg z-10">
                              <button
                                onClick={() => {
                                  setEditTarget(s);
                                  setFormData({
                                    id_utilisateur: s.id_utilisateur,
                                    id_matiere: s.id_matiere,
                                    date_cours: s.date_cours,
                                    nb_heures: s.nb_heures,
                                    type_heure: s.type_heure,
                                    salle: s.salle,
                                    observations: s.observations
                                  });
                                  setShowModal(true);
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5"
                              >
                                <MdEdit size={18} className="text-[#0097FB]" /> Modifier
                              </button>
                              <button
                                onClick={() => { handleDelete(s.id_enseigner); setOpenMenuId(null); }}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-[#EF4444] hover:bg-[#EF4444]/10"
                              >
                                <MdDelete size={18} /> Supprimer
                              </button>
                            </div>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-[#7A8FAD]">
                        <MdSearchOff size={40} className="mb-2" />
                        <p className="text-white text-[15px] font-medium">Aucune séance trouvée</p>
                        <p className="text-[13px]">Ajoutez une nouvelle séance</p>
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

    {/* MODALE SAISIE / MODIFICATION */}
    <AnimatePresence>
      {showModal && ( 
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-[#0D1B2A] border border-white/10 rounded-2xl p-7 w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg font-semibold">{editTarget ? "Modifier la séance" : "Nouvelle séance"}</h3>
                <button onClick={resetForm} className="text-[#7A8FAD] hover:text-white transition-colors"> 
                  <MdClose size={22} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">ENSEIGNANT</label> 
                  <select
                    value={formData.id_utilisateur}
                    onChange={(e) => setFormData({ ...formData, id_utilisateur: e.target.value, id_matiere: "" })}
                    className={`bg-white/[0.04] border ${formErrors.id_utilisateur ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all`}
                  >
                    <option value="">Sélectionner un enseignant</option>
                    {enseignants.map(e => <option key={e.id_utilisateur} value={e.id_utilisateur}>{e.prenom} {e.nom} ({e.ref_utilisateur})</option>)}
                  </select>
                  {formErrors.id_utilisateur && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">MATIÈRE</label> 
                  <select
                    disabled={!formData.id_utilisateur}
                    value={formData.id_matiere}
                    onChange={(e) => setFormData({ ...formData, id_matiere: e.target.value })}
                    className={`bg-white/[0.04] border ${formErrors.id_matiere ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">{formData.id_utilisateur ? "Sélectionner une matière" : "Sélectionnez un enseignant"}</option>
                    {matieres.filter(m => m.id_utilisateur === Number(formData.id_utilisateur)).map(m => (
                      <option key={m.id_matiere} value={m.id_matiere}>{m.intitule}</option>
                    ))}
                  </select>
                  {formErrors.id_matiere && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">DATE DU COURS</label> 
                  <input
                    type="date"
                    value={formData.date_cours}
                    onChange={(e) => setFormData({ ...formData, date_cours: e.target.value })}
                    className={`bg-white/[0.04] border ${formErrors.date_cours ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all [color-scheme:dark]`}
                  />
                  {formErrors.date_cours && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">DURÉE (HEURES)</label> 
                  <input
                    type="number" min="0.5" step="0.5" placeholder="Ex: 2"
                    value={formData.nb_heures}
                    onChange={(e) => setFormData({ ...formData, nb_heures: e.target.value })}
                    className={`bg-white/[0.04] border ${formErrors.nb_heures ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all`}
                  />
                  {formErrors.nb_heures && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">TYPE D'HEURE</label> 
                  <div className="flex gap-2">
                    {["CM", "TD", "TP"].map(type => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, type_heure: type })}
                        className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all border ${
                          formData.type_heure === type
                            ? 'bg-[#0097FB] text-white border-[#0097FB]'
                            : 'bg-white/[0.04] border-white/10 text-[#7A8FAD] hover:bg-[#0097FB]/10 hover:text-[#0097FB]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">SALLE</label> 
                  <input
                    type="text" placeholder="Ex: Amphi A, Salle 12"
                    value={formData.salle}
                    onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
                    className={`bg-white/[0.04] border ${formErrors.salle ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all`}
                  />
                  {formErrors.salle && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">OBSERVATIONS (OPTIONNEL)</label> 
                  <textarea
                    rows={3} placeholder="Remarques, notes particulières..."
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    className="bg-white/[0.04] border border-white/10 rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={resetForm} 
                  className="bg-transparent border border-white/10 text-[#7A8FAD] hover:text-white hover:border-white/20 rounded-lg px-6 py-2.5 text-[14px] font-medium transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit} 
                  className="bg-[#0097FB] text-white rounded-lg px-7 py-2.5 text-[14px] font-medium flex items-center gap-2 hover:opacity-85 transition-all"
                >
                  <MdSave size={18} /> {editTarget ? "Modifier" : "Enregistrer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardRhSaisie;