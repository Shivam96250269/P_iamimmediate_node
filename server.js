const express = require('express');
const app = express();
const router = require('./router/userRouter');
const cookieparser = require('cookie-parser')
const cors = require('cors');
const corsOptions = require('./config/corsOption')
const credentials = require('./middleware/credentials')
require('./cronJobs/cronJobs')
//dotenv Config
require('dotenv').config()
const PORT = process.env.PORT

const db = require('./db/dataBase');
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.static(__dirname + '/upload'));

//database
const errorHandler = require('./utills/errorHandle');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser()); 

//Router
app.use('/api', router)
app.use('/api/v1',require('./router/index'))
app.use('/employer', require('./router/empolyeRoutes'))
app.use('/admin', require('./router/adminRoutes'))
app.use("/withoutLogin",require('./router/withoutLogin'))

app.listen(PORT, () => console.log(`Server is running on port http://localhost:${PORT}`));

app.use(errorHandler)