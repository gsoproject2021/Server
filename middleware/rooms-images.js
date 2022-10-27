const multer = require('multer');
const { v1: uuidv1 } = require('uuid');
const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',    
};
// upload picture for room
const fileUpload = multer({
    limits: 50500000,
    storage: multer.diskStorage({
        destination: (req,file,cb) => {
            cb(null, `images/rooms`);
        },
        filename: (req,file,cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype];
            cb(null, uuidv1() + '.' + ext);
        }
    }),
    fileFilter: (req,file,cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        let error = isValid ? null : new Error("Invalid mimtype!");
        cb(error,isValid);
    }
});

module.exports = fileUpload;