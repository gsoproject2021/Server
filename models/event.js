const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Event = sequelize.define('event',{
    EventID: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'UserID'
        }
      },
      DateOfEvent: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      Hours: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      Subject: {
        type: DataTypes.STRING(30),
        allowNull: false
      },
      Description: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      CityID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
        
});

module.exports = Event;