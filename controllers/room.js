const Op = require('sequelize');
const fs = require('fs');
const path = require('path');
const {QueryTypes} = require('sequelize');


const Log = require('../models/log');
const Room = require('../models/room');

const sequelize = require('../util/dbconfig');
const Roomuser = require('../models/roomuser');



/**
 * fetch all rooms of some user
 */

exports.getRooms = (req,res)=>{
    sequelize.query(`select roomusers.RoomID, rooms.RoomName from roomusers
    join rooms on roomusers.RoomID = rooms.RoomID
    where UserID = ?`,{
        replacements:[`${req.params.userId}`],
        type: QueryTypes.SELECT
    })
    .then(result=>{
        const data = result.map(room =>{return {id:room.RoomID,roomName:room.RoomName}});
        res.send(data);
    })
    .catch(err=>{
        console.log(err);
    })
    
};

exports.fetchAllRooms = (req,res) =>{

    if(req.userDetails.IsAdmin){
        Room.findAll()
        .then(result => {
            const data = result.map(room =>{return {roomId:room.RoomID,roomName:room.RoomName}});
            res.status(200).json(data);
        })
        .catch(err => {
            console.log(err);
            res.json({messgae:"something went wrong can't fetch rooms"})
        })
    }
    else{
        res.json({message:"only admin can't get this information"});
    }  
}

/* 
* createRoom function is function that create new room in database
*  this function add row into rooms, roommanagers, roomuser tables  
*/
exports.createRoom = (req,res,next)=>{
    let date = new Date();
    let createDate = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`;
    let createHour = `${date.getHours()}:${date.getMinutes()}`;
    Room.create({
        RoomName: req.body.roomName,
        CreateDate: createDate,
        CreateHour:createHour,
        CreatorUserID: req.userDetails.userId
    }).then(result=>{
        req.body.roomCreated = 'created';
        let room = {roomId:result.RoomID,roomName:result.RoomName};
        req.body.roomId = result.RoomID;
        req.body.room = room;
        next();
    }).catch(err=>{
        console.log(err);
    });
}
   
exports.updateRoom = (req,res)=>{
    
    const {roomId,roomName} = req.body;
    const userId = req.userDetails.userId
    console.log(roomId,userId);
    Roomuser.findAll({
        where:{
            RoomID: roomId,
            UserID: userId
        }
    })
    .then(result => {
        
        if(result.IsAdmin || req.userDetails.isAdmin){
            return Room.findByPk(roomId)
        }
    })
    .then(room=>{
        console.log(room);
        room.RoomName = roomName,
        room.save();
        let updatedRoom={id:room.RoomID,roomName:room.RoomName};
        res.status(201).json(updatedRoom);
    })
    .catch(err=>{
        console.log(err);
        res.json({message:"something went wrong room didn't updated"});
    });

}

exports.deleteRoom = (req,res)=>{

    const { roomId } = req.params;
    console.log(roomId);

    Roomuser.findAll({
        where:{
            RoomID:roomId,
            UserID:req.userDetails.userId
        }
    })
    .then(result => {
        if(result.IsAdmin || req.userDetails.isAdmin){
            return Room.destroy({where:{RoomID:roomId}})
        }
    })
    .then(result => {
        res.json({message:"Room deleted"});
    })
    .catch(err=>{
        console.log(err);
        res.json({message:"something went wrong room didn't deleted"});
    });

}

exports.createLog = (req,res)=>{
    let date = new Date();
    let logFile = path.join(`C:/Users/vitali/Desktop/gsopro/server/logs/${req.body.room.roomName}.json`);
    let createDate = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`;
    let createHour = `${date.getHours()}:${date.getMinutes()}`;
    const roomId = req.body.roomId;

    
        
        Log.create({
            CreateDate: createDate,
            CreateHour: createHour,
            Path: logFile,
            RoomID:roomId,
        })
        .then(result =>{
            console.log(result);
            res.status(201).json(req.body.room);
        })
        .catch(err =>{
            console.log(err);
        });
        

}

