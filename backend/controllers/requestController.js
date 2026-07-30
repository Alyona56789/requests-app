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

    const request = await Request.create({
      title,
      description,
      statusId: finalStatusId,
      projectId
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Ошибка создания заявки:', error);
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

exports.getStatusTransitions = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findByPk(requestId, { include: [Status] });

    if (!request) return res.status(404).json({ error: 'Заявка не найдена' });

    const currentStatus = request.Status || request.status;
    if (!currentStatus) return res.status(400).json({ error: 'У заявки нет статуса' });

    let transitions = currentStatus.transitions;
    if (typeof transitions === 'string') transitions = JSON.parse(transitions);

    const nextIds = transitions?.next || [];
    const prevIds = transitions?.prev || [];

    const nextStatuses = nextIds.length > 0
      ? await Status.findAll({ where: { id: nextIds } })
      : [];

    const prevStatuses = prevIds.length > 0
      ? await Status.findAll({ where: { id: prevIds } })
      : [];

    res.json({
      current: currentStatus,
      next: nextStatuses,
      prev: prevStatuses
    });
  } catch (error) {
    console.error('Ошибка получения переходов:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.nextStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { targetStatusId } = req.body || {};

    const request = await Request.findByPk(requestId, { include: [Status] });
    if (!request) return res.status(404).json({ error: 'Заявка не найдена' });

    const currentStatus = request.Status || request.status;
    if (!currentStatus) return res.status(400).json({ error: 'У заявки не найден статус' });

    let transitions = currentStatus.transitions;
    if (typeof transitions === 'string') transitions = JSON.parse(transitions);

    const nextIds = transitions?.next || [];
    let newStatusId;

    if (targetStatusId) {
      if (!nextIds.includes(Number(targetStatusId))) {
        return res.status(400).json({ error: 'Этот статус недоступен для перехода' });
      }
      newStatusId = Number(targetStatusId);
    } else {
      if (nextIds.length === 0) return res.status(400).json({ error: 'Нет доступных следующих статусов' });
      newStatusId = nextIds[0];
    }

    await request.update({ statusId: newStatusId });

    const updatedRequest = await Request.findByPk(requestId, { include: [Status] });
    res.json({ message: 'Статус обновлён', request: updatedRequest });
  } catch (error) {
    console.error('Ошибка в nextStatus:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.prevStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { targetStatusId } = req.body || {};

    const request = await Request.findByPk(requestId, { include: [Status] });
    if (!request) return res.status(404).json({ error: 'Заявка не найдена' });

    const currentStatus = request.Status || request.status;
    if (!currentStatus) return res.status(400).json({ error: 'У заявки не найден статус' });

    let transitions = currentStatus.transitions;
    if (typeof transitions === 'string') transitions = JSON.parse(transitions);

    const prevIds = transitions?.prev || [];
    let newStatusId;

    if (targetStatusId) {
      if (!prevIds.includes(Number(targetStatusId))) {
        return res.status(400).json({ error: 'Этот статус недоступен для перехода' });
      }
      newStatusId = Number(targetStatusId);
    } else {
      if (prevIds.length === 0) return res.status(400).json({ error: 'Нет доступных предыдущих статусов' });
      newStatusId = prevIds[0];
    }

    await request.update({ statusId: newStatusId });

    const updatedRequest = await Request.findByPk(requestId, { include: [Status] });
    res.json({ message: 'Статус обновлён', request: updatedRequest });
  } catch (error) {
    console.error('Ошибка в prevStatus:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { targetStatusId } = req.body || {};

    if (!targetStatusId) {
      return res.status(400).json({ error: 'Не указан целевой статус' });
    }

    const request = await Request.findByPk(requestId, { include: [Status] });
    if (!request) return res.status(404).json({ error: 'Заявка не найдена' });

    const currentStatus = request.Status || request.status;
    if (!currentStatus) return res.status(400).json({ error: 'У заявки нет статуса' });

    let transitions = currentStatus.transitions;
    if (typeof transitions === 'string') {
      transitions = JSON.parse(transitions);
    }

    const nextIds = transitions?.next || [];
    const prevIds = transitions?.prev || [];

    // 🔥 Проверяем, доступен ли целевой статус в ЛЮБОМ направлении
    const isAllowed = nextIds.includes(targetStatusId) || prevIds.includes(targetStatusId);
    
    if (!isAllowed) {
      return res.status(400).json({ 
        error: `Переход в статус ${targetStatusId} недоступен. Доступны: next=${JSON.stringify(nextIds)}, prev=${JSON.stringify(prevIds)}` 
      });
    }

    await request.update({ statusId: targetStatusId });
    
    const updatedRequest = await Request.findByPk(requestId, { include: [Status] });
    res.json({ message: 'Статус обновлён', request: updatedRequest });
  } catch (error) {
    console.error('Ошибка в changeStatus:', error.message);
    res.status(500).json({ error: error.message });
  }
};