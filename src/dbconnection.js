const Sequelize = require('sequelize');
const config = require('./config.json');

const dbConnection = new Sequelize({
    dialect: 'sqlite',
    storage: config.db.sqlite.dbName,
    logging: config.db.sqlite.logging
});

module.exports = { dbConnection }