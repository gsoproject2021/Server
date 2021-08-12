const express = require('express');
const app = express();


const userRoutes = require('./routes/user');
// const eventRoutes = require('./routes/event');
// const roomRoutes = require('./routes/room');

// const db = require('./util/dbconfig');


const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));

app.use(userRoutes);
// app.use(eventRoutes);
// app.use(roomRoutes);



app.listen(3000,console.log("server running"));