// const { Op, and } = require('sequelize/types');
// const Log = require('../models/log');
// const Room = require('../models/room');
// const Roommanager = require('../models/roommanager');
// const Roomuser = require('../models/roomuser');

// exports.createRoom = (req,res)=>{
//     let date = new Date();
//     let createDate = `${date.getDay}+/+${date.getMonth}+/+${date.getFullYear}`;
//     let createHour = `${date.getHours}+:+${date.getMinutes}`;
//    Room.create({
        
//         NameRoom = req.body.groupName,
//         CreatDate = createDate,
//         CreatHoure = createHour,
//         OwnerRoomID = req.body.userid,
//         Active = true

//     }).then(result =>{
//         console.log(result);
//         Roommanager.create({
//             UserID = req.body.userid,
//             RoomID = result.RoomID,
//             Active = true
//         }).then(result =>{
//             console.log(result);
//         }).catch(err=>{
//             console.log(err);
//         });

//     }).then(result=>{
//         Roomuser.create({
//             UserID = req.body.userid,
//             RoomID = result.RoomID
//         }).then(result =>{
//             console.log(result);
//         }).catch(err=>{
//             console.log(err);
//         });

//     }).then(result =>{
//         Log.create({
//             createdate = createDate,
//             creathour = createHour,
//             groupname = req.body.groupName,
//             UserID = userid,
//             RoomID = result.RoomID
//         }).then(result=>{
//             console.log(result);
//         }).catch(err=>{
//             console.log(err);
//         });


//     }).catch(err =>{
//         console.log(err);
//     });

// }

// exports.deleteRoom = (req,res) => {
//     const roomid = req.body.roomid;
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
// }

// exports.addManager = (req,res) =>{
//     let userid = req.body.userid;
//     let roomid = req.body.roomid;

//     Roommanager.create({
//         UserID = userid,
//         RoomID = roomid,
//         Active = true
//     }).then(result=>{
//         console.log(result);
//     }).catch(err =>{
//         console.log(err);
//     });

// }
// exports.deleteManager = (req,res) =>{
//     let roomid = req.body.userid;
//     let userid = req.body.roomid;
//     Roommanager.destroy({where:{
//         [Op.and]: [{UserID:userid},{RoomID:roomid}]}})
//         .then(result=>{
//             console.log(result);
//         }).catch(err=>{console.log(err)});

// }

// exports.addUsers = (req,res) =>{
//     let userid = req.body.userid;
//     let roomid = req.body.roomid;

//     Roomuser.create({
//         UserID = userid,
//         RoomID = roomid,
//         Active = true
//     }).then(result=>{
//         console.log(result);
//     }).catch(err =>{
//         console.log(err);
//     });

// }

// exports.deleteUsers = (req,res) =>{
//     let userid = req.body.userid;
//     let roomid = rq.body.roomid;
//     Roomuser.destroy({where:{[Op.an]:[{UserID:userid},{RoomID:roomid}]}})
//     .then(result=>{
//         console.log(result);
//     }).catch(err=>{
//         console.log(err);
//     });
    
// }