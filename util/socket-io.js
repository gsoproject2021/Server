let io;

/**
 * global socket.io configurations for using in all app
 */
module.exports = {
  init: httpServer => {
    io = require('socket.io')(httpServer,{
        cors: {
            origin: ["http://localhost:3000"],
            credentials: true,
            
        }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};

