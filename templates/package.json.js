'use strict';
module.exports = (opts) => {

    let dbDependencies = '';

    switch (opts.dbDialect) {
        case 'postgres':
            dbDependencies = `"pg": "^7.8.0",
        "pg-hstore": "^2.3.2",`;
            break;
        case 'sqlite':
            dbDependencies = '"sqlite3": "^4.0.6",';
            break;
        case 'mssql':
            dbDependencies = '"mysql2": "^1.6.4",';
            break;
        case 'mysql':
            dbDependencies = '"tedious": "^4.1.3",';
            break;
    }

    return `
{
    "name": "${opts.appName}",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
        "test": "echo \\"Error: no test specified\\" && exit 1",
        "init": "npm install"
    },
    "author": "",
    "license": "ISC",
    "dependencies": {
        ${dbDependencies}
        "chalk-pipe": "^2.0.0",
        "commander": "^2.19.0",
        "express": "^4.16.4",
        "fs-extra": "^7.0.1",
        "helmet": "^3.15.0",
        "rmdir": "^1.2.0",
        "sequelize": "^4.42.0",
        "sequelize-cli": "^5.4.0"
    }
}
    `;
}