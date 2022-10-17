
const { getIO } = require('./socket-io');
const io = require('./socket-io');
const Room = require('../models/room');
const PublicRoom = require('../models/publicroom');
const Redis = require('ioredis');
const Message = require('../models/message');
const redisClient = new Redis();

const CLEANING_TIME = 24*3600*1000;

exports.addToNewRoom = (room,users) => {
    for (let user of users){
        io.getIO().emit(`userChannel-${user.UserID}`,room)
    }
}


exports.sendAddedUsers = (room) => {
       
    io.getIO().to(room.roomId).emit("addedUserToRoom", room);
    
}

exports.deleteRoom = (roomId) => {

    io.getIO().to(roomId).emit("deleteRoom",roomId);
}

exports.updateRoomName = (room) => {

    io.getIO().emit(`event_room_${room.roomId}`,{action:'rename',data:room});
}

exports.removeUser = (userId,roomId) => {

    io.getIO().to(roomId).emit("removeUser",{userId,roomId});

}

exports.addEvent = (event) => {

    io.getIO().to(event.roomId).emit("newEvent",event);
    
}

exports.updateEvent = (event) => {

    io.getIO().to(event.roomId).emit("updateEvent",event);
}

exports.deleteEvent = (eventId,roomId) => {
    
    io.getIO().to(roomId).emit("deleteEvent",{eventId,roomId})
}

exports.uploadImage = (image) => {

    io.getIO().emit(`upload_image_${image.roomId}`,{action:'add',data:image});
}

exports.userLogout = async (userId,rooms) => {

    let user = {
        userId:userId,
        isOnline: false
    }
    await redisClient.hmset(`userId-${userId}`,user);
    for ( let room of rooms){
        io.getIO().to(room.roomId).emit("userConnected", user)
    }

}

exports.fetchAllPublicRooms = async () => {
    
    try {
       const rooms = await PublicRoom.findAll();
       rooms.forEach((room) => {
        let publicRoom = {roomId:room.RoomID,users:new Set()};
        publicRooms.set(publicRoom);
       })
       console.log(publicRooms);
       return publicRooms;
    }catch(err){
        console.log(err);
    }
}

exports.userConnected = async (socket) => {
    
    let user = {
        userId:socket.user.userId,
        isOnline: true
    }
    
    await redisClient.hmset(`userId-${socket.user.userId}`,user);

    for (let room of socket.data.userRooms){
        let roomUser = {
            userId:socket.user.userId,
            isOnline: true
        }
        socket.join(room.roomId);
        socket.to(room.roomId).emit("userConnected", roomUser );
    }
}

exports.userDisconnected = async (socket) => {
    let user = {
        userId: socket.user.userId,
        isOnline: false
    }
    
    await redisClient.hmset(`userId-${socket.user.userId}`,user);
    for (let room of socket.rooms){
        socket.to(room).emit("userConnected",user)
    }
}

exports.changePublicRoom = async (socket,data) => {

    console.log(socket.user);

}

exports.newMessage = async (socket,msg) => {
    
    await redisClient.lpush("private-messages",JSON.stringify(msg));
    socket.to(msg.roomId).emit("newMessage",msg) 

}

exports.cleanCache = () => {
    let messages = [];
    setInterval(async () => {
        const messagesCount = await redisClient.llen("private-messages");
        for (let index =  messagesCount ; index > 0; index--){
            let temp = await redisClient.lpop("private-messages");
    
            let messageObj = JSON.parse(temp);
           
            let message = {
                MessageID:messageObj.messageId,
                UserID:messageObj.senderId,
                RoomID:messageObj.roomId,
                Message:messageObj.content,
                Sender:messageObj.sender,
                DateTime:messageObj.time
            }
            messages.push(message);
        }
        console.log(messages);
        const result = await Message.bulkCreate(messages);
        messages = [];   
           
    },CLEANING_TIME)


}