'use strict';

const capitalize = require('capitalize');

const requireRouterModules = (routers) => {
    return routers.map(r => `const route${capitalize(r)} = require('./routers/route-${r}');`)
        .join('\n');
}

const addRouterModules = (routers) => {
    return routers.map(r => `app.use('/${r}', /*passport.authenticate('jwt', {session: false}),*/ route${capitalize(r)})`)
        .join('\n');
}

module.exports = (opts) => {
    return `
'use strict';
const settings = require('./settings');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const passport = require('passport');

const passportLocalStrategy = require('./services/passportStrategiesService');
passportLocalStrategy(passport);

const express = require('express');
const app = express();
const port = settings.port;

app.use(helmet());
app.use( bodyParser.json() );     
app.use( bodyParser.urlencoded({
    extended: true
})); 

${requireRouterModules(opts.routersList)}

const authRouter = require('./routers/auth-route    ');

${addRouterModules(opts.routersList)}

app.use('/auth', authRouter);

app.listen(port, () => console.log('Example app listening on port', port));
`;
}