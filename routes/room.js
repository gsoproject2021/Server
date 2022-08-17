const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room');

const roomUsersController = require('../controllers/roomUsers');
const eventsController = require('../controllers/event');
const { checkAuth } = require('../middleware/check-auth');
const fileUpload = require('../middleware/rooms-images');


router.use(checkAuth);

//router.get('/roomDetails/:roomId',eventsController.getEvents,roomUsersController.getRoomDetails);
router.get('/roomUsers',roomUsersController.getAllUsers);
router.get('/roomUser/:userId',roomController.getRooms);
router.get('/rooms',roomController.fetchAllRooms);

router.post('/roomUser/:roomId',roomUsersController.addUsers,roomController.getRoomData);
router.delete('/roomUser',roomUsersController.removeUser);
router.put('/roomUser',roomUsersController.setAdminState);

router.post('/roomImage',fileUpload.single('image'),roomController.uploadImage)
router.post('/room',roomController.createRoom,roomController.createLog,roomUsersController.addUsers);
router.delete('/room/:roomId',roomController.deleteRoom);
router.put('/room',roomController.updateRoom);





module.exports = router;