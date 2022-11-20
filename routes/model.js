const express = require('express');
const crop = require('../crop.js');
const database = require('../database.js');
const router = express.Router();

// return json chart object
router.post('/', async (req, res) => {
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

router.post('/deadlines', async (req, res) => {
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

module.exports = router;