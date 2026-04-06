import axios from 'axios';
const API_URL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

export const getAllAnac = async () => {
    try {
        const response = await axios.get(`${API_URL}/anac/allAnac`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAnacById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/anac/specificAnac/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const newAnac = async (anacData) => {
    try {
        const response = await axios.post(`${API_URL}/anac/newAnac`, anacData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateAnac = async (id, anacData) => {
    try {
        const response = await axios.put(`${API_URL}/anac/updateAnac/${id}`, anacData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteAnac = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/anac/deleteAnac/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};