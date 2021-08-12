const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const City = sequelize.define('city',{
    CityID: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      CityName: {
        type: DataTypes.STRING(15),
        allowNull: false
      },
      OrigionName: {
        type: DataTypes.STRING(15),
        allowNull: false
      }
});

module.exports = City;