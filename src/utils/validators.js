//Memastikan email pakai "@" dan password tidak terlalu pendek sebelum dikirim ke Firebase.

// Validasi Email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validasi Password (minimal 8 karakter)
export const validatePassword = (password) => {
  return password && password.length >= 8;
};

// Validasi Full Name
export const validateFullName = (fullName) => {
  return fullName && fullName.trim().length >= 3;
};