//    Room.create({       
//         RoomName: req.body.roomName,
//         CreateDate: createDate,
//         CreateHour: createHour,
//         CreatorUserID: parseInt(req.body.userID),
//     }).then(result =>{
//         console.log(result);
//         if (result){
//             let logFile = path.join(`C:/Users/vitali/Desktop/gsopro/server/logs/${result.RoomName}.json`);
//             fs.appendFile(logFile,"",(err)=>{if(err) throw err;});
//             Roommanager.create({
//                 UserID: result.CreatorUserID,
//                 RoomID: result.RoomID,
//                 Active: true
//                 }).then(result =>{
//                     console.log(result);
//                 }).catch(err=>{
//                     console.log(err);
//                 });
            
//             Roomuser.create({
//                 UserID: result.CreatorUserID,
//                 RoomID : result.RoomID,
//                 }).then(result =>{
//                     console.log(result);
//                 }).catch(err=>{
//                     console.log(err);
//                 });
//             Log.create({
//                 CreateDate: createDate,
//                 CreateHour: createHour,
//                 Path: logFile,
//                 RoomID: result.RoomID,
//             }).then(result =>{
//                 console.log(result);
//             }).catch(err =>{
//                 console.log(err);
//             });
               
//         }
//     }).catch(err =>{
//         console.log(err);
//     });
//     res.send("room created");
// }
/**
 * delete room from rooms table and from all related tables in database
 */
// exports.deleteRoom = (req,res,next) => {
//     const roomid = req.body.roomId;
//     Roommanager.destroy({where:{RoomID:roomid}})
//     .then(result=>{
//         console.log(result);
//     })
//     .catch(err=>{console.log(err);});
//     Roomuser.destroy({where:{RoomID:roomid}})
//     .then(result=>{
//         console.log(result);
//     })
//     .catch(err=>{
//         console.log(err);
//     });
//     Room.destroy({where:{RoomID:roomid}})
//     .then(result=>{
//         console.log(result);
//     })
//     .catch(err=>{
//         console.log(err);
//     });
//     res.send("room deleted");
// }

/*
* addManager add row into roommanagers table that mean that user is admin too this room
*/

// exports.addManager = (req,res,next) =>{
//     let userid = req.body.userid;
//     let roomid = req.body.roomid;
//     Roommanager.create({
//         UserID: userid,
//         RoomID: roomid
//     }).then(result=>{
//         console.log(result.UserID, "is Admin now");
//         console.log(result);
//     }).catch(err =>{
//         console.log(err);
//     });
// }
// /**
//  * 
//  * deleteManager delete row from RoomManagers that means that the user is not an admin in this room
//  */
// exports.deleteManager = (req,res,next) =>{
//     let roomid = parseInt(req.body.userid);
//     let userid = parseInt(req.body.roomid);
//     Roommanager.destroy({where:{UserID: userid,RoomID:roomid}})
//         .then(result=>{
//             console.log(result);
//         }).catch(err=>{console.log(err)});

// }
// /**
//  * addUsers function add multiple users into roomusers table when we add more than 1 user into room
//  */
// exports.addUsers = (req,res,next) =>{
//     //const arr = [{'UserID':4,'RoomID':5},{'UserID':5,'RoomID':5},{'UserID':6,'RoomID':5},{'UserID':7,'RoomID':5}];
//     // let userid = req.body.userid;
//     // let roomid = req.body.roomid;
//     // const obj = {'UserID':userid,'RoomID':roomid};
//     // arr.push(obj);
//     Roomuser.create({
//         UserID: req.body.userid,
//         RoomID: req.body.roomid
//     }).then(result=>{
//         console.log(result);
//     }).catch(err =>{
//         console.log(err);
//     });

// }

// /**
//  * delete user from roomusers table 
//  */

// exports.deleteUser = (req,res,next) =>{
//     let userid = req.body.userid;
//     let roomid = req.body.roomid;
//     Roomuser.destroy({where:{UserID:userid,RoomID:roomid}})
//     .then(result=>{
//         console.log(result);
//     }).catch(err=>{
//         console.log(err);
//     });
// }




