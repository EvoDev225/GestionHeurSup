import axios from 'axios';
const API_URL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

export const exportFicheEnseignantPDF = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/export/pdf/ficheEnseignant/${id}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `fiche_enseignant_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const exportEtatGlobalHeuresPDF = async () => {
    try {
        const response = await axios.get(`${API_URL}/export/pdf/etatGlobalHeures`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'etat_global_heures.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const exportEtatComptabilitePDF = async () => {
    try {
        const response = await axios.get(`${API_URL}/export/pdf/etatComptabilite`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'etat_comptabilite.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const exportFicheEnseignantExcel = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/export/excel/ficheEnseignant/${id}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `fiche_enseignant_${id}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const exportEtatGlobalHeuresExcel = async () => {
    try {
        const response = await axios.get(`${API_URL}/export/excel/etatGlobalHeures`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'etat_global_heures.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const exportEtatComptabiliteExcel = async () => {
    try {
        const response = await axios.get(`${API_URL}/export/excel/etatComptabilite`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'etat_comptabilite.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw error.response?.data || error.message;
    }
};