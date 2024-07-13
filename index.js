const express = require('express');
const app = express();
require('dotenv/config');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const serverUtils = require('./server');

const api = process.env.API_URL;
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

// Middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());
app.use(authJwt());

// Routers
const userRouter = require('./routes/user');
const questionRouter = require('./routes/questions');
const categoryRouter = require('./routes/categories');
const test = require('./routes/test');
 

app.use(`${api}/users`, userRouter);
app.use(`${api}/questions`, questionRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/tests`, test);
 // Database connection
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'Emsat',
  })
  .then(() => {
    console.log('Database Connection is ready...');
  })
  .catch((err) => {
    console.log(err);
  });

 const port = process.env.PORT || 3003;
serverUtils.startServer(app, port);

module.exports = app;
