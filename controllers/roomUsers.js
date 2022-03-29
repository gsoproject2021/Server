const {Op,QueryTypes} = require('sequelize');
const Roomuser = require('../models/roomuser');
const User = require('../models/user');
const sequelize = require('../util/dbconfig');

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
            return sequelize.query(`select roomusers.IsAdmin,roomusers.UserID, users.Username from roomusers 
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
    
    const roomId = req.params.roomId || req.body.roomId;
    const userId = req.userDetails.userId;
    const users = req.body.users;
    const room = req.body.room;
    console.log(users);
    Roomuser.findAll({
        where:{
            RoomID:roomId ,
            UserID:userId
        }
    })
    .then(result => {
        
        if( !result.length ){
            
            return Roomuser.create({RoomID:roomId,UserID:userId});
        }
        else{
            if(result.IsAdmin || req.userDetails.isAdmin){
                
            return Roomuser.bulkCreate(users);
            }
        }
        
    })
    .then(result => {
        console.log(result);
        if(!result){
            res.json({message:"something went wrong users didn't added to room"});
        }
        return sequelize.query(`select roomusers.IsAdmin,roomusers.UserID, users.FirstName, users.LastName from roomusers 
        join users on roomusers.UserID = users.UserID
        where RoomID = ?`,{
        replacements:[`${roomId}`],
        type: QueryTypes.SELECT});
    })
    .then(result => {
        req.body.roomUsers = result;
        if(req.body.roomCreated === 'created'){
            next();
        }
        else{
            res.status(201).json(result);
        }
        
        
    })
    .catch(err=>{
        console.log(err);
        res.json({message:"something went wrong users didn't added to room"});
    });
};

/**
 * remove user from room by removing user from room users table
 */

exports.removeUser = (req,res)=>{

    const roomId = req.body.roomId;
    const userToDelete = req.body.userId
    const userThatDelete = req.userDetails.userId;
    
    Roomuser.findAll({
        where: {
            UserID: userToDelete,
            RoomID: roomId
        }
    })
    .then(result => {
        
        if(result.IsAdmin || req.userDetails.isAdmin){
            return Roomuser.destroy({
                where:{
                    RoomID:roomId,
                    UserId:userToDelete
                }
            })
        }
    })
    .then(result => {
        res.json({message:"User deleted from room"});
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
        const data = result.map(user => {return {userId:user.UserID,firstName:user.FirstName}})
        res.status(200).json(data);
    })
    .catch(err => {
        console.log(err);
    })
}

