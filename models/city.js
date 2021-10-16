const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const City = sequelize.define('city',{
    CityID: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      CityName: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      OriginName: {
        type: Sequelize.STRING(15),
        allowNull: false
      }
});

module.exports = City;