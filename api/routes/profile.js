const ProfileController = require("../controllers/profile");
module.exports = (app) => {
    app.get(process.env.API_BASE + "profile", ProfileController.getUser);
    app.patch(process.env.API_BASE + "profile", ProfileController.updateUser);
};
