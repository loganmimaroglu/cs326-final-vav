const e = require('express');
const { Pool } = require('pg');

// Grab the database URL.
let secrets;
let url;
if (!process.env.DATABASE_URL) {
    secrets = require('./secrets.json');
    url = secrets.url;
} else {
    url = process.env.DATABASE_URL;
}

const pool = new Pool({
    connectionString: url,
    max: 4,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
    ssl: {
        rejectUnauthorized: false
    }
});

// Start date options are numbers which represent (1 year: 0, 10 years: 1, 20 years: 2, 30 years: 3)
// Location options are (Amherst, MA US: 0)
async function getWeatherData(startDate, location) {

    const dataTAVG = {};
    const dataTMAX = {};
    const dataTMIN = {};
    const dataMERG = {};

    // inorder to prevent some kind of query injections since the API is public, we only accept certain input options
    // so lets check and make sure the inputs are valid
    if (!Number.isInteger(startDate) || !Number.isInteger(location)) {
        console.log('Bad input values');
        return -1;
    }

    switch(startDate) {
    case 1:
        startDate = '2012-01-01';
        break;
    case 2:
        startDate = '2002-01-01';
        break;
    case 3:
        startDate = '1992-01-01';
        break;
    default:
        startDate = '2012-01-01';
    }

    switch(location) {
    case 0:
        location = 'AMHERST, MA US';
        break;
    default:
        location = 'AMHERST, MA US';
    }

    const query = `
    SELECT *
    FROM weather
    WHERE date BETWEEN '${startDate}' AND CURRENT_DATE
    AND name = '${location}';
    `;


    let res;
    try {
        const client = await pool.connect();
        res = await client.query(query);
        client.release(true);
    } catch (err) {
        console.error(err);
    }

    for (const row of res.rows) {
        const tmax = row.tmax;
        const tmin = row.tmin;

        const date = new Date(row.date);
        const start = new Date(date.getFullYear(), 0, 0);
        let diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
        let oneDay = 1000 * 60 * 60 * 24;
        let day = Math.floor(diff / oneDay);

        if (!isNaN(tmax) && !isNaN(tmin)) {
            const TAVG = Math.round((row.tmax + row.tmin)/2);

            if ((day - 1) in dataTAVG) {
                dataTAVG[day - 1].push(TAVG);
            } else {
                dataTAVG[day - 1] = [TAVG];
            }
        }

        if (!isNaN(tmax)) {
            if ((day - 1) in dataTMAX) {
                dataTMAX[day - 1].push(tmax);
            } else {
                dataTMAX[day - 1] = [tmax];
            }
        }

        if (!isNaN(tmin)) {
            if ((day - 1) in dataTMIN) {
                dataTMIN[day - 1].push(tmin);
            } else {
                dataTMIN[day - 1] = [tmin];
            }
        }
    }

    for (const key in dataTAVG) {
        let sum = 0;
        dataTAVG[key].forEach((e) => {
            sum += e;
        });
        let mean = Math.round(sum / dataTAVG[key].length);

        dataTAVG[key] = mean;

        sum = 0;
        dataTMAX[key].forEach((e) => {
            sum += e;
        });
        mean = Math.round(sum / dataTMAX[key].length);

        dataTMAX[key] = mean;

        sum = 0;
        dataTMIN[key].forEach((e) => {
            sum += e;
        });
        mean = Math.round(sum / dataTMIN[key].length);

        dataTMIN[key] = mean;

        dataMERG[key] = { TAVG: dataTAVG[key], TMIN: dataTMIN[key], TMAX: dataTMAX[key] };
    }

    return dataMERG;

}

let users = [];
let crops = [];
pullDatabase();

// const users = [ { emailAddress: 'logan@test.com', password: 'password', crops: [{ type: 'carrot', plantDate: '20221228', profitPerAcre: 30, acres: 1 }, { type: 'wheat', plantDate: '20221228', profitPerAcre: 30, acres: 1 }, { type: 'soybean', plantDate: '20221228', profitPerAcre: 30, acres: 1 }] } ];

/**
 * Updates the current arrays of users and crops by pulling from their corresponding tables.
 */
async function pullDatabase() {

    // Define the first query.
    const query1 = `
    SELECT *
    FROM users;
    `;

    // Await the first query.
    let res1;
    try {
        const client = await pool.connect();
        res1 = await client.query(query1);
        client.release(true);
    } catch (err) {
        console.error(err);
    }

    // Add the response information to users array.
    for (let row of res1.rows) {
        users.push({ id: row.id, emailAddress: row.email, password: row.password, hash: row.hash, crops: JSON.parse(row.crops) });
    }

    // Define the second query.
    const query2 = `
    SELECT *
    FROM crops;
    `;

    // Await the second query.
    let res2;
    try {
        const client = await pool.connect();
        res2 = await client.query(query2);
        client.release(true);
    } catch (err) {
        console.error(err);
    }

    // Add the response information to crops array.
    for (let row of res2.rows) {
        crops.push(row);
    }

    // Fix users array to integrate with EJS code.
    for (let u of users) {
        const newCrops = [];
        for (let crop_id of u.crops) {
            for (let c of crops) {
                if (crop_id === c.id) {
                    newCrops.push(c);
                    break;
                }
            }
        }
        while (u.crops.length) {
            u.crops.pop();
        }
        for (let newCrop of newCrops) {
            u.crops.push(newCrop);
        }
    }
    users.sort(function(a, b) {
        return a.id - b.id;
    });
    crops.sort(function(a, b) {
        return a.id - b.id;
    });
}

/**
 * Authenticates a user login
 * @param {emailAddress: String, password: String} user
 * @returns {number} ID of the user, otherwise -1.
 */
