import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarAdmin from "./SidebarAdmin.jsx";
import Navbar from "../Navbar.jsx";
import { 
  MdPeople, 
  MdSchool, 
  MdBlock, 
  MdSearch, 
  MdPersonAdd, 
  MdMoreVert, 
  MdEdit, 
  MdDelete, 
  MdLock 
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { deconnexion, getAllUsers, verifierAuthentification, newUser, updateUserForAdmin, deleteUser, toggleStatutUser } from "../../fonctions/Utilisateur.jsx";
import toast from "react-hot-toast";
import { 
  getTotalUtilisateurs, 
  getTotalUtilisateursParRole, 
  getTotalUtilisateursParStat 
} from "../../fonctions/Stats.jsx";

// Variants pour les animations (uniformité avec DashboardMain)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const DashboardAdminUser = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("utilisateurs");
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [totalUtilisateurs, setTotalUtilisateurs] = useState(null);
  const [totalParRole, setTotalParRole] = useState([]);
  const [totalParStat, setTotalParStat] = useState(null);

  // État Modale Contextuelle
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const modalRef = useRef(null);

  // État Formulaire
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" | "edit"
  const [formData, setFormData] = useState({
    nom: "", prenom: "", sexe: "M", email: "", contact: "",
    role: "admin", mdp: "",
    // Champs enseignant (conditionnels)
    grade: "", statut: "permanent", departement: "", tauxh: ""
  });

  const handleOpenAdd = () => {
    setFormData({
      nom: "", prenom: "", sexe: "M", email: "", contact: "",
      role: "admin", mdp: "",
      grade: "", statut: "permanent", departement: "", tauxh: ""
    });
    setFormMode("add");
    setFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      nom: item.nom ?? "",
      prenom: item.prenom ?? "",
      sexe: item.sexe ?? "M",
      email: item.email ?? "",
      contact: item.contact ?? "",
      role: item.role ?? "admin",
      mdp: "",
      grade: item.grade ?? "", 
      statut: item.statut ?? "permanent", 
      departement: item.departement ?? "", 
      tauxh: item.tauxh ?? ""
    });
    setFormMode("edit");
    setSelectedItem(item);
    setModalOpen(false);
    setFormOpen(true);
  };

  const handleSubmitForm = async () => {
    const payload = {
      nom: formData.nom,
      prenom: formData.prenom,
      sexe: formData.sexe,
      email: formData.email,
      contact: formData.contact,
      role: formData.role,
      ...(formMode === "add" && { mdp: formData.mdp }),
      ...(formData.role === "enseignant" && {
        grade: formData.grade,
        statut: formData.statut,
        departement: formData.departement,
        tauxh: parseFloat(formData.tauxh)
      })
    };

    try {
      if (formMode === "add") {
        await newUser(payload);
        toast.success("Utilisateur ajouté avec succès !");
      } else {
        await updateUserForAdmin(selectedItem.idutil, payload);
        toast.success("Utilisateur mis à jour avec succès !");
      }
      setFormOpen(false);
      const res = await getAllUsers();
      setUsers(res.data ?? []);
    } catch (error) {
      toast.error(error?.message ?? "Erreur lors de l'opération.");
    }
  };

  const handleDelete = async (item) => {
    try {
      await deleteUser(item.idutil);
      toast.success("Utilisateur supprimé avec succès !");
      setModalOpen(false);
      const res = await getAllUsers();
      setUsers(res.data ?? []);
    } catch (error) {
      toast.error(error?.message ?? "Erreur lors de la suppression.");
    }
  };

  const handleToggleStatut = async (item) => {
    try {
      await toggleStatutUser(item.idutil);
      const label = item.stat === "actif" ? "désactivé" : "activé";
      toast.success(`Compte ${label} avec succès !`);
      setModalOpen(false);
      const res = await getAllUsers();
      setUsers(res.data ?? []);
    } catch (error) {
      toast.error("Erreur lors du changement de statut.");
    }
  };

  // Logique de filtrage
  const listeUsers = users.filter(u => u.role !== "enseignant");
  const listeEnseignants = users.filter(u => u.role === "enseignant");

  const filteredUsers = listeUsers.filter(u => 
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEnseignants = listeEnseignants.filter(e => 
    `${e.nom} ${e.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  // KPIs
  const totalUsersKPI = totalUtilisateurs ?? "...";
  const teachersCount = totalParRole.find(r => r.role === "enseignant")?.total ?? 0;
  const inactifCount = totalParStat?.total_inactifs ?? "...";

  const handleActionClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const getInitials = (nom, prenom) => `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase();
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
          const [allUsers, total, parRole, parStat] = await Promise.all([
            getAllUsers(),
            getTotalUtilisateurs(),
            getTotalUtilisateursParRole(),
            getTotalUtilisateursParStat(),
          ]);
          setUsers(allUsers.data ?? []);
          setTotalUtilisateurs(total.data.total);
          setTotalParRole(parRole.data ?? []);
          setTotalParStat(parStat.data);
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        }
      };

      fetchUserData();
      fetchStats()
    },[]);
  return (
    <div className="min-h-screen bg-[#000814]">
      <SidebarAdmin isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} role="admin" />
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <motion.main 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mt-16 text-white md:ml-57.5 transition-all duration-300 min-h-[calc(100vh-64px)] p-4 md:p-6"
      >
      
      {/* SECTION 1 — KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <MdPeople className="text-2xl text-[#0097FB]" />
            <span className="text-[#7A8FAD] text-[13px]">Utilisateurs</span>
          </div>
          <h3 className="text-3xl font-bold">{totalUsersKPI}</h3>
          <p className="text-[#0097FB] text-[12px] mt-1 font-medium">Enregistrés</p>
        </div>

        <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <MdSchool className="text-2xl text-[#0097FB]" />
            <span className="text-[#7A8FAD] text-[13px]">Enseignants</span>
          </div>
          <h3 className="text-3xl font-bold">{teachersCount}</h3>
          <p className="text-[#0097FB] text-[12px] mt-1 font-medium">Actifs</p>
        </div>

        <div className="bg-[#0D1B2A] border border-white/5 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <MdBlock className="text-2xl text-[#EF4444]" />
            <span className="text-[#7A8FAD] text-[13px]">Inactif</span>
          </div>
          <h3 className="text-3xl font-bold">{inactifCount}</h3>
          <p className="text-[#7A8FAD] text-[12px] mt-1">Ces derniers jours</p>
        </div>
      </div>

      {/* SECTION 2 — TABLEAU CONTAINER */}
      <motion.div variants={itemVariants} className="bg-[#0D1B2A] border border-white/5 rounded-xl p-4 md:p-6 mt-6 relative">
        
        {/* EN-TÊTE DU TABLEAU */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Liste des utilisateurs</h2>
          <button onClick={handleOpenAdd} className="bg-[#0097FB] hover:opacity-85 text-white rounded-lg px-4 py-2 text-[13px] flex items-center gap-2 transition-all">
            <MdPersonAdd className="text-lg" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>

        {/* ONGLETS & FILTRES */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 w-fit rounded-lg border border-white/5">
            <button 
              onClick={() => setActiveTab("utilisateurs")}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${activeTab === "utilisateurs" ? "bg-[#0097FB] text-white" : "text-[#7A8FAD] hover:text-white"}`}
            >
              Utilisateurs
            </button>
            <button 
              onClick={() => setActiveTab("enseignants")}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${activeTab === "enseignants" ? "bg-[#0097FB] text-white" : "text-[#7A8FAD] hover:text-white"}`}
            >
              Enseignants
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-50">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8FAD] text-xl" />
              <input 
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-[13px] outline-none focus:border-[#0097FB]/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* TABLE WRAPPER */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 text-left border-collapse">
            {/* HEADERS */}
            <thead className="bg-white/5 text-[#7A8FAD] text-[11px] uppercase tracking-wider">
              <tr>
                {activeTab === "utilisateurs" ? (
                  <>
                    <th className="px-4 py-3 font-semibold border-b border-white/5">Nom & Prénom</th>
                    <th className="px-4 py-3 font-semibold border-b border-white/5">Email</th>
                    <th className="px-4 py-3 font-semibold border-b border-white/5">Rôle</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 font-semibold border-b border-white/5">Enseignant</th>
                    <th className="px-4 py-3 font-semibold border-b border-white/5">Email</th>
                    <th className="px-4 py-3 font-semibold border-b border-white/5">Contact</th>
                  </>
                )}
                <th className="px-4 py-3 font-semibold border-b border-white/5 text-center">Statut</th>
                <th className="px-4 py-3 font-semibold border-b border-white/5 text-right">Actions</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-white/5">
              {(activeTab === "utilisateurs" ? filteredUsers : filteredEnseignants).map((item) => (
                <tr key={`${activeTab}-${item.idutil}`} className="hover:bg-white/[0.02] transition-colors group">
                  {/* Col 1 : Identité */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0097FB]/15 text-[#0097FB] flex items-center justify-center font-bold text-[13px]">
                        {getInitials(item.nom ?? "", item.prenom ?? "")}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium leading-tight">{item.nom} {item.prenom}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contenu spécifique par Tab */}
                  {activeTab === "utilisateurs" ? (
                    <>
                      <td className="px-4 py-4 text-[#7A8FAD] text-[13px]">{item.email}</td>
                      <td className="px-4 py-4">
                        <span className="bg-white/10 text-[#94A3B8] text-[11px] px-2.5 py-0.5 rounded-full border border-white/5">
                          {item.role}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4 text-[#7A8FAD] text-[13px]">{item.email}</td>
                      <td className="px-4 py-4 text-white font-medium text-[13px]">{item.contact}</td>
                    </>
                  )}

                  {/* Statut */}
                  <td className="px-4 py-4 text-center">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                      item.stat === "actif" 
                        ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20" 
                        : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20"
                    }`}>
                      {item.stat}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-right relative">
                    <button 
                      onClick={() => handleActionClick(item)}
                      className="text-[#7A8FAD] hover:text-white p-1 rounded-full hover:bg-white/5 transition-all"
                    >
                      <MdMoreVert className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODALE CONTEXTUELLE (DROPDOWN) */}
        <AnimatePresence>
          {modalOpen && (
          <motion.div 
            onClick={() => setModalOpen(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-90 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" 
          >
            {/* Overlay invisible pour capter le clic partout */}
            <div 
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute bg-[#0D1B2A] border border-white/10 rounded-[10px] p-2 min-w-45 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-100"
              style={{ 
                top: "50%",
                left: "50%", 
                transform: "translate(-50%, -50%)" // Centré par défaut pour simplifier le responsive
              }}
            >
              <div className="p-2 border-b border-white/5 mb-1">
                <p className="text-[11px] text-[#7A8FAD] uppercase font-bold tracking-tight">Actions utilisateur</p>
                <p className="text-[13px] font-medium truncate">{selectedItem?.nom} {selectedItem?.prenom}</p>
              </div>
              
              <div 
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-md cursor-pointer transition-colors group"
                onClick={() => handleOpenEdit(selectedItem)}
              >
                <MdEdit className="text-[#0097FB] text-lg" />
                <span className="text-[13px] text-white">Modifier les infos</span>
              </div>

              <div 
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#EF4444]/10 rounded-md cursor-pointer transition-colors group"
                onClick={() => handleDelete(selectedItem)}
              >
                <MdDelete className="text-[#EF4444] text-lg" />
                <span className="text-[13px] text-[#EF4444]">Supprimer le compte</span>
              </div>

              <div 
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-md cursor-pointer transition-colors group"
                onClick={() => handleToggleStatut(selectedItem)}
              >
                <MdLock className="text-[#F59E0B] text-lg" />
                <span className="text-[13px] text-[#F59E0B]">
                  {selectedItem?.stat === "actif" ? "Verrouiller l'accès" : "Activer le compte"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* FORMULAIRE MODAL */}
        <AnimatePresence>
          {formOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setFormOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#0D1B2A] border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-[16px] font-bold mb-5">
                  {formMode === "add" ? "Ajouter un utilisateur" : "Modifier l'utilisateur"}
                </h3>

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#7A8FAD] text-[12px]">Nom</label>
                      <input value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})}
                        className="bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-[13px] outline-none focus:border-[#0097FB] transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#7A8FAD] text-[12px]">Prénom</label>
                      <input value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})}
                        className="bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-[13px] outline-none focus:border-[#0097FB] transition-colors" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[#7A8FAD] text-[12px]">Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-[13px] outline-none focus:border-[#0097FB] transition-colors" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[#7A8FAD] text-[12px]">Contact</label>
                    <input value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-[13px] outline-none focus:border-[#0097FB] transition-colors" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#7A8FAD] text-[12px]">Sexe</label>
                      <select value={formData.sexe} onChange={e => setFormData({...formData, sexe: e.target.value})}
                        className="bg-[#0A1628] border border-white/10 rounded-lg py-2.5 px-3 text-[13px] outline-none cursor-pointer">
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#7A8FAD] text-[12px]">Rôle</label>
                      <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                        className="bg-[#0A1628] border border-white/10 rounded-lg py-2.5 px-3 text-[13px] outline-none cursor-pointer">
                        <option value="admin">Admin</option>
                        <option value="rh">RH</option>
                        <option value="enseignant">Enseignant</option>
                      </select>
                    </div>
                  </div>

                  {formMode === "add" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#7A8FAD] text-[12px]">Mot de passe</label>
                      <input type="password" value={formData.mdp} onChange={e => setFormData({...formData, mdp: e.target.value})}
                        className="bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-[13px] outline-none focus:border-[#0097FB] transition-colors" />
                    </div>
                  )}

                  {formData.role === "enseignant" && (
                    <>
                      <div className="border-t border-white/5 pt-4">
                        <p className="text-[#0097FB] text-[12px] font-medium mb-3">Informations enseignant</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[#7A8FAD] text-[12px]">Grade</label>
                          <input value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}
                            placeholder="Ex: Maître de conférence"
                            className="bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-[13px] outline-none focus:border-[#0097FB] transition-colors" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[#7A8FAD] text-[12px]">Statut</label>
                          <select value={formData.statut} onChange={e => setFormData({...formData, statut: e.target.value})}
                            className="bg-[#0A1628] border border-white/10 rounded-lg py-2.5 px-3 text-[13px] outline-none cursor-pointer">
                            <option value="permanent">Permanent</option>
                            <option value="vacataire">Vacataire</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[#7A8FAD] text-[12px]">Département</label>
                          <input value={formData.departement} onChange={e => setFormData({...formData, departement: e.target.value})}
                            placeholder="Ex: Informatique"
                            className="bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-[13px] outline-none focus:border-[#0097FB] transition-colors" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[#7A8FAD] text-[12px]">Taux horaire (FCFA)</label>
                          <input type="number" value={formData.tauxh} onChange={e => setFormData({...formData, tauxh: e.target.value})}
                            placeholder="Ex: 5000"
                            className="bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-[13px] outline-none focus:border-[#0097FB] transition-colors" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setFormOpen(false)}
                    className="text-[#7A8FAD] border border-white/10 rounded-lg px-4 py-2 text-[13px] hover:bg-white/5 transition-all">
                    Annuler
                  </button>
                  <button onClick={handleSubmitForm}
                    className="bg-[#0097FB] hover:opacity-85 text-white rounded-lg px-5 py-2 text-[13px] font-medium transition-all">
                    {formMode === "add" ? "Ajouter" : "Enregistrer"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
      </motion.main>
    </div>
  );
};

export default DashboardAdminUser;