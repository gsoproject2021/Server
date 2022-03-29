const express = require('express');
const app = express();
const cors = require('cors');


const userRoutes = require('./routes/user');
const eventRoutes = require('./routes/event');
const roomRoutes = require('./routes/room');

const sequelize = require('./util/dbconfig');


const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader(
//       'Access-Control-Allow-Headers',
//       'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//     );
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  
//     next();
//   });
app.use(cors());
app.use(userRoutes);
app.use(eventRoutes);
app.use(roomRoutes);


sequelize
    .sync()
    .then(result =>{
        app.listen(4000);
        console.log('server is running');
    })
    .catch(err=>{
        console.log(err);
    });

