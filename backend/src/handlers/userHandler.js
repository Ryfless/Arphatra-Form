import { db } from "../config/firebase-config.js";

export const getProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const userSnapshot = await db
      .collection("users")
      .where("uid", "==", uid)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = userSnapshot.docs[0].data();

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { fullName, avatarUrl } = req.body;

    const userSnapshot = await db
      .collection("users")
      .where("uid", "==", uid)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const docId = userSnapshot.docs[0].id;
    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (fullName) updateData.fullName = fullName;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;

    await db.collection("users").doc(docId).update(updateData);

    const updatedDoc = await db.collection("users").doc(docId).get();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedDoc.data(),
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};