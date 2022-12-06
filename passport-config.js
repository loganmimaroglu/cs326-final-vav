const bcrypt = require('bcrypt');

const LocalStrategy = require('passport-local').Strategy;

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email);
        if (user == null) {
            console.log('could not find user');
            return done(null, false, { message: 'No user with that email' });
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                console.log('password matched - found correct user');
                return done(null, user);
            } else {
                console.log('password did not match');
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (e) {
            console.log('there was an error');
            return done(e);
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'emailAddress'}, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
    });
}

module.exports = initialize;