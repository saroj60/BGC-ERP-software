import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api/`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration (optional basic implementation)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Skip redirect for login requests (token endpoint)
            if (originalRequest.url.includes('token/')) {
                return Promise.reject(error);
            }

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error("No refresh token");

                // Use a separate axios call for refresh to avoid interceptor issues if needed
                // but here 'api' is already configured. 
                const response = await axios.post(
                    `${api.defaults.baseURL}token/refresh/`, 
                    { refresh: refreshToken }
                );

                const { access } = response.data;
                localStorage.setItem('access_token', access);
                
                // Update original request with new token and retry
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                console.error("Token refresh failed", refreshError);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_role');
                localStorage.removeItem('user_id');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
