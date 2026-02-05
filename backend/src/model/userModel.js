//Ini adalah asisten khusus untuk urusan Firestore. 

import { db } from "../config/firebase-config.js";

export const UserModel = {
  // Membuat user baru
  async create(userId, userData) {
    try {
      await db.collection("users").doc(userId).set({
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { userId, ...userData };
    } catch (error) {
      throw error;
    }
  },

  // Mendapatkan user berdasarkan ID
  async getById(userId) {
    try {
      const doc = await db.collection("users").doc(userId).get();
      if (doc.exists) {
        return { userId: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Mendapatkan user berdasarkan UID Firebase
  async getByUid(uid) {
    try {
      const snapshot = await db
        .collection("users")
        .where("uid", "==", uid)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return {
        userId: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      };
    } catch (error) {
      throw error;
    }
  },

  // Mendapatkan user berdasarkan email
  async getByEmail(email) {
    try {
      const snapshot = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return {
        userId: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      };
    } catch (error) {
      throw error;
    }
  },

  // Mengupdate user
  async update(userId, updateData) {
    try {
      await db.collection("users").doc(userId).update({
        ...updateData,
        updatedAt: new Date().toISOString(),
      });
      return this.getById(userId);
    } catch (error) {
      throw error;
    }
  },

  // Menghapus user
  async delete(userId) {
    try {
      await db.collection("users").doc(userId).delete();
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Mendapatkan semua user
  async getAll(limit = 20) {
    try {
      const snapshot = await db
        .collection("users")
        .limit(limit)
        .get();

      return snapshot.docs.map((doc) => ({
        userId: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw error;
    }
  },

  // Mencari user berdasarkan full name
  async searchByName(fullName, limit = 10) {
    try {
      const snapshot = await db
        .collection("users")
        .where("fullName", ">=", fullName)
        .where("fullName", "<=", fullName + "\uf8ff")
        .limit(limit)
        .get();

      return snapshot.docs.map((doc) => ({
        userId: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw error;
    }
  },
};
