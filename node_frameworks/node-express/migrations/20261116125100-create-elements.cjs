'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('elements', {
      atomicNumber: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },

      symbol: {
        type: Sequelize.STRING(2),
        allowNull: false,
        unique: true
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      isMetal: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },

      discoveredOn: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },

      density: {
        type: Sequelize.FLOAT,
        allowNull: false
      }
    });

    await queryInterface.bulkInsert('elements', [
      { atomicNumber: 1, symbol: 'H', name: 'Wodór',
        isMetal: false, discoveredOn: '1766-01-01', density: 0.0000899 },

      { atomicNumber: 2, symbol: 'He', name: 'Hel',
        isMetal: false, discoveredOn: '1868-01-01', density: 0.0001785 },

      { atomicNumber: 6, symbol: 'C', name: 'Węgiel',
        isMetal: false, discoveredOn: null, density: 2.267 },

      { atomicNumber: 8, symbol: 'O', name: 'Tlen',
        isMetal: false, discoveredOn: '1774-01-01', density: 0.001429 },

      { atomicNumber: 11, symbol: 'Na', name: 'Sód',
        isMetal: true, discoveredOn: '1807-01-01', density: 0.971 },

      { atomicNumber: 16, symbol: 'S', name: 'Siarka',
        isMetal: false, discoveredOn: null, density: 2.07 },

      { atomicNumber: 17, symbol: 'Cl', name: 'Chlor',
        isMetal: false, discoveredOn: '1774-01-01', density: 0.003214 },

      { atomicNumber: 29, symbol: 'Cu', name: 'Miedź',
        isMetal: true, discoveredOn: null, density: 8.96 }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('elements');
  }
};