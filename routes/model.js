const express = require('express');
const router = express.Router();

function shuffle(array) {
    // Fisher-Yates shuffle, used for random decoder cipher below
    let m = array.length;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        const i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        const t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

// Static routes
router.get('/', (req, res) => {
    res.send('User list');
});

// return json chart object
router.post('/', (req, res) => {
    const colors = ['#00FFFF', '#00FF00', '#FF00FF', '#FFFF00', '#FF0000'];

    // confirm it says application/json
    console.log(req.header('Content-Type'));

    // confirm we are recieving a json object
    if (req.header('Content-Type') !== 'application/json') {
        res.status(500).send('NOT JSON OBJ');
        return;
    }

    // TODO: verify json object is valid

    const cropArr = req.body;

    const labels = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sept',
        'Oct',
        'Nov',
        'Dec'
    ];

    const datasets = [];

    cropArr.forEach((e) => {
        const type = e.type.charAt(0).toUpperCase() + e.type.slice(1);
        const plantDate = e.plantDate;
        const profitPerAcre = e.profitPerAcre;
        const acres = e.acres;

        const data = shuffle([
            100,
            200,
            300,
            400,
            500,
            600,
            700,
            800,
            900,
            1000,
            1100,
            1200
        ]);

        const item = { label: type, data: data, lineTension: .3, backgroundColor: 'transparent', borderColor: colors.pop()};

        datasets.push(item);
    });



    const chartData = {
        labels: labels,
        datasets: datasets
    };

    res.send(JSON.stringify(chartData));

});

module.exports = router;