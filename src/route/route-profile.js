const { Router } = require('express');

const { profileController } = require('../controller/profile-controller.js');
const { responseObject } = require('../model/general.js');

const controller = new profileController();

const profileRouter = Router();

profileRouter.get('/:id', (req, res) => {
    const includeContracts = (req.query['include-contracts'] === 'true');
    controller.getProfileById(req.params.id, includeContracts)
        .then((result) => {
            res.status(result.status).json(responseObject(result));
        })
        .catch((err) => {
            res.status(err.status).json(responseObject(err));
        });
})

module.exports = { profileRouter }