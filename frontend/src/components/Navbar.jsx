import React, { useEffect, useState } from "react";
import { 
  MdMenu, 
  MdClose, 
  MdEdit, 
  MdSave, 
  MdPerson, 
  MdEmail, 
  MdLock, 
  MdVisibility, 
  MdVisibilityOff 
} from "react-icons/md";
import { verifierAuthentification, getUserById, updateSimpleUser } from "../fonctions/utilisateur";
import toast from "react-hot-toast";

const Navbar = ({ onMenuClick }) => {

  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "", sexe: "", email: "", mdp: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await verifierAuthentification();
        setUser(res.data);
      } catch (error) {
        toast.error("Une erreur est survenue lors de la vérification de l'authentification.");
      }
    };
    fetchUserData();
  }, []);

  const openModal = async () => {
    if (!user?.idutil) return;
    try {
      const res = await getUserById(user.idutil);
      const data = res.data;
      setForm({
        nom: data.nom || "",
        prenom: data.prenom || "",
        sexe: data.sexe || "M",
        email: data.email || "",
        mdp: ""
      });
      setModalOpen(true);
      setEditMode(false);
    } catch (error) {
      toast.error("Erreur lors de la récupération du profil.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (form.mdp.trim() === "") delete payload.mdp;
      await updateSimpleUser(user.idutil, payload);
      toast.success("Profil mis à jour.");
      setEditMode(false);
      
      const res = await verifierAuthentification();
      setUser(res.data);
      window.location.reload()
    } catch (error) {
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const nomComplet = user ? `${user.prenom} ${user.nom}` : "...";
  const roleLabel = user?.role === "admin" ? "Administrateur"
    : user?.role === "rh" ? "Responsable RH"
    : user?.role === "enseignant" ? "Enseignant"
    : "";
  const initiales = user ? `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}` : "?";

  return (
    <>
      <nav className="fixed top-0 right-0 h-16 w-full md:w-[calc(100%-230px)] bg-[#000814] border-b border-white/5 border-l-2 border-[#7B2FBE] z-50 flex items-center justify-between px-6 transition-all duration-300">
      {/* CÔTÉ GAUCHE : Hamburger Mobile */}
      <div className="flex items-center">
        <button
          className="md:hidden text-white text-2xl hover:bg-white/5 p-2 rounded-lg transition-colors"
          onClick={onMenuClick}
        >
          <MdMenu />
        </button>
      </div>

      {/* CÔTÉ DROIT : Profil Utilisateur */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-white text-[14px] font-medium leading-tight">
            {nomComplet}
          </p>
          <p className="text-[#7A8FAD] text-[12px] leading-tight">
            {roleLabel}
          </p>
        </div>

        {/* Avatar */}
        <button 
          onClick={openModal}
          className="w-10 h-10 rounded-full bg-[#0097FB] flex items-center justify-center text-white font-bold shadow-lg shadow-[#0097FB]/20 border border-white/10 cursor-pointer hover:ring-2 hover:ring-[#0097FB]/50 transition-all"
        >
          {initiales}
        </button>
      </div>
    </nav>

    {/* Modal de Profil */}
    {modalOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-[#0D1B2A] border border-white/10 rounded-[16px] w-full max-w-md p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MdPerson className="text-[#0097FB] text-xl" />
              <h3 className="text-white text-[18px] font-bold">Mon profil</h3>
            </div>
            <button 
              onClick={() => { setModalOpen(false); setEditMode(false); }}
              className="text-[#7A8FAD] hover:text-white transition-colors"
            >
              <MdClose size={24} />
            </button>
          </div>

          {/* Profile Section Summary */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#0097FB] flex items-center justify-center text-white text-2xl font-bold border-4 border-white/5 mb-3">
              {initiales}
            </div>
            <h4 className="text-white text-[18px] font-bold">{nomComplet}</h4>
            <p className="text-[#7A8FAD] text-[13px]">{roleLabel}</p>
          </div>

          <div className="border-b border-white/8 mb-6" />

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <MdPerson className="absolute left-3 top-3 text-[#7A8FAD]" size={18} />
                <input 
                  type="text" value={form.prenom} disabled={!editMode}
                  onChange={(e) => editMode && setForm(prev => ({ ...prev, prenom: e.target.value }))}
                  placeholder="Prénom"
                  className={`w-full bg-white/4 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-[13px] outline-none transition-all ${editMode ? 'focus:border-[#0097FB]' : 'opacity-70 cursor-not-allowed'}`}
                />
              </div>
              <div className="relative">
                <MdPerson className="absolute left-3 top-3 text-[#7A8FAD]" size={18} />
                <input 
                  type="text" value={form.nom} disabled={!editMode}
                  onChange={(e) => editMode && setForm(prev => ({ ...prev, nom: e.target.value }))}
                  placeholder="Nom"
                  className={`w-full bg-white/4 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-[13px] outline-none transition-all ${editMode ? 'focus:border-[#0097FB]' : 'opacity-70 cursor-not-allowed'}`}
                />
              </div>
            </div>

            <div className="relative">
              <MdPerson className="absolute left-3 top-3 text-[#7A8FAD]" size={18} />
              <select 
                value={form.sexe} disabled={!editMode}
                onChange={(e) => editMode && setForm(prev => ({ ...prev, sexe: e.target.value }))}
                className={`w-full bg-[#0D1B2A] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-[13px] outline-none transition-all appearance-none ${editMode ? 'focus:border-[#0097FB]' : 'opacity-70 cursor-not-allowed'}`}
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>

            <div className="relative">
              <MdEmail className="absolute left-3 top-3 text-[#7A8FAD]" size={18} />
              <input 
                type="email" value={form.email} disabled={!editMode}
                onChange={(e) => editMode && setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className={`w-full bg-white/4 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-[13px] outline-none transition-all ${editMode ? 'focus:border-[#0097FB]' : 'opacity-70 cursor-not-allowed'}`}
              />
            </div>

            <div className="relative">
              <MdLock className="absolute left-3 top-3 text-[#7A8FAD]" size={18} />
              <input 
                type={showPassword ? "text" : "password"} value={form.mdp} disabled={!editMode}
                onChange={(e) => editMode && setForm(prev => ({ ...prev, mdp: e.target.value }))}
                placeholder="Laisser vide pour ne pas modifier"
                className={`w-full bg-white/4 border border-white/10 rounded-lg py-2.5 pl-10 pr-12 text-white text-[13px] outline-none transition-all ${editMode ? 'focus:border-[#0097FB]' : 'opacity-70 cursor-not-allowed'}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-[#7A8FAD] hover:text-white transition-colors">
                {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
              </button>
            </div>
          </div>

          {/* Footer cas par cas */}
          <div className="mt-8 flex gap-3">
            {!editMode ? (
              <>
                <button onClick={() => setModalOpen(false)} className="flex-1 bg-transparent border border-white/10 text-white rounded-lg py-2.5 text-[13px] font-medium hover:bg-white/5 transition-all">Fermer</button>
                <button onClick={() => setEditMode(true)} className="flex-1 bg-[#0097FB] text-white rounded-lg py-2.5 text-[13px] font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <MdEdit size={16} /> Modifier
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditMode(false)} className="flex-1 bg-transparent border border-white/10 text-white rounded-lg py-2.5 text-[13px] font-medium hover:bg-white/5 transition-all">Annuler</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#0097FB] text-white rounded-lg py-2.5 text-[13px] font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdSave size={16} />} Enregistrer
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Navbar;