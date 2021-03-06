const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Roomuser = sequelize.define('roomuser',{
      RoomUserID:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true,
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

module.exports = Roomuser;