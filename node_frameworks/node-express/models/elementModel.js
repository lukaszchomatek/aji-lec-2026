import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Element = sequelize.define('Element', {
  atomicNumber: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1,
      max: 118
    }
  },

  symbol: {
    type: DataTypes.STRING(2),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[A-Z][a-z]?$/
    }
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
      notOnlyWhitespace(value) {
        if (!value.trim()) {
          throw new Error('Nazwa nie może składać się z samych spacji');
        }
      }
    }
  },

  isMetal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    validate: {
      isIn: [[true, false]]
    }
  },

  discoveredOn: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true
    }
  },

  density: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      isFloat: true,
      min: Number.EPSILON
    }
  }
}, {
  tableName: 'elements',
  timestamps: false
});