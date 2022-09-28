const Room = require('./models/room');
let rooms = new Map();

Room.findAll()
    .then(result => {
        result.forEach(room => {
          rooms.set(room.RoomID,new Set());
        })
    })
    .catch(err => {
    console.log(err);
})

exports.userOnline = (userId,roomsId) => {
     
    roomsId.forEach(room => {
        let tempUsers = rooms.get(room);
        tempUsers.add(userId)
        rooms.set(room,tempUsers);
    })
}

exports.userOffline = (roomsId,userId) => {
    
    roomsId.forEach(room => {
        let tempUsers = rooms.get(room);
        tempUsers.delete(userId)
        rooms.set(room,tempUsers);
    })
}

exports.roomAdded = (roomId) => {
    rooms.set(roomId,new Set());
}

exports.roomDeleted = () => {
    rooms.delete(roomId)
}

exports.getSpecifiedRooms = (roomsId) => {
    let tempRooms = [];
    roomsId.forEach((roomId) => {
        let tempRoom = {
            roomId: roomId,
            users: rooms.get(roomId)
        } 
        tempRooms.push(tempRoom);
    })
    return tempRooms;
}