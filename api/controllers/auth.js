const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const User = require("../models/user");
const { createToken } = require("./tokens");
const toBase64 = require("../helpers/encodeBase64");
class Auth {
    constructor() {
        this.initialize = () => {
            passport.use("jwt", this.getStrategy());
            return passport.initialize();
        };

        this.authenticate = (callback) =>
            passport.authenticate("jwt", { session: false }, callback);

        this.getStrategy = () => {
            const params = {
                secretOrKey: process.env.JWT_SECRET,
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                passReqToCallback: true,
            };

            return new Strategy(params, (req, payload, done) => {
                User.findOne({ _id: payload.userId }, (err, user) => {
                    if (err) {
                        return done(err);
                    }
                    if (user === null) {
                        return done(null, false, {
                            message: "The user in the token was not found",
                        });
                    }

                    return done(null, user);
                });
            });
        };

        this.login = async (req, res) => {
            try {
                const user = await this.findUser(req.body.username);

                if (!user) {
                    return res
                        .status(400)
                        .json({ message: "Пользователь не найден" });
                }

                const success = await user.comparePassword(req.body.password);

                if (!success) {
                    return res.status(400).json({ message: "Неверный пароль" });
                }

                const tokens = await createToken(user._id);

                const responce = {
                    id: user._id,
                    username: user.username,
                    surName: user.surName,
                    firstName: user.firstName,
                    middleName: user.middleName,
                    permission: user.permission,
                    image: user.image
                };
                res.json({ ...responce, ...tokens });
            } catch (err) {
                res.status(500).json({
                    message: "Что-то пошло не так, попробуйте снова",
                });
            }
        };

        this.register = async (req, res) => {
            try {
                const newUser = await this.createUser(req.body);
                if (newUser.error) {
                    return res
                        .status(newUser.status)
                        .json({ message: newUser.message });
                }

                res.status(201).json({
                    message: "Пользователь создан",
                    data: { ...newUser },
                });
            } catch (error) {
                console.log(error);
                res.status(500).json({ message: "Что-то пошло не так" });
            }
        };

        this.createUser = async (data) => {
            const candidate = await this.findUser(data.username);
            if (candidate) {
                return {
                    error: true,
                    status: 400,
                    message: "Такой пользователь существует, попробуйте ещё!",
                };
            }

            const permission = {
                chat: { C: true, D: true, R: true, U: true },
                news: { C: true, D: true, R: true, U: true },
                settings: { C: true, D: true, R: true, U: true },
            };

            const userData = {
                username: data.username,
                password: data.password,
                surName: data.surName,
                firstName: data.firstName,
                middleName: data.middleName,
            };

            const user = new User({ ...userData, permission });
            await user.save();
            return { ...userData, permission };
        };

        this.findUser = async (username) => {
            return User.findOne({ username });
        };
    }
}

module.exports = new Auth();
