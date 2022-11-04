const express = require('express');
const router = express.Router();

// Static Routes
router.get('/', (req, res) => {
    res.send('User list');
});

router.get('/new', (req, res) => {
    res.render('users/new');
});

router.post('/', (req, res) => {

    const isValid = true;

    if (isValid) {
        users.push({ emailAddress: req.body.emailAddress, password: req.body.password, crops: [] });
        res.redirect(`/users/${users.length - 1}`);
    } else {
        console.log('error creating new user');
        res.render('users/new', { emailAddress: req.body.emailAddress, warning: 'Account with email already exists' });
    }
});

// Dynamic Routes
router
    .route('/:id')
    .get((req, res) => {
        res.render('users/dashboard', { 'user': req.user });

        // req.query.crop will give you corn for the request localhost:3000/users/5?crop=corn
    })
    .put((req, res) => {
        res.send(`Update User With ID ${req.params.id}`);
    })
    .delete((req, res) => {
        res.send(`Delete User With ID ${req.params.id}`);
    });

const users = [ { emailAddress: 'logan@test.com', password: 'password', crops: [{ type: 'corn', plantDate: '20221228', profitPerAcer: 30, acers: 1 }] } ];
router.param('id', (req, res, next, id) => {
    req.user = users[id];
    next();
});

module.exports = router;