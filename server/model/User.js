const config = require("../config");
const crypto = require("crypto");
const NodeCache = require("node-cache");
const uuid = require("uuid/v1");
const jwt = require("jsonwebtoken");
const TOTAL_VALID_ATTEMPT = 3;

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
    console.log(password, hashObj, savedPassword);
    return crypto.timingSafeEqual(Buffer.from(savedPassword), Buffer.from(hashObj.password));    
}

User.prototype.getToken = function(){
    //expires in 5min
    let id = this.get("username");
    return jwt.sign({ data: id }, config.SECRET_KEY, { "expiresIn": 5 * 60 });
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

User.xrespond = function (code, message) {
    this.response.send(code).send(message);
}

module.exports = (cache) => {
    User.cache = cache || new NodeCache({ checkperiod: 120 });
    return User;
}