'use strict';

const sequelize = require('../db/models');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

module.exports = new JwtStrategy(opts, (jwt_payload, done) => {
    User.findOne({
        where: {
            email: email
        },
        attributes: ['email']
    }).then(user => {
        if(user && user.email === jwt_payload.email) {
            return done(null, true)
        } else {
            return done(null, false)
        }
    });

}) 
