const config     = require("./config");
const NodeCache  = require("node-cache");
const bodyPraser = require("body-parser");
const express    = require("express");
const publicRoute = require("./router/public");
const userRoute = require("./router/user");

let cache = new NodeCache( { checkperiod: 120 })
let authMiddleware = require("./middleware/authorization");
let publicRouteMiddleware = publicRoute(express, cache);
let userRouteMiddleware = userRoute(express, cache);

let app = express();

app.use(bodyPraser.json());
app.use(bodyPraser.urlencoded({extended: false}));

app.use("/api/v1", publicRouteMiddleware);
app.use("/api/v1/user", authMiddleware, userRouteMiddleware);

app.listen(config.PORT);