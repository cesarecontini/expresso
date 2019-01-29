#!/usr/bin/env node

const program = require('commander');
const chalkPipe = require('chalk-pipe');
const fs = require('fs-extra');
const rmdir = require('rmdir');
const pluralize = require('pluralize');

const appString = require('./templates/app');
const packageJsonString = require('./templates/package.json');
const apiRouterString = require('./templates/api-router');
const settingsString = require('./templates/settings');
const sequelizeModelString = require('./templates/sequelize-model');
const sequelizeMigrationString = require('./templates/sequelize-migration');

const list = (val) => {
    if (!val) return [];
    return val.split(',')
        .filter(v => v && v.length > 0)
        .map(v => v.toLowerCase())
        .map(v => v.replace(/ /g, ''));
};

const addApiEndpoints = (program) => {
    const routersDir = `./${program.init}/routers`;
    fs.mkdir(routersDir)
        .then(() => {
            let promisesArray = [];
            program.list.forEach(propertyName => {
                const plural = pluralize.plural(propertyName);
                promisesArray.push(
                    fs.writeFile(`${routersDir}/route-${plural}.js`, apiRouterString({}))
                );
            });
            return Promise.all(promisesArray);
        });
};

const addSequelizeFiles = (program, targetDirPath, fileTemplateStringFn, isMigrationFile) => {
    const targetDir = `./${program.init}${targetDirPath}`;
    let promisesArray = [];
    let fileTimestamp = 20190129105640;
    let i = 1;
    program.list.forEach(modelName => {
        let singularModelName = pluralize.singular(modelName);
        let fileName = pluralize.singular(modelName);
        if (isMigrationFile) {
            fileName = `${(20190129105640 + (i * 100))}-create-${fileName}`;
        }

        promisesArray.push(
            fs.writeFile(`${targetDir}/${fileName}.js`, fileTemplateStringFn({
                modelName: singularModelName
            }))
        );
        i++;
    });
    return Promise.all(promisesArray);
};

const initProject = (program) => {
    const projectDirName = `./${program.init}`;
    fs.mkdir(program.init)
        .then(() => {
            console.log(chalkPipe('orange.bold')('Created directory ', projectDirName));
            return fs.writeFile(`${projectDirName}/index.js`, appString({
                port: program.port,
                routersList: program.list.map(l => pluralize.plural(l))
            }));
        })
        .then(() => console.log(chalkPipe('orange.bold')('Created index.js... ')))

        .then(() => fs.writeFile(`${projectDirName}/package.json`, packageJsonString({})))
        .then(() => console.log(chalkPipe('orange.bold')('Created package.json file ')))

        .then(() => {
            return Promise.all([
                fs.writeFile(`${projectDirName}/settings-prod.js`, settingsString({
                    port: program.port
                })),
                fs.writeFile(`${projectDirName}/settings.js`, settingsString({
                    port: program.port
                }))
            ]);
        })

        .then(() => addApiEndpoints(program))
        .then(() => console.log(chalkPipe('orange.bold')('Created router files')))

        .then(() => fs.copy('./db', `${projectDirName}/db`))
        .then(() => console.log(chalkPipe('orange.bold')('Created sequelize folder')))

        .then(() => addSequelizeFiles(program, '/db/models', sequelizeModelString, false))
        .then(() => console.log(chalkPipe('orange.bold')('Created model files')))

        .then(() => addSequelizeFiles(program, '/db/migrations', sequelizeMigrationString, true))
        .then(() => console.log(chalkPipe('orange.bold')('Created migration files')))

        .then(() => fs.copy('.sequelizerc', `${projectDirName}/.sequelizerc`))
        .then(() => console.log(chalkPipe('orange.bold')('Created .sequelizerc file')))

        .catch(e => console.log(chalkPipe('bgRed.#cccccc')('ERROR!!', e.message)));
};

program.version('0.1.0')
    .option('-i, --init [projectname]', 'Creates a project named [projectname]', 'my-app')
    .option('-p, --port [port]', 'Set the port project is running on [port]', 3000)
    .option('-o, --overwrite', 'Overwrite project if already existing')
    .option('-dbd, --dbDialect', 'Enter the database you would like to use: postgre, mariadb or mysql')
    .option('-dbconn, --dbConnectionString', 'Enter the the database full connection string')
    .option('-l, --list <apiEndpoints>', 'A list of api properties, comma-separated', list)
    .parse(process.argv);

console.log(chalkPipe('blue.bold')('CREATING PROJECT...'));
if (program.init) {

    const projectDirName = `./${program.init}`;

    if (program.overwrite) {
        rmdir(projectDirName, (err, dirs, files) => {
            if (!err) initProject(program);
            if (err) {
                console.log(chalkPipe('bgRed.#cccccc')('There is no directory ', projectDirName, 'to override.'));
            }
        })
    } else {
        initProject(program);
    }
};