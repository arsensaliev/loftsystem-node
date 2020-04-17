const AuthController = require("../controllers/auth");
module.exports = (app) => {
    app.post(process.env.API_BASE + "registration", AuthController.register);
    app.post(process.env.API_BASE + "login", AuthController.login);
};
