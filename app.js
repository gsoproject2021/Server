const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const userRoutes = require('./routes/user');
const eventRoutes = require('./routes/event');
const roomRoutes = require('./routes/room');
const Redis = require('ioredis');
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

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT');
  
    next();
  });

app.use(userRoutes);
app.use(eventRoutes);
app.use(roomRoutes);


//Room.hasMany(Roomuser,{foreignKey: 'RoomID'});
Roomuser.belongsTo(Room,{foreignKey: 'RoomID'});
//User.hasMany(Roomuser,{foreignKey: 'UserID'});
Roomuser.belongsTo(User,{foreignKey: 'UserID'});



sequelize
    .sync()
    .then(result =>{
        const server = http.createServer(app);
        const io = require('./util/socket-io').init(server);  
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
            socketAction.newMessage(socket,msg);
          })

          socket.on("disconnecting",data => {
            
            socketAction.userDisconnected(socket); 
          })

          socket.on("getPublicRoom", data => {
            console.log(data);
            socketAction.changePublicRoom(socket,data);

          })

        })
        
        socketAction.cleanCache();
        server.listen(4000);
        
        console.log('server is running');
    })
    .catch(err=>{
        console.log(err);
    });

