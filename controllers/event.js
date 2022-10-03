const { validationResult } = require("express-validator");
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
exports.createEvent = async (req,res) => {
    
    const errors = validationResult(req);
    let newDate = req.body.date.split('T');
    if(!errors.isEmpty()){
        let [data] =(errors.errors)
        return res.send(data.msg);
    }
    try{
        const roomUser = await Roomuser.findOne({
            where: {RoomID:req.body.roomId,
                    UserID:req.userDetails.userId}
        })
        
        if(!roomUser || !roomUser.IsAdmin){
            return res.send("Something went wrong can't create an event")
        }
        
       
        
        const newEvent = await Event.create({
            Subject: req.body.subject,
                    EventHour: newDate[1],
                    EventDate: newDate[0],
                    Description: req.body.description,
                    RoomID: req.body.roomId
        });
        
        if(!newEvent){
            return res.send("Something went wrong can't create event ");
        }

        let event = { eventId:newEvent.EventID,
                        subject:newEvent.Subject,
                        date:newEvent.EventDate,
                        hour:newEvent.EventHour,
                        description:newEvent.Description,
                        roomId:req.body.roomId,
                        userId:req.userDetails.userId};
        
        socketActions.addEvent(event);
        res.json(event);
    }
    catch(err){
        res.send("Something went wrong event didn't created")
    }

}

/**
 * update events details
 */
exports.updateEvent = async (req,res)=>{
    const {userId} = req.userDetails;

    const errors = validationResult(req);
    let newDate = req.body.date.split('T');
    if(!errors.isEmpty()){
        let [data] =(errors.errors)
        return res.send(data.msg);
    }

    try{
        const roomUser = await Roomuser.findOne({
            where:{
                RoomID:req.body.roomId,
                UserID:userId
            }
        })
        
        if(!roomUser || !roomUser.IsAdmin){
           return res.send("Unauthorized action you can't change event details");
        }
        
        const event = await Event.findByPk(req.body.eventId);
        
        if(!event){
            res.send("Something went wrong can't update event");
        }
        
        event.Subject = req.body.subject;
        event.EventHour = newDate[1];
        event.EventDate = newDate[0];
        event.Description = req.body.description;
        event.save();

        
        let updatedEvent = {eventId:event.EventID,
            subject:event.Subject,
            date:event.EventDate,
            hour:event.EventHour,
            description:event.Description,
            roomId:req.body.roomId
        };
        console.log(updatedEvent);
            socketActions.updateEvent(updatedEvent);
            res.json(updatedEvent)
    }
    catch(err){
        res.send("Something went wrong event didn't updated try later")
    }
    
}
/**
 * delete event from events table
 */
exports.deleteEvent = async (req,res) =>{
    
    try{
        const roomUser = await Roomuser.findOne({
            where:{
                RoomID:req.body.roomId,
                UserID:req.userDetails.userId
            }
        })
        if(!roomUser || !roomUser.IsAdmin){
            return res.send("Unauthorized action can't delete event")
        }
        const event = await Event.findByPk(req.body.eventId);
        
        if(!event){
            return res.send("Something went wrong can't delete event, event didn't found");
        }
        event.destroy();
        socketActions.deleteEvent(req.body.eventId,req.body.roomId);
        res.send("Event deleted")

    }
    catch(err){
        console.log(err);
        res.send("Something went wrong can't delete event")
    }

    // const {roomId} = req.body;
    // const {eventId,roomId} = req.body;
    // const {userId} = req.userDetails;
    // console.log(roomId,eventId,userId);
    // Roomuser.findAll({
    //     where:{
    //         RoomID:roomId,
    //         UserId:userId,
    //         IsAdmin:1
    //     }
    // })
    // .then(result => {
    //     if(result.length > 0){
    //         return Event.destroy({
    //             where:{
    //                 EventID:eventId
    //             }
    //         })
    //     }
    // })
    // .then(result => {
    //     if(result){
    //         socketActions.deleteEvent(eventId,roomId);
    //         res.status(200).json({message:"Event Deleted"})
    //     }
        
    // })
    // .catch(err=>{
    //     console.log(err);
    //     res.json({message:"somthing went wrong event didn't deleted"});
    // })
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