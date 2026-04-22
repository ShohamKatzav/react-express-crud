import axios from 'axios';

const baseUrl = import.meta.env.VITE_APP_BASE_URL || '';

const api = axios.create({
    baseURL: baseUrl,
    timeout: 15000,
});

// Response error handler: surface server errors and redirect on 5xx
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status && status >= 500) {
            try {
                window.location.href = '/error';
            } catch (e) {
                // ignore
            }
        }

        // Attach a friendly message where possible
        error.friendlyMessage = error?.response?.data?.message || error.message || 'Request failed';
        return Promise.reject(error);
    }
);

export default api;
