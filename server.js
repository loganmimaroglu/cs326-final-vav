// Express & sessions.
const express = require('express');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

// Express, database & auth constants.
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const production = 'https://haybale.herokuapp.com/';
const development = 'http://localhost:3000/';
const url = (process.env.NODE_ENV ? production : development);
const crop = require('./crop.js');
const database = require('./database.js');
const bcrypt = require('bcrypt');
const passport = require('passport');

// Initialize passport using config file.
const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => database.getUsers().find(user => user.emailAddress === email),
    id => database.getUsers().find(user => user.id === id)
);

// Get session code from correct location.
let secrets;
let sec;
if (!process.env.SESSION_SECRET) {
    secrets = require('./secrets.json');
    sec = secrets.SESSION_SECRET;
} else {
    sec = process.env.SESSION_SECRET;
}

// Initialize sessions & passport.
app.use(flash());
app.use(session({
    secret: sec,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// Serve static files.
app.use(express.static(path.join(__dirname, 'public')));

// Accept query.
app.use(express.urlencoded({ extended: false }));

// Use json.
app.use(express.json());

// Set view enigne.
app.set('view engine', 'ejs');

// GET route for creating a new user.
app.get('/users/new', checkNotAuthenticated, (req, res) => {
    console.log('get route for /users/new');
    res.render('users/new');
});

// GET route for /users/id (user dashboard pages).
app.get('/users/dashboard', checkAuthenticated, (req, res) => {

    console.log('get route for /users/dashboard');

    // Retrieve user's crops from the database.
    console.log(req.session.userID);
    let renderCrops = database.getCrops(req.session.userID);
    let page = '';

    let renderCrops2 = NaN;
    if (req.query.crop !== undefined) {
        renderCrops2 = renderCrops.filter((e) =>  e.type === req.query.crop);
    }

    console.log(renderCrops2);

    // Set page variable.
    if (req.query.crop === undefined) {
        page = 'dashboard';
    } else {
        page = renderCrops2[0].type;
    }

    console.log('rendering dashboard');
    console.log(page);

    console.log(renderCrops);

    console.log(req.session.user.crops);

    // Render the user's dashboard with correct information.
    res.render('users/dashboard', { 'user': req.session.user, 'id': req.session.userID, 'renderCrops': renderCrops, 'page': page});

    console.log('done rendering');
});

// POST route for /users/dashboard (adding new crops to user dashboards).
app.post('/users/dashboard', checkAuthenticated, async (req, res) => {

    console.log('post route for /users/dashboard');

    // Create the new crop & add it to database.
    const newCrop = { type: req.body.plantType, plantDate: req.body.plantDate };
    await database.addCrop(req.user.id, newCrop);

    req.session.user.crops = req.user.crops;

    // Redirect to user's dashboard page.
    res.redirect('/users/dashboard');
});

// DELETE route for /users/id (removing crops from user dashboards).
app.delete('/users/dashboard', checkAuthenticated, async (req, res) => {

    console.log('delete route for /users/dashboard');

    // Delete the drop from the database.
    await database.deleteCrop(req.session.userID, req.query.crop);

    // Delete the crop from the user object stored in session.
    req.session.user.crops = req.user.crops;

    // Redirect to user's dasboard page.
    res.redirect(303, '/users/dashboard');
});

// POST route for creating a new user.
app.post('/users', checkNotAuthenticated, async (req, res) => {

    console.log('post route for /users');

    try {
        const salt = await bcrypt.genSalt();
        const hashedPass = await bcrypt.hash(req.body.password, salt);
        const user = { emailAddress: req.body.emailAddress, password: hashedPass };
        const id =  await database.addUser(user);

        if (id >= 0) {
            res.redirect('/');
        } else {
            console.log('error creating new user');
            res.render('users/new', { emailAddress: req.body.emailAddress, warning: 'Account with email already exists' });
        }
    } catch {
        res.status(500).send()
    }
});

// GET route for root route (login page).
app.get('/', checkNotAuthenticated, (req, res) => {

    console.log('get route for /');

    res.render('index');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', { failureRedirect: '/', failureFlash: true }), (req, res) => {

    console.log('post route for /login');

    let user = database.auth({ emailAddress: req.body.emailAddress, password: req.body.password });

    let index = user.id;

    // Retrieve user's crops from the database.
    let renderCrops = database.getCrops(user.id);
    let page = '';
    if (req.query.crop !== undefined) {
        renderCrops = renderCrops.filter((e) =>  e.type === req.query.crop);
    }

    // Set page variable.
    if (req.query.crop === undefined) {
        page = 'dashboard';
    } else {
        page = renderCrops[0].type;
    }

    req.session.user = req.user;
    req.session.userID = user.id;
    req.session.crops = renderCrops;
    req.session.page = page;

    console.log(req.session.userID);
    res.redirect('users/dashboard');
});

app.post('/users/dashboard/logout', (req, res, next) => {

    console.log('post route for /users/dashboard/logout');

    req.session.user = null;
    req.session.userID = null;
    req.session.crops = null;
    req.session.page = null;

    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

app.get('/users/dashboard/add-plant', checkAuthenticated, (req, res) => {

    console.log('get route for /users/dashboard/add-plant');

    let renderCrops = database.getCrops(req.session.userID);

    res.render('users/add-plant', { 'user': req.user, 'id': req.params.id, 'renderCrops': renderCrops });
});

app.param('id', (req, res, next, id) => {
    req.user = database.getUser(id);
    req.id = id;
    next();
});

app.post('/model', async (req, res) => {
    const colors = ['#00FFFF', '#00FF00', '#FF00FF', '#FFFF00', '#FF0000'];

    // confirm we are recieving a json object
    if (req.header('Content-Type') !== 'application/json') {
        res.status(500).send('NOT JSON OBJ');
        return;
    }

    const userID = Number.parseInt(req.body.userID);
    const crops = req.body.crops;

    console.log(userID);
    console.log(crops);

    // now we need to get the crops from the user database api
    let cropArr = await database.getCrops(userID);

    // filter down the crops we actually need to display data for
    cropArr = cropArr.filter((e) => e.type === crops || crops === 'all');

    const datasets = [];

    let earliestPlantDate;
    let latestPlantDate;

    for (let i = 0; i < cropArr.length; i++) {
        const year = cropArr[i].plant_date.substring(0,4);
        const month = cropArr[i].plant_date.substring(5,7);
        const day = cropArr[i].plant_date.substring(8,10);

        const growthData = await crop.calcGDU(cropArr[i], 0);

        const plantDate = new Date(year, month-1, day);
        const harvestDate = new Date(plantDate);
        harvestDate.setDate(plantDate.getDate() + growthData.importantDates[growthData.importantDates.length - 1].dayNumber);

        if (earliestPlantDate === undefined || plantDate < earliestPlantDate) {
            earliestPlantDate = plantDate;
        }

        if (latestPlantDate === undefined || harvestDate > latestPlantDate) {
            latestPlantDate = harvestDate;
        }
    }

    const labels = [];
    const dates = [];
    let counter = new Date(earliestPlantDate);

    while (counter <= latestPlantDate) {
        labels.push(counter.toLocaleDateString());
        dates.push(new Date(counter));
        counter.setDate(counter.getDate() + 1);
    }

    for (let i = 0; i < cropArr.length; i++) {
        const growthData = await crop.calcGDU(cropArr[i], 0);

        const year = cropArr[i].plant_date.substring(0,4);
        const month = cropArr[i].plant_date.substring(5,7);
        const day = cropArr[i].plant_date.substring(8,10);

        const plantDate = new Date(year, month-1, day);
        const harvestDate = new Date(plantDate);
        harvestDate.setDate(plantDate.getDate() + growthData.importantDates[growthData.importantDates.length - 1].dayNumber);

        const data = [];

        let index = 1;
        for (let i = 0; i < dates.length; i++) {
            if (dates[i] >= plantDate && dates[i] <= harvestDate) {
                data.push(growthData.aGDU[index]);
                index++;
            } else {
                data.push(NaN);
            }
        }

        datasets.push({label: cropArr[i].type, data: data, lineTension: .3, backgroundColor: 'transparent', borderColor: colors.pop()});
    }

    const chartData = {
        labels: labels,
        datasets: datasets
    };

    res.send(JSON.stringify(chartData));

});

app.post('/model/deadlines', async (req, res) => {
    // confirm we are recieving a json object
    if (req.header('Content-Type') !== 'application/json') {
        res.status(500).send('NOT JSON OBJ');
        return;
    }

    const userID = Number.parseInt(req.body.userID);
    const crops = req.body.crops;

    console.log(userID);
    console.log(crops);

    // now we need to get the crops from the user database api
    let cropArr = await database.getCrops(userID);

    // filter down the crops we actually need to display data for
    cropArr = cropArr.filter((e) => e.type === crops || crops === 'all');

    const importantDatesList = [];

    for (let i = 0; i < cropArr.length; i++) {
        const dates = (await crop.calcGDU(cropArr[i], 0)).importantDates;

        const year = cropArr[i].plant_date.substring(0,4);
        const month = cropArr[i].plant_date.substring(5,7);
        const day = cropArr[i].plant_date.substring(8,10);

        const plantDate = new Date(year, month-1, day);
        // const harvestDate = new Date(plantDate);
        // harvestDate.setDate(plantDate.getDate() + growthData.importantDates[growthData.importantDates.length - 1].dayNumber);
        dates.forEach((e) => {
            const convertedDate = new Date(plantDate);
            convertedDate.setDate(plantDate.getDate() + e.dayNumber);
            e.dayNumber = convertedDate.toLocaleDateString();
        });

        importantDatesList.push({type: cropArr[i].type, dates: dates });

    }

    res.send(importantDatesList);
});

function checkAuthenticated(req, res, next) {
    console.log('checking authenticated');
    if (req.isAuthenticated()) {
        console.log('is authenticated');
        return next();
    }
    console.log('not authenticated');
    res.redirect('/');
}

function checkNotAuthenticated(req, res, next) {
    console.log('checking not authenticated');
    if (req.isAuthenticated()) {
        console.log('is authenticated');
        return res.redirect('/users/dashboard');
    }
    console.log('not authenticated');
    next();
}

const { setCartesian } = require('mathjs');
const { render } = require('ejs');

app.listen(port);