const app = require("./config/express")();
var http = require("http").createServer(app);
const socket = require("./controllers/socket");
socket(http);
const port = process.env.PORT || 3000;

http.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
