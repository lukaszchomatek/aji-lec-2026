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
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
      notOnlyWhitespace(value) {
        if (!value.trim()) {
          throw new Error('Imię nie może składać się z samych spacji');
        }
      }
    }
  },

  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
      notOnlyWhitespace(value) {
        if (!value.trim()) {
          throw new Error('Nazwisko nie może składać się z samych spacji');
        }
      }
    }
  }
}, {
  tableName: 'discoverers',
  timestamps: false
});