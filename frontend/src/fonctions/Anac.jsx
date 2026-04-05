import axios from 'axios';
const API_URL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

export const getAllAnac = async () => {
    try {
        const response = await axios.get(`${API_URL}/annee/allAnac`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAnacById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/annee/specificAnac/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const newAnac = async (anacData) => {
    try {
        const response = await axios.post(`${API_URL}/annee/newAnac`, anacData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateAnac = async (id, anacData) => {
    try {
        const response = await axios.put(`${API_URL}/annee/updateAnac/${id}`, anacData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteAnac = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/annee/deleteAnac/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};