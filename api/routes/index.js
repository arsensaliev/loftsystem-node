module.exports = (app) => {
    require("./auth")(app);
    require("./profile")(app);
    require("./refresh")(app);
    require("./users")(app);
    require("./news")(app);
};
