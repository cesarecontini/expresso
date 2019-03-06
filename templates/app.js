const capitalize = require('capitalize');

const requireRouterModules = routers => {
    return routers
        .map(
            r =>
            `const route${capitalize(r)} = require('./src/routers/route-${r}');`
        )
        .join('\n');
};

const addRouterModules = routers => {
    return routers
        .map(
            r =>
            `app.use('/${r}', passport.authenticate('jwt', { session: false }), route${capitalize(
                    r
                )});`
        )
        .join('\n');
};

module.exports = opts => {
    return `
${requireRouterModules(opts.routersList)}
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const passport = require('passport');
const pino = require('express-pino-logger')();

const passportLocalStrategy = require('./src/services/passportStrategiesService');

const settings = require('./settings');
const { port } = settings;

passportLocalStrategy(passport);

const app = express();
app.use(pino);
app.use(helmet());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

const authRouter = require('./src/routers/auth-route');
app.use('/auth', authRouter);

${addRouterModules(opts.routersList)}

app.listen(port, () => console.log('Example app listening on port', port));

`;
};