
module.exports = opts => {
    return `

const settings = require('./settings');
const { port } = settings;
const app = require('./app');

app.listen(port, () => console.log('Example app listening on port', port));
`;
};
