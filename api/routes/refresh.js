const { refreshToken } = require("../controllers/tokens");
module.exports = (app) => {
    app.post(process.env.API_BASE + "refresh-token", async (req, res) => {
        const refresh = req.headers["authorization"];
        const token = refresh.split(" ")[1];
        const data = await refreshToken(token);
        res.json({ ...data });
    });
};
