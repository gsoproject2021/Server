const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const PublicRoom = sequelize.define('publicroom',{
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
 
      
});

module.exports = PublicRoom;
