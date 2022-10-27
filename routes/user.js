const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { checkAuth } = require('../middleware/check-auth');
const fileUpload = require('../middleware/file-upload');
const {check} = require('express-validator')

/**
 * user routes
 */

router.get('/user/:userId',userController.getUser);
router.get('/users',userController.fetchAllUsers);

router.post('/forgotPassword/',userController.forgotPassword);
router.post('/resetPassword/:token',userController.resetPassword)

router.post('/contactUs',userController.contactUs);
router.post('/login/',[
            check('email').isEmail().withMessage("The login must be email"),
            ],userController.login);
router.post('/signup',[
    check('email').isEmail().withMessage("email can't be empty"),
    check('firstName').isLength({min:1}).withMessage("first name can't be empty"),
    check('lastName').isLength({min:1}).withMessage("last name can't be empty"),
    check('birthday').isLength({min:10,max:10}),
    check('gender').isLength({min:4,max:6}),
    check('password')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
            .isLength({min:8,max:16})
            .withMessage("Password must contain a-z,A-Z,0-9 and  length of 8-16 characters"),
            check('confirmPassword').custom((value,{req}) => {
                if(value != req.body.password){
                    throw new Error("Passwords don't match");
                }
                return true;
            })
                    ],userController.signup);

router.use(checkAuth);
router.get('/user/:userId',userController.getUser);
router.get('/users',userController.fetchAllUsers);

router.patch('/user/',
            [check('email').isEmail().withMessage("email can't be empty"),
            check('firstName').isLength({min:1}).withMessage("first name can't be empty"),
            check('lastName').isLength({min:1}).withMessage("last name can't be empty"),
            check('birthday').isLength({min:10,max:10})

        ],userController.updateUser);
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
router.post('/logout/',userController.userLogout);



module.exports = router;