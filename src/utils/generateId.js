//Membuat ID unik untuk dokumen di Firestore.

import { v4 as uuidv4 } from "uuid";

export const generateId = () => {
  return uuidv4();
};

export const generateShortId = () => {
  return Math.random().toString(36).substr(2, 9);
};


