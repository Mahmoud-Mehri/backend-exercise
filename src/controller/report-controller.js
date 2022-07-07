const { Profile } = require('../model/profile.js');
const { Contract } = require('../model/contract.js');
const { Job } = require('../model/job.js');
const { resultObject, ErrorWithCode } = require('../model/general.js');
const { dbConnection } = require('../dbconnection.js');
const { Op } = require('sequelize');

const reportController = function() {

    this.db = dbConnection;

    this.getBestProfession = (startDate, endDate) => {
        return new Promise(async(resolve, reject) => {
            try {
                const report = await Profile.findAll({
                    attributes: [
                        'profession', [this.db.fn(
                                'sum', this.db.col('`Contractor->Jobs`.`price`')
                            ),
                            'total'
                        ]
                    ],
                    where: {
                        '$Contractor->Jobs.paid$': true,
                        '$Contractor->Jobs.paymentDate$': {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    include: {
                        model: Contract,
                        as: 'Contractor',
                        attributes: [],
                        include: {
                            model: Job,
                            attributes: []
                        }
                    },
                    group: ['profession'],
                    order: [
                        [this.db.fn(
                                'sum', this.db.col('`Contractor->Jobs`.`price`')),
                            'DESC'
                        ]
                    ],
                    limit: 1,
                    subQuery: false
                })

                resolve(
                    resultObject(true, report)
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

    this.getBestClients = (startDate, endDate, countLimit) => {
        return new Promise(async(resolve, reject) => {
            try {
                const report = await Profile.findAll({
                    attributes: [
                        'id', [this.db.literal("firstName || ' ' || lastName"),
                            'fullname'
                        ],
                        [this.db.fn(
                                'sum',
                                this.db.col('`Client->Jobs`.`price`')),
                            'paid'
                        ]
                    ],
                    where: {
                        '$Client->Jobs.paid$': true,
                        ...((startDate && endDate) ? {
                            '$Client->Jobs.paymentDate$': {
                                [Op.between]: [startDate, endDate]
                            }
                        } : {})
                    },
                    include: {
                        model: Contract,
                        as: 'Client',
                        attributes: [],
                        include: {
                            model: Job,
                            attributes: []
                        }
                    },
                    group: [this.db.col('`Profile`.`id`')],
                    order: [
                        [this.db.fn(
                                'sum',
                                this.db.col('`Client->Jobs`.`price`')),
                            'DESC'
                        ]
                    ],
                    ...(countLimit ? {
                        limit: countLimit,
                        subQuery: false
                    } : {})
                })

                resolve(
                    resultObject(true, report)
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


module.exports = { reportController }