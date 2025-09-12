import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api",
//   withCredentials: true,
// });
const API = axios.create({
  baseURL: "https://social-media-app-backend-gamma.vercel.app/api", // ✅ deployed backend URL
  withCredentials: true,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
