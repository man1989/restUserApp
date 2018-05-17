const config = require("../config");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const validate = require("../util/hashing");

module.exports = (express, cache) => {

    let router = express.Router();

    router.post("/register", (req, res, next) => {
        let user = req.body;
        let { username: id, password } = user;
        let alreadyExists = cache.get(id);
        if(alreadyExists){
            return res.status(422).send({
                message: "Already registered"
            });
        }
        let hashObj = validate.getHashPassword(password, validate.getSalt());
        Object.assign(user, hashObj);
        cache.set(id, user);
        res.status(201).send({
            message: "success"
        });
        next();
    });

    router.post("/login", function (req, res, next) {
        let { username, password } = req.body;
        let user = cache.get(username);
        if(!user){
            return res.status(404).send({
                message: "please register first"
            })
        }
        let isValid = validate.isValidPassword(password, user);
        if (isValid) {
            let now = new Date().getTime();
            if (!_isValidAttempt(user, now)) {
                return res.status(403).send({
                    message: "You will able to login after",
                    secondsLeft: Math.round((user.attempts.lock - now) / 1000)
                });
            }
            let token = jwt.sign({ data: username }, config.SECRET_KEY, { "expiresIn": 5 * 60 }); //5min
            res.status(200).send({
                tokenId: token
            });
        } else {
            _setInvalidAttempt(user);
            cache.set(username, user);
            res.status(404).send({
                message: "invalid username or password",
                left: user.attempts.left
            });
        }
        next();
    });

    return router;
}
function alreadyExisys(cache){

}
function _isValidAttempt(user, now) {
    let attempts = user.attempts || {};
    return attempts.lock ? now > attempts.lock : true;
}

function _setInvalidAttempt(user) {
    let attempts = user.attempts || { left: 3 };
    if (attempts.left === 1) {
        attempts.left = --attempts.left
        attempts.lock = new Date().getTime() + (1000 * 60);
    } else {
        attempts.left = --attempts.left
    }
    user.attempts = attempts;
}