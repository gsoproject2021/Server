const {Op,QueryTypes} = require('sequelize');
const Roomuser = require('../models/roomuser');
const User = require('../models/user');
const sequelize = require('../util/dbconfig');
const socketActions = require('../util/helper');

/**
 * return all users of some room by room ID
 */

exports.getUsers = (req,res,next)=>{

    const roomId = req.params.roomId;
    const userId = req.userDetails.userId;
    
    Roomuser.findAll({
        where:{
            RoomID: roomId,
            UserID: userId
        }
    })
    .then(result => {
        if(result){
            return sequelize.query(`select roomusers.IsAdmin,roomusers.UserID, users.Username,users.ImageUrl from roomusers 
            join users on roomusers.UserID = users.UserID
            where RoomID = ?`,{
                replacements:[`${req.params.roomId}`],
                type: QueryTypes.SELECT
            })
        }
    })
    .then(result=>{
        console.log(result);
        res.status(200).json(result);
    })
    .catch(err=>{
        res.json({message:"something went wrong can't display users"});
    });  
};

/**
 * add user to room by adding user ID and room ID to room users table 
 */

exports.addUsers = (req,res,next) => {
    
    let roomId;
    let roomCreator = {RoomID:req.body.roomId,UserID:req.userDetails.userId || req.userDetails.UserID,IsAdmin:true,isOnline:true};
    let users = [];
    if(req.body.created === 'created'){
        console.log(req.body.created);
        users.push(roomCreator);
        roomId = req.body.roomId;
    }
    else{
        users = req.body.users;
        roomId = req.params.roomId;   
    }


    Roomuser.bulkCreate(users)
    .then(result => {
        
        return sequelize.query(`select roomusers.IsAdmin,roomusers.UserID, users.FirstName, users.LastName from roomusers 
                join users on roomusers.UserID = users.UserID
                where RoomID = ?`,{
                replacements:[`${roomId}`],
                type: QueryTypes.SELECT});
    })
    .then(result => {
        console.log(result);
        if(req.body.created === 'created'){
            let room = req.body.room;
            room.users = result.map(user => {return {userId:user.UserID, firstName:user.FirstName,isAdmin:user.IsAdmin,isOnline:true}})
            
            res.json(room);
        }else{
            let data = result.map(user => {return {userId:user.UserID, firstName:user.FirstName,isAdmin:user.IsAdmin,isOnline:false}})
            req.body.roomDetails = {roomId:req.body.roomId,roomName:'',users:data,events:[],messages:[]};
            next();
            // res.json(data);
        }
        
    })
    .catch(err => {
        console.log(err);
    })
    
}


// exports.addUsers = (req,res,next) => {
    
//     const roomId = req.params.roomId || req.body.roomId;
//     const userId = req.userDetails.userId;
//     const users = req.body.users;
//     const existedRoom = req.body.existedRoom;
//     const room = req.body.room;
//     console.log(room);
//     Roomuser.findAll({
//         where:{
//             RoomID:roomId ,
//             UserID:userId
//         }
//     })
//     .then(result => {
        
//         if( !result.length ){
            
//             return Roomuser.create({RoomID:roomId,UserID:userId,IsAdmin:true});
//         }
//         else{
//             if(result.IsAdmin || req.userDetails.isAdmin){
                
//             return Roomuser.bulkCreate(users);
//             }
//         }
        
//     })
//     .then(result => {
//         console.log(result);
//         if(!result){
//             res.json({message:"something went wrong users didn't added to room"});
//         }
//         return sequelize.query(`select roomusers.IsAdmin,roomusers.UserID, users.FirstName, users.LastName from roomusers 
//         join users on roomusers.UserID = users.UserID
//         where RoomID = ?`,{
//         replacements:[`${roomId}`],
//         type: QueryTypes.SELECT});
//     })
//     .then(result => {
//         req.body.roomUsers = result;
//         if(req.body.roomCreated === 'created'){
//             next();
//         }
//         else{
//             // getIO.getIO.broadcast(userId, {
//             //     action: 'addedToRoom',
//             //     roomDetails: {roomId: roomId, roomName: existedRoom}
                
