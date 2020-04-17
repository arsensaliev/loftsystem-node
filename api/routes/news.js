const newsController = require("../controllers/news");

module.exports = (app) => {
    app.get(process.env.API_BASE + "news", newsController.getNews);
    app.post(process.env.API_BASE + "news", newsController.createNews);
    app.patch(process.env.API_BASE + "news/:id", newsController.patchNews);
    app.delete(process.env.API_BASE + "news/:id", newsController.deleteNews);
};
