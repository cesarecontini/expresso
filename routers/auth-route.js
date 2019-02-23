const express = require('express');

const router = express.Router();

const jwt = require('jsonwebtoken');
const passport = require('passport');
const settings = require('../settings');

router.post('/login', (req, res) => {
    passport.authenticate(
        'local',
        {
            session: false,
        },
        (err, user, info) => {
            if (err || !user) {
                res.status(400).json({
                    message: info ? info.message : 'Login failed',
                    user,
                });
                return;
            }

            req.login(
                user,
                {
                    session: false,
                },
                errLogin => {
                    if (errLogin) {
                        res.send(errLogin);
                        return;
                    }

                    const token = jwt.sign(user, settings.jwtSecret, {
                        audience: settings.jwtAudience,
                        issuer: settings.jwtIssuer,
                        /* You may add more options here */
                    });

                    res.json({
                        user,
                        token,
                    });
                }
            );
        }
    )(req, res);
});

module.exports = router;
