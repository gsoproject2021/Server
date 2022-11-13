const path = require('path');
const {QueryTypes} = require('sequelize');
const Redis = require('ioredis');
const redisClient = new Redis();
const Room = require('../models/room');
const Event = require('../models/event')
const sequelize = require('../util/dbconfig');
const Roomuser = require('../models/roomuser');
const socketActions = require('../util/helper');
const PublicRoom = require('../models/publicroom');
const { validationResult } = require('express-validator');


/**
 * fetch all public room and all rooms of user and room's user and events
 */

exports.getAllUserData = async (req,res) => {

    let rooms = [];
    let publicRooms = [];

    try{
        const userRooms = await sequelize.query(`select roomusers.RoomID, rooms.RoomName, rooms.ImageUrl from roomusers
            join rooms on roomusers.RoomID = rooms.RoomID
            where UserID = ?`,{
                replacements:[`${req.params.userId}`],
                type: QueryTypes.SELECT
            })
        if(userRooms){
            rooms = userRooms.map(room => {return {
                roomId:room.RoomID,
                roomName:room.RoomName,
                users:[],
                events:[],
                messages:[],
                image:room.ImageUrl,
                newMessage:false,
                type: "private"
            }});
        
        

            for(const room of rooms){
                const roomUsers = await sequelize.query(`select roomusers.IsAdmin,roomusers.UserID,roomusers.RoomID, users.FirstName,users.ImageUrl from roomusers 
                        join users on roomusers.UserID = users.UserID
                        join rooms on roomusers.RoomID = rooms.RoomID
                        where roomusers.RoomID in (:room)`,{
                            replacements:{ room: room.roomId},
                            type: QueryTypes.SELECT
                        });
                if(!roomUsers){
                    room.users = [];
                }
                else{
                    let users = [];
                    for (let user of roomUsers){
                        let userStatus = await redisClient.hgetall(`userId-${user.UserID}`);
                        console.log(userStatus)
                        let roomUser = {
                            userId: user.UserID,
                            firstName: user.FirstName,
                            isAdmin: user.IsAdmin,
                            image: user.ImageUrl,
                            isOnline: userStatus.isOnline === "true" || false
                        }
                        
                        users.push(roomUser);
                    }
                    room.users = users;
                }

                let roomEvents = await Event.findAll({
                    where: {
                        RoomID:room.roomId
                    }
                });
                if(!roomEvents){
                    room.events = [];
                }
                else{
                    let events = roomEvents.map(event => {return{
                        eventId:event.EventID,
                        subject:event.Subject,
                        date:event.EventDate,
                        hour:event.EventHour,
                        description:event.Description
                    }})
                    room.events = events;
                }

                const messagesCount = await redisClient.llen("private-messages");
                for (let index = 0 ; index < messagesCount ; index++){
                    let temp = await redisClient.lindex("private-messages",index);
                    let message = JSON.parse(temp);
                    if(message.roomId === room.roomId){
                        room.messages.unshift(message);
                    }             
                }
                
            }
        }

        let fetchPublicRoom = await PublicRoom.findAll();
        if(fetchPublicRoom){
            publicRooms = fetchPublicRoom.map(publicRoom => {return { roomId:publicRoom.RoomID,roomName:publicRoom.RoomName,type:"public"}})
        } 
              
        res.json({message:`Welcome`,rooms,publicRooms})


    }
    catch(err){
        console.log(err)
    }

}
/**
 * fetch all rooms of some user
 */

