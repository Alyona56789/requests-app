const { Project, Request } = require('../models');

exports.createProject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Название проекта обязательно' });

    const project = await Project.create({ name });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [{ model: Request, attributes: ['id', 'title'] }] 
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [Request] 
    });
    if (!project) return res.status(404).json({ error: 'Проект не найден' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ error: 'Проект не найден' });

    await project.update({ name });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ error: 'Проект не найден' });

    await project.destroy();
    res.json({ message: 'Проект удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};