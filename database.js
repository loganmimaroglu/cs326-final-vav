const users = [ { emailAddress: 'logan@test.com', password: 'password', crops: [{ type: 'carrot', plantDate: '20221228', profitPerAcre: 30, acres: 1 }, { type: 'wheat', plantDate: '20221228', profitPerAcre: 30, acres: 1 }, { type: 'soybean', plantDate: '20221228', profitPerAcre: 30, acres: 1 }] } ];

/**
 * Authenticates a user login
 * @param {emailAddress: String, password: String} user
 * @returns {number} ID of the user, otherwise -1.
 */
function auth(user) {

    let index = -1;

    for (let i = 0; i < users.length; i++) {
        const element =  users[i];

        if (element.emailAddress === user.emailAddress) {
            index = i;
        }
    }

    return index;
}

/**
 * Authenticates a user login
 * @param {emailAddress: String, password: String} user the user to be added
 * @returns {number} ID of the user, otherwise -1.
 */
function addUser(user) {
    let isValid = true;

    user.crops = [];

    if (isValid) {
        users.push(user);
    }

    return users.length -1;
}

/**
 * Gets a users data
 * @param {number} id The ID of the user
 * @returns { emailAddress: String, crops: Array} The users email address and list of crops.
 */
function getUser(id) {
    return users[id];
}

/**
 * Adds a crop to a users list of crops
 * @param {number} id
 * @param { type: String, plantDate: Number, profitPerAcre: Number, acres: Number } crop
 */
function addCrop(id, crop) {
    users[id].crops.push(crop);
}

/**
 * Gets a users crop array
 * @param {} id The ID of the user
 * @returns {Array} Array of crops
 */
function getCrops(id) {
    return users[id].crops;
}

/**
 * Removes a crop from a users list of crops
 * @param {number} id The ID of the user
 * @param { type: String, plantDate: Number, profitPerAcre: Number, acres: Number } crop
 */
function deleteCrop(id, crop) {
    users[id].crops = users[id].crops.filter((e) => crop !== e.type);
}

exports.auth = auth;
exports.addUser = addUser;
exports.getCrops = getCrops;
exports.addCrop = addCrop;
exports.deleteCrop = deleteCrop;
exports.getUser = getUser;