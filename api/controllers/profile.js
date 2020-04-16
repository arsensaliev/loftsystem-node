const User = require("../models/user");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const toBase64 = require("../helpers/encodeBase64");
const validate = require("../helpers/validate");
module.exports.getUser = async (req, res) => {
    try {
        const user = req.user;
        const image = user.image ? await toBase64.encode(user.image) : null;
        const responce = {
            id: user._id,
            username: user.username,
            surName: user.surName,
            firstName: user.firstName,
            middleName: user.middleName,
            permission: user.permission,
            image,
        };
        res.json(responce);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
};

module.exports.updateUser = async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        const upload = path.join(__dirname, "../../assets/users");
        form.uploadDir = upload;

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.json({ message: "Ошибка!" });
            }

            const updateUser = await User.findOneAndUpdate(
                { _id: req.user._id },
                { ...fields },
                { new: true }
            );

            let image = null;

            if (files) {
                const photoPath = path.join(upload, files.avatar.name);
                fs.renameSync(files.avatar.path, photoPath);
                image = await toBase64.encode(photoPath, files.avatar.type);
            }

            console.log(image, "IMAGEEE");
            
            const responce = {
                id: updateUser._id,
                username: updateUser.username,
                surName: updateUser.surName,
                firstName: updateUser.firstName,
                middleName: updateUser.middleName,
                permission: updateUser.permission,
                image,
            };
            res.status(201).json({ ...responce, image });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
};
