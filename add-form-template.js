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
    const elements = S(elementsUserInput).splitLeft(',');
    const fields = [];
    elements.forEach(element => {
        if (S(element).contains('|')) {
            const bits = S(element).splitLeft('|');
            const field = {};
            const [type, id, helpText, options] = bits;
            field.type = type;
            field.id = S(id).dasherize().s;
            field.label = S(id).humanize().s;
            if (helpText) field.helpText = S(helpText).humanize().s;
            if (options) field.options = S(options).splitLeft(':');
            fields.push(field);
        }
    });
    console.log('fields________', fields)
    return fields;
};

const getHtml = opts => {
    const html = nunjucks.render(
        './.expresso-machine/form-library/get-form.html',
        {
            action: opts.formAction,
            method: opts.method,
            fields: opts.elements,
        }
    );
    console.log(beautifyHtml(html.replace(/\n\s*\n\s*\n/g, '\n\n')));
};

program
    .version('0.1.0')
    .name('expresso-machine-add-form-template')
    .usage(
        '-f /some/path -m post -e "text|firstName|Please enter your first name,text|lastName,radio|gender|male:female"'
    )
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

if (program.formAction && program.method && program.elements) {
    getHtml({
        formAction: program.formAction,
        method: program.method,
        elements: getFieldsArray(program.elements),
    });
}

// console.log(program);
// console.log(getFieldsArray(program.elements));
