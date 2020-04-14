module.exports = (app) => {
    require("./auth")(app);
    require("./profile")(app);
    require("./refresh")(app);
    app.get("/", (req, res) => res.render("index"));

};
