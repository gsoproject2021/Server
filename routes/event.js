const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event');
const {checkAuth} = require('../middleware/check-auth');
const { check } = require('express-validator');

/**
 * event route 
 */

router.use(checkAuth);
router.post('/event/',[
                    check('subject').isLength({min:1}).withMessage("Subject can't be empty"),
                    check('date').isLength({min:8}).withMessage("Date can't be empty"),
                    check('description').isLength({min:1}).withMessage("description can't be empty")
                    ],eventController.createEvent);
router.delete('/event/',eventController.deleteEvent);
router.patch('/event/',[
            check('subject').isLength({min:1}).withMessage("Subject can't be empty"),
            check('date').isLength({min:8}).withMessage("Date can't be empty"),
            check('description').isLength({min:1}).withMessage("Description can't be empty")
    ],eventController.updateEvent);



module.exports = router;