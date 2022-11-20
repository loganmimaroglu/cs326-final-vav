const database = require('./database.js');
const supportedCrops = {
    sweet_corn: {growthStages: [ {label: 'V2', aGDU: 200}, {label: 'V3', aGDU: 350}, {label: 'V6', aGDU: 475}, {label: 'V8', aGDU: 610}, {label: 'V10', aGDU: 740}, {label: 'VT', aGDU: 1135}, {label: 'R3', aGDU: 1400}], baseTemp: 50, freezeTemp: 28},
    sanbro_sunflower: {growthStages: [ {label: 'E', aGDU: 129}, {label: 'VE', aGDU: 269}, {label: 'R1', aGDU: 623}, {label: 'R3', aGDU: 1028}, {label: 'R51', aGDU: 1192}, {label: 'R55', aGDU: 1336}, {label: 'R6', aGDU: 1512}, {label: 'R9', aGDU: 2292}], baseTemp: 45, freezeTemp: 25},
    cranberries: {growthStages: [ {label: 'TB', aGDU: 250}, {label: 'CH', aGDU: 500}, {label: 'RN', aGDU: 750}, {label: 'H', aGDU: 1200}, {label: 'B', aGDU: 1500}, {label: 'FS', aGDU: 1700}, {label: 'FSM', aGDU: 2000}], baseTemp: 41, freezeTemp: 0}
};

// takes in a crop object of the format { type: 'carrot', plantDate: '20221228', profitPerAcre: 30, acres: 1 }
// and a number (0-3) to represent the variation
// returns a {aGDU: Array of numbers, importantDates: Array of {label: String, dayNumber: number}}
async function calcGDU(crop, variation) {
    const year = crop.plant_date.substring(0,4);
    const month = crop.plant_date.substring(5,7);
    const day = crop.plant_date.substring(8,10);

    const plantDate = new Date(year, month-1, day);
    const growthStages = supportedCrops[crop.type].growthStages;
    const baseTemp = supportedCrops[crop.type].baseTemp;
    const freezeTemp = supportedCrops[crop.type].freezeTemp;

    let weatherData;
    try {
        weatherData = await database.getWeatherData(variation, 0);
    } catch (err) {
        console.error(err);
    }

    const start = new Date(plantDate.getFullYear(), 0, 0);
    // compensating for daylight savings time
    let diff = (plantDate - start) + ((start.getTimezoneOffset() - plantDate.getTimezoneOffset()) * 60 * 1000);
    let oneDay = 1000 * 60 * 60 * 24;
    let dayNumber = Math.floor(diff / oneDay);

    let counter = 0;
    let aGDU = 0;
    let dates = [];

    let aGDUarr = [0];

    for (let i = 0; i < 600; i++) {
        let todayWeather = weatherData[((dayNumber - 1) + i) % 365];

        if (todayWeather.TAVG < freezeTemp) {
            // console.log('plant dies');
        }

        // add todays GDU
        aGDU += (todayWeather.TAVG - baseTemp) > 0 ? todayWeather.TAVG - baseTemp : 0;
        aGDUarr.push(aGDU);

        // check to see if the growth stage has been passed overnight
        if (aGDU > growthStages[counter].aGDU) {
            dates.push({label: growthStages[counter].label, dayNumber: i});
            counter += 1;
        }

        if (counter >= growthStages.length) {
            break;
        }

    }

    return {aGDU: aGDUarr, importantDates: dates};

}

// (async () => {
//     const data = await calcGDU({ type: 'sweet_corn', plantDate: '20220512', profitPerAcre: 30, acres: 1 }, 0);
//     console.log(data.aGDU);
//     console.log(data.importantDates);
// })();

exports.calcGDU = calcGDU;