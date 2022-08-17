const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

exports.signup = (req,res)=>{

    bcrypt.hash(req.body.password,10)
    .then(result => {
       return User.create({
            Email:req.body.email,
            FirstName:req.body.firstname,
            LastName:req.body.lastname,
            Password:result,
            Birthday:req.body.birthday,
            Gender:req.body.gender,
            IsAdvertiser:req.body.isAdvertiser,
            IsAdmin:req.body.isAdmin
        });

    })
    .then(result =>{
        let token;
        try{
            token = jwt.sign({userDetails: result},"P@$$w0rd",{expiresIn: '24h'});
        } catch (err){
            res.json({message:"something went wrong"});
        }

        const data = {
          userId:result.UserID,
          firstName: result.FirstName,
          lastName: result.LastName,
          email: result.Email,
          birthday: result.Birthday,
          gender: result.Gender,
          isAdmin: result.IsAdmin,
          isAdvertiser: result.IsAdvertiser,
          isBlocked: result.IsBlocked}
          
        res.status(201).json({data:data,token:token});
    })
    .catch(err => {
        if(err.name==="SequelizeUniqueConstraintError"){
            res.status(422).json({message:"Email already in use"});
        }else{
            res.json({message:"something went wrong"});
        }
    });

};

exports.updateUser = (req,res) => {
    const {firstName,lastName,email,gender,imageType} = req.body;
    
    const userId = req.userDetails.userId;
    
     
    
      console.log(req.body.formData);
    User.findByPk(userId)
    .then(user => {
        
        user.Email = email;
        user.FirstName = firstName;
        user.LastName = lastName;
        user.Gender = gender;
        user.save();
        
        let data = {
          userId:user.UserID,
          firstName: firstName,
          lastName: lastName,
          email: email,
          birthday: user.Birthday,
          gender: gender,
          isAdmin: user.IsAdmin,
          isAdvertiser: user.IsAdvertiser,
          isBlocked: user.IsBlocked,
          // image:req.file.path || ''
        };
        
        res.json(data);
    })
    .catch((err) => {
      if(err.name==="SequelizeUniqueConstraintError"){
        res.status(422).json({message:"Email already in use"});
      }else{
        res.json({message:"something went wrong"});
      }
    });
}

exports.uploadPicture = (req,res) => {

  User.findByPk(req.userDetails.userId)
  .then(user => {
    user.ImageUrl = req.file.path ? req.file.path : '';
    user.save();
    
    let data = {
      userId:user.UserID,
      firstName: user.FirstName,
      lastName: user.LastName,
      email: user.Email,
      birthday: user.Birthday,
      gender: user.Gender,
      isAdmin: user.IsAdmin,
      isAdvertiser: user.IsAdvertiser,
      isBlocked: user.IsBlocked,
      image:req.file.path ? req.file.path : ''
    };
    
    res.json(data);
  })
  .catch(err => {
    console.log(err)
  })

}

// exports.updateUser = (req, res) => {
    
//     const { email,firstName,lastName,birthday,password,gender,isAdmin,isBlocked } = req.body;
//     const userId = req.params.userId;
    
//     let hashedPassword;
//     bcrypt.hash(password,10)
//     .then(result => {
//        return hashedPassword = result;
//     })
//     .then(result => {
//         return User.findByPk(userId)
//     })
//     .then(user => {
//         console.log(user);
//         user.Email = email ;
//         user.FirstName = firstName;
//         user.LastName = lastName;
//         user.Birthday = birthday;
//         user.Password = password || hashedPassword;
//         user.Gender = gender;
//         user.IsAdmin = isAdmin || user.IsAdmin;
//         user.IsBlocked = isBlocked || user.IsBlocked;
//         user.save();
//         res.status(200).json(user);
//     })
//     User.findByPk(userId)
//       .then(user => {
//           console.log(user);
//         user.Email = email ;
//         user.FirstName = firstName;
//         user.LastName = lastName;
//         user.Birthday = birthday;
//         user.Password = password;
//         user.Gender = gender;
//         user.IsAdmin = isAdmin || user.IsAdmin;
//         user.IsBlocked = isBlocked || user.IsBlocked;
//         user.save();
//         res.status(201).json(user);
    
//       })
//       .catch((err) => {
//         if(err.name==="SequelizeUniqueConstraintError"){
//             res.status(422).json({message:"Email already in use"});
//         }else{
//             res.json({message:"something went wrong"});
//         }
//       });
// };


exports.deleteUser = (req, res) => {
    const userId = req.params.userId;
    User.findByPk(userId)
      .then((user) => {
        user.destroy();
        res.status(200).json({message:"User deleted"});
      })
      .catch((err) => {
        res.json({message:"something went wrong"});
      });
  };



exports.login = (req, res, next) => {
  
    const { email, password } = req.body;
    let data;
        User.findOne({
            where: {
                Email: email,
            },
        })
        .then((result) => {
            
            data = {
                userId:result.UserID,
                firstName: result.FirstName,
                lastName: result.LastName,
                email: result.Email,
                birthday: result.Birthday,
                gender: result.Gender,
                isAdmin: result.IsAdmin,
                isAdvertiser: result.IsAdvertiser,
                isBlocked: result.IsBlocked,
                image:result.ImageUrl
        };
            return result;
        })
        .then((result) => {
          
          return bcrypt.compare(password, result.Password);
               
        })
        .then((result) => {
          
        if (result) {

            let token;
            try{
                token = jwt.sign({userDetails: data},"P@$$w0rd",{expiresIn: '24h'});
            } catch (err){
                res.json({message:"something went wrong"});
            }
            res.status(200).json({data:data,token:token});
        } else {
            res.json("wrong password");
        }
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getUser = (req, res) => {
  console.log(req.params.userId);
  User.findByPk(req.params.userId)
    .then((result) => {
      let data = {
        userId: result.UserID,
        email: result.Email,
        firstName: result.FirstName,
        lastName: result.LastName,
        birthday: result.Birthday,
        isAdvertiser: result.IsAdvertiser,
        isAdmin: result.IsAdmin,
        isBlocked: result.IsBlocked,
        gender: result.Gender,
      };
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
};




exports.fetchAllUsers = (req, res) => {
  User.findAll({})
    .then((result) => {
      const data = result.map((user) => {
        return {
          userId: user.UserID,
          firstName: user.FirstName,
        };
      });
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addPicture = (req,res) => {

}