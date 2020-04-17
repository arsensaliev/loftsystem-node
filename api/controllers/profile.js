const User = require("../models/user");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const toBase64 = require("../helpers/encodeBase64");
module.exports.getUser = async (req, res) => {
    try {
        const currentUser = await User.findOne({ _id: req.user._id });
        const responce = {
            id: currentUser._id,
            username: currentUser.username,
            surName: currentUser.surName,
            firstName: currentUser.firstName,
            middleName: currentUser.middleName,
            permission: currentUser.permission,
            image: currentUser.image,
        };

        console.log(responce);
        res.json(responce);
    } catch (e) {
        console.log("Ошибка в запросе get profile");
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
            let image = null;
            if (files.avatar) {
                const photoPath = path.join(upload, files.avatar.name);
                fs.renameSync(files.avatar.path, photoPath);
                image = await toBase64.encode(photoPath, files.avatar.type);
            }
            
            const updateUser = await User.findOneAndUpdate(
                { _id: req.user._id },
                { ...fields, image },
                { new: true }
            );

            const responce = {
                id: updateUser._id,
                username: updateUser.username,
                surName: updateUser.surName,
                firstName: updateUser.firstName,
                middleName: updateUser.middleName,
                permission: updateUser.permission,
                image: image,
            };
            res.status(201).json(responce);
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
};
