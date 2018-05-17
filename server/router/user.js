module.exports = (express) => {

    let router = express.Router();
    let User = require("../model/User");
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