exports.fetchAllRooms = (req,res) =>{
    console.log("test");
    console.log(req.userDetails);
    if(req.userDetails.isAdmin){
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
*  this function add row into rooms, roomusers tables  
*/
exports.createRoom = async (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        let [data] =(errors.errors)
        return res.send(data.msg);
    }

    let date = new Date();
    let createDate = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`;
    let createHour = `${date.getHours()}:${date.getMinutes()}`;
    
    try{
        const newRoom = await Room.create({
                RoomName: req.body.roomName,
                CreateDate: createDate,
                CreateHour:createHour,
                CreatorUserID: req.userDetails.userId
        });
        
        if(!newRoom){
            res.send("something went wrong room didn't created");
        }

        let room = {
            roomId:newRoom.RoomID,
            roomName:newRoom.RoomName,
            users:[],
            events:[],
            messages:[],
            type:"private"
        };
        
        const userRoom = await Roomuser.create({
            RoomID:newRoom.RoomID,
            UserID:req.userDetails.userId,
            IsAdmin:true
        });
        
        if(!userRoom){
            newRoom.destroy();
            res.send("something went wrong can't create room");
        }

        const user = {
            userId: req.userDetails.userId,
            firstName: req.userDetails.firstName,
            image: req.userDetails.image,
            isAdmin: true,
            isOnline:true
        }
        
        room.users.push(user);
        socketActions.newRoomCreated(user.userId,room);
        res.json(room);

    }
    catch(err){
        res.send("something went wrong  try again");
    }


    // console.log(req.userDetails);
    // Room.create({
    //     RoomName: req.body.roomName,
    //     CreateDate: createDate,
    //     CreateHour:createHour,
    //     CreatorUserID: req.userDetails.userId || req.userDetails.UserID
    // }).then(result=>{
    //     req.body.created = 'created';
    //     let room = {roomId:result.RoomID,roomName:result.RoomName,users:[],events:[],messages:[]};
    //     req.body.roomId = result.RoomID;
    //     req.body.room = room;
    //     next();
    // }).catch(err=>{
    //     console.log(err);
    // });
}

/**
 * update room name
 */
exports.updateRoom = (req,res)=>{
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        let [data] =(errors.errors)
        return res.send(data.msg);
    }

    const {roomId,roomName} = req.body;
    const userId = req.userDetails.userId
    console.log(roomId,userId);
    Roomuser.findAll({
        where:{
            RoomID: roomId,
            UserID: userId,
            IsAdmin:1
        }
    })
    .then(result => {
        console.log(result)
        if(result.length > 0 || req.userDetails.isAdmin){
            return Room.findByPk(req.body.roomId)
        }
    })
    .then(room=>{
        console.log(room);
        room.RoomName = roomName,
        room.save();
        let updatedRoom={roomId:room.RoomID,roomName:room.RoomName};
        socketActions.updateRoomName(updatedRoom);
        res.json(updatedRoom);
    })
    .catch(err=>{
        console.log(err);
        res.send("something went wrong room didn't updated");
    });

}

/**
 * delete room 
 */

exports.deleteRoom = (req,res)=>{
    
    const { roomId } = req.params;

    let users = req.body.users.map(user => parseInt(user.userId));
    Roomuser.findAll({
        where:{
            RoomID:roomId,
            UserID:req.userDetails.userId ,
            IsAdmin:1
        }
    })
    .then(result => {

        if(result.length > 0 || req.userDetails.isAdmin){
            return Room.destroy({where:{RoomID:roomId}})
        }
        
    })
    .then(result => {
        if(result){
            socketActions.deleteRoom(roomId);
            res.send("Room deleted");

        }else{
            res.send("user unautorized to delete this room")
        }
    })
    .catch(err=>{
        console.log(err);
        res.send("something went wrong room didn't deleted");
    });

}

// send users and event some room for admin
exports.getRoomData = async (req,res) => {
    
    let users = [];
    let events = [];
    if(!req.userDetails.isAdmin){
        return res.json({message: "unauthorized request"});
    }
    try{
        const fetchedUsers = await sequelize.query(`select roomusers.IsAdmin,roomusers.UserID, users.FirstName,users.ImageUrl from roomusers 
        join users on roomusers.UserID = users.UserID
        where RoomID = ?`,{
            replacements:[`${req.params.roomId}`],
            type: QueryTypes.SELECT
        });
        if(fetchedUsers){
            users = fetchedUsers.map(user => {return {userId:user.UserID,
                                                            firstName:user.FirstName,
                                                            isAdmin:user.IsAdmin,
                                                            image:user.ImageUrl}});
        }

        const fetchedEvents = await Event.findAll({
            where: {RoomID:req.params.roomId}
        });
        if(fetchedEvents){
            events = fetchedEvents.map(event => {return {eventId:event.EventID,
                subject:event.Subject,
                date:event.EventDate,
                hour:event.EventHour,
                description:event.Description,
                roomId:req.params.roomId}} )
        }
        res.json({users,events});
    }
    catch(err){
        console.log(err);
    }

    // Room.findByPk(req.body.roomId)
    // .then(result => {
    //     req.body.roomDetails.roomName = result.RoomName;
    //     return Event.findAll({where: {RoomID:req.body.roomDetails.roomId}})
    // })
    // .then(result => {
    //     req.body.roomDetails.events = result.map(event=>{
    //         return{eventId:event.EventID,subject:event.Subject,date:event.EventDate+' '+event.EventHour,description:event.Description}})
        
    //     socketActions.sendAddedUsers(req.body.roomDetails);
    //     res.json(req.body.roomDetails);
    // })
    // .catch(err => {
    //     console.log(err);
    // })
}

//upload image for room
exports.uploadImage = (req,res) => {

    console.log(req.file.path);
    Room.findByPk(req.body.roomId)
    .then(room => {
        room.ImageUrl = req.file.path;
        room.save();
        let data = {
            roomId:room.RoomID,
            image:req.file.path
        }
        
        socketActions.uploadImage(data);
        res.json(data);
    })
    .catch(err => {
        console.log(err);
    })
}

//send all data of some room for admin
exports.getRoomDataByAdmin = async (req,res) => {

}

