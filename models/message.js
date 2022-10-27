const Sequelize = require('sequelize');

const sequelize = require('../util/dbconfig');

const Message = sequelize.define('message',{
      MessageID: {
        type: Sequelize.STRING(200),
        allowNull: false,
        primaryKey: true
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
      Message: {
        type: Sequelize.STRING(300),
        allowNull: false,
        
      },
      DateTimeMessage: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: 0
      },
      Sender: {
        type: Sequelize.STRING(45),
        allowNull: false,
        
      }
});

module.exports = Message;