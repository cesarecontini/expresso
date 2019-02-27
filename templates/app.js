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
    return `const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const passport = require('passport');
const passportLocalStrategy = require('./src/services/passportStrategiesService');

passportLocalStrategy(passport);

const settings = require('./settings');

const app = express();

const { port } = settings;

app.use(helmet());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

${requireRouterModules(opts.routersList)}

const authRouter = require('./src/routers/auth-route');

${addRouterModules(opts.routersList)}

app.use('/auth', authRouter);

app.listen(port, () => console.log('Example app listening on port', port));

`;
};
