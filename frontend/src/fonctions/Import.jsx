import axios from 'axios';

export const importerEnseignant = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/import/enseignant`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

export const importerEnseigner = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/import/enseigner`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

export const importerMatiere = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/import/matiere`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};