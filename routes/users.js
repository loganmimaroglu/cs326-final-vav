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
    .post((req, res) => {
        const newCrop = { type: req.body.plantType, plantDate: req.body.plantDate, profitPerAcre: req.body.profitPerAcre, acres: req.body.acres };
        users[req.id].crops.push(newCrop);
        res.redirect(`/users/${req.id}`);
    })
    .delete((req, res) => {
        res.send(`Delete User With ID ${req.params.id}`);
    });

router.get('/:id/add-plant', (req, res) => {
    res.render('users/add-plant', { 'user': req.user, 'id': req.params.id });
});

router.get('/:id/carrot', (req, res) => {
    res.render('users/carrot', { 'user': req.user })
})

const users = [ { emailAddress: 'logan@test.com', password: 'password', crops: [{ type: 'corn', plantDate: '20221228', profitPerAcre: 30, acres: 1 }, { type: 'corn', plantDate: '20221228', profitPerAcre: 30, acres: 1 }] } ];
router.param('id', (req, res, next, id) => {
    req.user = users[id];
    req.id = id;
    next();
});

module.exports = router;