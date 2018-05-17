const crypto = require("crypto");

function _getHashPassword(password, salt){
    salt = salt || _getSalt();
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
module.exports = {
    getHashPassword: _getHashPassword,
    getSalt: _getSalt,
    isValidPassword: _hasValidPassword
}