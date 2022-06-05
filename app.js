const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/user');
const eventRoutes = require('./routes/event');
const roomRoutes = require('./routes/room');

const sequelize = require('./util/dbconfig');
const socketAction = require('./util/helper');


const bodyParser = require('body-parser');
const Room = require('./models/room');
const Roomuser = require('./models/roomuser');
const User = require('./models/user');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use('/images/users', express.static(path.join('images', 'users')));
app.use('/images/rooms', express.static(path.join('images', 'rooms')));


let rooms = [];

Room.findAll()
    .then(result => {
        rooms = result.map(room => {return{roomId:room.RoomID,users:[]}});
        return rooms;
    })
    .catch(err => {
    console.log(err);
})

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
            console.log(rooms)
            console.log('client connected',socket.id);
            socket.on('user_joined', data => {
              console.log(data)
              data.rooms.forEach(room => )
              data.rooms.forEach(room => socket.broadcast.emit(`is_user_online${room}`,{userData:{userId:data.userId,roomId:room,isOnline:true}}));
            })
        })


        console.log('server is running');
    })
    .catch(err=>{
        console.log(err);
    });

