import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Element = sequelize.define('Element', {
  atomicNumber: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },

  symbol: {
    type: DataTypes.STRING(2),
    allowNull: false,
    unique: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  isMetal: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },

  discoveredOn: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  density: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'elements',
  timestamps: false
});