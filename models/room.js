const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Room = sequelize.define('room',{
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
      CreateDate: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      CreateHour: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      CreatorUserID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'UserID'
        }
      },
      ImageUrl: {
        type: Sequelize.STRING(300),
        allowNull:true,
        defaultValue:''
      }
      
});

module.exports = Room;
