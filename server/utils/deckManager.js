let shuffledDeck = []
let currentCardIndex = 0

const prepareDeck = () => {
    currentCardIndex = 0
    shuffledDeck = shuffle()
}

const shuffle = () => {
    const deck = require('./deck')

    let currentIndex = deck.length, randomIndex;

    // While there remain elements to deckManager.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [deck[currentIndex], deck[randomIndex]] = [
            deck[randomIndex], deck[currentIndex]];
    }

    return deck
};

const drawCard = () => {
    if (currentCardIndex >= shuffledDeck.length) {
        return null
    }

    const card = shuffledDeck[currentCardIndex];
    currentCardIndex++

    return card
}

exports.prepareDeck = prepareDeck
exports.drawCard = drawCard