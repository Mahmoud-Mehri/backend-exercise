const { Op } = require('sequelize');

const { Contract, ContractStatus } = require('../model/contract.js');
const { Job } = require('../model/job.js');
const { Profile } = require('../model/profile.js')
const { resultObject, ErrorWithCode } = require('../model/general.js');
const { dbConnection } = require('../dbconnection.js');

const contractController = function() {

    this.db = dbConnection;

    this.getContractById = (id, profileId = 0, includeJobs = true) => {
        return new Promise(async(resolve, reject) => {
            try {
                if (!id)
                    throw new ErrorWithCode(`Contract Id required!`, 200);

                const contract = await Contract.findOne({
                    where: {
                        id: id,
                    },
                    include: includeJobs ? [{ model: Job }] : []
                });

                if (!contract)
                    throw new ErrorWithCode("Contract not found!", 200);

                if (profileId > 0) {
                    if (!(contract.ContractorId === profileId || contract.ClientId === profileId))
                        throw new ErrorWithCode("You don't have permission to retrieve this contract", 403);
                }

                resolve(
                    resultObject(true, contract)
                );

            } catch (err) {
                if (!err.code) {
                    // Logging err.message ...

                    err.code = 500;
                    err.message = "Internal Server Error"
                }

                reject(
                    resultObject(false, err.message, err.code)
                );
            }
        })
    }

    this.getProfileContracts = (
        profileId,
        contractor = true,
        client = true,
        cStatus = [],
        includeJobs = true
    ) => {
        return new Promise(async(resolve, reject) => {
            try {
                const contracts = await Contract.findAll({
                    where: {
                        [Op.or]: [
                            (contractor ? { ContractorId: profileId } : {}),
                            (client ? { ClientId: profileId } : {})
                        ],
                        ...((cStatus.length > 0) ? {
                            status: {
                                [Op.in]: cStatus
                            }
                        } : {})
                    },
                    include: includeJobs ? [{ model: Job }] : []
                });

                resolve(
                    resultObject(true, contracts)
                );

            } catch (err) {
                if (!err.code) {
                    // Logging err.message ...

                    err.code = 500;
                    err.message = "Internal Server Error"
                }

                reject(
                    resultObject(false, err.message, err.code)
                );
            }
        })
    }
}

module.exports = { contractController }