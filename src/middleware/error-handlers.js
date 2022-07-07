const { responseObject, resultObject } = require('../model/general.js');

const catch404 = function(req, res, next) {
    next({ status: 404 });
}

const errorHandler = function(err, req, res, next) {
    if (err.status === 404)
        res.status(404).json(responseObject(
            resultObject(false, "Resource Not Found", 404)
        ))
    else {
        // console.log(err);
        res.status(500).json(responseObject(
            resultObject(false, "Internal Server Error", 500)
        ))
    }
}

module.exports = { catch404, errorHandler }