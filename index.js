#!/usr/bin/env node

const program = require('commander');
const chalkPipe = require('chalk-pipe');
const fs = require('fs-extra');
const rmdir = require('rmdir');
const pluralize = require('pluralize');
const Listr = require('listr');
const figlet = require('figlet');
const moment = require('moment');

const pathToExpressoMachine = require('global-modules-path').getPath(
    'expresso-machine'
);

const appString = require('./templates/app');
const appIndexString = require('./templates/app-index');
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
const cliUtils = require('./utils/cli-utils');

const { list } = cliUtils;

const addApiEndpoints = prog => {
    const routersDir = `./${prog.init}/src/routers`;
    fs.mkdir(routersDir).then(() => {
        const promisesArray = [
            fs.copy(
                `${pathToExpressoMachine}/routers/auth-route.js`,
                `${routersDir}/auth-route.js`
            ),
        ];
        prog.list.forEach(propertyName => {
            const plural = pluralize.plural(propertyName);
            const singular = pluralize.singular(propertyName);
            promisesArray.push(
                fs.writeFile(
                    `${routersDir}/route-${plural}.js`,
                    apiRouterString({
                        modelSingularName: singular,
                    })
                )
            );
        });
        return Promise.all(promisesArray);
    });
};

const addSequelizeFiles = (
    prog,
    targetDirPath,
    fileTemplateStringFn,
    isFilenameWithTimestampSuffix
) => {
    const targetDir = `./${prog.init}${targetDirPath}`;
    const promisesArray = [];
    let i = 1;
    prog.list.forEach(modelName => {
        const singularModelName = pluralize.singular(modelName);
        let fileName = pluralize.singular(modelName);
        if (isFilenameWithTimestampSuffix) {
            const fileNameSuffix =
                targetDirPath === '/src/db/migrations'
                    ? `create-${fileName}`
                    : `${fileName}-data`;
            const timestamp = Number(moment().format('YYYYMMDDHHmmss'));
            fileName = `${timestamp + i * 5}-${fileNameSuffix}`;
        }

        promisesArray.push(
            fs.writeFile(
                `${targetDir}/${fileName}.js`,
                fileTemplateStringFn({
                    modelName: singularModelName,
                })
            )
        );
        i += 1;
    });
    return Promise.all(promisesArray);
};

