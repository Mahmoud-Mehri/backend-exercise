const Sequelize = require('sequelize');
const { Profile } = require('./profile.js');
// const { Job } = require('./job.js');
const { dbConnection } = require('../dbconnection.js');

const ContractStatus = {
    NEW: "new",
    INPROGRESS: "in_progress",
    TERMINATED: "terminated"
};

class Contract extends Sequelize.Model {}
Contract.init({
    terms: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM(Object.values(ContractStatus))
    }
}, {
    sequelize: dbConnection,
    modelName: 'Contract'
});

Profile.hasMany(Contract, { as: 'Contractor', foreignKey: 'ContractorId' });
Profile.hasMany(Contract, { as: 'Client', foreignKey: 'ClientId' });

// Contract.belongsTo(Profile, { as: 'Contractor' });
// Contract.belongsTo(Profile, { as: 'Client' });
// Contract.hasMany(Job);

module.exports = { Contract, ContractStatus }