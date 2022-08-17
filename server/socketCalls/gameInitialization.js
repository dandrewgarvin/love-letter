const { prepareDeck, drawCard } = require("../utils/deckManager");

const rooms = {};

const joinRoom = (socket, roomId, name) => {
    console.log(`${name} joined the game`)
    let room = rooms[roomId];
    let player = {
        id: socket.id,
        name,
        cards: [],
        knockedOut: false
    };

    if (!room) {
        // create room
        room = {
            id: roomId,
            players: [player]
        };

        rooms[roomId] = room
    } else {
        // join room
        const existing = room.players.find((player) => player.id === socket.id);

        if (!existing) {
            // this player is not already in the room, add them
            room.players.push(player);
        } else {
            // player is already in room
            socket.emit("already joined");
            return null;
        }
    }

    socket.join(roomId);
    socket.emit("joined room", { player, room });
    socket.to(roomId).emit("player joined", {player, room });
}

const startGame = (io, roomId) => {
    const room = rooms[roomId]

    if (!room) {
        return null;
    }

    if (!room.started) {
        io.to(roomId).emit("starting game", { room });

        prepareDeck()

        // give all players starting card
        for (let i = 0; i < room.players.length; i++) {
            room.players[i].cards.push(drawCard())
        }

        // deal starting player's second card
        room.players[0].cards.push(drawCard())
    }

    io.to(roomId).emit("deck dealt", { room })
    room.started = true
}

const resetGame = (io, roomId) => {
    const room = rooms[roomId]
    for (let i = 0; i < room.players.length; i++) {
        room.players[i].cards = []
        room.players[i].knockedOut = false
    }

    room.started = false
    startGame(io, roomId)
}

exports.rooms = rooms;
exports.joinRoom = joinRoom;
exports.startGame = startGame;
exports.resetGame = resetGame;