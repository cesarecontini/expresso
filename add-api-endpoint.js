#!/usr/bin/env node

const program = require('commander');
const chalkPipe = require('chalk-pipe');
const fs = require('fs-extra');
const pluralize = require('pluralize');
const capitalize = require('capitalize');
const Listr = require('listr');
const figlet = require('figlet');

const apiRouterString = require('./templates/api-router');
const sequelizeModelString = require('./templates/sequelize-model');
const sequelizeMigrationString = require('./templates/sequelize-migration');
const sequelizeSeedString = require('./templates/sequelize-seed');
const cliUtils = require('./utils/cli-utils');

const filesAdded = [];

const { list, pathExist, getFormattedDateAsInt } = cliUtils;

const addApiEndpoints = prog => {
    const routersDir = `./src/routers`;
    const promisesArray = [];
    prog.list.forEach(propertyName => {
        const plural = pluralize.plural(propertyName);
        const singular = pluralize.singular(propertyName);
        const fileName = `${routersDir}/route-${plural}.js`;
        filesAdded.push(fileName);
        promisesArray.push(
            fs.writeFile(
                fileName,
                apiRouterString({
                    modelSingularName: singular,
                })
            )
        );
    });
    return Promise.all(promisesArray);
};

const addSequelizeFiles = (
    prog,
    targetDirPath,
    fileTemplateStringFn,
    isFilenameWithTimestampSuffix
) => {
    const targetDir = `./${targetDirPath}`;
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
            const timestamp = getFormattedDateAsInt();
            fileName = `${timestamp + i * 5}-${fileNameSuffix}`;
        }

        const sequelizeFileName = `${targetDir}/${fileName}.js`;
        promisesArray.push(
            fs.writeFile(
                sequelizeFileName,
                fileTemplateStringFn({
                    modelName: singularModelName,
                })
            )
        );
        filesAdded.push(sequelizeFileName);
        i += 1;
    });
    return Promise.all(promisesArray);
};

const initProject = prog => {
    console.log(
        chalkPipe('orange.bold')('\nexpresso-machine is adding endpoints....')
    );

    figlet(`expresso-machine`, (err, data) => {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(chalkPipe('orange.bold')(data));
    });

    const tasks = new Listr([
        {
            title: 'Checking routers path',
            task: () => pathExist('./src/routers'),
        },
        {
            title: 'Checking services path',
            task: () => pathExist('./src/services'),
        },
        {
            title: 'Checking models path',
            task: () => pathExist('./src/db/models'),
        },
        {
            title: 'Checking seeders path',
            task: () => pathExist('./src/db/seeders'),
        },
        {
            title: 'Checking migrations path',
            task: () => pathExist('./src/db/migrations'),
        },
        {
            title: 'Checking index path',
            task: () => pathExist('./index.js'),
        },
        {
            title: 'Create router files',
            task: () => addApiEndpoints(prog),
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
                    prog,
                    '/src/db/seeders',
                    sequelizeSeedString,
                    true
                ),
        },
        {
            title: 'Create migration files',
            task: () =>
                addSequelizeFiles(
                    prog,
                    '/src/db/migrations',
                    sequelizeMigrationString,
                    true
                ),
        },
        {
            title: 'Create api supertest tests',
            task: () => cliUtils.addSupertestFiles(prog)
        },
        {
            title: 'Update main application file',
            task: () => {
                return fs
                    .readFile('./app.js')
                    .then(file => file.toString().split('\n'))
                    .then(fileBits => {
                        fileBits.splice(
                            0,
                            0,
                            '\n',
                            ...prog.list.map(e => {
                                return `const route${capitalize(
                                    pluralize.plural(e)
                                )} = require('./src/routers/route-${pluralize.plural(
                                    e
                                )}');`;
                            })
                        );

                        fileBits.splice(
                            fileBits.length - 1,
                            0,
                            '\n',
                            ...prog.list.map(e => {
                                return `app.use(\`\${apiBasePath}/${pluralize.plural(
                                    e
                                )}\`, jwtAuth, route${capitalize(
                                    pluralize.plural(e)
                                )});\n`;
                            })
                        );

                        return fs.writeFile(
                            './app.js',
                            fileBits.join('\n').toString()
                        );
                    });
            },
        },
    ]);

    tasks
        .run()
        .then(() => {
            console.log();
            console.log(chalkPipe('orange.bold')('ALL DONE!'));
            console.log(chalkPipe('orange.bold')('\n'));
            console.log(
                chalkPipe('orange.bold')(
                    'We have created the following files: '
                )
            );
            filesAdded.forEach(f => console.log(chalkPipe('orange.bold')(f)));
        })
        .catch(e =>
            console.log(chalkPipe('bgRed.#cccccc')('ERROR!!', e.message))
        );
};

program
    .version('1.0.0')
    .name('expresso-machine-add-api-endpoints')
    .usage('l- product,category')
    .option(
        '-l, --list <apiEndpoints>',
        'A list of api properties <apiEndpoints>, comma-separated',
        list,
        []
    )
    .parse(process.argv);

if (program.list) {
    initProject(program);
}
