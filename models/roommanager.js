const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Roommanager = sequelize.define('roommanager',{
    RoomManagerID:{
      autoIncrement: true,
      type:Sequelize.INTEGER,
      primaryKey: true,
      allowNull:false,
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
    }
      
});

module.exports = Roommanager;