//             // });
//             let addedUsers = result.map( user => {return {userId:userId,firstName:user.FirstName,isAdmin:user.IsAdmin}})
//             res.status(201).json(addedUsers);
//         }
        
        
//     })
//     .catch(err=>{
//         console.log(err);
//         res.json({message:"something went wrong users didn't added to room"});
//     });
// };

/**
 * remove user from room by removing user from room users table
 */

exports.removeUser = (req,res)=>{

    const roomId = req.body.roomId;
    const userToDelete = req.body.userId
    const userThatDelete = req.userDetails.userId;
    console.log(roomId,req.body.userId);
    Roomuser.findAll({
        where: {
            UserID: userThatDelete,
            RoomID: roomId,
            IsAdmin:1
        }
    })
    .then(result => {
        if(result.length > 0 || req.userDetails.isAdmin){
            console.log("ok")
            return Roomuser.destroy({
                where:{
                    RoomID:roomId,
                    UserId:userToDelete
                }
            })
        }
    })
    .then(result => {
        console.log(result);
        if(result){
            socketActions.removeUser(userToDelete,roomId);
            res.json({message:"User deleted from room"});
        }else{
            res.json({message:"something went wrong user didn't removed"});
        }
    })
    .catch(err => {
        console.log(err);
        res.json({message:"something went wrong users didn't deleted"});
    });

}

exports.setAdminState = (req,res)=>{

    const roomId = req.body.roomId;
    const userToAdmin = req.body.userId;
    const userSetter = req.userDetails.userId;
    const adminState = req.body.isAdmin;
    console.log(roomId,userToAdmin,adminState);
    Roomuser.findAll({
        where:{
            UserID:userSetter,
            RoomID:roomId 
        }
    })
    .then(result => {
        if(result.IsAdmin || req.userDetails.isAdmin){
            result.IsAdmin = adminState;
            result.save();
        }
        
        res.status(201).json({message:"admin added"});
    })
    .catch(err=>{
        res.json({message:"something went wrong the action failed"});
    })
}

exports.getRoomDetails = (req,res) =>{

    const roomId = req.params.roomId;
    const userId = req.userDetails.userId;

    Roomuser.findAll({
        where:{
            RoomID:roomId,
            UserID:userId
        }
    })
    .then(result => {
        if(result){
            return sequelize.query(`select roomusers.IsAdmin,roomusers.UserID, users.FirstName from roomusers 
            join users on roomusers.UserID = users.UserID
            where RoomID = ? `,{
                replacements:[`${req.params.roomId }`],
                type: QueryTypes.SELECT
            })
        }
    })
    .then(result=>{
        let data = {
            events: req.body.events,
            users: result
        };
        res.json(data);
    })
    .catch(err=>{
        console.log(err);
        res.json({message:"something went wrong can't fetch details"});
    });
};

exports.getAllUsers = (req,res) => {
    User.findAll({
        where:{ IsAdmin:false,IsBlocked:false}
    })
    .then(result => {
        const data = result.map(user => {return {userId:user.UserID,firstName:user.FirstName,isAdmin:result.IsAdmin}})
        res.status(200).json(data);
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getAllData = (req,res) => {

    const userId = req.params.userId;
    sequelize.query(`select roomusers.IsAdmin,roomusers.UserID,roomusers.RoomID,users.FirstName,rooms.RoomName from roomusers
            join users on roomusers.UserID = users.UserID
            join rooms on roomusers.RoomID = rooms.RoomID
            where roomusers.RoomID in (select roomusers.RoomID from roomusers
                    where roomusers.UserID = ?)`,{
                        replacements:[`${req.params.userId }`],
                        type: QueryTypes.SELECT
                    })
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.log(err)
        })

}