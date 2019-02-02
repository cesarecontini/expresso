
const DB_DIALECT_MYSQL = 'mysql';
const DB_DIALECT_POSTGRES = 'postgres';

module.exports = (opts) => {

if(opts.dbDialect === DB_DIALECT_MYSQL) {
return `
version: '3'
services: 
    web:
        build: .
        volumes: 
            - ".:/src"
        command: npm start
        container_name: ${opts.projectName}_web_1
        ports:
            - "${opts.port}:3000"
        environment: 
            DATABASE_URL: mysql://mysql:password@db:3306/mysql
            NODE_ENV: development
    db:
        image: mysql
        command: --default-authentication-plugin=mysql_native_password
        restart: always
        environment:
            MYSQL_ROOT_PASSWORD: password
            MYSQL_DATABASE: mysql
            MYSQL_USER: mysql
            MYSQL_PASSWORD: password
        ports:
            - ${opts.dbPort}:3306
    adminer:
        image: adminer
        restart: always
        ports:
            - 8080:8080`;
} else if (opts.dbDialect === DB_DIALECT_POSTGRES) {
return `
version: '3'
services: 
    web:
        build: .
        volumes: 
            - ".:/src"
        command: npm start
        container_name: ${opts.projectName}_web_1
        ports:
            - "${opts.port}:3000"
        environment: 
            DATABASE_URL: postgres://postgres:password@db:5432/postgres
            NODE_ENV: development
    db:
        image: postgres
        restart: always
        environment: 
            POSTGRES_PASSWORD: password
        ports: 
            - ${opts.dbPort}:5432
    pgadmin:
        image: dpage/pgadmin4
        ports: 
            - 80:80
        restart: unless-stopped
        environment: 
            PGADMIN_DEFAULT_EMAIL: user@user.com
            PGADMIN_DEFAULT_PASSWORD: password`;
}

}