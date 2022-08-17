
const { getIO } = require('./socket-io');
const io = require('./socket-io');
const Room = require('../models/room');

exports.sendAddedUsers = (room) => {
    
    room.users.forEach(user => io.getIO().emit(`rooms_${user.userId}`,{action:'add',data:room}));
    
}

exports.deleteRoom = (users,roomId) => {
    
    users.forEach(user => io.getIO().emit(`rooms_${user}`,{action:'delete',data:parseInt(roomId)}));
    
}

exports.updateRoomName = (room) => {

    io.getIO().emit(`event_room_${room.roomId}`,{action:'rename',data:room});
}

exports.removeUser = (userId,roomId) => {

    io.getIO().emit(`event_room_${roomId}`,{action:'remove',data:{roomId,userId}});

}

exports.addEvent = (event) => {

    io.getIO().emit(`events_${event.roomId}`,{action:'create_event',data:event});
    return;
}

exports.updateEvent = (event) => {

    io.getIO().emit(`events_${event.roomId}`,{action:'update_event',data:event});
}

exports.deleteEvent = (eventId,roomId) => {

    io.getIO().emit(`events_${roomId}`,{action:'delete_event',data:{eventId,roomId}})
}

exports.uploadImage = (image) => {

    io.getIO().emit(`upload_image_${image.roomId}`,{action:'add',data:image});
}

exports.onLogin = (socket,rooms) => {



}

exports.fetchAllRooms = () => {
    let rooms;
    Room.findAll()
    .then(result => {
        rooms = result.map(room => room.RoomID);
        return rooms;
    })
    .catch(err => {
    console.log(err);
    })
}