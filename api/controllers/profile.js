const User = require("../models/user");
module.exports.getUser = async (req, res) => {
    try {
        const user = req.user;
        const responce = {
            id: user._id,
            username: user.username,
            surName: user.surName,
            firstName: user.firstName,
            middleName: user.middleName,
            permission: user.permission,
        };
        res.json(responce);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
};
