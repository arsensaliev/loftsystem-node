const jwt = require("jwt-simple");
const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const moment = require("moment");
class Auth {
    constructor() {
        this.initialize = () => {
            passport.use("jwt", this.getStrategy());
            return passport.initialize();
        };

        this.authenticate = (callback) =>
            passport.authenticate("jwt", { session: false }, callback);

        this.genToken = (user) => {
            let expires = moment().utc().add({ days: 7 }).unix();
            let token = jwt.encode(
                {
                    exp: expires,
                    username: user.username,
                },
                process.env.JWT_SECRET
            );

            return {
                accessToken: "Bearer " + token,
                accessTokenExpiredAt: moment.unix(expires).format(),
                refreshToken: token + "123123543",
                refreshTokenExpiredAt: moment.unix(expires).format(),
            };
        };

        this.getStrategy = () => {
            const params = {
                secretOrKey: process.env.JWT_SECRET,
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                passReqToCallback: true,
            };

            return new Strategy(params, (req, payload, done) => {
                console.log("payload " + payload);
                User.findOne({ username: payload.username }, (err, user) => {
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
                const { username, password } = req.body;
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        errors: errors.array(),
                        message: "Некорректный данные при регистрации",
                    });
                }

                const user = await User.findOne({
                    username: username,
                }).exec();

                if (!user) {
                    return res
                        .status(400)
                        .json({ message: "Пользователь не найден" });
                }

                const success = await user.comparePassword(password);

                if (!success) {
                    return res
                        .status(400)
                        .json({ message: "Неверный пароль, попробуйте снова" });
                }

                let token = await this.genToken(user);

                await User.updateOne({ username: user.username }, token);

                const dataUser = await User.findOne({
                    username: username,
                }).exec();
                res.status(200).json(dataUser);
            } catch (err) {
                res.status(200).json({
                    message: "Что-то пошло не так, попробуйте снова",
                });
            }
        };

        this.register = async (req, res) => {
            try {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        errors: errors.array(),
                        message: "Некорректный данные при регистрации",
                    });
                }

                const {
                    password,
                    username,
                    surName,
                    firstName,
                    middleName,
                } = req.body;

                const candidate = await User.findOne({ username });

                if (candidate) {
                    res.status(400).json({
                        message: "Такой пользователь уже существует",
                    });
                }

                const data = {
                    username,
                    password,
                    surName,
                    firstName,
                    middleName,
                    permission: {
                        chat: {
                            C: true,
                            R: true,
                            U: true,
                            D: true,
                        },
                        news: {
                            C: true,
                            R: true,
                            U: true,
                            D: true,
                        },
                        settings: {
                            C: true,
                            R: true,
                            U: true,
                            D: true,
                        },
                    },
                    ...this.genToken({ username }),
                };

                const user = new User(data);

                const pass = await user.save();
                console.log(pass);
                res.status(201).json({
                    message: "Пользователь успешно зарегистрирован",
                    data: { ...data, password },
                });
            } catch (error) {
                console.log(error);
                res.status(500).json({ message: "Что-то пошло не так" });
            }
        };
    }
}

module.exports = new Auth();
