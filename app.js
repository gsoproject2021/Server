const express = require('express');
const app = express();
const path = require('path');
const jwt = require('jsonwebtoken');
const userRoutes = require('./routes/user');
const eventRoutes = require('./routes/event');
const roomRoutes = require('./routes/room');
const http = require('http')
const sequelize = require('./util/dbconfig');
const socketAction = require('./util/helper');
const bodyParser = require('body-parser');
const Room = require('./models/room')
const Roomuser = require('./models/roomuser');
const User = require('./models/user');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use('/images/users', express.static(path.join('images', 'users')));
app.use('/images/rooms', express.static(path.join('images', 'rooms')));


/*
* CORS middleware configurations
*/
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT');
  
    next();
  });

//user routes
app.use(userRoutes);
//event routes
app.use(eventRoutes);
//room routes
app.use(roomRoutes);



sequelize
    .sync()
    .then(result =>{
        const server = http.createServer(app);
        const io = require('./util/socket-io').init(server);  
        //user authentication on socket connection
        io.use((socket,next) => {
          const token = socket.handshake.auth.token;
          
          if(!token){
            throw new Error("something went wrong");
          }
          try{

            const decoded = jwt.verify(token,'P@$$w0rd');
            socket.user = decoded.userDetails;
            next()
          }
          catch(err){
            console.log(err);
          }

        })
        
        io.on("connect", socket => {
          socket.join(socket.user.userId);
          socket.on("userRooms",data => {
            socket.data.userRooms = data 
            
            socketAction.userConnected(socket);
          })

          socket.on("message", msg => {
            if(msg.roomType === "private"){
              socketAction.newMessage(socket,msg);
            }
            if(msg.roomType === "public"){
              socket.to(`public-${msg.roomId}`).emit("newMessage",msg);
            }
          })

          socket.on("getPublicRoom", data => {
          
            socketAction.changePublicRoom(socket,data);
          })

          socket.on('joinToNewRoom', data => {
            socketAction.joinToNewRoom(socket,data);
          })

          socket.on('roomDeleted', data => {
            socketAction.roomDeleted(socket,data)
          })

          socket.on("disconnecting",data => {
            
            socketAction.userDisconnected(socket); 
          })

          

        })
        
        socketAction.cleanCache();
        server.listen(4000);
        
        console.log('server is running on port 4000');
    })
    .catch(err=>{
        console.log(err);
    });

