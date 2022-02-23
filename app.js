const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
dotenv.config();

const errorHandler = require('./middlewares/errorHandlers');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join('images')));

// Routers
app.use('/user', userRoutes);
app.use('/feed', postRoutes);

// Error Handlers
app.use(errorHandler.notFoundHandler);
app.use(errorHandler.commonError);

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => {
    app.listen(process.env.PORT);
    console.log('Database connected!');
  })
  .catch(err => console.log(err.message));
