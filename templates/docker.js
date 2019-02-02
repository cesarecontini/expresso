module.exports = (opts) => {
    return `
FROM mhart/alpine-node:latest

RUN npm install && npm install -g nodemon

WORKDIR /src

COPY . . 
RUN npm install
EXPOSE 3000
`;
}