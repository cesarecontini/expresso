module.exports = opts => {
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
        default:
            dbDependencies = '';
            break;
    }

    return `
{
    "name": "${opts.appName}",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
        "test": "jest",
        "test-coverage": "jest --coverage",
        "start": "nodemon -e js,html,css ./index.js",
        "debug": "nodemon --inspect=0.0.0.0:9229 -e js,html,css ./index.js",
        "dockerbuild": "docker-compose build",
        "dockerup": "docker-compose up",
        "erase-db": "docker exec -it ${
            opts.appName
        }_web_1 ./node_modules/.bin/sequelize db:migrate:undo:all",
        "migrate": "docker exec -it ${
            opts.appName
        }_web_1 ./node_modules/.bin/sequelize db:migrate",
        "seed": "docker exec -it ${
            opts.appName
        }_web_1 ./node_modules/.bin/sequelize db:seed:all",
        "seed-undo": "docker exec -it ${
            opts.appName
        }_web_1 ./node_modules/.bin/sequelize db:seed:undo:all",
        "go-into-container": "docker exec -it ${opts.appName}_web_1 /bin/ash",
        "npminstall-and-start": "yarn install && yarn run debug",
        "init": "docker-compose build && docker-compose up",
        "init-db": "npm-run-all migrate seed",
        "reset-db": "npm-run-all erase-db migrate seed"
    },
    "author": "",
    "license": "ISC",
    "dependencies": {
        ${dbDependencies}
        "bcryptjs": "^2.4.3",
        "body-parser": "^1.18.3",
        "cookie-parser": "^1.4.4",
        "chalk-pipe": "^2.0.0",
        "compression": "^1.7.4",
        "csurf": "^1.9.0",
        "commander": "^2.19.0",
        "express": "^4.16.4",
        "express-nunjucks": "^2.2.3",
        "express-pino-logger": "^4.0.0",
        "fs-extra": "^7.0.1",
        "helmet": "^3.15.0",
        "jsonwebtoken": "^8.4.0",
        "nunjucks": "^3.2.0",
        "passport": "^0.4.0",
        "passport-jwt": "^4.0.0",
        "passport-local": "^1.0.0",
        "rmdir": "^1.2.0",
        "sequelize": "^5.3.1",
        "sequelize-cli": "^5.4.0",
        "validate": "^4.5.1",
        "validator": "^10.11.0"
    },
    "devDependencies": {
        "eslint": "^5.3.0",
        "eslint-config-airbnb": "^17.1.0",
        "eslint-config-prettier": "^4.0.0",
        "eslint-plugin-import": "^2.16.0",
        "eslint-plugin-jest": "^22.3.0",
        "eslint-plugin-jsx-a11y": "^6.2.1",
        "eslint-plugin-prettier": "^3.0.1",
        "eslint-plugin-react": "^7.12.4",
        "jest": "^24.1.0",
        "nodemon": "^1.18.9",
        "npm-run-all": "^4.1.5",
        "prettier": "1.16.4"
    }
}
    `;
};
