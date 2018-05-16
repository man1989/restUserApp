const crypto  = require("crypto");
const jwt = require("jsonwebtoken");

module.exports = (cache) => {
    return (req, res, next)=>{
        let {username, password} = req.body;
        let user = cache.get(username);
        let isValid  = _hasValidPassword(password, user);
        if(isValid){
            res.status(200).send(user)
        }else{
            res.status(404).send("invalid username or password");
        }
        next();
    }
}

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