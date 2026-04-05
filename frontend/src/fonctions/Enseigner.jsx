import axios from 'axios';

const API_URL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

export const getAllEnseigner = async () => {
    try {
        const response = await axios.get(`${API_URL}/enseigner/allEnseigner`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getEnseignerById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/enseigner/specificEnseigner/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const newEnseigner = async (enseignerData) => {
    try {
        const response = await axios.post(`${API_URL}/enseigner/newEnseigner`, enseignerData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateEnseigner = async (id, enseignerData) => {
    try {
        const response = await axios.put(`${API_URL}/enseigner/updateEnseigner/${id}`, enseignerData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteEnseigner = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/enseigner/deleteEnseigner/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};