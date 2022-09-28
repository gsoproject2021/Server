const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/user');
const eventRoutes = require('./routes/event');
const roomRoutes = require('./routes/room');

const sequelize = require('./util/dbconfig');
const socketAction = require('./util/helper');
const onlineStatus = require('./rooms');

const bodyParser = require('body-parser');
const Room = require('./models/room')
const Roomuser = require('./models/roomuser');
const User = require('./models/user');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use('/images/users', express.static(path.join('images', 'users')));
app.use('/images/rooms', express.static(path.join('images', 'rooms')));
///
// app.get('/getTest/:userId',async (req,res)=>{
//   try{
//     const results = await sequelize.query(`select eventsByRoom(${req.params.userId})`);
//     console.log(results);
//     res.send(results);
//   }catch(err){
//     console.log(err);
//   }
// })
///
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT');
  
    next();
  });
//app.use(cors());
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
        const server = app.listen(4000);
        const io = require('./util/socket-io').init(server);  

        io.on('connection', socket => {
          console.log(socket.handshake.auth)
          socket.on("userOnline", data => {
            let roomsId = data.roomsId;
            let userId = data.userId;
            console.log(data)
            roomsId.forEach(roomId => {
              socket.join(roomId);
              socket.to(roomId).emit("whoIsConnected",{userId,roomId})
            })
          })

          socket.on("iAmConnected",({userAnswer,roomId}) => {
            console.log(userAnswer,roomId,"2")
            let userId = userAnswer;
            socket.to(roomId).emit("userAnswer",{userId,roomId})
          })

          socket.on("message", data => {
            socket.to(data.roomId).emit("newMessage",data);
          })

          socket.on('disconnecting', () => {
            let userId = socket.handshake.auth;
            let rooms = socket.rooms;
            console.log(userId);
            io.to(rooms).emit('userDisconnected',{userId,rooms})
            rooms.forEach(room => {
              socket.leave(room);
            })
          })
        })

        
        
        console.log('server is running');
    })
    .catch(err=>{
        console.log(err);
    });

