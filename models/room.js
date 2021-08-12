const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Room = sequelize.define('room',{
    RoomID: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      NameRoom: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      CreateDate: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      CreateHoure: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      OwnerRoomID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      Active: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
});

module.exports = Room;
