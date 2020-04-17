const Chat = require("../models/chat");

let users = [];

module.exports = (htpp) => {
    const io = require("socket.io")(htpp);

    io.sockets.on("connection", (socket) => {
        socket.on("users:connect", ({ userId, username }) => {
            const currentUser = {
                username: username,
                socketId: socket.id,
                userId: userId,
                activeRoom: null,
            };

            users.push(currentUser);

            socket.emit("users:list", users);

            socket.broadcast.emit("users:add", currentUser);
        });

        socket.on("message:add", async (message) => {
            let dialog = new Object();
            const newMessage = new Chat(message);
            await newMessage.save();

            users.forEach((user) => {
                if (user.userId === message.recipientId)
                    dialog.to = user.socketId;
                if (user.userId === message.senderId)
                    dialog.from = user.socketId;
            });

            io.to(dialog.from).to(dialog.to).emit("message:add", message);
        });

        socket.on("message:history", async (dialog) => {
            const findHistory = (dialog, msg) => {
                if (
                    (dialog.recipientId === msg.recipientId &&
                        dialog.userId === msg.senderId) ||
                    (dialog.recipientId === msg.senderId &&
                        dialog.userId === msg.recipientId)
                ) {
                    return true;
                }
                return false;
            };

            const history = (await Chat.find()).filter((msg) =>
                findHistory(dialog, msg) ? true : false
            );

            socket.emit("message:history", history);
        });

        socket.on("disconnect", (data) => {
            socket.broadcast.emit("users:leave", users[socket.id]);

            users.forEach((user, index) => {
                if (user.socketId === socket.id) users.splice(index, 1);
            });
        });
    });
};
