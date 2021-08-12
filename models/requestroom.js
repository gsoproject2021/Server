const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Requestroom = sequelize.define('requestroom',{
    UserID: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      RoomID: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
});

module.exports = Requestroom;