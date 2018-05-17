module.exports = (express, cache) => {

    let router = express.Router();

    router.get("/:id", function (req, res, next) {
        let { id } = req.params;
        let user = cache.get(id);
        res.status(200).send(user);
        next();
    });

    router.put("/:id", function (req, res, next) {
        let { id } = req.params;
        let data = req.body;
        user = cache.get(id);
        Object.keys(data).forEach((key) => {
            user[key] = data[key];
        });
        cache.set(id, user);
        res.status(200).send("success")
        next();
    });

    return router;
}