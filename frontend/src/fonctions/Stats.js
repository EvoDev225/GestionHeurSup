import axios from 'axios';

const API_URL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

// --- Stats dashboard enseignant ---
export const getProfilEnseignant = async (idens) => {
    try {
        const response = await axios.get(`${API_URL}/stats/enseignant/${idens}/profil`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getHeuresEnseignant = async (idens) => {
    try {
        const response = await axios.get(`${API_URL}/stats/enseignant/${idens}/heures`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getRemunerationEnseignant = async (idens) => {
    try {
        const response = await axios.get(`${API_URL}/stats/enseignant/${idens}/remuneration`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getHeuresParMoisEnseignant = async (idens) => {
    try {
        const response = await axios.get(`${API_URL}/stats/enseignant/${idens}/heures-par-mois`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getHeuresParMatiereEnseignant = async (idens) => {
    try {
        const response = await axios.get(`${API_URL}/stats/enseignant/${idens}/heures-par-matiere`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getStatutSeancesEnseignant = async (idens) => {
    try {
        const response = await axios.get(`${API_URL}/stats/enseignant/${idens}/statut-seances`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getDernieresSeancesEnseignant = async (idens) => {
    try {
        const response = await axios.get(`${API_URL}/stats/enseignant/${idens}/dernieres-seances`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getRecapEnseignantById = async (idens) => {
    try {
        const response = await axios.get(`${API_URL}/stats/enseignant/${idens}/recap`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getTop5Enseignants = async () => {
    try {
    const response = await axios.get(`${API_URL}/stats/top5Enseignants`);
    return response.data;
    } catch (error) {
        throw error.response?.data || error.message;    
    }
};