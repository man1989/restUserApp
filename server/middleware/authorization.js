const config = require("../config");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    let {"x-access-token": tokenId} = req.headers;
    try{
        let isValid = tokenId && jwt.verify(tokenId, config.SECRET_KEY);
        if(isValid){
            return next();
        }else{
            throw new Error("invalid token");
        }
    }catch(err){
        console.error(err);
        return res.status(401).send("not authorized");
    }
}