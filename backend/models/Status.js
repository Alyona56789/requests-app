const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Status = sequelize.define('Status', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true 
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false 
  }
}, {
  tableName: 'statuses',
  timestamps: false 
});

module.exports = Status;