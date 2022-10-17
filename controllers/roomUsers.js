const {Op,QueryTypes} = require('sequelize');
const Roomuser = require('../models/roomuser');
const User = require('../models/user');
const sequelize = require('../util/dbconfig');
const socketActions = require('../util/helper');
const Room = require('../models/room');
const Redis = require('ioredis');
const redisClient = new Redis()
const Event = require('../models/event');
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

exports.addUsers = async (req,res) => {
    
        let users = [];
        let room;
    try{
        const roomAdmin = await Roomuser.findOne({where: {
            UserID: req.userDetails.userId,
            RoomID: req.params.roomId
        }})
        console.log(roomAdmin);
        if(roomAdmin.IsAdmin !== true && roomAdmin.IsAdmin !== 1){
            return res.send("unauthorized action only admin can add users to group");
        }

        const response = await Roomuser.bulkCreate(req.body.users)
        if(!response){
            return res.send("something went wrong users didn't add");
        }

        const tempRoom = await Room.findByPk(req.body.roomId);
        if(!tempRoom){
            return res.send("something went wrong");
        }
        
        room = {
            roomId: tempRoom.RoomID,
            roomName: tempRoom.RoomName,
            users:[],
            events:[],
            messages:[],
            newMessage:false

        };
        const roomUsers = await sequelize.query(`select roomusers.IsAdmin,roomusers.UserID,roomusers.RoomID, users.FirstName,users.ImageUrl from roomusers 
            join users on roomusers.UserID = users.UserID
            join rooms on roomusers.RoomID = rooms.RoomID
            where roomusers.RoomID in (:room)`,{
            replacements:{ room: room.roomId},
            type: QueryTypes.SELECT
        });

        for (let user of roomUsers){
            let userStatus = await redisClient.hgetall(`userId-${user.UserID}`);
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
        
        socketActions.addToNewRoom(room,req.body.users);
        socketActions.sendAddedUsers(room);
        
        res.json(room);
    }
    catch(err){
        if(err){
            res.send("something went wrong can't add users");
            console.log(err);
        }
    }

    // Roomuser.bulkCreate(users)
    // .then(result => {
        
    //     return sequelize.query(`select roomusers.IsAdmin,roomusers.UserID, users.FirstName, users.LastName,users.ImageUrl from roomusers 
    //             join users on roomusers.UserID = users.UserID
    //             where RoomID = ?`,{
    //             replacements:[`${roomId}`],
    //             type: QueryTypes.SELECT});
    // })
    // .then(result => {
    //     console.log(result);
    //     if(req.body.created === 'created'){
    //         let room = req.body.room;
    //         room.users = result.map(user => {return {userId:user.UserID, firstName:user.FirstName,isAdmin:user.IsAdmin,isOnline:true}})
            
    //         res.json(room);
    //     }else{
    //         let data = result.map(user => {return {userId:user.UserID, firstName:user.FirstName,isAdmin:user.IsAdmin,isOnline:false}})
    //         req.body.roomDetails = {roomId:req.body.roomId,roomName:'',users:data,events:[],messages:[]};
    //         next();
    //         // res.json(data);
    //     }
        
    // })
    // .catch(err => {
    //     console.log(err);
    // })
    
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

exports.removeUser = async (req,res)=>{

    const roomId = req.body.roomId;
    const userToDelete = req.body.userId
    const userThatDelete = req.userDetails.userId;
    console.log(req.body);
    try{
        const roomAdmin = await Roomuser.findOne({
            where:{
                RoomID: roomId,
                UserID: userThatDelete
            }
        })
        if(!roomAdmin){
            return res.send("something went wrong you can't remove user from room");
        }

        if(roomAdmin.IsAdmin === true || roomAdmin.IsAdmin === 1){
            const toDelete = await Roomuser.findOne({
                where:{
                    UserID: userToDelete,
                    RoomID:roomId
                }
            });
            if(!toDelete){
                return res.send("something went wrong user didn't removed");
            }
            toDelete.destroy();
        }
        socketActions.removeUser(userToDelete,roomId);
        res.send("User removed")

    }
    catch(err){
        console.log(err);
    }

    // Roomuser.findAll({
    //     where: {
    //         UserID: userThatDelete,
    //         RoomID: roomId,
    //         IsAdmin:1
    //     }
    // })
    // .then(result => {
    //     if(result.length > 0 || req.userDetails.isAdmin){
    //         console.log("ok")
    //         return Roomuser.destroy({
    //             where:{
    //                 RoomID:roomId,
    //                 UserId:userToDelete
    //             }
    //         })
    //     }
    // })
    // .then(result => {
    //     console.log(result);
    //     if(result){
    //         socketActions.removeUser(userToDelete,roomId);
    //         res.json({message:"User deleted from room"});
    //     }else{
    //         res.json({message:"something went wrong user didn't removed"});
    //     }
    // })
    // .catch(err => {
    //     console.log(err);
    //     res.json({message:"something went wrong users didn't deleted"});
    // });

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