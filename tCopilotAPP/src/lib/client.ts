import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_BASE || "http://127.0.0.1:8010";

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg =
      err?.response?.data?.detail ||
      err?.message ||
      "Network error";
    return Promise.reject(new Error(msg));
  }
);
