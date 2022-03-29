const express = require('express');
const jsonwebtoken = require('jsonwebtoken');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userController = require('../controllers/user');
const { checkAuth } = require('../middleware/check-auth');


router.get('/user/:userId',userController.getUser);
router.get('/users',userController.fetchAllUsers);


router.post('/login/',userController.login);
router.post('/signup',userController.signup);

router.use(checkAuth);

//router.put('/user/:userId',userController.updateUser);

router.delete('/user/:userId',userController.deleteUser);



module.exports = router;