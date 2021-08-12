const Sequelize = require('sequelize');

const sequelize = new Sequelize('gso','root','123456',{
    dialect:'mysql',
    host:'localhost',
    define:{
        timestamps:false
    }
});

module.exports = sequelize;










