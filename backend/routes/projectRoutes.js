const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.post('/project/', projectController.createProject);
router.get('/projects/', projectController.getAllProjects); 
router.get('/project/:id/', projectController.getProjectById);
router.patch('/project/:id/', projectController.updateProject);
router.delete('/project/:id/', projectController.deleteProject);

module.exports = router;