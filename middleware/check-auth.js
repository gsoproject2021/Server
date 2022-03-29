const jwt = require('jsonwebtoken');

exports.checkAuth = (req,res,next) => {
    
    try{
        console.log(req.headers.authorization);
        const token = req.headers.authorization.split(' ')[1];
        
        if(!token){
            throw new Error("Authentication failed");
        }
        const decodedToken = jwt.verify(token,'P@$$w0rd');
        req.userDetails = decodedToken.userDetails;
        // console.log("ok");
        // console.log(req.userDetails);
        next();
    } catch (err){
        // const error = new Error("Authentication failed");
        console.log(err);
    }
    
}