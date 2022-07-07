const { profileController } = require('../controller/profile-controller.js');
const { resultObject, responseObject } = require('../model/general.js');

const controller = new profileController();

const profileAuthenticator = function(req, res, next) {
    const profileId = req.get('profile_id');
    if (profileId) {
        controller.getProfileById(profileId)
            .then((result) => {
                req.profile = result.data;
                next();
            })
            .catch((err) => {
                res.status(401).json(responseObject(err));
            })
    } else {
        res.status(401).json(responseObject(
            resultObject(false, "You doa't have permission!", 401)
        ));
    }
}

module.exports = { profileAuthenticator }