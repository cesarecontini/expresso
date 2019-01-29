module.exports = (opts) => {
    return `
{
    "name": "cli-app-test",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
        "test": "echo \\"Error: no test specified\\" && exit 1",
        "init": "npm install"
    },
    "author": "",
    "license": "ISC",
    "dependencies": {
        "chalk-pipe": "^2.0.0",
        "commander": "^2.19.0",
        "express": "^4.16.4",
        "fs-extra": "^7.0.1",
        "helmet": "^3.15.0",
        "rmdir": "^1.2.0"
    }
}
    `;
}