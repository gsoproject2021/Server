const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.signup = async (req,res)=>{
    let data;
    const errors = validationResult(req);
    console.log(errors);
    if(!errors.isEmpty()){
     return res.send("can't sign up check your inputs");
    }
    try{
      const hashedPassword = await bcrypt.hash(req.body.password,10);
      if(!hashedPassword){
        res.json("something went wrong can't sign-up try again");
      }

      const user = await User.create({
            Email:req.body.email,
            FirstName:req.body.firstName,
            LastName:req.body.lastName,
            Password:hashedPassword,
            Birthday:req.body.birthday,
            Gender:req.body.gender,
            IsAdvertiser:req.body.isAdvertiser,
            IsAdmin:req.body.isAdmin,
            Address:req.body.address,
            Phone:req.body.phone
      });
      console.log(user)
      if(!user){
        res.json("something went wrong can't sign-up try again");
      }

      data = {
        userId:user.UserID,
        firstName: user.FirstName,
        lastName: user.LastName,
        email: user.Email,
        birthday: user.Birthday,
        gender: user.Gender,
        isAdmin: user.IsAdmin,
        isAdvertiser: user.IsAdvertiser,
        isBlocked: user.IsBlocked,
        image: user.ImageUrl
      };

      let token;

      try{
        token = jwt.sign({userDetails: data},"P@$$w0rd",{expiresIn: '24h'});
      } catch (err){
        res.send("something went wrong can't sign-up");
      }

      let expiresIn = new Date().getTime() + 24*60*60*1000;
      let userData = {
        data:data,
        token:token,
        expireIn:expiresIn
      }
    res.json(userData);

    }
    catch(err){
      let [data] = err.errors
      if(data.message === 'users.Email_UNIQUE must be unique'){
        return res.send("Email already in use try another email");
      }
    }
    
};

exports.updateUser = async (req,res) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
      let {error} = errors;
      res.send(error.msg);
    }
    let {firstName,lastName,email,birthday} = req.body;
    
    try{
      const response = await User.findByPk(req.userDetails.userId);
      if(!response){
        throw new Error("something went wrong can't update user");
      }

      response.Email = email;
      response.FirstName = firstName;
      response.LastName = lastName;
      response.Birthday = birthday;
      response.save();
      let data = {
        userId:response.UserID,
        firstName: response.FirstName,
        lastName: response.LastName,
        email: response.Email,
        birthday: response.Birthday,
        gender: response.Gender,
        isAdmin: response.IsAdmin,
        image: response.ImageUrl,
        isAdvertiser: response.IsAdvertiser,
        isBlocked: response.IsBlocked,
      }
      try{
        token = jwt.sign({userDetails: data},"P@$$w0rd",{expiresIn: '24h'})
      }
      catch(err){
        res.send({message:"something went wrong cant update user"})
      }
      res.json({data,token});
    }
    catch(err){
      if(err.name==="SequelizeUniqueConstraintError"){
        res.status(422).json({message:"Email already in use"});
      }
      res.json({message:"something went wrong can't update details"});
    }   
};

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

};

exports.deleteUser = async (req, res) => {
    console.log(req.userDetails.userId,req.params.userId);
    if(req.userDetails.isAdmin || req.params.userId === req.userDetails.userId){
      try{

        const response = await User.findByPk(req.params.userId);
        console.log(response)
        if(!response){
          throw new Error("something went wrong user didn't deleted");
        }
        response.destroy();

        res.json({message: "User deleted"});
      }
      catch(err){
        res.json({message:err})
      }
    }
    else{
      res.json({message:"unauthorized action user didn't deleted"});
    }
};

