import axios from 'axios';
const API_URL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

export const getTotalUtilisateurs = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/totalUtilisateurs`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getHeuresParEnseignant = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/heuresParEnseignant`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getHeuresParDepartement = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/heuresParDepartement`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Fonctions ajoutées ou vérifiées selon la tâche
export const getTotalHeures = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/totalHeures`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
export const getCoutTotalHeures = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/coutTotalHeures`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};  

export const getHeuresParMois = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/heuresParMois`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getRepartitionHeures = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/repartitionHeures`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getEnseignantsEnDepassement = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/enseignantsEnDepassement`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getMoyenneHeuresParEnseignant = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/moyenneHeuresParEnseignant`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getTauxDepassement = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/tauxDepassement`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getStatutHeures = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/statutHeures`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getTotalUtilisateursParRole = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/totalUtilisateursParRole`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getTotalUtilisateursParStat = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/totalUtilisateursParStat`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getMatiereMaxVolumeHoraire = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/max-volume`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getMatiereParNiveau = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/par-niveau`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getStatutAnneesAcademiques = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/statutAnneesAcademiques`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getDerniersJournaux = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/derniersJournaux`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getProfilEnseignant = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/stats/profilEnseignant/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getHeuresEnseignant = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/stats/heuresEnseignant/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getRemunerationEnseignant = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/stats/remunerationEnseignant/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getHeuresParMoisEnseignant = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/stats/heuresParMoisEnseignant/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getHeuresParMatiereEnseignant = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/stats/heuresParMatiereEnseignant/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getStatutSeancesEnseignant = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/stats/statutSeancesEnseignant/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getDernieresSeancesEnseignant = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/stats/dernieresSeancesEnseignant/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getTop5Enseignants = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats/getTop5Enseignants`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};