const userController = require("../controllers/users");
module.exports = (app) => {
    app.get(process.env.API_BASE + "users", userController.getAllUsers);
    app.patch(
        process.env.API_BASE + "users/:id/permission",
        userController.setPermission
    );
    app.delete(process.env.API_BASE + "users/:id", userController.deleteUser);
};
