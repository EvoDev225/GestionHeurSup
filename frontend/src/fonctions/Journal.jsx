import axios from 'axios';

const API_URL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

export const getAllJournal = async () => {
    try {
        const response = await axios.get(`${API_URL}/journal/allJournal`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteJournal = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/journal/deleteJournal/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};