exports.login = async (req, res, next) => {
  
    const { email,password } = req.body;
    let data;
    try{
      const user = await User.findOne({where: {Email: email}});
      if(!user){
        return res.send("email doesn't exist check your email");
      }
            data = {
                userId:user.UserID,
                firstName: user.FirstName,
                lastName: user.LastName,
                email: user.Email,
                birthday: user.Birthday,
                gender: user.Gender,
                isAdmin: user.IsAdmin,
                isAdvertiser: user.IsAdvertiser,
                isBlocked: user.IsBlocked,
                image: user.ImageUrl
        };
      let isValid = await bcrypt.compare(password,user.Password);

      if(isValid){

        let token;
        try{
            token = jwt.sign({userDetails: data},"P@$$w0rd",{expiresIn: '1h'});
        } catch (err){
            res.send("something went wrong can't login");
        }
        let expiresIn = new Date().getTime() + 1*60*60*1000;
        let user = {
          data:data,
          token:token,
          expireIn:expiresIn
        }
        console.log(user)
        res.status(200).json(user);
      }else
      {
        res.send("Wrong password try again");
      }

    }
    catch(err){
      console.log(err);
    }
    
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
        address: result.Address,
        isAdvertiser: result.IsAdvertiser,
        isAdmin: result.IsAdmin,
        isBlocked: result.IsBlocked,
        gender: result.Gender,
        image: result.ImageUrl
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

};

exports.updateUserByAdmin = async (req,res) => {
  
  if(req.userDetails.isAdmin){
    
    try{
        const response = await User.findByPk(req.body.data.userId);
        if(!response){
          throw new Error ("something went wrong cant update user");
        }
        
        response.FirstName = req.body.data.firstName;
        response.LastName = req.body.data.lastName;
        response.Email = req.body.data.email;
        response.Gender = req.body.data.gender;
        response.Phone = req.body.data.phone;
        response.Birthday = req.body.data.birthday;
        response.Address = req.body.data.address;
        response.IsAdmin = req.body.data.isAdmin;
        response.IsAdvertiser = req.body.data.isAdvertiser;
        let data = {
          userId: response.UserID,
          address: response.Address,
          phone: response.Phone,
          email: response.Email,
          firstName: response.FirstName,
          lastName: response.LastName,
          birthday: response.Birthday,
          isAdvertiser: response.IsAdvertiser,
          isAdmin: response.IsAdmin,
          isBlocked: response.IsBlocked,
          gender: response.Gender,
        };
        response.save();
        res.json({message: "User updated",data});
      }
    catch(err){
      res.json({message: "something went wrong can't update user"});
    }
  }
  else{
    res.json({message:"you don't have permission to do this actions"})
  }
};

exports.changePasswordByAdmin = async (req,res) => {
  const errors = validationResult(req);
  console.log(req.body)
  if(!errors.isEmpty()){
   res.json({message: "Invalid inputs try again"})
  }

  if(!req.userDetails.isAdmin){
    res.json({message:"unauthprized actions "});
  }
  try{

    const password = await bcrypt.hash(req.body.password,10);

    if(!password){
      res.json({message:"Something went wrong cant change password"});
    }

    const user = await User.findByPk(req.body.userId);
    
    if(!user){
      throw new Error("User not found");
    }

    user.Password = password;
    user.save();
    console.log(user)
    res.json({message:"password changed"})

  }
  catch(err){
    console.log(err);
    res.json({message:"something went wrong can't change password"});
  }
}

exports.changePassword = async (req,res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
   res.json({message: "Invalid inputs try again"})
  }

  try{

    const password = await bcrypt.hash(req.body.password,10);

    if(!password){
      res.json({message:"Something went wrong cant change password"});
    }

    const user = await User.findByPk(req.userDetails.userId);
    
    if(!user){
      throw new Error("User not found");
    }

    user.Password = password;
    user.save();

    res.json({message:"password changed"})

  }
  catch(err){
    console.log(err);
    res.json({message:"something went wrong can't change password"});
  }


}

exports.blockUser = async (req,res) => {

  if(!req.userDetails.isAdmin){
    return res.json({message:"unauthorized action"});
  }
  try{
    const response = await User.findByPk(req.body.userId);
    
    if(!response){
      return res.json({message:"something went wrong user didin't blocked"});
    }

    response.IsBlocked = req.body.isBlocked;
    response.save();
    let data = {
      userId: response.UserID,
      email: response.Email,
      firstName: response.FirstName,
      lastName: response.LastName,
      birthday: response.Birthday,
      address: response.Address,
      isAdvertiser: response.IsAdvertiser,
      isAdmin: response.IsAdmin,
      isBlocked: response.IsBlocked,
      gender: response.Gender,
      image: response.ImageUrl
    };
    res.json({message:"User blocked",data});

  }catch(err){
    console.log(err);
  }
}