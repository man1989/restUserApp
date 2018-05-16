const config = require("../config");
const validation  = require("../util/hashing");
const jwt = require("jsonwebtoken");

module.exports = (cache) => {
    return (req, res, next) => {
        console.log("authenticating.....");
        let {"x-access-token": tokenId} = req.headers;
        let isValid = tokenId && jwt.verify(tokenId, config.SECRET_KEY);
        if(isValid){
            console.log("you are good");
            return next();
        }
        return res.status(401).send("not authorized");
    }
}