
const User = require('../models/user');
const Eventjoin = require('../models/eventjoin');
const Requestroom = require('../models/requestroom');
const Roomuser = require('../models/roomuser');
const Roommanager = require('../models/roommanager');



exports.registerUser = (req,res)=>{

    User.create({
        UserName:req.body.username,
    
        Email:req.body.email,
        FirstName:req.body.firstname,
        LastName:req.body.lastname,
        Password:req.body.password,
        BirthDay:req.body.birthday,
        PhoneNumber:req.body.phone,
        Gender:req.body.gender,
        IsAdvertiser:req.body.IsAdvertiser
    }).then(result => {
        console.log(req.body.username);
        console.log(result);
    }).catch(err =>{
        console.log(err);
    });
    res.send("user created");
}

exports.getUser = (req,res)=>{
    User.findByPk(req.body.id).then(result=>{
        console.log(result);
        res.send(result);
    }).catch(err=>{
        console.log(err);
    });
}

exports.updateUser = (req,res)=>{
    User.findByPk(req.body.id).then(user =>{
        user.UserName = req.body.username;
        user.Email = req.body.email;
        user.FirstName = req.body.firstname;
        user.LastName = req.body.lastname;
        user.BirthDay = req.body.birthday;
        user.Password = req.body.password;
        user.PhoneNumber = req.body.PhoneNumber;
        //user.IsAdvertiser = req.body.IsAdvertiser;
        user.save();
        res.send(user);
        console.log(user);

    }
    ).catch(err => console.log(err));
    
}
// exports.deleteUser = (req,res) => {
//     const userid = req.body.id;
//     Eventjoin.destroy({where :{UserID:userid}}).then( result=>{
//         console.log(result);
//     }).catch(err=>{
//         console.log(err);
//     });
//     Requestroom.destroy({where :{UserID:userid}}).then( result=>{
//         console.log(result);
//     }).catch(err=>{
//         console.log(err);
//     });
//     Roomuser.destroy({where :{UserID:userid}}).then( result=>{
//         console.log(result);
//     }).catch(err=>{
//         console.log(err);
//     });
//     Roommanager.destroy({where :{UserID:userid}}).then( result=>{
//         console.log(result);
//     }).catch(err=>{
//         console.log(err);
//     });
//     User.findByPk(userid).then(user=>{
//         user.destroy();
//     }).catch(err=>{
//         console.log(err);
//     });

// }