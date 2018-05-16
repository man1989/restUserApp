const config = require("../config");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const validate = require("../util/hashing");

module.exports = (express, cache) => {
    
    let router = express.Router();
    let safe = express.Router();

    safe.post("/register", (req, res, next) => {
        let user = req.body;
        let {username: id, password} = user;
        let hashObj = validate.getHashPassword(password, validate.getSalt());
        Object.assign(user, hashObj);
        cache.set(id, user);
        res.status(201).send("success");
        next();
    });

    safe.post("/login", function(req, res, next){
        let {username, password} = req.body;
        let user = cache.get(username);
        let isValid  = validate.isValidPassword(password, user);
        if(isValid){
            let token = jwt.sign({username: username}, config.SECRET_KEY);
            res.status(200).send({
                tokenId: token
            });
        }else{
            res.status(404).send("invalid username or password");
            console.log("authentication error");
        }
        next();
    });

    router.get("/user/:id", function(req, res, next){
        let {id} = req.params;
        let user = cache.get(id);
        res.status(200).send(user);
        next();
    });

    router.put("/user/:id", function(req, res, next){
        let {id} = req.params;
        let data = req.body;
        user = cache.get(id);
        Object.keys(data).forEach((key)=>{
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