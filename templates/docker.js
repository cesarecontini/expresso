module.exports = () => {
    return `
FROM mhart/alpine-node:11.9.0

RUN npm install - g nodemon
RUN npm install - g npx
RUN npx npm - check - updates--packageFile / src / package.json
RUN npx npm - check - updates - a--packageFile / src / package.json
RUN yarn install--debug


WORKDIR /src

COPY . . 
RUN npm install
EXPOSE 3000 9229
`;
};
