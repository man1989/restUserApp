const config = require("../config");
const hash = require("../util/hashing");
const crypto = require("crypto");
const NodeCache = require("node-cache");
const uuid = require("uuid/v1");
const jwt = require("jsonwebtoken");

const TOKEN_EXPIRE_TIME = (5 * 60) //5min;
const TOTAL_VALID_ATTEMPT = 3;
const LOCK_PERIOD = (1000*60) //1min

function User(data) {
    this.data = data;
}

User.create = function(data){
    data.id = uuid();
    let hashObj = hash.getHashPassword(data.password);
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
    return hash.isValidPassword(password, this.data);
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