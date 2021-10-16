const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Roomrequest = sequelize.define('roomrequest',{
    RoomRequestID: {
      type:Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    UserID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'UserID'
        }
      },
      
      RoomID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'RoomID'
        }
      },
});

module.exports = Roomrequest;