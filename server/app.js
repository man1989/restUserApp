const config     = require("./config");
const bodyPraser = require("body-parser");
const express    = require("express");
const publicRoute = require("./router/public");
const userRoute = require("./router/user");

let authMiddleware = require("./middleware/authorization");
let publicRouteMiddleware = publicRoute(express);
let userRouteMiddleware = userRoute(express);

let app = express();

app.use(bodyPraser.json());
app.use(bodyPraser.urlencoded({extended: false}));

app.use("/api/v1/", publicRouteMiddleware);
app.use("/api/v1/user", authMiddleware, userRouteMiddleware);

app.listen(config.PORT);