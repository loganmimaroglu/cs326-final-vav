const database = require('../database.js');
const bcrypt = require('bcrypt');

const express = require('express');
const router = express.Router();

// Static Routes
router.post('/', async (req, res) => {

    let user = database.auth({ emailAddress: req.body.emailAddress, password: req.body.password })

    let index = user.id;

    try {
        if(!await bcrypt.compare(req.body.password, user.password)) {
            index = -1;
        }
    } catch {
        res.status(500).send();
    }

    if ( index >= 0 ) {
        res.redirect(`/users/${index}`);
    } else {
        console.log('error logging in');
        res.render('index', { emailAddress: req.body.emailAddress, warning: 'Sorry, your email or password could not be verified.' });
    }
});

module.exports = router;