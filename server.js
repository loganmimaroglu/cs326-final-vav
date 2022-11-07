const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// accept query
app.use(express.urlencoded({ extended: true }));

// use json
app.use(express.json());

app.set('view engine', 'ejs');

const userRouter = require('./routes/users');
const modelRouter = require('./routes/model');

app.use('/users', userRouter);
app.use('/model', modelRouter);

app.listen(port);