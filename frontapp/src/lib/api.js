import { getToken } from "./storage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    // For frontapp, we don't necessarily need to redirect to login
    // as it might be a public form. The page should handle the error.
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};