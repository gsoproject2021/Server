const express = require('express');

const router = express.Router();
const eventController = require('../controllers/event');
const {checkAuth} = require('../middleware/check-auth');

router.use(checkAuth);
router.get('/events',eventController.getEvents);
router.post('/event',eventController.createEvent);
router.delete('/event/',eventController.deleteEvent);
router.put('/event',eventController.updateEvent);



module.exports = router;