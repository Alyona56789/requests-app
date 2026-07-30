const { Request, Status, Project } = require('../models');

exports.createRequest = async (req, res) => {
  try {
    const { title, description, statusId, projectId } = req.body;
    if (!title) return res.status(400).json({ error: 'Название заявки обязательно' });

    let finalStatusId = statusId;
    if (!finalStatusId) {
      const firstStatus = await Status.findOne({ order: [['id', 'ASC']] });
      finalStatusId = firstStatus ? firstStatus.id : null;
    }

    const request = await Request.create({ title, description, statusId: finalStatusId, projectId });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUnboundRequests = async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: { projectId: null },
      include: [Status]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findByPk(id, {
      include: [Status, Project]
    });
    if (!request) return res.status(404).json({ error: 'Заявка не найдена' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, statusId, projectId } = req.body;

    const request = await Request.findByPk(id);
    if (!request) return res.status(404).json({ error: 'Заявка не найдена' });

    await request.update({ title, description, statusId, projectId });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findByPk(id);
    if (!request) return res.status(404).json({ error: 'Заявка не найдена' });

    await request.destroy();
    res.json({ message: 'Заявка удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};