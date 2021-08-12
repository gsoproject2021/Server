const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Log = sequelize.define('log',{
    LogsID: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      createdate: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      createhour: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      groupname: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      RoomID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }
});

module.exports = Log;