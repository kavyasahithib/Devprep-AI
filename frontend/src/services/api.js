import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Interceptor to add Access Token to headers
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle Token Refreshing on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (refreshToken) {
        try {
          const res = await axios.post("http://localhost:5000/api/auth/refresh-token", { refreshToken });
          const { token } = res.data;
          localStorage.setItem("token", token);
          
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return API(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = "/";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
