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
    const apiBasePath = '${apiBasePath}';
    return routers
        .map(
            r =>
                `app.use(\`${apiBasePath}/${r}\`, jwtAuth, route${capitalize(r)});`
        )
        .join('\n');
};

module.exports = opts => {
    return `
${requireRouterModules(opts.routersList)}
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const csrf = require('csurf');
const pino = require('express-pino-logger')();
const expressNunjucks = require('express-nunjucks');
const path = require('path');

const passportLocalStrategy = require('./src/services/passportStrategiesService');

const settings = require('./settings');
const { apiBasePath } = settings;

passportLocalStrategy(passport);

const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: true });

const app = express();
app.use(pino);
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

app.use('/public', express.static('public'));
app.set('views', path.join('views'));
let njk = expressNunjucks(app, {
    watch: true,
    noCache: true,
    globals: {
        // ADD GLOBAL VARIABLES HERE
    }
});

app.use(parseForm);

const authRouter = require('./src/routers/auth-route');
app.use(\`\${apiBasePath}/auth\`, authRouter);

const jwtAuth = settings.enableJwtAuthentication ? passport.authenticate('jwt', { session: false }) : (req, res, next) => next();

${addRouterModules(opts.routersList)}

app.get('/', (req, res) => res.render('home', {}));
app.get('/about', (req, res) => res.render('about', {}));

module.exports = app;
`;
};
