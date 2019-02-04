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
        "start": "nodemon -e js,html,css ./index.js",
        "dockerbuild": "docker-compose build",
        "dockerup": "docker-compose up",
        "erase-db": "docker exec -it ${opts.appName}_web_1 ./node_modules/.bin/sequelize db:migrate:undo:all",
        "migrate": "docker exec -it ${opts.appName}_web_1 ./node_modules/.bin/sequelize db:migrate",
        "seed": "docker exec -it ${opts.appName}_web_1 ./node_modules/.bin/sequelize db:seed:all",
        "npminstall-and-start": "npm install && npm start",
        "init": "docker-compose build && docker-compose up",
        "init-db": "npm-run-all migrate seed",
        "reset-db": "npm-run-all erase-db migrate seed"
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
    },
    "devDependencies": {
        "nodemon": "^1.18.9",
        "npm-run-all": "^4.1.5"
    }
}
    `;
}