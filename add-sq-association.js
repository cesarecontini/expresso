#!/usr/bin/env node

const program = require('commander');
const chalkPipe = require('chalk-pipe');
const fs = require('fs-extra');
const pluralize = require('pluralize');
const capitalize = require('capitalize');
const validator = require('validator');
const Listr = require('listr');
const figlet = require('figlet');
const moment = require('moment');
const inquirer = require('inquirer');

const associationMigrationTemplate = require('./templates/sequelize-migration-association');

let filesAdded = [];
let existingModels = [];
let inquirerAnswers = [];

const pathExist = path => {
    return fs.pathExists(path)
        .then(exists => {
            if (!exists) {
                throw new Error('You must run this command in an expresso-machine generated project');
            }
            return true;
        })
};


const initProject = prog => {

    console.log(chalkPipe('orange.bold')('\nexpresso-machine is about to add a sequelize association....'));

    figlet(`expresso-machine`, (err, data) => {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(chalkPipe('orange.bold')(data));
    });

    const tasks = new Listr([{
            title: 'Checking routers path',
            task: () => pathExist('./src/routers')
        },
        {
            title: 'Checking services path',
            task: () => pathExist('./src/services')
        },
        {
            title: 'Checking models path',
            task: () => pathExist('./src/db/models')
        },
        {
            title: 'Checking seeders path',
            task: () => pathExist('./src/db/seeders')
        },
        {
            title: 'Checking migrations path',
            task: () => pathExist('./src/db/migrations')
        },
        {
            title: 'Checking index path',
            task: () => pathExist('./index.js')
        },
        {
            title: 'Retrieving models',
            task: () => {
                return fs.readdir('./src/db/models')
                    .then(files => {
                        existingModels = files
                            .filter(f => f != 'index.js')
                            .map(f => f.replace(new RegExp('.js', 'g'), ''));
                    })
                    .then(() => Promise.resolve(true))
            },
        },
    ]);

    tasks
        .run()
        .then(() => {
            return inquirer.prompt([{
                    type: 'list',
                    name: 'sourceModel',
                    message: 'Please pick a source model',
                    choices: existingModels
                },
                {
                    type: 'list',
                    name: 'targetModel',
                    message: 'Please pick a target model to associate to source model',
                    choices: existingModels
                },
                {
                    type: 'list',
                    name: 'associationType',
                    message: 'Please pick an association type',
                    choices: ['belongsTo', 'hasOne', 'hasMany', 'belongsToMany']
                },
            ]).then(answers => {

                if (answers.sourceModel === answers.targetModel) {
                    throw new Error('Source model and target model are the same!');
                }

                inquirerAnswers = answers;
                console.log('==========>', inquirerAnswers);

                let task;
                let consoleMessages;
                const sourceModelCapital = capitalize(pluralize.singular(answers.sourceModel));
                const targetModelCapital = capitalize(pluralize.singular(answers.targetModel));
                let timestamp = parseInt(moment().format('YYYYMMDDHHmmss'));
                if (answers.associationType === 'belongsTo') {
                    task = () => {
                        
                        consoleMessages = () => console.log(chalkPipe('orange.bold')(`
                        Please edit the folloging file: ./src/db/models/${answers.sourceModel}.js by adding the following:
                        -----------------------------------------
                        ${sourceModelCapital}.associate = function(models) {
                            ${sourceModelCapital}.belongsTo(models.${targetModelCapital});
                        };
                        -----------------------------------------
                        `));
                        return fs.writeFile(`./src/db/migrations/${timestamp}-add-${answers.sourceModel}-belongs-to-${answers.targetModel}-association.js`, associationMigrationTemplate({
                            sourceModel: answers.sourceModel,
                            targetModel: answers.targetModel,
                            associationType: answers.associationType
                        }));
                    };
                } else if (answers.associationType === 'hasOne') {
                    task = () => {
                        
                        consoleMessages = () => console.log(chalkPipe('orange.bold')(`
                        Please edit the folloging file: ./src/db/models/${answers.sourceModel}.js by adding the following:
                        -----------------------------------------
                        ${sourceModelCapital}.associate = function(models) {
                            ${sourceModelCapital}.hasOne(models.${targetModelCapital});
                        };
                        -----------------------------------------
                        `));
                        return fs.writeFile(`./src/db/migrations/${timestamp}-add-${answers.sourceModel}-has-one-${answers.targetModel}-association.js`, associationMigrationTemplate({
                            sourceModel: answers.sourceModel,
                            targetModel: answers.targetModel,
                            associationType: answers.associationType
                        }));
                    };
                }

                return new Listr([{
                        title: 'Create migration file',
                        task: task
                    }, ])
                    .run()
                    .then(() => {
                        consoleMessages();
                        return Promise.resolve(true);
                    });

            }).then(() => Promise.resolve(true));
        })
        .catch(e =>
            console.log(chalkPipe('bgRed.#cccccc')('ERROR!!', e.message))
        );


    // tasks
    //     .run()
    //     .then(() => {
    //         console.log();
    //         console.log(chalkPipe('orange.bold')('ALL DONE!'));
    //         console.log(chalkPipe('orange.bold')('\n'))
    //         console.log(chalkPipe('orange.bold')('We have created the following files: '))
    //         filesAdded.forEach(f => console.log(chalkPipe('orange.bold')(f)));
    //     })
    //     .catch(e =>
    //         console.log(chalkPipe('bgRed.#cccccc')('ERROR!!', e.message))
    //     );
};

program
    .version('1.0.0')
    .name('expresso-machine-add-sequelize-migration')
    .usage('')
    .parse(process.argv);

initProject(program);