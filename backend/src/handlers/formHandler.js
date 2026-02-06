import { db } from '../config/firebase-config.js';
import { generateId } from '../utils/generateId.js';
import admin from 'firebase-admin';

// 1. Create New Form
export const createForm = async (req, res) => {
  try {
    const { name, title, description, theme, questions, bannerImage } = req.body;
    const userId = req.user.uid; 

    console.log(`Creating form for user: ${userId}, name: ${name}`);

    const newForm = {
      id: generateId(),
      userId,
      name: name || "Form 1",
      title: title || "",
      description: description || "",
      theme: theme || {},
      bannerImage: bannerImage || "",
      questions: questions || [],
      createdAt: new Date().toISOString(),
      status: 'active',
      responseCount: 0
    };

    await db.collection('forms').doc(newForm.id).set(newForm);

    res.status(201).json({
      status: 'success',
      message: 'Form created successfully',
      data: newForm
    });
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 1.5 Update Existing Form
export const updateForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { name, title, description, theme, questions, bannerImage } = req.body;
    const userId = req.user.uid;

    console.log(`Updating form ${formId} for user: ${userId}`);

    const formRef = db.collection('forms').doc(formId);
    const doc = await formRef.get();

    if (!doc.exists) return res.status(404).json({ status: 'error', message: 'Form not found' });
    if (doc.data().userId !== userId) return res.status(403).json({ status: 'error', message: 'Unauthorized' });

    await formRef.update({
      name, title, description, theme, questions, bannerImage,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ status: 'success', message: 'Form updated' });
  } catch (error) {
    console.error("Error updating form:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. Get All Forms
export const getMyForms = async (req, res) => {
  try {
    const userId = req.user.uid;
    const formsRef = db.collection('forms');
    const snapshot = await formsRef.where('userId', '==', userId).get();

    if (snapshot.empty) {
      return res.status(200).json({ status: 'success', data: [] });
    }

    const forms = [];
    snapshot.forEach(doc => {
      forms.push(doc.data());
    });

    forms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ status: 'success', data: forms });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. Get Single Form
export const getFormById = async (req, res) => {
  try {
    const { formId } = req.params;
    const doc = await db.collection('forms').doc(formId).get();

    if (!doc.exists) {
      return res.status(404).json({ status: 'error', message: 'Form not found' });
    }

    res.status(200).json({ status: 'success', data: doc.data() });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 4. Submit Response
export const submitResponse = async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body; 

    const responseData = {
      id: generateId(),
      formId,
      answers,
      submittedAt: new Date().toISOString()
    };

    await db.collection('forms').doc(formId).collection('responses').doc(responseData.id).set(responseData);

    await db.collection('forms').doc(formId).update({
      responseCount: admin.firestore.FieldValue.increment(1)
    });

    res.status(201).json({ status: 'success', message: 'Response submitted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 5. Get Responses
export const getFormResponses = async (req, res) => {
  try {
    const { formId } = req.params;
    const formDoc = await db.collection('forms').doc(formId).get();
    if (!formDoc.exists || formDoc.data().userId !== req.user.uid) {
        return res.status(403).json({ status: 'error', message: 'Unauthorized' });
    }
    const snapshot = await db.collection('forms').doc(formId).collection('responses').get();
    const responses = [];
    snapshot.forEach(doc => responses.push(doc.data()));
    res.status(200).json({ status: 'success', data: responses });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 6. Delete Form
export const deleteForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const userId = req.user.uid;
    const formRef = db.collection('forms').doc(formId);
    const doc = await formRef.get();
    if (!doc.exists) return res.status(404).json({ status: 'error', message: 'Form not found' });
    if (doc.data().userId !== userId) return res.status(403).json({ status: 'error', message: 'Unauthorized' });
    await formRef.delete();
    const responses = await formRef.collection('responses').get();
    const batch = db.batch();
    responses.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    res.status(200).json({ status: 'success', message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
