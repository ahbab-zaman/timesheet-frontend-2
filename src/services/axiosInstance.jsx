import axios from "axios";
const FALLBACK_API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://timeserver.airepro.in"
    : "http://localhost:8108";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || FALLBACK_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Log baseURL for debugging
console.log("Axios baseURL:", axiosInstance.defaults.baseURL);

// Add token from localStorage to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response error handling
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      // Server responded with a status code
      if (error.response.status === 401) {
        console.warn("Unauthorized - possibly invalid or expired token");
      } else {
        console.error(
          `API error: ${error.response.status} - ${error.response.statusText}`,
          error.response.data
        );
      }
    } else if (error.request) {
      // No response received (e.g., network error)
      console.error("Network error: No response received from server", error);
    } else {
      // Error setting up the request
      console.error("Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
