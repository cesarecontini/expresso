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
const settings = require('./settings');
const express = require('express');
const app = express();
const port = settings.port;

${requireRouterModules(opts.routersList)}

${addRouterModules(opts.routersList)}

app.listen(port, () => console.log('Example app listening on \${port}', port));
`;
}