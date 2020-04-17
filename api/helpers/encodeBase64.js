const fs = require("fs");
const path = require("path");
const util = require("util");

const readFile = util.promisify(fs.readFile);

module.exports = {
    encode: async (image, type = "image/jpeg") => {
        const imageBitmap = await readFile(image);
        const encodeImage = `data:${type};base64,${Buffer.from(
            imageBitmap
        ).toString("base64")}`;
        return encodeImage;
    },
};