const initProject = prog => {
    const projectDirName = `./${prog.init}`;

    console.log(chalkPipe('orange.bold')('expresso-machine is brewing....'));

    figlet(`${prog.init}`, (err, data) => {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(chalkPipe('orange.bold')(data));
    });

    const tasks = new Listr([
        {
            title: 'Create project directory',
            task: () => fs.mkdir(prog.init),
        },
        {
            title: 'Create src directory',
            task: () => fs.mkdir(`${prog.init}/src`),
        },
        {
            title: 'Create app.js main file',
            task: () => {
                return fs.writeFile(
                    `${projectDirName}/app.js`,
                    appString({
                        port: prog.port,
                        routersList: prog.list.map(l => pluralize.plural(l)),
                    })
                );
            },
        },
        {
            title: 'Create index.js main file',
            task: () => {
                return fs.writeFile(
                    `${projectDirName}/index.js`,
                    appIndexString()
                );
            },
        },
        {
            title: 'Create package.json file',
            task: () =>
                fs.writeFile(
                    `${projectDirName}/package.json`,
                    packageJsonString({
                        dbDialect: prog.dbDialect,
                        appName: prog.init,
                    })
                ),
        },
        {
            title: 'Create settings.js file',
            task: () =>
                fs.writeFile(
                    `${projectDirName}/settings.js`,
                    settingsString({
                        port: prog.port,
                        dbDialect: prog.dbDialect,
                    })
                ),
        },
        {
            title: 'Create router files',
            task: () => addApiEndpoints(prog),
        },
        {
            title: 'Create vscode folder',
            task: () =>
                fs.copy(
                    `${pathToExpressoMachine}/addons/vscode`,
                    `${projectDirName}/.vscode`
                ),
        },
        {
            title: 'Create sequelize folder',
            task: () =>
                fs.copy(
                    `${pathToExpressoMachine}/db`,
                    `${projectDirName}/src/db`
                ),
        },
        {
            title: 'Create model files',
            task: () =>
                addSequelizeFiles(
                    prog,
                    '/src/db/models',
                    sequelizeModelString,
                    false
                ),
        },
        {
            title: 'Create seeder files',
            task: () =>
                addSequelizeFiles(
                    program,
                    '/src/db/seeders',
                    sequelizeSeedString,
                    true
                ),
        },
        {
            title: 'Create seeder files',
            task: () =>
                addSequelizeFiles(
                    prog,
                    '/src/db/migrations',
                    sequelizeMigrationString,
                    true
                ),
        },
        {
            title: 'Create sequelize custom config.json file',
            task: () =>
                fs.writeFile(
                    `${projectDirName}/src/db/config.json`,
                    sequelizeConfigJsonString({
                        dbDialect: prog.dbDialect,
                    })
                ),
        },
        {
            title: 'Create .sequelizerc file',
            task: () =>
                fs.copy(
                    `${pathToExpressoMachine}/.sequelizerc`,
                    `${projectDirName}/.sequelizerc`
                ),
        },
        {
            title: 'Create services folder',
            task: () =>
                fs.copy(
                    `${pathToExpressoMachine}/services`,
                    `${projectDirName}/src/services`
                ),
        },
        {
            title: 'Create Dockerfile',
            task: () =>
                fs.writeFile(`${projectDirName}/Dockerfile`, dockerString({})),
        },
        {
            title: 'Create docker-compose.yml file',
            task: () =>
                fs.writeFile(
                    `${projectDirName}/docker-compose.yml`,
                    dockerComposeString({
                        port: prog.port,
                        dbPort: prog.dbport,
                        dbDialect: prog.dbDialect,
                        projectName: prog.init,
                    })
                ),
        },
        {
            title: 'Creating .git ignore file',
            task: () =>
                fs.writeFile(
                    `${projectDirName}/.gitignore`,
                    gitIgnoreString({})
                ),
        },
        {
            title: 'Create .eslintrc.json file',
            task: () =>
                fs.copy(
                    `${pathToExpressoMachine}/.eslintrc.json`,
                    `${projectDirName}/.eslintrc.json`
                ),
        },
        {
            title: 'Create .prettierrc file',
            task: () =>
                fs.copy(
                    `${pathToExpressoMachine}/.prettierrc`,
                    `${projectDirName}/.prettierrc`
                ),
        },
        {
            title: 'Create jest configuration file',
            task: () =>
                fs.copy(
                    `${pathToExpressoMachine}/addons/jest/jest.config.js`,
                    `${projectDirName}/jest.config.js`
                ),
        },
        {
            title: 'Create test folder structure',
            task: () =>
                fs.copy(
                    `${pathToExpressoMachine}/addons/jest/test`,
                    `${projectDirName}/test`
                ),
        },
        {
            title: 'Create api supertest tests',
            task: () => cliUtils.addSupertestFiles(prog)
        },
        {
            title: 'Create views folder',
            task: () =>
                fs.copy(
                    `${pathToExpressoMachine}/views`,
                    `${projectDirName}/views`
                ),
        },
        {
            title: 'Create public folder',
            task: () =>
                fs.copy(
                    `${pathToExpressoMachine}/addons/public`,
                    `${projectDirName}/public`
                ),
        },
        {
            title: 'Create .expresso-machine library folder',
            task: () =>
                fs.copy(
                    `${pathToExpressoMachine}/.expresso-machine`,
                    `${projectDirName}/.expresso-machine`
                ),
        },
    ]);

    tasks
        .run()
        .then(() => {
            console.log();
            console.log(chalkPipe('orange.bold')('ALL DONE!'));
            console.log();
            console.log(
                chalkPipe('orange.bold')(
                    `1) CD into newly brewed project ${prog.init}`
                )
            );
            console.log(chalkPipe('white.bold')(`~$ cd ${prog.init}`));
            console.log();
            console.log(
                chalkPipe('orange.bold')(
                    `2) Docker compose build & up in background`
                )
            );
            console.log(
                chalkPipe('white.bold')(`~/${prog.init}$ npm run init &`)
            );
            console.log();
            console.log(
                chalkPipe('orange.bold')(
                    `3) When process ends, build DB and seed it`
                )
            );
            console.log(
                chalkPipe('white.bold')(`~/${prog.init}$ npm run init-db`)
            );
        })
        .catch(e =>
            console.log(chalkPipe('bgRed.#cccccc')('ERROR!!', e.message))
        );
};

program
    .version('0.1.0')
    .name('expresso-machine')
    .usage('-i my-app l- product,category')
    .option(
        '-i, --init <projectname>',
        'Creates a project named <projectname>',
        'my-app'
    )
    .option(
        '-p, --port [port]',
        'Set the port the node app is exposed on [port]',
        3000
    )
    .option(
        '-P, --dbport [dbport]',
        'Set the port database is exposed on [dbport]',
        5433
    )
    .option('-o, --overwrite', 'Overwrite project folder if already existing')
    .option(
        '-d, --dbDialect [dbDialect]',
        'Enter the database [dbDialect] you would like to use: postgres, sqlite, mssql or mysql',
        'postgres'
    )
    .option(
        '-l, --list <apiEndpoints>',
        'A list of api properties <apiEndpoints>, comma-separated',
        list,
        ['product', 'category']
    )
    .option('-a, --about', 'About expresso-machine cli')
    .parse(process.argv);

if (program.about) {
    figlet(`expresso-machine`, (err, data) => {
        if (err) {
            console.log('Something went wrong');
            console.dir(err);
            return;
        }
        console.log(chalkPipe('orange.bold')(''));
        console.log(
            chalkPipe('orange.bold')(
                'Brew an express(o) app within seconds with:'
            )
        );
        console.log(chalkPipe('orange.bold')(data));
        console.log(chalkPipe('orange.bold')(''));
        console.log(chalkPipe('orange.bold')('(c) 2019 Cesare Giani Contini'));
        console.log(chalkPipe('orange.bold')('\n'));
    });
}

if (!program.about && program.init) {
    const projectDirName = `./${program.init}`;

    if (program.overwrite) {
        rmdir(projectDirName, err => {
            if (!err) initProject(program);
            if (err) {
                console.log(
                    chalkPipe('bgRed.#cccccc')(
                        'There is no directory ',
                        projectDirName,
                        'to override.'
                    )
                );
            }
        });
    } else {
        initProject(program);
    }
}
