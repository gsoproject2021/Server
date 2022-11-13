const io = require('./socket-io');
const Room = require('../models/room');
const PublicRoom = require('../models/publicroom');
const Redis = require('ioredis');
const Message = require('../models/message');
const redisClient = new Redis();

const CLEANING_TIME = 24*3600*1000;
/**
 * emit to users that they added to new room
 */
exports.addToNewRoom = (room,users) => {
    for (let user of users){
        io.getIO().emit(`userChannel-${user.UserID}`,room)
    }
}

/**
 * 
 * @param {*} room 
 * emit to user to join to new created room
 */

exports.newRoomCreated = (userId,room) => {
    io.getIO().emit(`roomCreatedByUser-${userId}`,room);
}
/*
 * update existed users about new users added
 */
exports.sendAddedUsers = (room) => {   
    io.getIO().to(room.roomId).emit("addedUserToRoom", room); 
}

/**
 * update users that room deleted
 */
exports.deleteRoom = (roomId) => {
    io.getIO().to(roomId).emit("deleteRoom",roomId);
}

/**
 *  update users about removed users
 * */ 
exports.removeUser = (userId,roomId) => {
    io.getIO().to(roomId).emit("removeUser",{userId,roomId});
}

/**
 * emit users about new event in room
 * 
 */
exports.addEvent = (event) => {
    io.getIO().to(event.roomId).emit("newEvent",event);
    
}

/**
 * emit updates of event on room
 */
exports.updateEvent = (event) => {
    io.getIO().to(event.roomId).emit("updateEvent",event);
}

/**
 * emit that event deleted
 */
exports.deleteEvent = (eventId,roomId) => {
    
    io.getIO().to(roomId).emit("deleteEvent",{eventId,roomId})
}

/**
 * emit to room that user went offline
 */
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

/**
 * 
 * emit that user connected to chat 
 */

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

/**
 * emit that user disconnected
 */
exports.userDisconnected = async (socket) => {
    let user = {
        userId: socket.user.userId,
        isOnline: false
    }
    
    await redisClient.hmset(`userId-${socket.user.userId}`,user);
    for (let room of socket.rooms){
        socket.to(room).emit("userConnected",user)
    }
    socket.to(`public-${socket.data.curRoomName}`)
}

/**
 * emit users that user leave public room
 */

exports.changePublicRoom = async (socket,data) => {

    console.log(data)

    let publicUser = {
        userId: socket.user.userId,
        firstName: socket.user.firstName,
        isAdmin: false,
        isOnline: true,
        image: socket.user.image
    }
    let users = [];
    let curRoom = await redisClient.lrem(`public-room-${data.curRoomId}`,0,JSON.stringify(publicUser));
    await redisClient.lpush(`public-room-${data.curRoomId}`,JSON.stringify(publicUser));
    let prevRoom = await redisClient.lrem(`public-room-${data.prevRoomId}`,0,JSON.stringify(publicUser));
    socket.leave(`public-${data.prevRoomId}`);
    socket.join(`public-${data.curRoomId}`);
    let publicRoomUsers = await redisClient.lrange(`public-room-${data.curRoomId}`,0,-1);
    publicRoomUsers.forEach(user => {
        users.push(JSON.parse(user));
    });
    let room = {
        roomId: data.curRoomId,
        roomName: data.curRoomName,
        users: users,
        events: [],
        messages: []
    }
    
    
    socket.emit(`publicRoomDetails-${socket.user.userId}`,room);
    
    socket.to(`public-${data.curRoomId}`).emit("updatePublicUsers",room.users);
    socket.to(`public-${data.prevRoomId}`).emit("updatePublicUsersById",socket.user.userId);

}

/**
 *emit new message 
 */

exports.newMessage = async (socket,msg) => {
    
    await redisClient.lpush("private-messages",JSON.stringify(msg));
    socket.to(msg.roomId).emit("newMessage",msg) 

}

/*
*clean the redis cache every 24 hours moving all messages from cache to DB
*/
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
                DateTimeMessage:messageObj.time
            }
            messages.push(message);
        }
        console.log(messages);
        const result = await Message.bulkCreate(messages);
        messages = [];   
           
    },CLEANING_TIME)


}

exports.joinToNewRoom = (socket,data) => {

    socket.join(data.roomId);
}

exports.roomDeleted = (socket,data) => {
    socket.leave(data);
}