import express from 'express';
import checkAuth from '../middleware/checkAuth.js';
import {
    getProjects,
    newProject,
    getProject,
    editProject,
    deleteProject,
    searchCollaborators,
    addCollaborator,
    deleteCollaborator,    
} from '../controllers/projectController.js';

const router = express.Router();

// Create projects, edits projects and modify collaborators.

router
    .route ('/')
    .get(checkAuth, getProjects)
    .post(checkAuth, newProject)

router
    .route ('/:id')
    .get(checkAuth, getProject)
    .put(checkAuth, editProject)
    .delete(checkAuth, deleteProject)

router.post('/collaborator', checkAuth, searchCollaborators);
router.post('/collaborator/:id', checkAuth, addCollaborator);
router.post('/delete-collaborator/:id', checkAuth, deleteCollaborator);

export default router;