// /**
//  * getUserRooms return all rooms of user from database
//  */


// exports.getUserRooms = (req,res,next) =>{
    
//     sequelize.query(`select users.Username,rooms.RoomName,roomusers.RoomID,events.EventID,events.Subject,events.EventHour,events.EventDate,events.Description from roomusers
// 	                    join rooms on roomusers.RoomID = rooms.RoomID
// 	                    join users on roomusers.UserID = users.UserID
//                         join events on roomusers.RoomID = events.RoomId
// 	                    where roomusers.RoomID in (select rooms.RoomID from roomusers 
// 							join rooms on roomusers.RoomID = rooms.RoomId
// 							where  roomusers.UserID = ${req.body.userid});`,{type: QueryTypes.SELECT})
//     .then(result=>{
        
//         let rooms = result.map(room=>{
//             return {id:room.RoomID,roomName:room.RoomName,members:[],events:[]};
//         });
//         let users = result.map(user=>{
//             return {id:user.RoomID,username:user.Username}
//         });
//         let events = result.map(event=>{
//             return {roomId:event.RoomID,id:event.EventID,subject:event.Subject,date:event.EventHour+' '+event.EventDate,description:event.Description}
//         });
//         rooms = helper.filterData(rooms);
//         events = helper.filterData(events);
//         users = helper.filterData(users);
//         rooms = helper.buildData(rooms,users,events);

//         res.send(rooms);
//     }).catch(err=>{
//         console.log(err);
//     });  
// }
// /**
//  * 
//  * getMembers function to get all users that member in some room
//  */

// exports.getMembers = (req,res,next)=>{

//      sequelize.query(`select userid,roomid from roomusers where RoomID in (${res.locals.roomsArray}) inner join users on users.Username = roomusers.UserID`).then(result=>{
//         console.log(result);
//     }).catch(err=>{
//         console.log(err);
//     });
    
//     // Roomuser.findAll({
//     //     where:{UserID:res.locals.roomsArray},
//     //     include:[{model: User ,attributes:['Username']},
//     //     {model:Room,attributes:['RoomName']}
//     // ]
//     // }).then(result=>{
//     //     console.log(result);
//     // }).catch(err=>{
//     //     console.log(err);
//     // });
//     // res.locals.roomsArray.forEach((item,index)=>{
        
//     //     Roomuser.findAll({
//     //         where: {RoomID:item},
//     //         include:{model: User,attributes:['Username']}
//     //     }).then(result=>{
//     //         console.log(result)
//     //         if(result){
//     //             res.locals.updatedRooms.rooms[index].members = result.map(member=>{
//     //                 return member.user.Username;
//     //             });
//     //         }
//     //     }).catch(err=>{
//     //         console.log(err);
//     //     });
        
//     // });
//     // res.send(result);

//     //res.send(req.members);
//     // console.log(req.members);
//     // Roomuser.findAll({
//     //     where:{ RoomID: req.roomsArray[0]},
//     //     include:{model: User,attributes:['Username']}
//     // }).then(result=>{
//     //     console.log(result);
//     //     if(result){
//     //         req.usersOfRoom = result.map(member => {
//     //         return member.user.Username;
//     //     });
//     //     }
//     //     //res.send(req.rooms);
//     //     res.send(result);
//     // }).catch(err=>{
//     //     console.log(err);
//     // });
    
// }

// /**
//  * helper function to get all events of some room
//  */

// const getEvents = (roomId)=>{
//     let roomEvents = [];
//     Event.findAll({
//         where:{RoomID: roomId}
//     }).then(result=>{
//         if(result){
//              roomEvents = result.map(event => {
//                 return {id:event.EventID,subject:event.Subject,date:event.EventHour+','+event.EventDate,description:event.Description};
//             });
//         }else{
//             return roomEvents;
//         }
        
//     }).catch(err=>{
//         console.log(err);
//     })
 