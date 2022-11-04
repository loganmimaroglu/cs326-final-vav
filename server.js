const express = require('express');
const app = express();
const path = require('path');

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const userRouter = require('./routes/users');

app.use('/users', userRouter);

app.listen(3000);