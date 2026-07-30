const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const { Status, Project, Request } = require('./models'); 
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(projectRoutes);

const requestRoutes = require('./routes/requestRoutes');
app.use(requestRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер заявок запущен' });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL подключён');
    
    await sequelize.sync({ alter: true }); 
    console.log('Таблицы синхронизированы');

        const statuses = await Status.findAll();
    if (statuses.length === 0) {
      const created = await Status.bulkCreate([
        { code: 'draft', name: 'Заготовка' },
        { code: 'in_progress', name: 'В работе' },
        { code: 'review', name: 'На согласовании' },
        { code: 'accepted', name: 'Принята' },
        { code: 'rejected', name: 'Отказ' }
      ]);

      const map = {};
      created.forEach(s => map[s.code] = s.id);

      await Status.update({ transitions: { next: [map.in_progress], prev: [] } }, { where: { code: 'draft' } });
      await Status.update({ transitions: { next: [map.review], prev: [map.draft] } }, { where: { code: 'in_progress' } });
      await Status.update({ transitions: { next: [map.accepted, map.rejected], prev: [map.in_progress] } }, { where: { code: 'review' } });
      await Status.update({ transitions: { next: [], prev: [map.review] } }, { where: { code: 'accepted' } });
      await Status.update({ transitions: { next: [], prev: [map.review] } }, { where: { code: 'rejected' } });

      console.log('Начальные статусы и граф переходов созданы');
    }

    app.listen(PORT, () => console.log(`Сервер работает на http://localhost:${PORT}`));
  } catch (e) {
    console.error('Ошибка запуска:', e.message);
  }
};

start();