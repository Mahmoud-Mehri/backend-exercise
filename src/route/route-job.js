const { Router } = require('express');

const { jobController } = require('../controller/job-controller.js');
const { ContractStatus } = require('../model/contract.js');
const { responseObject } = require('../model/general.js');

const controller = new jobController();

const jobRouter = Router();

jobRouter.get('/unpaid', (req, res) => {
    controller.getProfileUnpaidJobs(
            req.profile.id,
            true,
            true, [
                // ContractStatus.NEW,
                ContractStatus.INPROGRESS
            ]
        )
        .then((result) => {
            res.status(result.status).json(responseObject(result));
        })
        .catch((err) => {
            res.status(err.status).json(responseObject(err));
        });
})

jobRouter.get('/:id', (req, res) => {
    controller.getJobById(req.params.id)
        .then((result) => {
            res.status(result.status).json(responseObject(result));
        })
        .catch((err) => {
            res.status(err.status).json(responseObject(err));
        });
})

jobRouter.post('/:job_id/pay', (req, res) => {
    const profileId = req.get('profile_id');
    controller.payForJob(profileId, req.params.job_id)
        .then((result) => {
            res.status(result.status).json(responseObject(result));
        })
        .catch((err) => {
            res.status(err.status).json(responseObject(err));
        });
})

module.exports = { jobRouter }