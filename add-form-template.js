#!/usr/bin/env node

const program = require('commander');
const chalkPipe = require('chalk-pipe');
const Listr = require('listr');
const figlet = require('figlet');
const nunjucks = require('nunjucks');
const beautifyHtml = require('js-beautify').html;
const S = require('string');
const cliUtils = require('./utils/cli-utils');

const getFieldsArray = elementsUserInput => {
    const elements = S(elementsUserInput).stripLeft(',');
    const fields = [];
    elements.forEach(element => {
        if (S(element).contains('|')) {
            const bits = S(element).splitLeft('|');
            const field = {};
            let type;
            let id;
            let label;
            let helpText;
            let options;
            if (bits.length === 2) {
                [type, id] = bits;
                field.type = type;
                field.id = S(id).dasherize().s;
                field.label = S(id).humanize().s;
            }

            fields.push(field);
        }
    });
};

const getHtml = fieldsArray => {
    const html = nunjucks.render(
        './.expresso-machine/form-library/get-form.html',
        {
            fields: [
                {
                    type: 'text',
                    id: 'name',
                    label: 'Name',
                    helpText: 'Some help please',
                },
                {
                    type: 'text',
                    id: 'fox',
                    label: 'Fox',
                },
            ],
        }
    );
    console.log(beautifyHtml(html.replace(/\n\s*\n\s*\n/g, '\n\n')));
};

program
    .version('0.1.0')
    .name('expresso-machine-add-form-template')
    .usage('-f /some/path l- product,category')
    .option(
        '-f, --formAction <formAction>',
        'Sets the form action to <formAction>'
    )
    .option(
        '-m, --method [method]',
        'Enter the form [method] you would like to use: post, delete, put or get',
        'post'
    )
    .option(
        '-e, --elements <formElements>',
        'A list form elements <formElements>, comma-separated [element type]|[label camelcase name] list i.e. text|firstName,text|lastName'
    )
    .option('-a, --about', 'About expresso-machine-add-form-template cli')
    .parse(process.argv);

if (program.about) {
    figlet(`em-add-form-template`, (err, data) => {
        if (err) {
            console.log('Something went wrong');
            console.dir(err);
            return;
        }
        console.log(chalkPipe('orange.bold')(''));
        console.log(chalkPipe('orange.bold')('Create a form instantly!'));
        console.log(chalkPipe('orange.bold')(data));
        console.log(chalkPipe('orange.bold')(''));
        console.log(chalkPipe('orange.bold')('(c) 2019 Cesare Giani Contini'));
        console.log(chalkPipe('orange.bold')('\n'));
    });
}

console.log(program);
