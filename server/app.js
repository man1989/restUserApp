const config = require("./config");
const NodeCache = require("node-cache");
const bodyPraser = require("body-parser");
const express = require("express");
let cache = new NodeCache( { checkperiod: 120 })
let authMiddleware = require("./middleware/authorization")(cache);
let router = require("./router/user")(express, cache);
let app = express();

app.use(bodyPraser.json());
app.use(bodyPraser.urlencoded({extended: false}));
app.use("/api/v1", authMiddleware)
app.use("/api/v1", router);
app.listen(config.PORT);