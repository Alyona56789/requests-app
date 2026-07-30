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
      await Status.bulkCreate([
        { code: 'draft', name: 'Заготовка' },
        { code: 'in_progress', name: 'В работе' },
        { code: 'review', name: 'На согласовании' },
        { code: 'accepted', name: 'Принята' },
        { code: 'rejected', name: 'Отказ' }
      ]);
      console.log('Начальные статусы созданы');
    }

    app.listen(PORT, () => console.log(`Сервер работает на http://localhost:${PORT}`));
  } catch (e) {
    console.error('Ошибка запуска:', e.message);
  }
};

start();