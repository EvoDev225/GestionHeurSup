import axios from 'axios';
const API_URL = 'http://localhost:3000';
axios.defaults.withCredentials = true; // ← pour inclure les cookies dans les requêtes
export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/user/allUser`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getUserById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/user/specificUser/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const newUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/user/newUser`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateUserForAdmin = async (id, userData) => {
    try {
        const response = await axios.put(`${API_URL}/user/updateUserForAdmin/${id}`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateSimpleUser = async (id, userData) => {
    try {
        const response = await axios.put(`${API_URL}/user/updateUser/${id}`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/user/deleteUser/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const connexion = async (login) => {
    try {
        const response = await axios.post(`${API_URL}/user/connexion`,  login );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deconnexion = async () => {
    try {
        const response = await axios.post(`${API_URL}/user/deconnexion`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const verifierAuthentification = async () => {
    try {
        const response = await axios.get(`${API_URL}/user/verifierAuthentification`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const motdepasseOublie = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/user/motdepasseOublie`, { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const changerMotdepasse = async (token, nouveauMdp) => {
    try {
        const response = await axios.put(`${API_URL}/user/reinitialiserMotdepasse/${token}`, { nouveauMdp });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const toggleStatutUser = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/user/changeStatutUser/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
