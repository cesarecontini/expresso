module.exports = (opts) => {
return `
module.exports = {
    port: ${opts.port},
    dbDialect: ${opts.dbDialect || '\'\''},
    dbConnectionString: ${opts.dbConnectionString || '\'\''},
}    
`; 
} 