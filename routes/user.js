const express = require('express');

const router = express.Router();
const userController = require('../controllers/user');
router.get('/signup',userController.getUser);
router.put('/signup',userController.updateUser);
router.post('/signup',userController.registerUser);




module.exports = router;