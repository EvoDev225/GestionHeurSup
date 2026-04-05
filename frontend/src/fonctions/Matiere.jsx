import axios from 'axios';

const API_URL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

export const getAllMatieres = async () => {
    try {
        const response = await axios.get(`${API_URL}/matiere/allMatieres`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getMatiereById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/matiere/specificMatiere/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const newMatiere = async (matiereData) => {
    try {
        const response = await axios.post(`${API_URL}/matiere/newMatiere`, matiereData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateMatiere = async (id, matiereData) => {
    try {
        const response = await axios.put(`${API_URL}/matiere/updateMatiere/${id}`, matiereData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteMatiere = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/matiere/deleteMatiere/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};