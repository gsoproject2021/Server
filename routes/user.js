const express = require('express');
const jsonwebtoken = require('jsonwebtoken');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userController = require('../controllers/user');
const { checkAuth } = require('../middleware/check-auth');
const fileUpload = require('../middleware/file-upload');

router.get('/user/:userId',userController.getUser);
router.get('/users',userController.fetchAllUsers);


router.post('/login/',userController.login);
router.post('/signup',userController.signup);

router.use(checkAuth);
router.get('/user/:userId',userController.getUser);
router.get('/users',userController.fetchAllUsers);
//router.put('/user/',userController.updateUser);
router.post('/user/',fileUpload.single('image'),userController.uploadPicture);
router.delete('/user/:userId',userController.deleteUser);



module.exports = router;