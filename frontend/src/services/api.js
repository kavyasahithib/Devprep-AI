import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // Enable sending/receiving cookies
});

// Interceptor to handle Token Refreshing on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh token endpoint now checks the 'refreshToken' cookie automatically
        await axios.post("http://localhost:5000/api/auth/refresh-token", {}, { withCredentials: true });
        
        // Retry the original request (it will now include the new cookies)
        return API(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear manual user data and redirect
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
