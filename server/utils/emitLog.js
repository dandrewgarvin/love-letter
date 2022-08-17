const log = (io, roomId, event) => {
    io.to(roomId).emit("log", { event })
}

exports.log = log