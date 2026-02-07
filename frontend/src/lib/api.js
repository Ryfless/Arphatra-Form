import { getToken, clearAuthStorage } from "./storage";

const BASE_URL = "http://localhost:5000"; // Kembali menggunakan localhost

export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Jika token expired atau tidak valid (401), pemicu popup sesi berakhir
    if (response.status === 401) {
        window.dispatchEvent(new CustomEvent("session-expired"));
        // Tetap throw error agar pemanggil tahu request gagal
        throw new Error("Session expired");
    }
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};
