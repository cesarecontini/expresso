'use strict';

const jwt = require('jsonwebtoken');
const sequelize = require('../db/models');
const bcrypt = require('bcryptjs');

const auth = (res, req) => {
    const {
        email,
        password
    } = req.body;
    const User = sequelize.User;

    User.findOne({
        where: {
            email: email
        },
        attributes: ['email', 'password']
    }).then(user => {
        if (user && user.email === email && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({
                email
            }, process.env.JWT_SECRET, {
                expiresIn: 120
            });
            return res.status(200).json({
                message: "Auth Passed",
                token
            });
        } else {
            return res.status(401).json({
                message: "Auth Failed"
            });
        }
    })
}

module.exports = auth;