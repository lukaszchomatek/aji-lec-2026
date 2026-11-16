import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Discoverer = sequelize.define('Discoverer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },

  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'discoverers',
  timestamps: false
});