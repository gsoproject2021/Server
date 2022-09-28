const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { checkAuth } = require('../middleware/check-auth');
const fileUpload = require('../middleware/file-upload');
const {check} = require('express-validator')

router.get('/user/:userId',userController.getUser);
router.get('/users',userController.fetchAllUsers);

router.get('')
router.post('/login/',userController.login);
router.post('/signup',userController.signup);

router.use(checkAuth);
router.get('/user/:userId',userController.getUser);
router.get('/users',userController.fetchAllUsers);

router.patch('/user/',userController.updateUser);
router.patch('/changePassword/',
            [check('password')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
            .isLength({min:8,max:16})
            .withMessage("Password must contain a-z,A-Z,0-9 and  length of 8-16 characters"),
            check('confirmPassword').custom((value,{req}) => {
                if(value != req.body.password){
                    throw new Error("Passwords don't match");
                }
                return true;
            })
],userController.changePassword);

router.patch('/changePasswordByAdmin/',
            [check('password')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
            .isLength({min:8,max:16})
            .withMessage("Password must contain a-z,A-Z,0-9 and  length of 8-16 characters"),
            check('confirmPassword').custom((value,{req}) => {
                if(value != req.body.password){
                    throw new Error("Passwords don't match");
                }
                return true;
            })
],userController.changePasswordByAdmin);

router.patch('/blockUser/',userController.blockUser);
router.patch('/updateUserByAdmin/',userController.updateUserByAdmin);
router.post('/user/',fileUpload.single('image'),userController.uploadPicture);
router.delete('/user/:userId',userController.deleteUser);




module.exports = router;