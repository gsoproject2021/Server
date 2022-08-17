const Op = require('sequelize');
const fs = require('fs');
const path = require('path');
const {QueryTypes} = require('sequelize');


const Log = require('../models/log');
const Room = require('../models/room');
const User = require('../models/user')
const Event = require('../models/event')

const sequelize = require('../util/dbconfig');
const Roomuser = require('../models/roomuser');
const socketActions = require('../util/helper');


/**
 * fetch all rooms of some user
 */

exports.getRooms = (req,res)=>{
    sequelize.query(`select roomusers.RoomID, rooms.RoomName, rooms.ImageUrl from roomusers
    join rooms on roomusers.RoomID = rooms.RoomID
    where UserID = ?`,{
        replacements:[`${req.params.userId}`],
        type: QueryTypes.SELECT
    })
    
    .then(result=>{
        
        let roomInd = result.map(room => {return room.RoomID});
        let data = result.map(room =>{return {roomId:room.RoomID,roomName:room.RoomName,users:[],events:[],messages:[],image:room.ImageUrl }});
        req.body.roomInd = roomInd
        req.body.rooms = data;
        return sequelize.query(`select roomusers.IsAdmin,roomusers.UserID,roomusers.RoomID, users.FirstName,users.ImageUrl from roomusers 
        join users on roomusers.UserID = users.UserID
        join rooms on roomusers.RoomID = rooms.RoomID
        where roomusers.RoomID in (:room)`,{
            replacements:{ room: roomInd},
            type: QueryTypes.SELECT
        })
        
    })
    .then(result => {
        let rooms = req.body.rooms;

        rooms.forEach((room) => {
            room.users = result.filter(res => res.RoomID === room.roomId);
            room.users = room.users.map(user => {
                return {userId:user.UserID,firstName:user.FirstName,isAdmin:user.IsAdmin,image:user.ImageUrl,isOnline:false}})
        })
        req.body.rooms = rooms;
        
        return sequelize.query(`select * from events 
            where RoomID in (:room)`,{
            replacements:{ room: req.body.roomInd },
            type: QueryTypes.SELECT
        })
        
    })
    .then(result => {
        let rooms = req.body.rooms;
        
        rooms.forEach((room) => {
            room.events = result.filter(res => room.roomId === res.RoomID);
            
            room.events = room.events.map(event=>{
                return{eventId:event.EventID,subject:event.Subject,date:event.EventDate,hour:event.EventHour,description:event.Description}
            })
        })
        res.json(rooms);
    })
    .catch(err=>{
        console.log(err);
    })
    
};

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
*  this function add row into rooms, roommanagers, roomusers tables  
*/
exports.createRoom = (req,res,next)=>{
    let date = new Date();
    let createDate = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`;
    let createHour = `${date.getHours()}:${date.getMinutes()}`;
    console.log(req.userDetails.userId);
    Room.create({
        RoomName: req.body.roomName,
        CreateDate: createDate,
        CreateHour:createHour,
        CreatorUserID: req.userDetails.userId
    }).then(result=>{
        req.body.created = 'created';
        let room = {roomId:result.RoomID,roomName:result.RoomName,users:[],events:[],messages:[]};
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
        res.status(201).json(updatedRoom);
    })
    .catch(err=>{
        console.log(err);
        res.json({message:"something went wrong room didn't updated"});
    });

}

exports.deleteRoom = (req,res)=>{
    console.log("ok");
    const { roomId } = req.params;
    let users = req.body.users.map(user => parseInt(user.userId));
    Roomuser.findAll({
        where:{
            RoomID:roomId,
            UserID:req.userDetails.userId,
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
            console.log(users,roomId);
            socketActions.deleteRoom(users,roomId);
            res.json({message:"Room deleted"});

        }else{
            res.json({message:"user unautorized to delete this room"})
        }
    })
    .catch(err=>{
        console.log(err);
        res.json({message:"something went wrong room didn't deleted"});
    });

}

exports.createLog = (req,res,next)=>{
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
            next()
        })
        .catch(err =>{
            console.log(err);
        });
        

}

exports.getRoomData = (req,res) => {

    Room.findByPk(req.body.roomId)
    .then(result => {
        req.body.roomDetails.roomName = result.RoomName;
        return Event.findAll({where: {RoomID:req.body.roomDetails.roomId}})
    })
    .then(result => {
        req.body.roomDetails.events = result.map(event=>{
            return{eventId:event.EventID,subject:event.Subject,date:event.EventDate+' '+event.EventHour,description:event.Description}})
        
        socketActions.sendAddedUsers(req.body.roomDetails);
        res.json(req.body.roomDetails);
    })
    .catch(err => {
        console.log(err);
    })
}

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