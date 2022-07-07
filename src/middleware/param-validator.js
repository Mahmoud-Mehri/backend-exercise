const { isValidDate, isNumeric } = require('../model/general.js');

const paramValidator = function(req, res, next) {
    if (req.query['start'] !== undefined && isValidDate(req.query['start']))
        req.startDate = new Date(req.query['start']);
    if (req.query['end'] !== undefined && isValidDate(req.query['end']))
        req.endDate = new Date(req.query['end']);
    if (req.startDate && (!req.endDate)) {
        req.endDate = new Date();
    }

    if (req.query['limit'] !== undefined && isNumeric(req.query['limit']))
        req.countLimit = parseInt(req.query['limit']);

    next()
}

module.exports = { paramValidator }