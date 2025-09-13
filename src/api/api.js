import axios from "axios";

// ✅ Backend ka base URL automatic detect hoga
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api" // Local development backend
    : "https://social-media-app-backend-gamma.vercel.app/api"; // Deployed backend

// ✅ Image URL ka helper (use in PostCard etc.)
export const getImageUrl = (path) => {
  if (!path) return "/default-avatar.png";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return window.location.hostname === "localhost"
    ? `http://localhost:5000${cleanPath}`
    : `https://social-media-app-backend-gamma.vercel.app${cleanPath}`;
};

// ✅ Axios instance
const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ✅ Token add karna
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
