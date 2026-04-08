import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarAdmin from "./SidebarAdmin.jsx";
import Navbar from "../Navbar.jsx";
import { 
  MdAccountTree, 
  MdLayers, 
  MdAdd, 
  MdSearch, 
  MdMoreVert, 
  MdEdit, 
  MdDelete, 
  MdSearchOff,
  MdAccessTime,
  MdClose,
  MdSave
} from "react-icons/md";
import { deconnexion, verifierAuthentification } from "../../fonctions/utilisateur.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getMatiereMaxVolumeHoraire, getMatiereParNiveau } from "../../fonctions/Stats.jsx";
import { getAllMatieres, newMatiere, updateMatiere, deleteMatiere } from "../../fonctions/Matiere.jsx";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const DashboardAdminMatiere = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [matieres, setMatieres] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterFiliere, setFilterFiliere] = useState('');
  const [filterNiveau, setFilterNiveau] = useState('');

  const [kpiNiveau, setKpiNiveau] = useState(null);
  const [kpiMaxVol, setKpiMaxVol] = useState(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState(null);

  // Formulaire partagé add/edit
  const [formData, setFormData] = useState({
    intitule: '',
    filiere: '',
    niveau: '',
    volumhor: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchMatieres = async () => {
    try {
      const [res, nRes, vRes] = await Promise.all([
        getAllMatieres(),
        getMatiereParNiveau(),
        getMatiereMaxVolumeHoraire()
      ]);
      setMatieres(res.data || []);
      setFiltered(res.data || []);
      setKpiNiveau(nRes.data);
      setKpiMaxVol(vRes.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des matières");
    }
  };

  useEffect(() => { fetchMatieres(); }, []);

  // FILTRAGE en temps réel
  useEffect(() => {
    let result = matieres;
    if (search) result = result.filter(m =>
      m.intitule.toLowerCase().includes(search.toLowerCase()) ||
      m.filiere.toLowerCase().includes(search.toLowerCase())
    );
    if (filterFiliere) result = result.filter(m => m.filiere === filterFiliere);
    if (filterNiveau) result = result.filter(m => m.niveau === filterNiveau);
    setFiltered(result);
  }, [search, filterFiliere, filterNiveau, matieres]);

  const handleOpenAdd = () => {
    setFormData({ intitule: '', filiere: '', niveau: '', volumhor: '' });
    setShowAddModal(true);
  };

  const handleAddSubmit = async () => {
    if (!formData.intitule || !formData.filiere || !formData.niveau || !formData.volumhor) {
      toast.error("Tous les champs sont obligatoires");
      return;
    }
    setFormLoading(true);
    try {
      await newMatiere(formData);
      toast.success("Matière ajoutée avec succès");
      setShowAddModal(false);
      fetchMatieres();
    } catch (err) {
      toast.error("Erreur lors de l'ajout",err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenActionModal = (matiere) => {
    setSelectedMatiere(matiere);
    setShowActionModal(true);
  };

  const handleChooseEdit = () => {
    setFormData({
      intitule: selectedMatiere.intitule,
      filiere: selectedMatiere.filiere,
      niveau: selectedMatiere.niveau,
      volumhor: String(selectedMatiere.volumhor)
    });
    setShowActionModal(false);
    setShowEditModal(true);
  };

  const handleChooseDelete = () => {
    setShowActionModal(false);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    // Vérification sécurité
    if (!selectedMatiere?.idmat) {
      toast.error("Aucune matière sélectionnée");
      return;
    }

    try {
      await deleteMatiere(selectedMatiere.idmat);
      toast.success(`"${selectedMatiere.intitule}" supprimée avec succès`);
      setShowDeleteConfirm(false);
      setSelectedMatiere(null);
      fetchMatieres();
    } catch (err) {
      const msg = typeof err === 'object' ? err.message : err;
      toast.error(`Erreur : ${msg || "suppression échouée"}`);
    }
  };

  const handleEditSubmit = async () => {
    // Vérification présence des données
    if (!selectedMatiere?.idmat) {
      toast.error("Aucune matière sélectionnée");
      return;
    }
    if (!formData.intitule?.trim()) {
      toast.error("L'intitulé est obligatoire");
      return;
    }
    if (!formData.filiere?.trim()) {
      toast.error("La filière est obligatoire");
      return;
    }
    if (!formData.niveau) {
      toast.error("Le niveau est obligatoire");
      return;
    }
    if (!formData.volumhor || Number(formData.volumhor) <= 0) {
      toast.error("Le volume horaire doit être un nombre positif");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        intitule: formData.intitule.trim(),
        filiere: formData.filiere.trim(),
        niveau: formData.niveau,
        volumhor: Number(formData.volumhor)
      };
      await updateMatiere(selectedMatiere.idmat, payload);
      toast.success("Matière modifiée avec succès");
      setShowEditModal(false);
      setSelectedMatiere(null);
      fetchMatieres();
    } catch (err) {
      const msg = typeof err === 'object' ? err.message : err;
      toast.error(`Erreur : ${msg || "modification échouée"}`);
    } finally {
      setFormLoading(false);
    }
  };

  // Ouvre directement le modal modification
  const handleChooseEditDirect = (matiere) => {
    setSelectedMatiere(matiere);
    setFormData({
      intitule: matiere.intitule,
      filiere: matiere.filiere,
      niveau: matiere.niveau,
      volumhor: String(matiere.volumhor) // conversion en string pour l'input
    });
    setShowEditModal(true);
  };

  // Ouvre directement le modal suppression
  const handleChooseDeleteDirect = (matiere) => {
    setSelectedMatiere(matiere);
    setShowDeleteConfirm(true);
  };

  const countFilieres = [...new Set(matieres.map(m => m.filiere))].length;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await verifierAuthentification();
        if (res.data.role !== "admin") {
          toast.error("Accès refusé. Redirection vers la page d'accueil.");
          await deconnexion();
          navigate('/');
        }
      } catch (error) {
        navigate("/");
        toast.error("Une erreur est survenue lors de la vérification de l'authentification.");
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-[#000814]">
      <SidebarAdmin isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} role="admin" />
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} userName="John Smith" userRole="Administrateur" />

      <motion.main 
        initial="hidden" animate="visible" variants={containerVariants}
        className="mt-16 text-white md:ml-57.5 transition-all duration-300 min-h-[calc(100vh-64px)] p-4 md:p-6"
      >
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-[#0d1b2a] border border-[#1e2d3d] p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <MdAccountTree className="text-2xl text-[#0097FB]" />
                <span className="text-[#7A8FAD] text-[13px]">Filières</span>
              </div>
              <h3 className="text-3xl font-bold">{countFilieres}</h3>
              <p className="text-[#7A8FAD] text-[12px] mt-1">Filières actives</p>
            </div>

            <div className="bg-[#0d1b2a] border border-[#1e2d3d] p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <MdLayers className="text-2xl text-[#0097FB]" />
                <span className="text-[#7A8FAD] text-[13px]">Niveau le plus chargé</span>
              </div>
              <h3 className="text-3xl font-bold">{kpiNiveau?.niveau || "—"}</h3>
              <p className="text-[#7A8FAD] text-[12px] mt-1">{kpiNiveau?.total || 0} matières · niveau le plus chargé</p>
            </div>

            <div className="bg-[#0d1b2a] border border-[#1e2d3d] p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <MdAccessTime className="text-2xl text-[#10B981]" />
                <span className="text-[#7A8FAD] text-[13px]">Volume Max</span>
              </div>
              <h3 className="text-3xl font-bold">{kpiMaxVol ? `${kpiMaxVol.volumhor}h` : "—"}</h3>
              <p className="text-[#7A8FAD] text-[12px] mt-1 truncate">{kpiMaxVol?.intitule || "Aucune matière"}</p>
            </div>
        </div>

        {/* TABLE SECTION */}
        <motion.div variants={itemVariants} className="bg-[#0D1B2A] border border-white/5 rounded-xl p-4 md:p-6 mt-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold">Liste des matières</h2>
              <button
                onClick={handleOpenAdd}
                className="bg-[#0097FB] hover:opacity-85 text-white rounded-lg px-4 py-2.5 text-[13px] flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
              >
                <MdAdd className="text-lg" />
                <span className="hidden sm:inline">Ajouter une matière</span>
              </button>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-full lg:min-w-[200px]">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8FAD] text-xl" />
                <input 
                  type="text" placeholder="Rechercher une matière, une filière..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-[13px] outline-none focus:border-[#0097FB] transition-all"
                />
              </div>
              <select value={filterFiliere} onChange={e => setFilterFiliere(e.target.value)} className="bg-[#0D1B2A] border border-white/10 rounded-lg px-3 py-2 text-[13px] flex-1 min-w-[140px] outline-none cursor-pointer">
                <option value="">Toutes les filières</option>
                {[...new Set(matieres.map(m => m.filiere))].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} className="bg-[#0D1B2A] border border-white/10 rounded-lg px-3 py-2 text-[13px] flex-1 min-w-[140px] outline-none cursor-pointer">
                <option value="">Tous les niveaux</option>
                {[...new Set(matieres.map(m => m.niveau))].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <p className="text-[13px] text-[#7A8FAD] mb-4">{filtered.length} matière(s) trouvée(s)</p>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead className="bg-white/[0.03] text-[#7A8FAD] text-[12px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Intitulé</th>
                    <th className="px-4 py-3 text-left font-medium">Filière</th>
                    <th className="px-4 py-3 text-left font-medium">Niveau</th>
                    <th className="px-4 py-3 text-left font-medium">Volume Hor.</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.length > 0 ? (
                    filtered.map((m) => (
                      <tr key={m.idmat} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 py-4 text-[14px] font-medium text-white">{m.intitule}</td>
                        <td className="px-4 py-4 text-[13px] text-[#7A8FAD]">{m.filiere}</td>
                        <td className="px-4 py-4">
                          <span className="bg-[#0097FB]/10 text-[#0097FB] text-[12px] px-2.5 py-0.5 rounded-full font-medium">{m.niveau}</span>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-white font-mono">{m.volumhor}h</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Bouton Modifier */}
                            <button
                              onClick={() => handleChooseEditDirect(m)}
                              title="Modifier"
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#7B2FBE]/15 text-[#7B2FBE] hover:bg-[#7B2FBE]/35 transition"
                            >
                              <MdEdit className="text-base" />
                            </button>

                            {/* Bouton Supprimer */}
                            <button
                              onClick={() => handleChooseDeleteDirect(m)}
                              title="Supprimer"
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/25 transition"
                            >
                              <MdDelete className="text-base" />
                            </button>

                            {/* Bouton Actions (modal choix) */}
                            <button
                              onClick={() => handleOpenActionModal(m)}
                              title="Plus d'actions"
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-[#7A8FAD] hover:bg-white/10 transition"
                            >
                              <MdMoreVert className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <MdSearchOff className="text-5xl text-[#7A8FAD]" />
                          <p className="text-[15px] font-medium">Aucune matière trouvée</p>
                          <p className="text-[#7A8FAD] text-[13px]">Modifiez vos filtres ou ajoutez une nouvelle matière</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        </motion.div>
      </motion.main>

      {/* ===== MODAL AJOUT ===== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-white text-xl font-semibold mb-5">Ajouter une matière</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Intitulé *</label>
                <input
                  type="text"
                  value={formData.intitule}
                  onChange={e => setFormData({ ...formData, intitule: e.target.value })}
                  placeholder="Ex: Algorithmique"
                  className="w-full bg-[#0a1628] border border-[#1e2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#0097FB]"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Filière *</label>
                <input
                  type="text"
                  value={formData.filiere}
                  onChange={e => setFormData({ ...formData, filiere: e.target.value })}
                  placeholder="Ex: Informatique"
                  className="w-full bg-[#0a1628] border border-[#1e2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#0097FB]"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Niveau *</label>
                <select
                  value={formData.niveau}
                  onChange={e => setFormData({ ...formData, niveau: e.target.value })}
                  className="w-full bg-[#0a1628] border border-[#1e2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#0097FB]"
                >
                  <option value="">-- Sélectionner --</option>
                  {['BTS1','BTS2','L1','L2','L3','M1','M2'].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Volume horaire (h) *</label>
                <input
                  type="number"
                  value={formData.volumhor}
                  onChange={e => setFormData({ ...formData, volumhor: e.target.value })}
                  placeholder="Ex: 45"
                  min="1"
                  className="w-full bg-[#0a1628] border border-[#1e2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#0097FB]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2 rounded-lg border border-[#1e2d3d] text-gray-400 hover:text-white text-sm transition"
              >
                Annuler
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={formLoading}
                className="px-5 py-2 rounded-lg bg-[#0097FB] text-white text-sm font-medium hover:bg-[#0080d4] transition disabled:opacity-50"
              >
                {formLoading ? "Enregistrement..." : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL D'ACTION ===== */}
      {showActionModal && selectedMatiere && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-2xl p-6 w-full max-w-sm shadow-xl">
            
            <h2 className="text-white text-lg font-semibold mb-1">Actions sur la matière</h2>
            <p className="text-[#0097FB] text-sm font-medium mb-6">
              {selectedMatiere.intitule} — {selectedMatiere.niveau}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleChooseEdit}
                className="w-full px-4 py-3 rounded-xl bg-[#7B2FBE]/20 text-[#7B2FBE] hover:bg-[#7B2FBE]/40 text-sm font-medium transition flex items-center gap-3"
              >
                <span className="text-lg">✏️</span>
                <div className="text-left">
                  <div className="font-semibold">Modifier</div>
                  <div className="text-xs text-gray-400">Mettre à jour les informations</div>
                </div>
              </button>

              <button
                onClick={handleChooseDelete}
                className="w-full px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/25 text-sm font-medium transition flex items-center gap-3"
              >
                <span className="text-lg">🗑️</span>
                <div className="text-left">
                  <div className="font-semibold">Supprimer</div>
                  <div className="text-xs text-gray-400">Retirer définitivement cette matière</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => { setShowActionModal(false); setSelectedMatiere(null); }}
              className="w-full mt-4 px-4 py-2 rounded-lg border border-[#1e2d3d] text-gray-400 hover:text-white text-sm transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL MODIFICATION ===== */}
      {showEditModal && selectedMatiere && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-2xl p-6 w-full max-w-md shadow-xl">
            
            <h2 className="text-white text-xl font-semibold mb-1">Modifier la matière</h2>
            <p className="text-gray-400 text-sm mb-5">{selectedMatiere.intitule}</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Intitulé *</label>
                <input
                  type="text"
                  value={formData.intitule}
                  onChange={e => setFormData({ ...formData, intitule: e.target.value })}
                  className="w-full bg-[#0a1628] border border-[#1e2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#0097FB]"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Filière *</label>
                <input
                  type="text"
                  value={formData.filiere}
                  onChange={e => setFormData({ ...formData, filiere: e.target.value })}
                  className="w-full bg-[#0a1628] border border-[#1e2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#0097FB]"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Niveau *</label>
                <select
                  value={formData.niveau}
                  onChange={e => setFormData({ ...formData, niveau: e.target.value })}
                  className="w-full bg-[#0a1628] border border-[#1e2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#0097FB]"
                >
                  <option value="">-- Sélectionner --</option>
                  {['BTS1','BTS2','L1','L2','L3','M1','M2'].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Volume horaire (h) *</label>
                <input
                  type="number"
                  value={formData.volumhor}
                  onChange={e => setFormData({ ...formData, volumhor: e.target.value })}
                  min="1"
                  className="w-full bg-[#0a1628] border border-[#1e2d3d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#0097FB]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2 rounded-lg border border-[#1e2d3d] text-gray-400 hover:text-white text-sm transition"
              >
                Annuler
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={formLoading}
                className="px-5 py-2 rounded-lg bg-[#7B2FBE] text-white text-sm font-medium hover:bg-[#6a28a3] transition disabled:opacity-50"
              >
                {formLoading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL CONFIRMATION SUPPRESSION ===== */}
      {showDeleteConfirm && selectedMatiere && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0d1b2a] border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center text-xl">
                🗑️
              </div>
              <h2 className="text-white text-lg font-semibold">Confirmer la suppression</h2>
            </div>

            <p className="text-gray-400 text-sm mb-2">
              Vous êtes sur le point de supprimer :
            </p>
            <p className="text-white font-medium text-sm mb-1">{selectedMatiere.intitule}</p>
            <p className="text-gray-500 text-xs mb-6">
              {selectedMatiere.filiere} · {selectedMatiere.niveau} · {selectedMatiere.volumhor}h
            </p>
            <p className="text-red-400 text-xs mb-6">
              ⚠️ Cette action est irréversible.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setSelectedMatiere(null); }}
                className="flex-1 px-4 py-2 rounded-lg border border-[#1e2d3d] text-gray-400 hover:text-white text-sm transition"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdminMatiere;