//Memastikan email pakai "@" dan password tidak terlalu pendek sebelum dikirim ke Firebase.

// Validasi Email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validasi Password (minimal 8 karakter, huruf kapital, angka, simbol)
export const validatePassword = (password) => {
  if (!password || password.length < 8) return false;
  
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  
  return hasUpper && hasNumber && hasSymbol;
};

// Validasi Full Name
export const validateFullName = (fullName) => {
  return fullName && fullName.trim().length >= 3;
};

