const config = require("../config");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const validate = require("../util/hashing");

module.exports = (express, cache) => {

    let router = express.Router();
    let safe = express.Router();

    safe.post("/register", (req, res, next) => {
        let user = req.body;
        let { username: id, password } = user;
        let hashObj = validate.getHashPassword(password, validate.getSalt());
        Object.assign(user, hashObj);
        cache.set(id, user);
        res.status(201).send("success");
        next();
    });

    safe.post("/login", function (req, res, next) {
        let { username, password } = req.body;
        let user = cache.get(username);
        let isValid = validate.isValidPassword(password, user);
        if (isValid) {
            let now = new Date().getTime();
            if (!_isValidAttempt(user, now)) {
                return res.status(403).send({
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

    router.get("/:id", function (req, res, next) {
        let { id } = req.params;
        let user = cache.get(id);
        res.status(200).send(user);
        next();
    });

    router.put("/:id", function (req, res, next) {
        let { id } = req.params;
        let data = req.body;
        user = cache.get(id);
        Object.keys(data).forEach((key) => {
            user[key] = data[key];
        });
        cache.set(id, user);
        res.status(200).send("success")
        next();
    });

    return {
        protected: router,
        unprotected: safe
    };
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