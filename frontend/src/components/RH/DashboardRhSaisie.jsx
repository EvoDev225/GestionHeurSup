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
import { deconnexion, getAllEnseignant, verifierAuthentification } from '../../fonctions/Utilisateur';
import { getTotalHeures, getHeuresParMois, getRepartitionHeures, getHeuresParEnseignant } from '../../fonctions/Stats';
import { getAllMatieres } from '../../fonctions/Matiere';
import { getAllAnac } from '../../fonctions/Anac';
import { getAllEnseigner, getEnseignerById, newEnseigner, updateEnseigner, deleteEnseigner } from '../../fonctions/Enseigner';
import toast from 'react-hot-toast';

const DashboardRhSaisie = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Données API
  const [totalHeures, setTotalHeures] = useState("");
  const [heuresParMois, setHeuresParMois] = useState([]);
  const [repartition, setRepartition] = useState([]);
  const [seances, setSeances] = useState([]);
  const [enseigner, setEnseigner] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [allEnseignant,setAllEnseignant]=useState([])
  const [anac,setAnac]=useState(null)

  // UI
  const [showModal, setShowModal] = useState(false);

  // Modal modification — complètement séparée de l'insertion
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    date: '',
    type: '',
    duree: '',
    salle: '',
    observation: ''
  });
  const [editFormErrors, setEditFormErrors] = useState({});

  // État Formulaire
  const [formData, setFormData] = useState({
    idens: '',
    idmat: '',
    idanac:anac ? anac.idanac : "",
    date: '',
    type: '',
    duree:'',
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
    setFormData({ idens: '', idanac: anac?.idanac || '', idmat: '', date: '', type: '', duree: '', salle: '', observations: '' });
    setFormErrors({});
    setShowModal(false);
  };

  // Handlers CRUD
  const handleAdd = async () => {
    const errors = {};
    if (!formData.idens) errors.idens = true;
    if (!formData.idmat) errors.idmat = true;
    if (!formData.idanac) errors.idanac = true;
    if (!formData.date) errors.date = true;
    if (!formData.type) errors.type = true;
    if (!formData.duree) errors.duree = true;
    if (!formData.salle) errors.salle = true;
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    try {
      await newEnseigner(formData);
      toast.success("Séance ajoutée avec succès.");
      const res = await getHeuresParEnseignant();
      setSeances(res.data);
      resetForm();
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'ajout.");
    }
  };

  const handleOpenEdit = async (idenseigner) => {
    setEditLoading(true);
    setShowEditModal(true);
    try {
      const res = await getEnseignerById(idenseigner);
      const d = res.data;
      setEditTarget(d);
      setEditFormData({
        date: d.date ? d.date.substring(0, 10) : '',
        type: d.type || '',
        duree: d.duree || '',
        salle: d.salle || '',
        observation: d.observation || ''
      });
    } catch (err) {
      toast.error("Erreur lors du chargement de la séance.");
      setShowEditModal(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdate = async () => {
    const errors = {};
    if (!editFormData.date) errors.date = true;
    if (!editFormData.type) errors.type = true;
    if (!editFormData.duree) errors.duree = true;
    if (!editFormData.salle) errors.salle = true;
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    try {
      await updateEnseigner(editTarget.idenseigner, {
        date: editFormData.date,
        type: editFormData.type,
        duree: editFormData.duree,
        salle: editFormData.salle,
        observation: editFormData.observation
      });
      toast.success("Séance mise à jour avec succès.");
      const res = await getAllEnseigner();
      setEnseigner(res.data);
      setShowEditModal(false);
      setEditTarget(null);
      setEditFormData({ date: '', type: '', duree: '', salle: '', observation: '' });
      setEditFormErrors({});
    } catch (err) {
      toast.error(err.message || "Erreur lors de la modification.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEnseigner(id);
      toast.success("Séance supprimée.");
      const res = await getAllEnseigner();
      setEnseigner(res.data);
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
        setEnseigner(res.data);
      } catch { toast.error("Erreur enseignants."); }
      try {
        const res = await getAllEnseignant();
        setAllEnseignant(res.data);
      } catch (error) {console.log("erreur",error)}
      try { 
        const res = await getAllMatieres();
        setMatieres(res.data);
        
      } catch { toast.error("Erreur matières."); }
    const loadAnac = async () => {
    try {
      const response = await getAllAnac()
      
      let anacEnCours = null;
      if (Array.isArray(response.data)) {
        anacEnCours = response.data.find(a => a.statut === 'en_cours');
      } else {
        anacEnCours = response.data;
      }
      
      setAnac(anacEnCours);
      
      // Mettre à jour formData avec l'idanac
      if (anacEnCours && anacEnCours.idanac) {
        setFormData(prev => ({ ...prev, idanac: anacEnCours.idanac }));
      }
    } catch (error) {
      console.error("Erreur chargement anac:", error);
    }
  };
  
  loadAnac();
      
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
            <p className="text-[#7A8FAD] text-sm mt-1">
              Enregistrement et validation des séances · {anac?.libelle || ''}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="bg-[#7B2FBE]/15 border border-[#7B2FBE]/30 text-[#7B2FBE] text-[13px] font-bold py-1.5 px-4 rounded-full flex items-center gap-2">
              <MdSupervisorAccount size={16} />
              <span>RH</span>
            </div>
          </div>
        </div>

        {/* SECTION 1 — KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
          <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <MdAccessTime className="text-[#0097FB] text-xl" />
              <span className="text-[#7A8FAD] text-[13px]">Total heures saisies</span>
            </div>
            <div className="text-white text-[36px] font-bold leading-tight">{formatHeures(totalHeures)}</div>
            <div className="text-[#7A8FAD] text-[12px] mt-1">Sur {anac?.libelle || 'l\'année en cours'}</div>
            <div className="mt-4 w-full bg-white/5 h-[3px] rounded-full overflow-hidden">
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
            <div className="flex items-center gap-2 mb-3">
              <MdPieChart className="text-[#7B2FBE] text-xl" />
              <span className="text-[#7A8FAD] text-[13px]">Répartition types</span>
            </div>
            {/* Titre type dominant */}
            <div className="text-white text-[22px] font-bold mb-3">
              {repartition.length > 0
                ? `${repartition.reduce((a, b) => parseFloat(a.total_heures) > parseFloat(b.total_heures) ? a : b).type} DOMINANT`
                : '—'}
            </div>
            {/* Barre multicolore */}
            <div className="w-full h-2.5 rounded-full overflow-hidden flex mb-3">
              {repartition.map((type, i) => {
                const pct = totalRepartitionHeures > 0 ? (parseFloat(type.total_heures) / totalRepartitionHeures) * 100 : 0;
                let color = "#0097FB";
                if (type.type === "TD") color = "#EF4444";
                if (type.type === "TP") color = "#10B981";
                return <div key={i} style={{ width: `${pct}%`, backgroundColor: color }} />;
              })}
            </div>
            {/* Légende points */}
            <div className="flex items-center gap-4 flex-wrap">
              {repartition.map((type, i) => {
                let color = "#0097FB";
                if (type.type === "TD") color = "#EF4444";
                if (type.type === "TP") color = "#10B981";
                return (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-[#7A8FAD] text-[12px]">{type.type} {formatHeures(type.total_heures)}</span>
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
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-[#0097FB] text-white text-[13px] font-medium py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-85 transition-all"
            >
              <MdAdd size={18} />
              Ajouter une séance
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] border-collapse">
              <thead>
                <tr className="bg-white/[0.03] text-[#7A8FAD] text-[12px] uppercase tracking-wider text-left">
                  <th className="px-4 py-3 font-medium border-b border-white/5">Enseignant</th> 
                  <th className="px-4 py-3 font-medium border-b border-white/5">Matière</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Date</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Type</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Durée</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5">Salle</th>
                  <th className="px-4 py-3 font-medium border-b border-white/5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enseigner.length > 0 ? (
                  enseigner.map((s) => ( 
                    <tr key={s.idenseigner} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
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
                      <td className="px-4 py-4">
                        <div className="text-[#7A8FAD] text-[13px] max-w-[130px] truncate" title={s.date}>{s.date}</div>
                      </td>
                      <td className="px-4 py-4 text-white text-[13px]">{(s.type)}</td>
                      <td className="px-4 py-4 text-white text-[13px]">{formatHeures(s.duree)}</td>
                      <td className="px-4 py-4">
                        <div className="text-[#7A8FAD] text-[13px] max-w-[130px] truncate" title={s.salle}>{s.salle}</div>
                      </td>
                      <td className="px-4 py-4 text-[#7A8FAD] text-[13px]">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(s.idenseigner)}
                            className="flex items-center gap-1.5 bg-[#0097FB]/10 hover:bg-[#0097FB]/20 text-[#0097FB] text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all"
                          >
                            <MdEdit size={15} /> Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(s.idenseigner)}
                            className="flex items-center gap-1.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all"
                          >
                            <MdDelete size={15} /> Supprimer
                          </button>
                        </div>
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
     {
      showModal && (
         <div className="fixed inset-0 z-[300] flex items-start justify-center pt-16 px-4 pb-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-[#0D1B2A] border border-white/10 rounded-2xl p-7 w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg font-semibold">Nouvelle séance</h3>
                <button onClick={resetForm} className="text-[#7A8FAD] hover:text-white transition-colors"> 
                  <MdClose size={22} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">ENSEIGNANT</label>
                    <select
                      value={formData.idens}
                      onChange={(e) => setFormData({ ...formData, idens: e.target.value })}
                      className={`bg-white/[0.04] border ${formErrors.idens ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all`}
                    >
                      <option value="" className='text-black'>Sélectionner un enseignant</option>
                      {
                        allEnseignant && (
                          allEnseignant.map((e) => (
                            <option className='text-black' key={e.idens} value={e.idens}>
                              {e.prenom} {e.nom}
                            </option>
                          ))
                        )
                      }
                    </select>
                    {formErrors.id_utilisateur && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                  </div>
                  <div className='hidden'>
                    <input type="text" value={formData.idanac || ''} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">MATIÈRE</label>
                    <select
                      value={formData.idmat}
                      onChange={(e) => setFormData({ ...formData, idmat: e.target.value })}
                      className={`bg-white/[0.04] border rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value="" className='text-black'>Sélectionner une matière</option>
                      {
                        matieres && matieres.length > 0 ? (
                          matieres.map((m) => (
                            <option className='text-black' key={m.idmat} value={m.idmat}>
                              {m.intitule}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Chargement des matières...</option>
                        )
                      }
                    </select>
                    {formErrors.idmat && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">DATE DU COURS</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={`bg-white/[0.04] border ${formErrors.date ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all [color-scheme:dark]`}
                    />
                    {formErrors.date && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">DURÉE (HEURES)</label>
                    <input
                      type="number" min="0.5" step="0.5" placeholder="Ex: 2"
                      value={formData.duree}
                      onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                      className={`bg-white/[0.04] border ${formErrors.duree ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all`}
                    />
                    {formErrors.duree && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">TYPE D'HEURE</label>
                    <div className="flex gap-2">
                      {["CM", "TD", "TP"].map(type => (
                        <button
                          key={type}
                          onClick={() => setFormData({ ...formData, type: type })}
                          className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all border ${
                            formData.type === type
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
                  onClick={handleAdd} 
                  className="bg-[#0097FB] text-white rounded-lg px-7 py-2.5 text-[14px] font-medium flex items-center gap-2 hover:opacity-85 transition-all"
                >
                  <MdSave size={18} /> Enregistrer
                </button>
              </div>
            </motion.div>
          </div>
      )
     }
      </AnimatePresence>

      {/* MODALE MODIFICATION — indépendante */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[300] flex items-start justify-center pt-16 px-4 pb-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-[#0D1B2A] border border-white/10 rounded-2xl p-7 w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg font-semibold">Modifier la séance</h3>
                <button
                  onClick={() => { setShowEditModal(false); setEditTarget(null); setEditFormErrors({}); }}
                  className="text-[#7A8FAD] hover:text-white transition-colors"
                >
                  <MdClose size={22} />
                </button>
              </div>

              {editLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-7 h-7 border-2 border-[#0097FB] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">DATE DU COURS</label>
                    <input
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      className={`bg-white/[0.04] border ${editFormErrors.date ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all [color-scheme:dark]`}
                    />
                    {editFormErrors.date && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">DURÉE (HEURES)</label>
                    <input
                      type="number" min="0.5" step="0.5" placeholder="Ex: 2"
                      value={editFormData.duree}
                      onChange={(e) => setEditFormData({ ...editFormData, duree: e.target.value })}
                      className={`bg-white/[0.04] border ${editFormErrors.duree ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all`}
                    />
                    {editFormErrors.duree && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">TYPE D'HEURE</label>
                    <div className="flex gap-2">
                      {["CM", "TD", "TP"].map(type => (
                        <button
                          key={type}
                          onClick={() => setEditFormData({ ...editFormData, type: type })}
                          className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all border ${
                            editFormData.type === type
                              ? 'bg-[#0097FB] text-white border-[#0097FB]'
                              : 'bg-white/[0.04] border-white/10 text-[#7A8FAD] hover:bg-[#0097FB]/10 hover:text-[#0097FB]'
                          }`}
                        >{type}</button>
                      ))}
                    </div>
                    {editFormErrors.type && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">SALLE</label>
                    <input
                      type="text" placeholder="Ex: Amphi A, Salle 12"
                      value={editFormData.salle}
                      onChange={(e) => setEditFormData({ ...editFormData, salle: e.target.value })}
                      className={`bg-white/[0.04] border ${editFormErrors.salle ? 'border-[#EF4444]' : 'border-white/10'} rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all`}
                    />
                    {editFormErrors.salle && <span className="text-[#EF4444] text-[11px]">Ce champ est requis</span>}
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[#7A8FAD] text-[12px] uppercase font-bold tracking-tight">OBSERVATIONS (OPTIONNEL)</label>
                    <textarea
                      rows={3} placeholder="Remarques, notes particulières..."
                      value={editFormData.observation}
                      onChange={(e) => setEditFormData({ ...editFormData, observation: e.target.value })}
                      className="bg-white/[0.04] border border-white/10 rounded-lg py-2.5 px-3.5 text-white text-[13px] outline-none focus:border-[#0097FB] transition-all resize-none"
                    />
                  </div>

                </div>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => { setShowEditModal(false); setEditTarget(null); setEditFormErrors({}); }}
                  className="bg-transparent border border-white/10 text-[#7A8FAD] hover:text-white hover:border-white/20 rounded-lg px-6 py-2.5 text-[14px] font-medium transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdate}
                  className="bg-[#0097FB] text-white rounded-lg px-7 py-2.5 text-[14px] font-medium flex items-center gap-2 hover:opacity-85 transition-all"
                >
                  <MdSave size={18} /> Modifier
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