const Event = require("../models/event");
const Roomuser = require("../models/roomuser");
const socketActions = require('../util/helper');




exports.getEvents = (req,res,next)=>{
    
    Event.findAll({where:{RoomID:req.params.roomId}})
    .then(results=>{
        
        let events = results.map(event=>{
            return{eventId:event.EventID,subject:event.Subject,date:event.EventDate+' '+event.EventHour,description:event.Description}
        })
        req.body.events = events;
        next();
    })
    .catch(err=>{
        console.log(err); 
    })
}

/**
 * add event in events table
 */
exports.createEvent = (req,res)=>{
    const {event,roomId} = req.body;
    const {userId} = req.userDetails;
    
    let date = event.eventDate.split('T');
    console.log(date,roomId,userId);
    Roomuser.findAll({
        where:{
            RoomID:roomId,
            UserId:userId,
            IsAdmin:1
        }
    })
    .then(result => {
        
        if (result.length > 0){
            console.log("okok")
            return Event.create({
                Subject: event.eventSubject,
                EventHour: date[1],
                EventDate: date[0],
                Description: event.eventDescription,
                RoomID: roomId});
        }
        else{
            res.json({message:"user not allowed to create event"});
            
        }
    })
    .then(result =>{
        console.log("test",result);
        const event = {eventId:result.EventID,subject:result.Subject,date:result.EventDate,hour:result.EventHour,description:result.Description,roomId:roomId,userId:req.userDetails.userId};
        
        socketActions.addEvent(event);
        console.log('event');
        res.status(201).json(event);
    }).catch(err =>{
        console.log(err);
        res.json({message:"something went wrong event didn't created"});
    });
}
/**
 * update events details
 */
exports.updateEvent = (req,res)=>{
    const {event,roomId} = req.body;
    const {userId} = req.userDetails;
    console.log(event);
    let date = event.eventDate.split('T');
    
    Roomuser.findAll({
        where:{
            RoomID:roomId,
            UserID:userId,
            IsAdmin:1
        }
    })
    .then(result => {
        if(result.length>0){
            return Event.findByPk(event.eventId);
        }
    })
    .then(result => {
        console.log(event);
        result.Subject = event.eventSubject;
        result.EventHour = date[1];
        result.EventDate = date[0];
        result.Description = event.eventDescription;
        result.save();
        let updatedEvent = {eventId:result.EventID,subject:result.Subject,date:result.EventDate,hour:result.EventHour,description:result.Description,roomId:roomId};
        socketActions.updateEvent(updatedEvent);
        res.status(200).json(updatedEvent);
    }).catch(err =>{
        console.log(err);
        res.json({message:"something went wrong event didn't updated"});
    });
}
/**
 * delete event from events table
 */
exports.deleteEvent = (req,res) =>{
    // const {roomId} = req.body;
    const {eventId,roomId} = req.body;
    const {userId} = req.userDetails;
    console.log(roomId,eventId,userId);
    Roomuser.findAll({
        where:{
            RoomID:roomId,
            UserId:userId,
            IsAdmin:1
        }
    })
    .then(result => {
        if(result.length > 0){
            return Event.destroy({
                where:{
                    EventID:eventId
                }
            })
        }
    })
    .then(result => {
        if(result){
            socketActions.deleteEvent(eventId,roomId);
            res.status(200).json({message:"Event Deleted"})
        }
        
    })
    .catch(err=>{
        console.log(err);
        res.json({message:"somthing went wrong event didn't deleted"});
    })
}

/**
 * delete all events of some room 
 */
// exports.deleteAllEvents = (req,res,next)=>{
//     Event.destroy({
//         where:{RoomID:req.body.roomId}
//     })
//     .then(result=>{
//         console.log(result);
//         next();
//     })
//     .catch(err=>{
//         console.log(err);
//     })
// }