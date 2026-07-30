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

exports.bindRequest = async (req, res) => {
  try {
    const { requestId, projectId } = req.params;
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ error: 'Проект не найден' });

    const request = await Request.findByPk(requestId);
    if (!request) return res.status(404).json({ error: 'Заявка не найдена' });

    await request.update({ projectId });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.unbindRequest = async (req, res) => {
  try {
    const { requestId } = req.params; 
    const request = await Request.findByPk(requestId);
    if (!request) return res.status(404).json({ error: 'Заявка не найдена' });

    await request.update({ projectId: null });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.nextStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findByPk(requestId, { include: [Status] });
    if (!request) return res.status(404).json({ error: 'Заявка не найдена' });

    const nextIds = request.Status.transitions?.next || [];
    if (nextIds.length === 0) return res.status(400).json({ error: 'Нет доступных следующих статусов' });

    const nextStatus = await Status.findByPk(nextIds[0]);
    await request.update({ statusId: nextStatus.id });

    res.json({ message: 'Статус обновлён', request: await Request.findByPk(requestId, { include: [Status] }) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.prevStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findByPk(requestId, { include: [Status] });
    if (!request) return res.status(404).json({ error: 'Заявка не найдена' });

    const prevIds = request.Status.transitions?.prev || [];
    if (prevIds.length === 0) return res.status(400).json({ error: 'Нет доступных предыдущих статусов' });

    const prevStatus = await Status.findByPk(prevIds[0]);
    await request.update({ statusId: prevStatus.id });

    res.json({ message: 'Статус обновлён', request: await Request.findByPk(requestId, { include: [Status] }) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
