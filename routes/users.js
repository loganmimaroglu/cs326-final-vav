const database = require('../database.js');
const bcrypt = require('bcrypt');

const express = require('express');
const router = express.Router();

// Static Routes
router.get('/', (req, res) => {
    res.send('User list');
});

router.get('/new', (req, res) => {
    res.render('users/new');
});

router.post('/', async (req, res) => {

    try {
        const salt = await bcrypt.genSalt()
        const hashedPass = await bcrypt.hash(req.body.password, salt);
        const user = { emailAddress: req.body.emailAddress, password: hashedPass };
        const id = database.addUser(user);
        if (id >= 0) {
            res.redirect(`/users/${id}`);
        } else {
            console.log('error creating new user');
            res.render('users/new', { emailAddress: req.body.emailAddress, warning: 'Account with email already exists' });
        }
    } catch {
        res.status(500).send()
    }


    
});

// Dynamic Routes
router
    .route('/:id')
    .get((req, res) => {
        let renderCrops = database.getCrops(req.id);
        let page = '';

        if (req.query.crop !== undefined) {
            renderCrops = renderCrops.filter((e) =>  e.type === req.query.crop);
        }

        if (req.query.crop === undefined) {
            page = 'dashboard';
        } else {
            page = renderCrops[0].type;
        }

        console.log(req.user);

        res.render('users/dashboard', { 'user': req.user, 'id': req.id, 'renderCrops': renderCrops, 'page': page});

    })
    .post((req, res) => {
        console.log(req.body);

        const newCrop = { type: req.body.plantType, plantDate: req.body.plantDate, profitPerAcre: req.body.profitPerAcre, acres: req.body.acres };
        database.addCrop(req.id, newCrop);
        res.redirect(`/users/${req.id}`);

    })
    .delete((req, res) => {
        database.deleteCrop(req.id, req.query.crop);
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

router.param('id', (req, res, next, id) => {
    req.user = database.getUser(id);
    req.id = id;
    next();
});

module.exports = router;