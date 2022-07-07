const { Op } = require('sequelize');

const { Profile } = require('../model/profile.js');
const { Contract } = require('../model/contract.js');
const { Job } = require('../model/job.js');
const { resultObject, ErrorWithCode } = require('../model/general.js');
const { dbConnection } = require('../dbconnection.js');

const profileController = function() {

    this.db = dbConnection;

    this.getProfileById = (id, includeContracts = false) => {
        return new Promise(async(resolve, reject) => {
            try {
                if (!id)
                    throw new ErrorWithCode(`Profile Id required!`, 200);

                const profile = await Profile.findOne({
                    where: { id: id },
                    include: (includeContracts ? [{
                        model: Contract,
                        include: [{
                            model: Job
                        }]
                    }] : [])
                })

                if (!profile)
                    throw new ErrorWithCode("Profile not found!", 200);
                resolve(
                    resultObject(true, profile)
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

    this.depositBalance = (profileId, value) => {
        return new Promise(async(resolve, reject) => {
            try {
                const profile = await Profile.findOne({
                    attributes: ['id', 'balance', [this.db.fn(
                            'sum',
                            this.db.col('`Client->Jobs`.`price`')),
                        'unpaid'
                    ]],
                    where: {
                        id: profileId,
                    },
                    include: [{
                        model: Contract,
                        as: 'Client',
                        attributes: [],
                        include: [{
                            model: Job,
                            attributes: [],
                            where: {
                                [Op.or]: [{ paid: null }, { paid: false }]
                            }
                        }]
                    }],
                    group: [this.db.col('`Profile`.`id`')]
                });

                if (!profile)
                    throw new ErrorWithCode("Profile is not valid!");

                const currentBalance = profile.dataValues.balance;
                const quarterValue = Math.trunc(profile.dataValues.unpaid / 4);
                if ((value + currentBalance > quarterValue))
                    throw new ErrorWithCode("You have exeeded your deposit limit," +
                        `the maximum value you add to your balance is: ${quarterValue - currentBalance}`, 200);

                const [affectedRows] = await Profile.update({ balance: this.db.literal(`${value} + balance`) }, { where: { id: profileId } })
                if (affectedRows == 0)
                    throw new ErrorWithCode("Profile info not found for update!", 200);

                resolve(
                    resultObject(true, "Deposit added to your balance successfully")
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


module.exports = { profileController }