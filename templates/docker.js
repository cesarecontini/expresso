module.exports = () => {
    return `
FROM mhart/alpine-node:11.9.0

WORKDIR /src

RUN npm install -g nodemon
RUN npm install -g npx
RUN pwd && ls
RUN yarn

COPY . . 

EXPOSE 3000 9229
`;
};
