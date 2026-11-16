'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('discoverers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });

    await queryInterface.createTable('element_discoverers', {
      atomicNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'elements',
          key: 'atomicNumber'
        },
        onDelete: 'CASCADE'
      },
      discovererId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'discoverers',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    });

    await queryInterface.bulkInsert('discoverers', [
      { id: 1, firstName: 'Henry', lastName: 'Cavendish' },
      { id: 2, firstName: 'Pierre', lastName: 'Janssen' },
      { id: 3, firstName: 'Norman', lastName: 'Lockyer' },
      { id: 4, firstName: 'Carl Wilhelm', lastName: 'Scheele' },
      { id: 5, firstName: 'Joseph', lastName: 'Priestley' },
      { id: 6, firstName: 'Humphry', lastName: 'Davy' },
      { id: 7, firstName: 'Maria', lastName: 'Skłodowska-Curie' },
      { id: 8, firstName: 'Pierre', lastName: 'Curie' }
    ]);

    await queryInterface.bulkInsert('elements', [
      {
        atomicNumber: 84,
        symbol: 'Po',
        name: 'Polon',
        isMetal: true,
        discoveredOn: '1898-01-01',
        density: 9.196
      },
      {
        atomicNumber: 88,
        symbol: 'Ra',
        name: 'Rad',
        isMetal: true,
        discoveredOn: '1898-01-01',
        density: 5.5
      }
    ]);

    await queryInterface.bulkInsert('element_discoverers', [
      { atomicNumber: 1, discovererId: 1 },
      { atomicNumber: 2, discovererId: 2 },
      { atomicNumber: 2, discovererId: 3 },
      { atomicNumber: 8, discovererId: 4 },
      { atomicNumber: 8, discovererId: 5 },
      { atomicNumber: 11, discovererId: 6 },
      { atomicNumber: 17, discovererId: 4 },
      { atomicNumber: 84, discovererId: 7 },
      { atomicNumber: 84, discovererId: 8 },
      { atomicNumber: 88, discovererId: 7 },
      { atomicNumber: 88, discovererId: 8 }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('element_discoverers');

    await queryInterface.bulkDelete('elements', {
      atomicNumber: [84, 88]
    });

    await queryInterface.dropTable('discoverers');
  }
};