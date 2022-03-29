const Joi = require("joi");


/**user data validation */
exports.validUser = (userData)=>{
    const userSchema = Joi.object({
        username: Joi.string().alphanum().min(5).max(30).required(),
        email: Joi.string().email().required(),
        firstname: Joi.string(),
        lastname: Joi.string(),
        password: Joi.string().pattern(/^[a-zA-Z0-9]{6,30}/).required(),
        confirmPassword: Joi.ref('password').required(),
        gender: Joi.boolean().required(),
        isAdvertiser: Joi.boolean().required()
    });
    return userSchema.validate(userData);
}
/**room data validation */
exports.validRoom = (roomData)=>{
    const roomSchema = Joi.object({
        userID: Joi.number(),
        roomName: Joi.string().alphanum().min(1).max(30).required()
    });
    return roomSchema.validate(roomData);
}
    


/**event data validation */
const eventSchema = Joi.object({

})

