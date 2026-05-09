import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { MdUpload, MdClose, MdCheckCircle, MdError, MdDownload } from 'react-icons/md';
import { importerEnseignant, importerEnseigner, importerMatiere } from '../fonctions/Import';

const ImportModal = ({ type, onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rapport, setRapport] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const labels = {
    enseignant: 'Enseignants',
    enseigner: "Séances d'enseignement",
    matiere: 'Matières'
  };

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.xlsx')) {
      toast.error('Seuls les fichiers .xlsx sont acceptés');
      return;
    }
    setFile(f);
    setRapport(null);
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      let data;
      if (type === 'enseignant') data = await importerEnseignant(file);
      else if (type === 'enseigner') data = await importerEnseigner(file);
      else data = await importerMatiere(file);

      setRapport(data);
      if (data.success > 0) toast.success(`${data.success} ligne(s) importée(s) avec succès`);
      if (data.errors.length > 0) toast.error(`${data.errors.length} erreur(s) détectée(s)`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'import");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-[#0D1B2A] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-white text-[17px] font-bold">Importer des {labels[type]}</h2>
            <p className="text-[#7A8FAD] text-[13px]">Mise à jour groupée via fichier Excel</p>
          </div>
          <button onClick={onClose} className="text-[#7A8FAD] hover:text-white transition-colors">
            <MdClose size={20} />
          </button>
        </div>

        <a href={`/templates/template_${type}.xlsx`} download className="flex items-center gap-2 w-fit mb-5 text-[13px] text-[#0097FB] bg-[#0097FB]/10 border border-[#0097FB]/20 px-3 py-2 rounded-lg hover:bg-[#0097FB]/20 transition-all">
          <MdDownload /> Télécharger le modèle .xlsx
        </a>

        <div 
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-5 ${dragging ? 'border-[#0097FB] bg-[#0097FB]/5' : 'border-white/10 hover:border-[#0097FB]/50'}`}
        >
          <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          <MdUpload className={`text-3xl mb-2 mx-auto ${file ? 'text-[#10B981]' : 'text-[#7A8FAD]'}`} />
          {file ? (
            <span className="text-[#10B981] text-[13px] font-medium block truncate">{file.name}</span>
          ) : (
            <>
              <p className="text-[#7A8FAD] text-[13px]">Glissez votre fichier .xlsx ici</p>
              <p className="text-[#7A8FAD] text-[11px]">ou cliquez pour parcourir</p>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-[#7A8FAD] text-[13px] hover:bg-white/5 transition-all">
            Annuler
          </button>
          <button 
            onClick={handleImport} 
            disabled={!file || loading}
            className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all flex items-center justify-center gap-2 ${file && !loading ? 'bg-[#0097FB] text-white hover:bg-[#0097FB]/90' : 'bg-white/5 text-[#7A8FAD] cursor-not-allowed'}`}
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdUpload />}
            {loading ? 'Importation...' : 'Importer'}
          </button>
        </div>

        {rapport && (
          <div className="mt-5 pt-5 border-t border-white/5">
            <div className="flex gap-3 mb-4">
              <div className="bg-[#10B981]/8 border border-[#10B981]/20 rounded-xl p-4 flex-1 text-center">
                <MdCheckCircle className="text-[#10B981] text-2xl mb-1 mx-auto" />
                <div className="text-[#10B981] text-[24px] font-bold">{rapport.success}</div>
                <div className="text-[#7A8FAD] text-[11px]">Importées</div>
              </div>
              <div className="bg-[#EF4444]/8 border border-[#EF4444]/20 rounded-xl p-4 flex-1 text-center">
                <MdError className="text-[#EF4444] text-2xl mb-1 mx-auto" />
                <div className="text-[#EF4444] text-[24px] font-bold">{rapport.errors.length}</div>
                <div className="text-[#7A8FAD] text-[11px]">Erreurs</div>
              </div>
            </div>
            {rapport.errors.length > 0 && (
              <div className="max-h-48 overflow-y-auto flex flex-col gap-2">
                {rapport.errors.map((e, i) => (
                  <div key={i} className="bg-white/3 border border-white/5 rounded-lg p-3">
                    <span className="text-[#EF4444] text-[12px] font-medium block">Ligne {e.ligne} — {e.referencens}</span>
                    <ul className="mt-1.5 ml-4 list-disc">
                      {e.messages.map((msg, j) => <li key={j} className="text-[#FF8888] text-[11px]">{msg}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;