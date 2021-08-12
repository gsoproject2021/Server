const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Roomuser = sequelize.define('roomuser',{
    UserID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      RoomID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
});

module.exports = Roomuser;