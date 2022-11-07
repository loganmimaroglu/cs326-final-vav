const express = require('express');
const router = express.Router();

const users = [ { emailAddress: 'logan@test.com', password: 'password', crops: [{ type: 'carrot', plantDate: '20221228', profitPerAcre: 30, acres: 1 }, { type: 'wheat', plantDate: '20221228', profitPerAcre: 30, acres: 1 }, { type: 'soybean', plantDate: '20221228', profitPerAcre: 30, acres: 1 }] } ];

// Static Routes
router.post('/', (req, res) => {

    let isValid = false;
    let index = -1;

    // find the user
    for (let i = 0; i < users.length; i++) {
        const user = users[i];

        if (user.emailAddress === req.body.emailAddress) {
            index = i;
            isValid = true;
        }
    }

    console.log(isValid);
    console.log(index);

    if (isValid) {
        res.redirect(`/users/${index}`);
    } else {
        console.log('error logging in');
        res.render('index', { emailAddress: req.body.emailAddress, warning: 'Sorry, your email or password could not be verified.' });
    }
});

module.exports = router;