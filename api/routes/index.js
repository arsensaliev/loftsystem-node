module.exports = (app) => {
    require("./auth")(app);
    app.get("/", (req, res) => res.render("index"));

};
