module.exports = (express, cache) => {

    let router = express.Router();
    let User = require("../model/User")(cache);
    router.get("/:id", function (req, res, next) {
        let { id } = req.params;
        let user = User.find(id);
        res.status(200).send(user);
        next();
    });

    router.put("/:id", function (req, res, next) {
        let { id } = req.params;
        let data = req.body;
        User.update(id, data);
        res.status(200).send({
            message:  "Updated Successfully"
        });
        next();
    });

    return router;
}