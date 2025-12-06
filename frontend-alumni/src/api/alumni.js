import api from './auth'; // Reuse the axios instance

export const getAlumniProfile = async (id) => {
    try {
        const response = await api.get(`/alumni/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching alumni profile:', error);
        throw error;
    }
};

export const updateAlumniProfile = async (id, data) => {
    try {
        const response = await api.put(`/alumni/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating alumni profile:', error);
        throw error;
    }
};

// Add other alumni related endpoints here
