#!/usr/bin/env node

const program = require('commander');
const chalkPipe = require('chalk-pipe');
const fs = require('fs-extra');
const rmdir = require('rmdir');
const pluralize = require('pluralize');
const validator = require('validator');

const appString = require('./templates/app');
const packageJsonString = require('./templates/package.json');
const apiRouterString = require('./templates/api-router');
const settingsString = require('./templates/settings');
const sequelizeModelString = require('./templates/sequelize-model');
const sequelizeMigrationString = require('./templates/sequelize-migration');
const sequelizeSeedString = require('./templates/sequelize-seed');
const sequelizeConfigJsonString = require('./templates/sequelize-config.json');
const dockerString = require('./templates/docker');
const dockerComposeString = require('./templates/docker-compose.yml');

const list = (val) => {
    if (!val) return [];
    return val.split(',')
        .filter(v => v && v.length > 0 && validator.isAlpha(v))
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

const addSequelizeFiles = (program, targetDirPath, fileTemplateStringFn, isFilenameWithTimestampSuffix) => {
    const targetDir = `./${program.init}${targetDirPath}`;
    let promisesArray = [];
    let fileTimestamp = 20190129105640;
    let i = 1;
    program.list.forEach(modelName => {
        let singularModelName = pluralize.singular(modelName);
        let fileName = pluralize.singular(modelName);
        if (isFilenameWithTimestampSuffix) {
            const fileNameSuffix = (targetDirPath === '/db/migrations' ? `create-${fileName}` : `${fileName}-data`)
            fileName = `${(20190129105640 + (i * 100))}-${fileNameSuffix}`;
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

        .then(() => fs.writeFile(`${projectDirName}/package.json`, packageJsonString({
            dbDialect: program.dbDialect,
            appName: program.init
        })))
        .then(() => console.log(chalkPipe('orange.bold')('Created package.json file ')))

        .then(() => {
            return Promise.all([
                fs.writeFile(`${projectDirName}/settings-prod.js`, settingsString({
                    port: program.port,
                    dbDialect: program.dbDialect
                })),
                fs.writeFile(`${projectDirName}/settings.js`, settingsString({
                    port: program.port,
                    dbDialect: program.dbDialect
                }))
            ]);
        })

        .then(() => addApiEndpoints(program))
        .then(() => console.log(chalkPipe('orange.bold')('Created router files')))

        .then(() => fs.copy('./db', `${projectDirName}/db`))
        .then(() => console.log(chalkPipe('orange.bold')('Created sequelize folder')))

        .then(() => addSequelizeFiles(program, '/db/models', sequelizeModelString, false))
        .then(() => console.log(chalkPipe('orange.bold')('Created model files')))

        .then(() => addSequelizeFiles(program, '/db/seeders', sequelizeSeedString, true))
        .then(() => console.log(chalkPipe('orange.bold')('Created seeder files')))

        .then(() => addSequelizeFiles(program, '/db/migrations', sequelizeMigrationString, true))
        .then(() => console.log(chalkPipe('orange.bold')('Created migration files')))

        .then(() => fs.writeFile(`${projectDirName}/db/config.json`, sequelizeConfigJsonString({dbDialect: program.dbDialect})))
        .then(() => console.log(chalkPipe('orange.bold')('Created sequelize custom config.json file')))

        .then(() => fs.copy('./services', `${projectDirName}/services`))
        .then(() => console.log(chalkPipe('orange.bold')('Created services folder ')))

        .then(() => fs.copy('.sequelizerc', `${projectDirName}/.sequelizerc`))
        .then(() => console.log(chalkPipe('orange.bold')('Created .sequelizerc file')))

        .then(() => fs.writeFile(`${projectDirName}/Dockerfile`, dockerString({})))
        .then(() => console.log(chalkPipe('orange.bold')('Created Dockerfile')))

        .then(() => fs.writeFile(`${projectDirName}/docker-compose.yml`, dockerComposeString({
            port: program.port,
            dbPort: program.dbport,
            dbDialect: program.dbDialect,
            projectName: program.init
        })))
        .then(() => console.log(chalkPipe('orange.bold')('Created docker-compose.yml file ')))


        .catch(e => console.log(chalkPipe('bgRed.#cccccc')('ERROR!!', e.message)));
};

program.version('0.1.0')
    .name('expresso')
    .usage('-i my-app l- product,category')
    .option('-i, --init <projectname>', 'Creates a project named <projectname>', 'my-app')
    .option('-p, --port [port]', 'Set the port the node app is exposed on [port]', 3000)
    .option('-P, --dbport [dbport]', 'Set the port database is exposed on [dbport]', 5433)
    .option('-o, --overwrite', 'Overwrite project folder if already existing')
    .option('-d, --dbDialect [dbDialect]', 'Enter the database [dbDialect] you would like to use: postgres, sqlite, mssql or mysql', 'postgres')
    .option('-l, --list <apiEndpoints>', 'A list of api properties <apiEndpoints>, comma-separated', list, ['product', 'category'])
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