const { Client } = require("pg");

let users = [];
let crops = [];

// Grab the database URL.
let secrets;
let url;
if (!process.env.DATABASE_URL) {
    secrets = require('./secrets.json');
    url = secrets.url;
} else {
    url = process.env.DATABASE_URL;
}

// const users = [ { emailAddress: 'logan@test.com', password: 'password', crops: [{ type: 'carrot', plantDate: '20221228', profitPerAcre: 30, acres: 1 }, { type: 'wheat', plantDate: '20221228', profitPerAcre: 30, acres: 1 }, { type: 'soybean', plantDate: '20221228', profitPerAcre: 30, acres: 1 }] } ];
pullDatabase();

/**
 * Updates the current arrays of users and crops by pulling from their corresponding tables.
 */
function pullDatabase() {

    // Create the client.
    const client = new Client({
        connectionString: url,
        ssl: {
            rejectUnauthorized: false
        }
    });

    // Connect to the database.
    client.connect();

    // Query the database for all current users.
    client.query('SELECT * FROM users;', (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
            users.push({ id: row.id, emailAddress: row.email, password: row.password, hash: row.hash, crops: JSON.parse(row.crops) });
        }
    });

    // Query the database for all current crops.
    client.query('SELECT * FROM crops;', (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
            crops.push(row);
        }
        client.end();
    });
}

/**
 * Authenticates a user login
 * @param {emailAddress: String, password: String} user
 * @returns {number} ID of the user, otherwise -1.
 */
function auth(user) {

    // Pull from database.
    pullDatabase();

    console.log(users);

    // Return index tracker.
    let index = -1;

    // Loop through users to find matching email.
    for (let i = 0; i < users.length; i++) {
        const element =  users[i];
        if (element.email === user.emailAddress) {
            index = i;
        }
    }

    // Return their index, or -1.
    return index;
}

/**
 * Authenticates a user login
 * @param {emailAddress: String, password: String} user the user to be added
 * @returns {number} ID of the user, otherwise -1.
 */
function addUser(user) {

    // Pull from database.
    pullDatabase();

    // Flag for whether user is valid.
    let isValid = true;

    // Set properties of user for database insertion.
    user.id = users.length + 1;
    user.hash = 'null';
    user.crops = JSON.stringify([]);

    // Create the client.
    const client = new Client({
        connectionString: url,
        ssl: {
            rejectUnauthorized: false
        }
    });

    // If user is valid, insert into database and return their ID.
    if (isValid) {
        users.push(user);
        client.connect();
        client.query('INSERT INTO users (id, email, password, hash, crops) VALUES (' + user.id + ', ' + user.emailAddress + ', ' + user.password + ', ' + user.hash + ', ' + user.crops + ');', (err, res) => {
            if (err) throw err;
            client.end();
        });
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

    // Pull from database.
    pullDatabase();

    // Return corresponding user.
    return users[id];
}

/**
 * Adds a crop to a users list of crops
 * @param {number} id
 * @param { type: String, plantDate: Number, profitPerAcre: Number, acres: Number } crop
 */
function addCrop(id, crop) {

    // Pull from database.
    pullDatabase();

    // Set properties of crop for database insertion.
    crop.id = crops.length + 1;
    crop.growth_stages = 'null';
    crop.base_temp = 'null';
    crop.freeze_temp = 'null';
    crop.location = 'null';

    // Create the client.
    const client = new Client({
        connectionString: url,
        ssl: {
            rejectUnauthorized: false
        }
    });

    // Add the new crop to the crops database.
    client.connect();
    client.query('INSERT INTO crops (id, name, growth_stages, plant_date, base_temp, freeze_temp, location) VALUES (' + crop.id + ', ' + crop.type + ', ' + crop.growth_stages + ', ' + crop.plantDate + ', ' + crop.base_temp + ', ' + crop.freeze_temp + ', ' + crop.location + ');', (err, res) => {
        if (err) throw err;
    });

    // Get the array of crops for the current user.
    const userCrops = JSON.parse(users[id]);

    // Add the new crop ID to it.
    userCrops.push(crop.id);

    // Update record in user database.
    client.query('UPDATE users SET crops = ' + JSON.stringify(userCrops) + ' WHERE id = ' + id + ');', (err, res) => {
        if (err) throw err;
        client.end();
    });
}

/**
 * Gets a users crop array
 * @param {} id The ID of the user
 * @returns {Array} Array of crops
 */
function getCrops(id) {
    
    // Pull from database.
    pullDatabase();

    // Get the array of crop IDs for this user.
    const userCrops = JSON.parse(users[id].crops);

    // Create a return array to store the actual crops.
    const returnCrops = [];

    // Go through crops array and add those that belong to this user.
    for (let crop in crops) {
        if (crop.id in userCrops) {
            returnCrops.push(crop);
        }
    }

    // Return the final array of crop objects.
    return returnCrops;
}

/**
 * Removes a crop from a users list of crops
 * @param {number} id The ID of the user
 * @param { type: String, plantDate: Number, profitPerAcre: Number, acres: Number } crop
 */
function deleteCrop(id, crop) {

    // Pull from database.
    pullDatabase();

    // Get the users list of crops.
    let userCrops = JSON.parse(users[id].crops);

    // Remove the crop from the list.
    userCrops = userCrops.filter((e) => e.type !== crop.type);

    // Reset the user's crops property.
    users[id].crops = JSON.stringify(userCrops);

    // Create the client.
    const client = new Client({
        connectionString: url,
        ssl: {
            rejectUnauthorized: false
        }
    });

    // Insert the new data into the users database.
    client.connect();
    client.query('UPDATE users SET crops = ' + JSON.stringify(userCrops) + ' WHERE id = ' + id + ');', (err, res) => {
        if (err) throw err;
        client.end();
    });
}

exports.auth = auth;
exports.addUser = addUser;
exports.getCrops = getCrops;
exports.addCrop = addCrop;
exports.deleteCrop = deleteCrop;
exports.getUser = getUser;