const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const PublicRoom = sequelize.define('room',{
    RoomID: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      RoomName: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      ImageUrl: {
        type: Sequelize.STRING(300),
        allowNull:true,
        defaultValue:''
      }
      
});

module.exports = PublicRoom;