function auth(user) {

    // Return index tracker.
    let index = -1;

    console.log(user);

    // Loop through users to find matching email.
    for (let i = 0; i < users.length; i++) {
        const element =  users[i];
        if (element.emailAddress === user.emailAddress) {
            index = i;
        }
    }

    // Return their index, or -1.
    return users[index];
}

/**
 * Authenticates a user login
 * @param {emailAddress: String, password: String} user the user to be added
 * @returns {number} ID of the user, otherwise -1.
 */
async function addUser(user) {

    // Flag for whether user is valid.
    let isValid = true;

    // Set properties of user for database insertion.
    user.id = users.length;
    user.hash = 'null';
    user.crops = [];

    // If user is valid, insert into database and return their ID.
    if (isValid) {

        // Push user into users array.
        users.push(user);

        // Define the query,
        const query = `
        INSERT INTO
        users (id, email, password, hash, crops)
        VALUES (${user.id}, '${user.emailAddress}', '${user.password}', '${user.hash}', '${JSON.stringify(user.crops)}');
        `;

        // Await the query.
        let res;
        try {
            const client = await pool.connect();
            res = await client.query(query);
            client.release(true);
        } catch (err) {
            console.error(err);
        }

        // Return the user ID.
        return user.id;
    }

    // Else, return -1;
    else {
        return -1;
    }
}

/**
 * Gets a users data
 * @param {number} id The ID of the user
 * @returns { emailAddress: String, crops: Array} The users email address and list of crops.
 */
function getUser(id) {
    // Return corresponding user.
    return users[id];
}

/**
 * Get the current users in the database.
 * @returns {Array} The users array pulled from the users database.
 */
function getUsers() {

    // Return the users array.
    return users;
}


let isRunning = false;

/**
 * Adds a crop to a users list of crops
 * @param {number} id
 * @param { type: String, plantDate: Number, profitPerAcre: Number, acres: Number } crop
 */
async function addCrop(id, crop) {

    console.log(id);
    console.log(crop);

    // Find out of that crop exists in the crops database.
    let foundCrop = null;
    for (let c of crops) {
        if (c.type === crop.type && c.plant_date === crop.plantDate) {
            foundCrop = c;
            break;
        }
    }

    // Declare new crop ID variable.
    let newCropID = null;

    // If we found the crop in the database, use its ID.
    if (foundCrop) {
        newCropID = foundCrop.id;

        // Check if user already has this crop added
        const userCrops = getCrops(id);
        for (let i = 0; i < userCrops.length; i++) {
            if (userCrops[i].id.toString() === foundCrop.id.toString()) {
                return false;
            }
        }

    }

    // Else, add it to the crops database and increment the DB size for the ID.
    else {

        // Set ID based on new DB size.
        newCropID = crops.length + 1;

        // Define the query.
        const query = `
        INSERT INTO crops
        VALUES (${newCropID}, '${crop.type}', null, '${crop.plantDate}', null, null, null);
        `;

        crops.push({ id: newCropID, type: crop.type, growth_stages: 'null', plant_date: crop.plantDate, base_temp: 'null', freeze_temp: 'null', location: 'null' });

        // Await the query.
        let res;
        try {
            const client = await pool.connect();
            res = await client.query(query);
            client.release(true);
        } catch (err) {
            console.error(err);
        }
    }

    // Create new crop from existing information.
    const newCrop = { id: newCropID, type: crop.type, growth_stages: 'null', plant_date: crop.plantDate, base_temp: 'null', freeze_temp: 'null', location: 'null' };

    // Get the array of crops for the current user.
    const userCrops = users[id].crops;

    // Add the new crop ID to it.
    userCrops.push(newCrop);

    // Go through userCrops to extract all the ID's for database insertion.
    const dbCrops = [];
    for (let c of userCrops) {
        dbCrops.push(c.id);
    }

    // Define the query.
    const query = `
    UPDATE users
    SET crops = '${JSON.stringify(dbCrops)}' WHERE id = ${id};
    `;

    // Await the query.
    let res;
    try {
        const client = await pool.connect();
        res = await client.query(query);
        client.release(true);
    } catch (err) {
        console.error(err);
    }

    return true;

}

/**
 * Gets a users crop array
 * @param {} id The ID of the user
 * @returns {Array} Array of crops
 */
function getCrops(id) {

    // If the user is new and hasn't been created yet, return empty array.
    if (id >= users.length) {
        return [];
    }

    // Return the user's crops.
    return users[id].crops;
}

/**
 * Removes a crop from a users list of crops
 * @param {number} id The ID of the user
 * @param {number} crop
 */
async function deleteCrop(id, crop) {

    // Get the users list of crops.
    let userCrops = users[id].crops;

    // Remove only the first occurance of the crop
    for (let i = 0; i < userCrops.length; i++) {
        if (userCrops[i].id.toString() === crop) {
            userCrops.splice(i, 1);
            break;
        }
    }

    // Reset the user's crops property.
    users[id].crops = userCrops;

    // Go through userCrops to extract all the ID's for database insertion.
    const dbCrops = [];
    for (let c of userCrops) {
        dbCrops.push(c.id);
    }

    // Define the query.
    const query = `
    UPDATE users
    SET crops = '${JSON.stringify(dbCrops)}' WHERE id = ${id};
    `;

    // Await the query.
    let res;
    try {
        const client = await pool.connect();
        res = await client.query(query);
        client.release(true);
    } catch (err) {
        console.error(err);
    }

}

exports.auth = auth;
exports.addUser = addUser;
exports.getCrops = getCrops;
exports.addCrop = addCrop;
exports.deleteCrop = deleteCrop;
exports.getUser = getUser;
exports.getUsers = getUsers;
exports.getWeatherData = getWeatherData;