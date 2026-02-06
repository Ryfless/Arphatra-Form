import express from 'express';
import { createForm, updateForm, getMyForms, getFormById, submitResponse, getFormResponses, deleteForm } from '../handlers/formHandler.js';
import { verifyToken } from '../middlewares/authentication.js';

const router = express.Router();

// Private Routes (Butuh Login)
router.post('/', verifyToken, createForm);       // Create
router.put('/:formId', verifyToken, updateForm);  // Update
router.delete('/:formId', verifyToken, deleteForm); // Delete
router.get('/', verifyToken, getMyForms);        // List My Forms
router.get('/:formId/responses', verifyToken, getFormResponses); // Get Analytics

// Public Routes (Tidak Butuh Login)
router.get('/:formId', getFormById);                // View Form
router.post('/:formId/submit', submitResponse);     // Submit Answer

export default router;