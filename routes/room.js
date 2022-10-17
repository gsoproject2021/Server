const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room');

const roomUsersController = require('../controllers/roomUsers');
const eventsController = require('../controllers/event');
const { checkAuth } = require('../middleware/check-auth');
const fileUpload = require('../middleware/rooms-images');
const publicRoomController = require('../controllers/publicroom');
const {check} = require('express-validator');

router.use(checkAuth);

//router.get('/roomDetails/:roomId',eventsController.getEvents,roomUsersController.getRoomDetails);
router.get('/roomUsers',roomUsersController.getAllUsers);
router.get('/roomUser/:userId',roomController.getAllUserData);
router.get('/rooms/',roomController.fetchAllRooms);
router.get('/roomDetails/:roomId',roomController.getRoomData)

router.post('/roomUser/:roomId',roomUsersController.addUsers);
router.delete('/roomUser',roomUsersController.removeUser);
router.put('/roomUser',roomUsersController.setAdminState);

router.post('/roomImage',fileUpload.single('image'),roomController.uploadImage)
router.post('/room',[
            check('roomName').isLength({min:1}).withMessage("Room name can't be empty")
            ],roomController.createRoom);
router.delete('/room/:roomId',roomController.deleteRoom);
router.put('/room',[
    check('roomName').isLength({min:1}).withMessage("Room name can't be empty")
    ],roomController.updateRoom);

router.post('/publicRooms/',publicRoomController.addPublicRoom);
router.patch('/publicRooms/',publicRoomController.updatePublicRoomName);
router.delete('/publicRooms/:roomId',publicRoomController.deletePublicRoom);



module.exports = router;