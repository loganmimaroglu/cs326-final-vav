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
        let renderCrops = req.user.crops;
        let page = '';

        if (req.query.crop !== undefined) {
            renderCrops = renderCrops.filter((e) =>  e.type === req.query.crop);
        }

        if (req.query.crop === undefined) {
            page = 'dashboard';
        } else {
            page = renderCrops[0].type;
        }

        res.render('users/dashboard', { 'user': req.user, 'id': req.id, 'renderCrops': renderCrops, 'page': page});

    })
    .post((req, res) => {
        console.log(req.body);
        if ('add' in req.body) {
            const newCrop = { type: req.body.plantType, plantDate: req.body.plantDate, profitPerAcre: req.body.profitPerAcre, acres: req.body.acres };
            users[req.id].crops.push(newCrop);
            console.log(users[req.id].crops);
            res.redirect(`/users/${req.id}`);
        }
    })
    .delete((req, res) => {
        users[req.id].crops = users[req.id].crops.filter((e) => req.query.crop !== e.type);
        res.redirect(303, `/users/${req.id}`);
    });

router.get('/:id/add-plant', (req, res) => {
    res.render('users/add-plant', { 'user': req.user, 'id': req.params.id });
});

router.get('/:id/remove-plant', (req, res) => {
    res.render('users/remove-plant', { 'user': req.user, 'id': req.params.id });
});

router.get('/:id/carrot', (req, res) => {
    res.render('users/carrot', { 'user': req.user });
});

const users = [ { emailAddress: 'farmer@test.com', password: 'password', crops: [{ type: 'carrot', plantDate: '20221228', profitPerAcre: 30, acres: 1 }, { type: 'wheat', plantDate: '20221228', profitPerAcre: 30, acres: 1 }, { type: 'soybean', plantDate: '20221228', profitPerAcre: 30, acres: 1 }] } ];
router.param('id', (req, res, next, id) => {
    req.user = users[id];
    req.id = id;
    next();
});

module.exports = router;