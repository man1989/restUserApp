const crypto = require("crypto");
module.exports = (express, cache) => {
    let router = express.Router();
    router.post("/user", (req, res, next) => {
        let user = req.body;
        let {username: id, password} = user;
        let hashObj = _getHashPassword(password, _getSalt());
        Object.assign(user, hashObj);
        cache.set(id, user);
        res.status(201).send("success");
    });
    router.post("/user/login", function(req, res, next){
        console.log(req.body);
        let {username, password} = req.body;
        let user = cache.get(username);
        let isValid  = _hasValidPassword(password, user);
        if(isValid){
            res.status(200).send(user)
        }else{
            res.status(404).send("invalid username or password");
        }
    });
    router.get("/users/:id", function(req, res, next){
        let {id} = req.params;
        let user = cache.get(id);
        res.status(200).send(user);
    });

    router.put("/users/:id", function(req, res, next){
        let {id} = req.params;
        let data = req.body;
        user = cache.get(id);
        Object.keys(data).forEach((key)=>{
            user[key] = data[key];
        });
        cache.set(id, user);
        res.status(200).send("success")
    });

    function _getHashPassword(password, salt){
        let hashCode = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
        return {
            password: hashCode,
            salt: salt
        };
    };
    
    function _getSalt(){
        return crypto.randomBytes(10).toString("hex");
    };

    function _hasValidPassword(password, user){
        let {password: savedPassword, salt} = user;
        let hashObj = _getHashPassword(password, salt);
        return crypto.timingSafeEqual(Buffer.from(savedPassword), Buffer.from(hashObj.password));
    }

    return router;
}