let config = require("./config.js");

module.exports = require('knex')({
    client: 'mysql',
    connection: {
        host: config.db_host,
        user: config.db_username,
        password: config.db_password,
        port: config.db_port,
        database: config.db_name,
        timezone: 'GST',
        charset: 'utf8mb4'
    },
    useNullAsDefault: true,
    acquireConnectionTimeout: 300000
});