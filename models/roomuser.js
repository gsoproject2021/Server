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
      },
      IsAdmin:{
        type: Sequelize.ENUM('true','false'),
        allowNull:false,
        defaultValue:false
      }
});

module.exports = Roomuser;