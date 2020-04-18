const jwt = require("jsonwebtoken");
const User = require("../models/user");
const createToken = (userId) => {
    const token = jwt.sign(
        {
            userId,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1m",
        }
    );

    const refreshToken = jwt.sign(
        {
            userId,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    const verifyRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);

    return {
        accessToken: token,
        refreshToken:  refreshToken,
        accessTokenExpiredAt: verifyToken.exp * 1000,
        refreshTokenExpiredAt: verifyRefresh.exp * 1000,
    };
};

const refreshToken = async (refreshToken) => {
    let userId = -1;
    try {
        userId = jwt.verify(refreshToken, process.env.JWT_SECRET).userId;
    } catch (err) {
        return {};
    }
    const user = await User.findById({ _id: userId });

    if (user) {
        return await createToken(user);
    } else {
        return {};
    }
};

module.exports = {
    refreshToken,
    createToken
}
