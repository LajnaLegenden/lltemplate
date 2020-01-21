#!/usr/bin/env node

let inquirer = require('inquirer');
let fs = require('fs');
let path = require('path');
let shell = require('shelljs');
let chalk = require('chalk')
let yargs = require('yargs');
let template = require('./modules/hbsCompile')

const SKIP_FILES = ['node_modules', '.template.json'];
const CHOICES = fs.readdirSync(path.join(__dirname, 'templates'));
const CURR_DIR = process.cwd();

const QUESTIONS = [
    {
        name: 'template',
        type: 'list',
        message: 'What project template would you like to generate?',
        choices: CHOICES,
        when: () => !yargs.argv['template']
    },
    {
        name: 'name',
        type: 'input',
        message: 'Project name:',
        when: () => !yargs.argv['name'],
        validate: (input) => {
            if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
            else return 'Project name may only include letters, numbers, underscores and hashes.';
        }
    }
];

inquirer.prompt(QUESTIONS).then((answers) => {

    answers = Object.assign({}, answers, yargs.argv);

    let templatePath = path.join(__dirname, 'templates', answers['template']);
    let targetPath = path.join(CURR_DIR, answers['name']);
    let config = getTemplateConfig(templatePath);

    if (!createProject(targetPath)) {
        return;
    }

    createDirectoryContents(templatePath, answers["name"], { name: answers["name"] });
    config.templatePath = templatePath;
    config.targetPath = targetPath;
    if (!postProcess(config)) {
        return;
    }

    showMessage(config.postInstall.message);
    return;

})

function showMessage(message) {
    for (let i in message) {
        console.log(chalk.green(message[i]))
    }
}

function postProcess(options) {
    if (isNode(options)) {
        return postProcessNode(options);
    }

    //Add suppoer for ore pors tproess etxc php
    return true;
}

function isNode(options) {
    return fs.existsSync(path.join(options.templatePath, 'package.json'));
}

function postProcessNode(options) {
    shell.cd(options.targetPath);

    let cmd = '';

    if (shell.which('yarn')) {
        cmd = 'yarn';
    } else if (shell.which('npm')) {
        cmd = 'npm install';
    }

    if (cmd) {
        const result = shell.exec(cmd);

        if (result.code !== 0) {
            return false;
        }
    } else {
        console.log(chalk.red('No yarn or npm found. Cannot run installation.'));
    }

    return true;
}




function createProject(projectPath) {
    if (fs.existsSync(projectPath)) {
        console.log(chalk.red(`Folder ${projectPath} exists. Delete or use another name.`));
        return false;
    }

    fs.mkdirSync(projectPath);
    return true;
}


function getTemplateConfig(templatePath) {
    const configPath = path.join(templatePath, 'template.json');

    if (!fs.existsSync(configPath)) return {};

    const templateConfigContent = fs.readFileSync(configPath);

    if (templateConfigContent) {
        return JSON.parse(templateConfigContent.toString());
    }

    return {};
}
function createDirectoryContents(templatePath, projectName, data) {
    const filesToCreate = fs.readdirSync(templatePath);

    filesToCreate.forEach(file => {
        const origFilePath = path.join(templatePath, file);

        // get stats about the current file
        const stats = fs.statSync(origFilePath);

        if (SKIP_FILES.indexOf(file) > -1) return;

        if (stats.isFile()) {
            let contents = fs.readFileSync(origFilePath, 'utf8');

            contents = template(contents, data);

            const writePath = path.join(CURR_DIR, projectName, file);
            fs.writeFileSync(writePath, contents, 'utf8');
        } else if (stats.isDirectory()) {
            fs.mkdirSync(path.join(CURR_DIR, projectName, file));

            // recursive call
            createDirectoryContents(path.join(templatePath, file), path.join(projectName, file), data);
        }
    });
}