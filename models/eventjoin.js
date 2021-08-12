const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Eventjoin = sequelize.define('eventjoin',{
    EventID: {
        type: Sequelize.INTEGER,
        allowNull: false,
    
      },
      UserID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      
      },
      RequestDate: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      RequestHour: {
        type: Sequelize.STRING(10),
        allowNull: false
      }
});

module.exports = Eventjoin;