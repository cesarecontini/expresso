'use strict';

const capitalize = require('capitalize');

const requireRouterModules = (routers) => {
    return routers.map(r => `const route${capitalize(r)} = require('./routers/route-${r}');`)
        .join('\n');
}

const addRouterModules = (routers) => {
    return routers.map(r => `app.use('/${r}', route${capitalize(r)})`)
        .join('\n');
}

module.exports = (opts) => {
    return `
'use strict';
const settings = require('./settings');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const port = settings.port;

const passport = require("passport");
const jwtStrategry  = require("./services/jwtPassportStrategyService")
passport.use(jwtStrategry);

app.use(helmet());
app.use( bodyParser.json() );     
app.use( bodyParser.urlencoded({
    extended: true
})); 

${requireRouterModules(opts.routersList)}

${addRouterModules(opts.routersList)}

app.get("/", (req, res) => {
    res.send("hello express server")
})

app.get("/protected", passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.status(200).send("YAY! this is a protected Route")
})

app.listen(port, () => console.log('Example app listening on port', port));
`;
}