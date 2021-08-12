const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Roommanager = sequelize.define('roommanager',{
    UserID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      RoomID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      Active: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
});

module.exports = Roommanager;