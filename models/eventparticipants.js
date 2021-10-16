const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Eventparticipant = sequelize.define('eventparticipant',{
    ParticipantID: {
      type:Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
    },
    EventID: {
        type: Sequelize.INTEGER,
        allowNull: false,
    
      },
      UserID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      
      },

});

module.exports = Eventjoin;