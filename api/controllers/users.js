const User = require("../models/user");
const toBase64 = require("../helpers/encodeBase64");

module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const userlist = await User.find();

            const formattedUserList = await Promise.all(
                userlist.map(async (user) => {
                    return {
                        id: user._id,
                        username: user.username,
                        surName: user.surName,
                        firstName: user.firstName,
                        middleName: user.middleName,
                        permission: user.permission,
                    };
                })
            );
            res.status(201).json(formattedUserList);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: "Что-то пошло не так" });
        }
    },
    setPermission: async (req, res) => {
        try {
            const { id: _id } = req.params;
            const { permission } = req.body;

            await User.findOneAndUpdate({ _id }, { permission });

            res.status(200).json({ message: "Права изменены" });
        } catch (e) {
            if (e.name && e.name === "CastError") {
                res.status(400).json({ message: "Пользователя не существует" });
            } else {
                res.status(500).json({ message: "Что-то пошло не так" });
            }
        }
    },
    deleteUser: async (req, res) => {
        try {
            const { id: _id } = req.params;

            await User.findOneAndDelete({ _id });

            res.status(200).json({ message: "Пользователь удален" });
        } catch (e) {
            if (e.name && e.name === "CastError") {
                res.status(400).json({ message: "Пользователя не существует" });
            } else {
                res.status(500).json({ message: "Что-то пошло не так" });
            }
        }
    },
};
