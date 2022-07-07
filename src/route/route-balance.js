const { Router } = require('express');

const { profileController } = require('../controller/profile-controller.js');
const { resultObject, responseObject } = require('../model/general.js');

const controller = new profileController();

const balanceRouter = Router();

balanceRouter.post('/deposit/:userId', (req, res) => {
    const value = req.body.value;
    if (!value) {
        return res.status(400).json(responseObject(
            resultObject(false, "Bad Request: Field 'value' is not provided")
        ));
    }

    controller.depositBalance(req.params.userId, value)
        .then((result) => {
            res.status(result.status).json(responseObject(result));
        })
        .catch((err) => {
            res.status(err.status).json(responseObject(err));
        });
})

module.exports = { balanceRouter }