const jwt = require('jsonwebtoken');
require("dotenv").config

//token decrypting
exports.checkAuth = (req,res,next) => {
    if (req.method === 'OPTIONS') {
        return next();
      }
    try{
        const token = req.headers.authorization.split(' ')[1];
        
        if(!token){
            throw new Error("Authentication failed");
        }
        const decodedToken = jwt.verify(token,`${process.env.JWD_PASSWORD}`);
        
        
        req.userDetails = decodedToken.userDetails;
        next();
    } catch (err){
        return next(err)
    }
    
}