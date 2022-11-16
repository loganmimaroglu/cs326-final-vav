const { Client } = require("pg");

// Grab the database URL.
let secrets;
let url;
if (!process.env.DATABASE_URL) {
    secrets = require('./secrets.json');
    url = secrets.url;
} else {
    url = process.env.DATABASE_URL;
}

let users = [];
let crops = [];
pullDatabase();

// const users = [ { emailAddress: 'logan@test.com', password: 'password', crops: [{ type: 'carrot', plantDate: '20221228', profitPerAcre: 30, acres: 1 }, { type: 'wheat', plantDate: '20221228', profitPerAcre: 30, acres: 1 }, { type: 'soybean', plantDate: '20221228', profitPerAcre: 30, acres: 1 }] } ];

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

    // Query the database for all current crops and fix users array.
    client.query('SELECT * FROM crops;', (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
            crops.push(row);
        }
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
        client.end();
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
function addUser(user) {

    // Flag for whether user is valid.
    let isValid = true;

    // Set properties of user for database insertion.
    user.id = users.length;
    user.hash = 'null';
    user.crops = [];

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
        client.query('INSERT INTO users (id, email, password, hash, crops) VALUES (' + user.id + ', \'' + user.emailAddress + '\', \'' + user.password + '\', \'' + user.hash + '\', \'' + JSON.stringify(user.crops) + '\');', (err, res) => {
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

    // Return corresponding user.
    return users[id];
}

/**
 * Adds a crop to a users list of crops
 * @param {number} id
 * @param { type: String, plantDate: Number, profitPerAcre: Number, acres: Number } crop
 */
function addCrop(id, crop) {

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
    }
    
    // Else, add it to the crops database and increment the DB size for the ID.
    else {
        newCropID = crops.length + 1;
        const client = new Client({
            connectionString: url,
            ssl: {
                rejectUnauthorized: false
            }
        });
        client.connect();
        client.query('INSERT INTO crops VALUES (' + newCropID + ', \'' + crop.type + '\', ' + 'null' + ', \'' + crop.plantDate + '\', ' + 'null' + ', ' + 'null' + ', ' + 'null' + ');', (err, res) => {
            if (err) throw err;
            client.end();
        });
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

    // Create the client.
    const client = new Client({
        connectionString: url,
        ssl: {
            rejectUnauthorized: false
        }
    });

    // Update record in user database.
    client.connect();
    client.query('UPDATE users SET crops = \'' + JSON.stringify(dbCrops) + '\' WHERE id = ' + id + ';', (err, res) => {
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
 * @param { type: String, plantDate: Number, profitPerAcre: Number, acres: Number } crop
 */
function deleteCrop(id, crop) {

    // Get the users list of crops.
    let userCrops = users[id].crops;

    // Remove the crop from the list.
    userCrops = userCrops.filter(function(e) {
        return e.type !== crop;
    });

    // Reset the user's crops property.
    users[id].crops = userCrops;

    // Go through userCrops to extract all the ID's for database insertion.
    const dbCrops = [];
    for (let c of userCrops) {
        dbCrops.push(c.id);
    }

    // Create the client.
    const client = new Client({
        connectionString: url,
        ssl: {
            rejectUnauthorized: false
        }
    });

    // Insert the new data into the users database.
    client.connect();
    client.query('UPDATE users SET crops = \'' + JSON.stringify(dbCrops) + '\' WHERE id = ' + id + ';', (err, res) => {
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