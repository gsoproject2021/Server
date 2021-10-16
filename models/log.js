const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Log = sequelize.define('log',{
      LogID: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      CreateDate: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      CreateHour: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      Path: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      RoomID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'RoomID'
        }
      }
});

module.exports = Log;