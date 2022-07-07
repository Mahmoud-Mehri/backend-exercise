const { Job } = require('../model/job.js');
const { resultObject, ErrorWithCode } = require('../model/general.js');
const { dbConnection } = require('../dbconnection.js');
const { Contract } = require('../model/contract.js');
const { Profile } = require('../model/profile.js');
const { Op } = require('sequelize');

const jobController = function() {

    this.db = dbConnection;

    this.getJobById = (id) => {
        return new Promise(async(resolve, reject) => {
            try {
                if (!id)
                    throw new ErrorWithCode(`Job Id required!`, 200);

                const job = await Job.findOne({ where: { id: id } });
                if (!job)
                    throw new ErrorWithCode("Job not found!", 200);

                resolve(
                    resultObject(true, job.dataValues)
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

    this.getProfileUnpaidJobs = (
        profileId,
        contractor = true,
        client = true,
        cStatus = []
    ) => {
        return new Promise(async(resolve, reject) => {
            try {
                // const [jobs, metaData] = await this.db.query()
                const jobs = await Job.findAll({
                    where: {
                        paid: {
                            [Op.or]: {
                                [Op.is]: null,
                                [Op.eq]: false
                            }
                        },
                        [Op.or]: [
                            (contractor ? { '$Contract.ContractorId$': profileId } : {}),
                            (client ? { '$Contract.ClientId$': profileId } : {})
                        ],
                        ...((cStatus.length > 0) ? {
                            '$Contract.status$': {
                                [Op.in]: cStatus
                            }
                        } : {})
                    },
                    include: [{
                        model: Contract,
                        attributes: []
                    }]
                });

                resolve(
                    resultObject(true, jobs)
                );

            } catch (err) {
                console.log(err);
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

    this.payForJob = (profileId, jobId) => {
        return new Promise(async(resolve, reject) => {
            let trans;
            try {
                const profile = await Profile.findOne({
                    where: { id: profileId }
                });
                if (!profile)
                    throw new ErrorWithCode("Profile Id is not valid", 200);

                const job = await Job.findOne({
                    where: { id: jobId }
                });
                if (!job)
                    throw new ErrorWithCode("Job Id is not valid", 200);

                const contract = await Contract.findOne({
                    where: { id: job.dataValues.ContractId }
                });

                if (contract.dataValues.ClientId != profileId)
                    throw new ErrorWithCode("You're not the Client of this contract!", 200);

                const value = job.dataValues.price;
                if (profile.dataValues.balance < value)
                    throw new ErrorWithCode("You don't have enough balance to pay for this Job", 200)

                const contractorId = contract.dataValues.ContractorId;

                trans = await this.db.transaction();
                await Profile.update({ // Update Client
                    balance: this.db.literal(`balance - ${value}`)
                }, {
                    where: { id: profileId },
                    transaction: trans
                });
                await Profile.update({ // Update Contractor
                    balance: this.db.literal(`balance + ${value}`)
                }, {
                    where: { id: contractorId },
                    transaction: trans
                });
                await Job.update({ // Update Job Info
                    paid: true,
                    paymentDate: new Date()
                }, {
                    where: { id: jobId },
                    transaction: trans
                });
                await trans.commit();
                resolve(
                    resultObject(true, "Payment done sucessfully")
                );
            } catch (err) {
                if (trans)
                    trans.rollback();

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

module.exports = { jobController }