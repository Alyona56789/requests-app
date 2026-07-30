const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер заявок запущен' });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL подключён');
    
    await sequelize.sync({ alter: true }); 
    console.log('Таблицы синхронизированы');

    app.listen(PORT, () => console.log(` Сервер работает на http://localhost:${PORT}`));
  } catch (e) {
    console.error('Ошибка запуска:', e.message);
  }
};

start();