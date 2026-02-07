import { UserModel } from "../model/userModel.js";
import { db } from "../config/firebase-config.js";

// Get User Settings
export const getSettings = async (req, res) => {
  try {
    const userId = req.user.uid;
    const user = await UserModel.getByUid(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const defaultSettings = {
      notifications: {
        email: true,
        weeklySummary: false
      },
      preferences: {
        defaultTheme: '#584738',
        autoBranding: true
      },
      display: {
        layout: 'list',
        language: 'English (US)'
      }
    };

    // Merge existing settings with defaults
    const userSettings = { ...defaultSettings, ...user.settings };

    res.status(200).json({ success: true, data: userSettings });
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Update User Settings
export const updateSettings = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { category, key, value } = req.body; // e.g. category='notifications', key='email', value=false

    const user = await UserModel.getByUid(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Deep merge logic
    const currentSettings = user.settings || {};
    const newSettings = {
      ...currentSettings,
      [category]: {
        ...currentSettings[category],
        [key]: value
      }
    };

    await UserModel.update(user.userId, { settings: newSettings });

    res.status(200).json({ success: true, message: "Settings updated", data: newSettings });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Deactivate Account
export const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user.uid;
    const user = await UserModel.getByUid(userId);
    
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // In a real app, this would toggle an 'isActive' flag and log the user out
    await UserModel.update(user.userId, { isActive: false, status: 'deactivated' });

    res.status(200).json({ success: true, message: "Account deactivated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to deactivate account" });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.uid;
    const user = await UserModel.getByUid(userId);
    
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Delete all forms owned by this user
    const formsSnapshot = await db.collection('forms').where('userId', '==', userId).get();
    const batch = db.batch();
    
    // Delete each form and its responses
    for (const formDoc of formsSnapshot.docs) {
      // Delete all responses for this form
      const responsesSnapshot = await formDoc.ref.collection('responses').get();
      responsesSnapshot.forEach(responseDoc => {
        batch.delete(responseDoc.ref);
      });
      
      // Delete the form itself
      batch.delete(formDoc.ref);
    }
    
    // Commit the batch delete for forms and responses
    await batch.commit();

    // Permanently delete user from Firestore
    await UserModel.delete(user.userId);
    
    // Ideally, also delete from Firebase Auth using Admin SDK
    // Uncomment the following line if you want to delete from Firebase Auth too:
    // await auth.deleteUser(userId);

    res.status(200).json({ success: true, message: "Account and all associated data deleted permanently" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ success: false, message: "Failed to delete account" });
  }
};
