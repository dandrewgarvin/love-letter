const express = require('express');
const path = require('path');
const socket = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");

const gameInitialization = require('./socketCalls/gameInitialization');
const gamePlay = require('./socketCalls/gamePlay')

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", express.static(path.join(__dirname, 'public')));

const PORT = 5555
const io = socket(
    app.listen(PORT, () =>{
      console.log(`listening on port ${PORT}`);
    }),

    {
      cors: {
        origin: '*'
      }
    }
);

io.on("connection", (socket) => {
    socket.on("join room", ({ roomId, name }) => {
      gameInitialization.joinRoom(socket, roomId, name);
    });

    socket.on("start game", ({ roomId }) => {
      gameInitialization.startGame(io, roomId)
    });

    socket.on("start new round", ({ roomId }) => {
      gameInitialization.resetGame(io, roomId)
    })

    socket.on("swap", ({ roomId, playerOne, playerTwo }) => {
      gamePlay.swap(io, socket, roomId, playerOne, playerTwo)
    });

    socket.on("view", ({ roomId, players }) => {
      gamePlay.view(io, socket, roomId, players)
    });

    socket.on("play", ({ roomId, card }) => {
      gamePlay.play(io, socket, roomId, card)
    });

    socket.on("knock out", ({ roomId }) => {
      gamePlay.knockOut(io, socket, roomId)
    });
})

module.exports = app;
