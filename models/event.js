const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Event = sequelize.define('event',{
    EventID: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      Subject: {
        type: Sequelize.STRING(45),
        allowNull: false
      },
      EventHour: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      EventDate: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      
      Description: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      CityID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cities',
          key: 'CityID'
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

module.exports = Event;