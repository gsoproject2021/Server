const Event = require("../models/event");
const Roomuser = require("../models/roomuser");





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
    
    let date = req.body.event.eventDate.split('T');

    Roomuser.findAll({
        where:{
            RoomID:roomId,
            UserId:userId
        }
    })
    .then(result => {
        console.log(result.IsAdmin);
        if (result.IsAdmin){
            return Event.create({
                Subject: event.eventSubject,
                EventHour: date[1],
                EventDate: date[0],
                Description: event.eventDescription,
                RoomID: roomId})
        }
        else{
            res.json({message:"user not allowed to create event"});
        }
    })
    .then(result =>{
        console.log(result);
        const event = {eventId:result.EventID,subject:result.Subject,date:result.EventDate,hour:result.EventHour,description:result.Description};
        console.log(event);
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
    const {subject,description,roomId,eventId} = req.body;
    const {userId} = req.userDetails;
    let date = req.body.eventDate.split('T');
    
    Roomuser.findAll({
        where:{
            RoomID:roomId,
            UserID:userId
        }
    })
    .then(result => {
        if(result.IsAdmin){
            return Event.findByPk(req.body.eventId).then(event =>{
                event.Subject = subject;
                event.EventHour = date[1];
                event.EventDate = date[0];
                event.Description = description;
                event.save();})
        }
    })
    .then(event => {
        console.log(event);
        let updatedEvent = {eventId:event.EventID,subject:event.Subject,date:event.EventDate+' '+event.EventHour,description:event.Description}
        res.status(200).json(updatedEvent);
    }).catch(err =>{
        console.log(err);
        req.json({message:"something wentwrong event didn't updated"});
    });
}
/**
 * delete event from events table
 */
exports.deleteEvent = (req,res) =>{
    const {roomId,eventId} = req.body;
    const {userId} = req.userDetails;

    Roomuser.findAll({
        where:{
            RoomID:roomId,
            UserId:userId
        }
    })
    .then(result => {
        if(result.IsAdmin){
            return Event.destroy({
                where:{
                    EventID:eventId
                }
            })
        }
    })
    .then(result => {
        res.status(200).json({message:"Event Deleted"})
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