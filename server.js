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

app.get('/', (req, res) => {
    console.log('request');
    res.render('index');
});

const userRouter = require('./routes/users');
const modelRouter = require('./routes/model');
const loginRouter = require('./routes/login');

app.use('/users', userRouter);
app.use('/model', modelRouter);
app.use('/login', loginRouter);

app.listen(port);