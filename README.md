# Requests App

Система управления заявками с гибкой статусной машиной. Логика переходов между статусами хранится в базе данных, что позволяет менять её без изменения кода и пересборки фронтенда.

## Стек

- Backend: Node.js, Express, Sequelize, PostgreSQL
- Frontend: Vue 3, Vuetify, Vuex, Axios

## Запуск backend и frontend

# Backend (в первом терминале)
cd backend 
npm install 
node server.js

# Frontend (во втором терминале)
cd frontend && npm install && npm run dev