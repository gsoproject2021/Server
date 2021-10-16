/**
 * filter duplicate data in array
 */
exports.filterData = (data)=>{

    let newMapData = data.map(item=>{return [item.id,item]});
    let cleanedData =  new Map(newMapData);
    return [...cleanedData.values()];  
}

/**
 * 
 * @param {*} rooms all rooms of some users 
 * @param {*} users all users that members of rooms
 * @param {*} events all events of rooms
 * @returns rooms with all users and events of each room
 */
exports.buildData = (rooms,users,events)=>{
    rooms.forEach((item)=>{
        item.members = users.filter(user=> user.id === item.id);
        item.events = events.filter(event=> event.roomId === item.id);
        return item;
    });
    return rooms;
}