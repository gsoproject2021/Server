const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const User = sequelize.define('user',{
    UserID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
        
      },
      Username: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      Password: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      Email: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      Birthday: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      Phone: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      FirstName: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      LastName: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      Gender: {
        type: Sequelize.STRING(8),
        allowNull: true
      },
      IsAdvertiser: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue:false
      },
      isAdmin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue:false
      },
      IsBlocked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue:false
      }
      
});

module.exports = User;