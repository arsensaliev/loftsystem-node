// DotEnv
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const auth = require("../controllers/auth");
const path = require("path");
// Connect DB
const db = require("./db");
db();
module.exports = () => {
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(auth.initialize());

    app.use(express.static(path.join(__dirname, "../../build")));
    app.all(process.env.API_BASE + "*", (req, res, next) => {
        if (req.path.includes(process.env.API_BASE + "registration"))
            return next();
        if (req.path.includes(process.env.API_BASE + "login"))
            return next();

        return auth.authenticate((err, user, info) => {
            if (err) {
                return next(err);
            }
            console.log(user);
            console.log(info);
            if (!user) {
                if (info.name === "TokenExpiredError") {
                    return res.status(401).json({
                        message:
                            "Your token has expired. Please generate a new one",
                    });
                } else {
                    console.log("Error");
                    return res.status(401).json({ message: info.message });
                }
            }
            app.set("user", user);
            return next();
        })(req, res, next);
    });

    const routes = require("../routes")(app);

    return app;
};
