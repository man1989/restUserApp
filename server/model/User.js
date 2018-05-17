const config = require("../config");
const crypto = require("crypto");
const NodeCache = require("node-cache");
const uuid = require("uuid/v1");
const jwt = require("jsonwebtoken");
const TOKEN_EXPIRE_TIME = (5 * 60) //5min;
const TOTAL_VALID_ATTEMPT = 3;
const LOCK_PERIOD = (1000*60) //1min

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

function User(data) {
    this.data = data;
}

User.create = function(data){
    data.id = uuid();
    let hashObj = _getHashPassword(data.password, _getSalt());
    Object.assign(data, hashObj); 
    return new User(data)
}

User.getInstance =  function(id) {
    let data = this.find(id);
    return new User(data);
}

User.prototype.get = function(key){
    return this.data[key]
}

User.prototype.exists = function () {
    let id = this.get("username");
    return !!User.find(id);
}

User.prototype.hasValidPassword = function (password){
    let {password: savedPassword, salt} = this.data;
    let hashObj = _getHashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(savedPassword), Buffer.from(hashObj.password));    
}
User.prototype.ApplyLock = function(){
    this.data.attempts.lock = new Date().getTime() + LOCK_PERIOD;
}

User.prototype.setInvalidAttempts = function(){
    let user = this.data;
    let {attempts = { left: 3 }} = user;
    if (attempts.left === 1) {
        attempts.left = --attempts.left
        this.ApplyLock();
    } else {
        attempts.left = --attempts.left
    }
    this.data.attempts = attempts;
    User.save(this);
}

User.prototype.checkValidAttempt = function(){
    let now = new Date().getTime();
    let attempts = this.data.attempts || {lock:0};
    return (attempts.lock - now);
}

User.prototype.getToken = function(){
    let id = this.get("username");
    return jwt.sign({ data: id }, config.SECRET_KEY, { "expiresIn":  TOKEN_EXPIRE_TIME});
}

User.prototype.getId = function(){
    return this.data.username;
}

User.save = function (user) {
    let userId = user.getId();
    this.cache.set(userId, user.data);
    return this.find(userId);
}


User.find = function (id) {
    let data = this.cache.get(id);
    return data;
}

User.delete = function (id) {
    this.cache.del(id);
}

User.update = function (id, payload) {
    let user = this.find(id);
    Object.keys(payload).forEach((key) => {
        user[key] = payload[key];
    });
    this.cache.set(id, user);
}

User.exists = function (id) {
    return !!this.cache.get(id)
}

User.cache = new NodeCache({ checkperiod: 120 });

module.exports = User;