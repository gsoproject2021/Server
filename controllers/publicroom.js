const PublicRoom = require('../models/publicroom');


exports.getPublicRooms = async (req,res) => {
    let publicRooms = []
    try{
        const rooms = await PublicRoom.findAll();
        if(rooms){
            publicRooms = rooms.map(room => {return { roomId:room.RoomID,roomName:RoomName}});
        }
        res.json(publicRooms);
    }catch(err){
        console.log(err);
        res.json({message:"something went wrong can't fetch public rooms"})
    }
}

exports.addPublicRoom = async (req,res) => {
    console.log(req.body)
    if(!req.userDetails.isAdmin){
        return res.json({message: "You can't add public room"})
    }
    try{

        
        const response = await PublicRoom.create({
            RoomName:req.body.roomName
        })
        if(!response){
            return res.json({message:"something went wrong room didn't created"});
        }
        const room ={
            roomId: response.RoomID,
            roomName: response.RoomName
        }
        console.log(room)
        res.json({message:"Room created",room:room});
    }
    catch(err){
        console.log(err);
    }
}

exports.updatePublicRoomName = async (req,res) => {
    console.log(req.userDetails)
    if(!req.userDetails.isAdmin){
        return res.json({message:"you can't change public room name"});
    }
    try{
        const response = await PublicRoom.findByPk(req.body.roomId);
        if(!response){
            return req.json({message:"can't change room name"});
        }
        response.RoomName = req.body.roomName;
        response.save();
        res.json({message:"room updated",room:{roomId:response.RoomID,roomName:response.RoomName}});
    }
    catch(err){
        console.log(err);
    }

}

exports.deletePublicRoom = async (req,res) => {
    
    if(!req.userDetails.isAdmin){
        return res.json({message:"you can't delete public room"});
    }

    try{
        const response = await PublicRoom.findByPk(req.params.roomId);
        if(!response){
           return res.json({message:"something went wrong room didn't deleted"});
        }
        response.destroy();
        res.json({message:"room deleted"});
    }
    catch(err){
        console.log(err);
    }

}