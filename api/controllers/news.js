const News = require("../models/news");
const User = require("../models/user");
const uuid = require("uuid").v4;

const encodePicAutors = async (newsList, user) => {
    const formattedNewsList = await Promise.all(
        newsList.map(async (news) => {
            return {
                id: news.id,
                created_at: news.created_at,
                text: news.text,
                title: news.title,
                user: {
                    firstName: news.user.firstName,
                    id: news.user.id,
                    middleName: news.user.middleName,
                    surName: news.user.surName,
                    username: news.user.username,
                    image: news.user.image,
                },
            };
        })
    );
    return formattedNewsList;
};

module.exports = {
    getNews: async (req, res) => {
        try {
            const newsList = await News.find();

            //because send img into base64 formate ^_^
            const encodeNewsList = await encodePicAutors(newsList, req.user);

            res.status(201).json(encodeNewsList);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: "Что-то пошло не так" });
        }
    },
    createNews: async (req, res) => {
        try {
            const { title, text } = req.body;
            const author = await User.findOne({ _id: req.user._id });
            const newNews = new News({
                id: uuid(),
                created_at: new Date(),
                text,
                title,
                user: {
                    firstName: author.firstName,
                    id: author._id,
                    image: author.image,
                    middleName: author.middleName,
                    surName: author.surName,
                    username: author.username,
                },
            });

            await newNews.save();
            const newsList = await News.find();

            //because send img into base64 formate ^_^
            const encodeNewsList = await encodePicAutors(newsList);

            res.status(201).json(encodeNewsList);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: "Что-то пошло не так" });
        }
    },
    patchNews: async (req, res) => {
        try {
            const { title, text } = req.body;
            const { id } = req.params;

            await News.findOneAndUpdate({ id }, { text, title });
            const updateNewsList = await News.find();
            const encodeNewsList = await encodePicAutors(updateNewsList);

            res.status(201).json(encodeNewsList);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: "Что-то пошло не так" });
        }
    },
    deleteNews: async (req, res) => {
        try {
            const { id } = req.params;

            await News.findOneAndDelete({ id });

            const updateNewsList = await News.find();
            const encodeNewsList = await encodePicAutors(updateNewsList);

            res.status(201).json(encodeNewsList);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: "Что-то пошло не так" });
        }
    },
};
