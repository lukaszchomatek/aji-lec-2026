import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ElementDiscoverer = sequelize.define('ElementDiscoverer', {
  atomicNumber: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'elements',
      key: 'atomicNumber'
    }
  },
  discovererId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'discoverers',
      key: 'id'
    }
  }
}, {
  tableName: 'element_discoverers',
  timestamps: false
});