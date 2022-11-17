const passport = require('passport');
const bcrypt = require('bcrypt');

const LocalStrategy = require('passport-local').Strategy

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = (email, password, done) => {
        const user = getUserByEmail(email)
        if(user == null) {
            return done(null, false, {message: 'no user with that email'})
        }
        try {
            if(await bcrypt.compare(req.body.password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, {message: 'password incorrect'});
            }
        } catch (e){
            return done(e);
        }
    }

    passport.use(new LocalStrategy({usernameField: 'email'}), authenticateUser)
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initialize