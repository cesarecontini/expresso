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
    return fs.pathExists(path).then(exists => {
        if (!exists) {
            throw new Error(
                'You must run this command in an expresso-machine generated project'
            );
        }
        return true;
    });
};

const initProject = prog => {
    console.log(
        chalkPipe('orange.bold')(
            '\nexpresso-machine is about to add a sequelize association....'
        )
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
            title: 'Retrieving models',
            task: () => {
                return fs
                    .readdir('./src/db/models')
                    .then(files => {
                        existingModels = files
                            .filter(f => f != 'index.js')
                            .map(f => f.replace(new RegExp('.js', 'g'), ''));
                    })
                    .then(() => Promise.resolve(true));
            },
        },
    ]);

    tasks
        .run()
        .then(() => {
            return inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'associationType',
                        message: 'Please pick an association type',
                        choices: [
                            'belongsTo',
                            'hasOne',
                            'hasMany',
                            'belongsToMany',
                        ],
                    },
                    {
                        type: 'list',
                        name: 'sourceModel',
                        message: answers => {
                            if (answers.associationType === 'belongsTo') {
                                return 'Please pick a source model i.e. <source model> BELONGS TO <target model>';
                            } else if (answers.associationType === 'hasOne') {
                                return 'Please pick a source model i.e. <source model> HAS ONE <target model>';
                            } else if (answers.associationType === 'hasMany') {
                                return 'Please pick a source model i.e. <source model> HAS MANY <target model>';
                            } else if (answers.associationType === 'belongsToMany') {
                                return 'Please pick a source model i.e. <source model> BELONGS TO MANY <target model>';
                            }
                            return 'Please pick a source model';
                        },
                        choices: existingModels,
                    },
                    {
                        type: 'list',
                        name: 'targetModel',
                        message: answers => {
                            if (answers.associationType === 'belongsTo') {
                                return `Please pick a target model i.e. <${
                                    answers.sourceModel
                                }> BELONGS TO  <target model>`;
                            } else if (answers.associationType === 'hasOne') {
                                return `Please pick a target model i.e. <${
                                    answers.sourceModel
                                }> HAS ONE <target model>`;
                            } else if (answers.associationType === 'hasMany') {
                                return `Please pick a target model i.e. <${
                                    answers.sourceModel
                                }> HAS MANY <target model>`;
                            } else if (answers.associationType === 'belongsToMany') {
                                return `Please pick a target model i.e. <${
                                    answers.sourceModel
                                }> BELONGS TO MANY <target model>`;
                            }
                            return 'Please pick a target model';
                        },
                        choices: existingModels,
                    },
                ])
                .then(answers => {
                    if (answers.sourceModel === answers.targetModel) {
                        throw new Error(
                            'Source model and target model are the same!'
                        );
                    }

                    inquirerAnswers = answers;

                    let task;
                    let consoleMessages;
                    const sourceModelCapital = capitalize(
                        pluralize.singular(answers.sourceModel)
                    );
                    const targetModelCapital = capitalize(
                        pluralize.singular(answers.targetModel)
                    );
                    let timestamp =
                        parseInt(moment().format('YYYYMMDDHHmmss')) + 5;
                    if (answers.associationType === 'belongsTo') {
                        task = () => {
                            const fileName = `./src/db/migrations/${timestamp}-add-${
                                answers.targetModel
                            }-belongs-to-${answers.sourceModel}-association.js`;

                            consoleMessages = () =>
                                console.log(
                                    chalkPipe('orange.bold')(`
                        Please edit the folloging file: ./src/db/models/${
                            answers.sourceModel
                        }.js by adding the following:
                        -----------------------------------------
                        ${sourceModelCapital}.associate = models => {
                            // some associations.....
                            ${sourceModelCapital}.belongsTo(models.${targetModelCapital});
                        };
                        -----------------------------------------

                        Migration file created: ${fileName}

                        `)
                                );

                            return fs.writeFile(
                                fileName,
                                associationMigrationTemplate({
                                    sourceModel: answers.sourceModel,
                                    targetModel: answers.targetModel,
                                    associationType: answers.associationType,
                                })
                            );
                        };
                    } else if (answers.associationType === 'hasOne') {
                        task = () => {
                            const fileName = `./src/db/migrations/${timestamp}-add-${
                                answers.sourceModel
                            }-has-one-${answers.targetModel}-association.js`;
                            consoleMessages = () =>
                                console.log(
                                    chalkPipe('orange.bold')(`
                        Please edit the folloging file: ./src/db/models/${
                            answers.sourceModel
                        }.js by adding the following:
                        -----------------------------------------
                        ${sourceModelCapital}.associate = models => {
                            // some associations.....
                            ${sourceModelCapital}.hasOne(models.${targetModelCapital});
                        };
                        -----------------------------------------

                        Migration file created: ${fileName}

                        `)
                                );

                            return fs.writeFile(
                                fileName,
                                associationMigrationTemplate({
                                    sourceModel: answers.sourceModel,
                                    targetModel: answers.targetModel,
                                    associationType: answers.associationType,
                                })
                            );
                        };
                    } else if (answers.associationType === 'hasMany') {
                        task = () => {
                            const fileName = `./src/db/migrations/${timestamp}-add-${
                                answers.sourceModel
                            }-has-many-${answers.targetModel}-association.js`;

                            consoleMessages = () =>
                                console.log(
                                    chalkPipe('orange.bold')(`
                        Please edit the folloging file: ./src/db/models/${
                            answers.sourceModel
                        }.js by adding the following:
                        -----------------------------------------
                        
                        ${sourceModelCapital}.associate = models => {
                            // some associations.....
                            ${sourceModelCapital}.hasMany(models.${targetModelCapital});
                        };
                        -----------------------------------------

                        Migration file created: ${fileName}
                        
                        `)
                                );

                            return fs.writeFile(
                                fileName,
                                associationMigrationTemplate({
                                    sourceModel: answers.sourceModel,
                                    targetModel: answers.targetModel,
                                    associationType: answers.associationType,
                                })
                            );
                        };
                    } else if (answers.associationType === 'belongsToMany') {
                        task = () => {
                            const fileName = `./src/db/migrations/${timestamp}-add-${
                                answers.sourceModel
                            }-belongs-to-many-${
                                answers.targetModel
                            }-association.js`;

                            consoleMessages = () =>
                                console.log(
                                    chalkPipe('orange.bold')(`
                        Please edit the folloging file: ./src/db/models/${
                            answers.sourceModel
                        }.js by adding the following:
                        -----------------------------------------
                        ${sourceModelCapital}.associate = models => {
                            // some associations.....
                            ${sourceModelCapital}.hasMany(models.${targetModelCapital});
                        };
                        -----------------------------------------

                        Please edit the folloging file: ./src/db/models/${
                            answers.targetModel
                        }.js by adding the following:
                        -----------------------------------------
                        ${targetModelCapital}.associate = models => {
                            // some associations.....
                            ${targetModelCapital}.hasMany(models.${sourceModelCapital});
                        };
                        -----------------------------------------

                        Migration file created: ${fileName}
                        
                        `)
                                );

                            return fs.writeFile(
                                fileName,
                                associationMigrationTemplate({
                                    sourceModel: answers.sourceModel,
                                    targetModel: answers.targetModel,
                                    associationType: answers.associationType,
                                })
                            );
                        };
                    }

                    return new Listr([
                        {
                            title: 'Create migration file',
                            task: task,
                        },
                    ])
                        .run()
                        .then(() => {
                            consoleMessages();
                            return Promise.resolve(true);
                        });
                })
                .then(() => Promise.resolve(true));
        })
        .catch(e =>
            console.log(chalkPipe('bgRed.#cccccc')('ERROR!!', e.message))
        );
};

program
    .version('1.0.0')
    .name('expresso-machine-add-sequelize-migration')
    .usage('')
    .parse(process.argv);

initProject(program);
