const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const dbAdress = process.env.DB_ADDRESS || "127.0.0.1";

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
};

module.exports = () => {
    mongoose
        .connect(dbAdress, options)
        .then(() => {
            console.log("MongoDB connected...");
        })
        .catch((err) => {
            console.log(err);
        });
};
