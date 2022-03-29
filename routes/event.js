const express = require('express');

const router = express.Router();
const eventController = require('../controllers/event');
const {checkAuth} = require('../middleware/check-auth');

router.use(checkAuth);
router.get('/events',eventController.getEvents);
router.post('/event',eventController.createEvent);
router.put('/event',eventController.updateEvent);
router.delete('/event',eventController.deleteEvent);


module.exports = router;