import { STORAGE_KEYS } from "./config.js";

export function saveToken(token) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

export function saveUser(userData) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
}

export function getUser() {
  const userData = localStorage.getItem(STORAGE_KEYS.USER);
  return userData ? JSON.parse(userData) : null;
}

export function clearUser() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.IS_NEW_USER);
}

export function setIsNewUser(isNew) {
  localStorage.setItem(STORAGE_KEYS.IS_NEW_USER, isNew ? "true" : "false");
}

export function getIsNewUser() {
  return localStorage.getItem(STORAGE_KEYS.IS_NEW_USER) === "true";
}

export function clearAuthStorage() {
  clearToken();
  clearUser();
}
