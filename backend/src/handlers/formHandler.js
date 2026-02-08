import { db } from '../config/firebase-config.js';
import { generateId } from '../utils/generateId.js';
import admin from 'firebase-admin';
import { sendFormSubmissionNotification } from '../utils/emailService.js';
import { UserModel } from '../model/userModel.js';

// 1. Create New Form
export const createForm = async (req, res) => {
  try {
    const { name, title, description, theme, questions, bannerImage, slug, thumbnail } = req.body;
    const userId = req.user.uid; 

    console.log(`Creating form for user: ${userId}, name: ${name}`);

    // If slug is provided, validate uniqueness
    if (slug) {
      const existingSlug = await db.collection('forms').where('slug', '==', slug).limit(1).get();
      if (!existingSlug.empty) {
        return res.status(400).json({ status: 'error', message: 'Custom URL sudah digunakan' });
      }
    }

    const newForm = {
      id: generateId(),
      userId,
      name: name || "Form 1",
      title: title || "",
      description: description || "",
      slug: slug || null,
      theme: theme || {},
      bannerImage: bannerImage || "",
      thumbnail: thumbnail || "", // Save thumbnail URL
      questions: questions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    const { name, title, description, theme, questions, bannerImage, slug, thumbnail } = req.body; // Added thumbnail
    const userId = req.user.uid;

    console.log(`Updating form ${formId} for user: ${userId}`);

    // 1. Try search by ID (UUID)
    let formRef = db.collection('forms').doc(formId);
    let doc = await formRef.get();

    // 2. If not found by ID, try search by Slug
    if (!doc.exists) {
      const snapshot = await db.collection('forms').where('slug', '==', formId).limit(1).get();
      if (!snapshot.empty) {
        doc = snapshot.docs[0];
        formRef = doc.ref;
      }
    }

    if (!doc.exists) return res.status(404).json({ status: 'error', message: 'Form not found' });
    const currentData = doc.data();
    if (currentData.userId !== userId) return res.status(403).json({ status: 'error', message: 'Unauthorized' });

    // Validate slug uniqueness if it changed
    if (slug && slug !== currentData.slug) {
      const existingSlug = await db.collection('forms').where('slug', '==', slug).limit(1).get();
      if (!existingSlug.empty) {
        return res.status(400).json({ status: 'error', message: 'Custom URL sudah digunakan' });
      }
    }

    await formRef.update({
      name, title, description, theme, questions, bannerImage, 
      slug: slug || null,
      thumbnail: thumbnail || currentData.thumbnail || "", // Update thumbnail URL
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

    forms.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    res.status(200).json({ status: 'success', data: forms });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. Get Single Form
export const getFormById = async (req, res) => {
  try {
    const { formId } = req.params; // Can be UUID or Slug
    
    // 1. Try search by ID (UUID)
    let doc = await db.collection('forms').doc(formId).get();

    // 2. If not found by ID, try search by Slug
    if (!doc.exists) {
      const snapshot = await db.collection('forms').where('slug', '==', formId).limit(1).get();
      if (!snapshot.empty) {
        doc = snapshot.docs[0];
      }
    }

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
    const { formId } = req.params; // Can be UUID or Slug
    const { answers } = req.body; 

    // 1. Try search by ID (UUID)
    let formRef = db.collection('forms').doc(formId);
    let formDoc = await formRef.get();

    // 2. If not found by ID, try search by Slug
    if (!formDoc.exists) {
      const snapshot = await db.collection('forms').where('slug', '==', formId).limit(1).get();
      if (!snapshot.empty) {
        formDoc = snapshot.docs[0];
        formRef = formDoc.ref;
      }
    }

    if (!formDoc.exists) {
      return res.status(404).json({ status: 'error', message: 'Form not found' });
    }

    const formData = formDoc.data();
    const actualFormId = formData.id; // Use the actual UUID for the response storage
    const formOwnerId = formData.userId;

    const responseData = {
      id: generateId(),
      formId: actualFormId,
      answers,
      submittedAt: new Date().toISOString()
    };

    await formRef.collection('responses').doc(responseData.id).set(responseData);

    await formRef.update({
      responseCount: admin.firestore.FieldValue.increment(1)
    });

    // Send email notification if enabled in user settings
    try {
      const formOwner = await UserModel.getByUid(formOwnerId);
      
      if (formOwner) {
        const userSettings = formOwner.settings || {};
        const emailNotificationsEnabled = userSettings.notifications?.email ?? true; // Default to true
        
        if (emailNotificationsEnabled) {
          const newResponseCount = (formData.responseCount || 0) + 1;
          
          await sendFormSubmissionNotification(
            formOwner.email,
            formData.name,
            formData.title,
            newResponseCount
          );
          
          console.log(`Email notification sent to ${formOwner.email} for form ${formId}`);
        } else {
          console.log(`Email notifications disabled for user ${formOwner.email}`);
        }
      }
    } catch (emailError) {
      // Log error but don't fail the response submission
      console.error("Error sending email notification:", emailError);
    }

    res.status(201).json({ status: 'success', message: 'Response submitted' });
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 5. Get Responses
export const getFormResponses = async (req, res) => {
  try {
    const { formId } = req.params;
    
    // 1. Try search by ID (UUID)
    let formRef = db.collection('forms').doc(formId);
    let formDoc = await formRef.get();

    // 2. If not found by ID, try search by Slug
    if (!formDoc.exists) {
      const snapshot = await db.collection('forms').where('slug', '==', formId).limit(1).get();
      if (!snapshot.empty) {
        formDoc = snapshot.docs[0];
        formRef = formDoc.ref;
      }
    }

    if (!formDoc.exists || formDoc.data().userId !== req.user.uid) {
        return res.status(403).json({ status: 'error', message: 'Unauthorized' });
    }
    const snapshot = await formRef.collection('responses').get();
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
    
    // 1. Try search by ID (UUID)
    let formRef = db.collection('forms').doc(formId);
    let doc = await formRef.get();

    // 2. If not found by ID, try search by Slug
    if (!doc.exists) {
      const snapshot = await db.collection('forms').where('slug', '==', formId).limit(1).get();
      if (!snapshot.empty) {
        doc = snapshot.docs[0];
        formRef = doc.ref;
      }
    }

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

// New: Check Slug Availability
export const checkSlugAvailability = async (req, res) => {
  try {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ status: 'error', message: 'Slug required' });

    const snapshot = await db.collection('forms').where('slug', '==', slug).limit(1).get();
    res.status(200).json({ 
      status: 'success', 
      available: snapshot.empty 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};