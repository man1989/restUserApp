const config = require("../config");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const validate = require("../util/hashing");

module.exports = (express) => {

    let router = express.Router();
    let User = require("../model/User");

    router.post("/user", (req, res, next) => {
        let { username: id, password } = req.body;
        let user = User.create(req.body);
        if(User.exists(id)){
            return res.status(422).send({
                message: "Already registered"
            });
        }
        User.save(user);
        res.status(201).send({
            message: "success"
        });
        next();
    });

    router.post("/user/login", function (req, res, next) {
        let { username, password } = req.body;
        let user = User.getInstance(username);
        if(!user.exists()){
            return res.status(404).send({
                message: "please register first"
            });
        }
        let isValid = user.hasValidPassword(password);
        let userData = user.data;
        if (isValid) {
            let timeLeft = user.checkValidAttempt();
            if (timeLeft >= 0) {
                return res.status(403).send({
                    message: "You will able to login after",
                    secondsLeft: Math.round(timeLeft / 1000)
                });
            }
            let token = user.getToken();
            res.status(200).send({
                tokenId: token
            });
        } else {
            user.setInvalidAttempts();
            res.status(404).send({
                message: "invalid username or password",
                left: user.data.attempts.left
            });
        }
        next();
    });

    return router;
}