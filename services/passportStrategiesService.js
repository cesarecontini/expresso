const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const settings = require('../settings');
const sequelize = require('../db/models');

const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;

const { User } = sequelize;

const loginUser = (email, password, cb) => {
    return User.findOne({
        where: {
            email,
        },
        attributes: ['id', 'email', 'password'],
    })
        .then(user => {
            if (
                user &&
                user.email === email &&
                bcrypt.compareSync(password, user.password)
            ) {
                const plainUser = user.toJSON();
                return cb(
                    null,
                    {
                        id: plainUser.id,
                        email: plainUser.email,
                    },
                    {
                        message: 'Logged In Successfully',
                    }
                );
            }
            return cb(null, false, {
                message: 'Incorrect email or password.',
            });
        })
        .catch(e => cb(e));
};

const veryfyJWT = (jwtPayload, cb) => {
    return User.findOne({
        where: {
            id: jwtPayload.id,
        },
        attributes: ['id', 'firstName', 'lastName', 'email'],
    })
        .then(user => cb(null, user))
        .catch(err => cb(err));
};

module.exports = passport => {
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
            },
            loginUser
        )
    );

    passport.use(
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
                secretOrKey: settings.jwtSecret,
                issuer: settings.jwtIssuer,
                audience: settings.jwtAudience,
                /** you may add more options here */
            },
            veryfyJWT
        )
    );
};
