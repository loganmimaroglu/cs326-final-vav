const database = require('../database.js');

const express = require('express');
const router = express.Router();

// Static Routes
router.post('/', (req, res) => {

    let index = database.auth({ emailAddress: req.body.emailAddress, password: req.body.password });

    if ( index >= 0 ) {
        res.redirect(`/users/${index}`);
    } else {
        console.log('error logging in');
        res.render('index', { emailAddress: req.body.emailAddress, warning: 'Sorry, your email or password could not be verified.' });
    }
});

module.exports = router;