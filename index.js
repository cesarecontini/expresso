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
                )
            });
            return Promise.all(promisesArray);
        });
}

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
        .then(() => {
            console.log(chalkPipe('orange.bold')('Created index.js... '));
            return fs.writeFile(`${projectDirName}/package.json`, packageJsonString({}));
        })
        .then(() => {
            console.log(chalkPipe('orange.bold')('Created package.json file '));
            return Promise.all([
                fs.writeFile(`${projectDirName}/settings-prod.js`, settingsString({port: program.port})),
                fs.writeFile(`${projectDirName}/settings.js`, settingsString({port: program.port}))
            ]);
        })
        .then(() => addApiEndpoints(program))
        .then(() => console.log(chalkPipe('orange.bold')('Created router files')))
        .catch(e => console.log(chalkPipe('bgRed.#cccccc')('ERROR!!', e.message)));
}

program.version('0.1.0')
    .option('-i, --init [projectname]', 'Creates a project named [projectname]', 'my-app')
    .option('-p, --port [port]', 'Set the port project is running on [port]', 3000)
    .option('-o, --overwrite', 'Overwrite project if already existing')
    .option('-dbd, --dbDialect', 'Enter the database you would like to use: postgre, mariadb or mysql')
    .option('-dbconn, --dbConnectionString', 'Enter the the database full connection string')
    .option('-o, --overwrite', 'Overwrite project if already existing')
    .option('-l, --list <apiEndpoints>', 'A list of api properties, comma-separated', list)
    .parse(process.argv);

console.log(chalkPipe('blue.bold')('CREATING PROJECT...'));
if (program.init) {

    const projectDirName = `./${program.init}`;

    if (program.overwrite) {
        rmdir(projectDirName, (err, dirs, files) => {
            if (!err) initProject(program);
            if (err) {
                console.log( chalkPipe('bgRed.#cccccc')('There is no directory ', projectDirName, 'to override.'));
            }
        })
    } else {
        initProject(program);
    }
}