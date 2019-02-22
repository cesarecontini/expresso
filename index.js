#!/usr/bin/env node

const program = require('commander');
const chalkPipe = require('chalk-pipe');
const fs = require('fs-extra');
const rmdir = require('rmdir');
const pluralize = require('pluralize');
const validator = require('validator');
const Listr = require('listr');
const figlet = require('figlet');
const pathToExpressoMachine = require("global-modules-path").getPath("expresso-machine");

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
const gitIgnoreString = require('./templates/gitignore');

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
            let promisesArray = [
                fs.copy(`${pathToExpressoMachine}/routers/auth-route.js`, `${routersDir}/auth-route.js`)
            ];
            program.list.forEach(propertyName => {
                const plural = pluralize.plural(propertyName);
                const singular = pluralize.singular(propertyName);
                promisesArray.push(
                    fs.writeFile(`${routersDir}/route-${plural}.js`, apiRouterString({
                        modelSingularName: singular
                    }))
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

    console.log(chalkPipe('orange.bold')('expresso-machine is brewing....'));

    figlet(`${program.init}`, function(err, data) {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(chalkPipe('orange.bold')(data));
    });

    const tasks = new Listr([{
            title: 'Create project directory',
            task: () => fs.mkdir(program.init)
        },
        {
            title: 'Create index.js main file',
            task: () => {
                return fs.writeFile(`${projectDirName}/index.js`, appString({
                    port: program.port,
                    routersList: program.list.map(l => pluralize.plural(l))
                }));
            }
        },
        {
            title: 'Create package.json file',
            task: () => fs.writeFile(`${projectDirName}/package.json`, packageJsonString({
                dbDialect: program.dbDialect,
                appName: program.init
            }))
        },
        {
            title: 'Create settings.js file',
            task: () => fs.writeFile(`${projectDirName}/settings.js`, settingsString({
                port: program.port,
                dbDialect: program.dbDialect
            }))
        },
        {
            title: 'Create router files',
            task: () => addApiEndpoints(program)
        },
        {
            title: 'Create vscode folder',
            task: () => fs.copy(`${pathToExpressoMachine}/addons/vscode`, `${projectDirName}/.vscode`)
        },
        {
            title: 'Create sequelize folder',
            task: () => fs.copy(`${pathToExpressoMachine}/db`, `${projectDirName}/db`)
        },
        {
            title: 'Create model files',
            task: () => addSequelizeFiles(program, '/db/models', sequelizeModelString, false)
        },
        {
            title: 'Create seeder files',
            task: () => addSequelizeFiles(program, '/db/seeders', sequelizeSeedString, true)
        },
        {
            title: 'Create seeder files',
            task: () => addSequelizeFiles(program, '/db/migrations', sequelizeMigrationString, true)
        },
        {
            title: 'Create sequelize custom config.json file',
            task: () => fs.writeFile(`${projectDirName}/db/config.json`, sequelizeConfigJsonString({
                dbDialect: program.dbDialect
            }))
        },
        {
            title: 'Create .sequelizerc file',
            task: () => fs.copy(`${pathToExpressoMachine}/.sequelizerc`, `${projectDirName}/.sequelizerc`)
        },
        {
            title: 'Create services folder',
            task: () => fs.copy(`${pathToExpressoMachine}/services`, `${projectDirName}/services`)
        },
        {
            title: 'Create Dockerfile',
            task: () => fs.writeFile(`${projectDirName}/Dockerfile`, dockerString({}))
        },
        {
            title: 'Create docker-compose.yml file',
            task: () => fs.writeFile(`${projectDirName}/docker-compose.yml`, dockerComposeString({
                port: program.port,
                dbPort: program.dbport,
                dbDialect: program.dbDialect,
                projectName: program.init
            }))
        },
        {
            title: 'Creating .git ignore file',
            task: () => fs.writeFile(`${projectDirName}/.gitignore`, gitIgnoreString({}))
        },
    ]);

    tasks
        .run()
        .then(() => {
            console.log();
            console.log(chalkPipe('orange.bold')('ALL DONE!'));
            console.log();
            console.log(chalkPipe('orange.bold')(`1) CD into newly brewed project ${program.init}`));
            console.log(chalkPipe('white.bold')(`~$ cd ${program.init}`));
            console.log();
            console.log(chalkPipe('orange.bold')(`2) Docker compose build & up in background`))
            console.log(chalkPipe('white.bold')(`~/${program.init}$ npm run init &`));
            console.log();
            console.log(chalkPipe('orange.bold')(`3) When process ends, build DB and seed it`))
            console.log(chalkPipe('white.bold')(`~/${program.init}$ npm run init-db`));
        })
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