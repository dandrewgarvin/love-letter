const { rooms } = require('./gameInitialization')
const { log } = require('../utils/emitLog')
const {drawCard} = require("../utils/deckManager");

const swap = (io, socket, roomId, playerOne, playerTwo) => {
    let room = rooms[roomId]

    let roomP1 = room.players.find(player => player.id === playerOne.id);
    let roomP2 = room.players.find(player => player.id === playerTwo.id);

    let indexCard1 = roomP1.cards.findIndex(card => card.name === playerOne.cards[0].name)
    let indexCard2 = roomP2.cards.findIndex(card => card.name === playerTwo.cards[0].name)

    let swapCard = roomP1.cards[indexCard1]
    roomP1.cards[indexCard1] = roomP2.cards[indexCard2]
    roomP2.cards[indexCard2] = swapCard

    const currentPlayer = room.players.find(player => player.id === socket.id)
    const event = {
        timestamp: new Date(),
        message: `${currentPlayer.name} made ${playerOne.name} swap cards with ${playerTwo.name}`
    }
    log(io, roomId, event)

    io.to(roomId).emit("swap complete", { room })
}

const view = (io, socket, roomId, players) => {
    let room = rooms[roomId]
    const currentPlayer = room.players.find(player => player.id === socket.id)

    const message = players.length > 1 ?
                    `${currentPlayer.name} viewed ${players[0].name}'s and ${players[1].name}'s card` :
                    `${currentPlayer.name} viewed ${players[0].name}'s card`

    const event = {
        timestamp: new Date(),
        message: message
    }
    log(io, roomId, event)
}

const play = (io, socket, roomId, card) => {
    let room = rooms[roomId]

    let currentPlayer, currentPlayerIndex;
    for (let i = 0; i < room.players.length; i++) {
        if (room.players[i].id === socket.id) {
            currentPlayer = room.players[i];
            currentPlayerIndex = i;

            const removeIndex = currentPlayer.cards.findIndex(playerCard => playerCard.name === card.name)
            currentPlayer.cards = removeIndex === 0 ? [currentPlayer.cards[1]] : [currentPlayer.cards[0]]
        }
    }

    let nextPlayer;
    let nextPlayerIndex = currentPlayerIndex + 1
    do {
        if (nextPlayerIndex >= room.players.length) {
            nextPlayer = room.players[0]
        } else {
            nextPlayer = room.players[nextPlayerIndex]
        }
        nextPlayerIndex++;
    } while (nextPlayer?.knockedOut === true)

    const event = {
        timestamp: new Date(),
        message: `${currentPlayer.name} just played the ${card.name}`
    }
    log(io, roomId, event)

    const newCard = drawCard()
    if (newCard == null) {
        io.to(roomId).emit("game over", { room })
        nextPlayer = null
    } else {
        nextPlayer.cards.push(newCard)
    }

    io.to(roomId).emit("next player", { room, nextPlayer })
}

const knockOut = (io, socket, roomId) => {
    let room = rooms[roomId]
    const currentPlayer = room.players.find(player => player.id === socket.id)

    let numRemainingPlayers = 0
    for (let i = 0; i < room.players.length; i++) {
        if (room.players[i].id === currentPlayer.id) {
            room.players[i].knockedOut = true
        }
        else if (room.players[i].knockedOut === false) {
            numRemainingPlayers++
        }
    }

    const event = {
        timestamp: new Date(),
        message: `${currentPlayer.name} got knocked out`
    }
    log(io, roomId, event)

    if (numRemainingPlayers > 1) {
        io.to(roomId).emit("remaining players", { room })
    } else {
        io.to(roomId).emit("game over", { room })
    }
}

exports.swap = swap
exports.view = view
exports.play = play
exports.knockOut = knockOut