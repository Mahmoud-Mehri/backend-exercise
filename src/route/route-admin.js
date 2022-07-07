const { Router } = require('express');

const { reportController } = require('../controller/report-controller.js');
const { responseObject } = require('../model/general.js');

const controller = new reportController();

const adminRouter = Router();

adminRouter.get('/best-profession', (req, res) => {
    controller.getBestProfession(req.startDate, req.endDate)
        .then((result) => {
            res.status(result.status).json(responseObject(result));
        })
        .catch((err) => {
            res.status(err.status).json(responseObject(err));
        });
})

adminRouter.get('/best-clients', (req, res) => {
    controller.getBestClients(req.startDate, req.endDate, req.countLimit)
        .then((result) => {
            res.status(result.status).json(responseObject(result));
        })
        .catch((err) => {
            res.status(err.status).json(responseObject(err));
        });
})


module.exports = { adminRouter }