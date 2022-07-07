const { Router } = require('express');

const { contractController } = require('../controller/contract-controller.js');
const { ContractStatus } = require('../model/contract.js');
const { responseObject } = require('../model/general.js');

const controller = new contractController();

const contractRouter = Router();

contractRouter.get('/', (req, res) => {
    const includeJobs = !(req.query['include-jobs'] === 'false');
    controller.getProfileContracts(
            req.profile.id,
            true,
            true, [
                ContractStatus.NEW,
                ContractStatus.INPROGRESS
            ],
            includeJobs
        )
        .then((result) => {
            res.status(result.status).json(responseObject(result));
        })
        .catch((err) => {
            res.status(err.status).json(responseObject(err));
        });
})

contractRouter.get('/:id', (req, res) => {
    const includeJobs = !(req.query['include-jobs'] === 'false');
    controller.getContractById(req.params.id, req.profile.id, includeJobs)
        .then((result) => {
            res.status(result.status).json(responseObject(result));
        })
        .catch((err) => {
            res.status(err.status).json(responseObject(err));
        });
})

module.exports = { contractRouter }