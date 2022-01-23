import { cardValues, SUITS } from './constants';

class Card {
    constructor(num, suit) {
        this.value = num;
        this.suit = suit;
    }

    getCard() {
        return {
            value: this.value,
            suit: this.suit,
        };
    }
}
class Deck {
    constructor() {
        this.cards = [];
    }
    addCard(card) {
        this.cards.push(card);
    }
    dealCard() {
        const card = this.cards.pop();
        return card;
    }
    get isEmpty() {
        return this.cards.length === 0;
    }
    getDeck() {
        return this.cards;
    }
}
export const dealCard = (G, ctx) => {
    const hand = G.hands[ctx.currentPlayer] || [];
    const deck = [...G.deck];
    hand.push(deck.pop());
    G.hands[ctx.currentPlayer] = hand;
    G.deck = deck;
    return G;
};

const setupG = (ctx, G, changeDealer = false, round = 1) => {
    let deck = new Deck();


    for (let i = 0; i < 4; i++) {
        const suit = SUITS[i];

        for (let x = 0; x < cardValues.length; x++) {
            deck.addCard(
                new Card(cardValues[x], suit).getCard()
            );
        }
    }

    const getNextDealer = dealer => dealer < 3 ? [0, 1, 2, 3][dealer + 1] : 0;

    const books = Array(13).fill([]);

    if (!G.stats) {
        G.stats = {};
    }

    return ({
        ...G,
        round,
        deck: ctx.random.Shuffle(deck.getDeck()),
        books,
        turn: 0,
        turnIndex: 0,
        bids: {},
        hands: {},
        dealer: changeDealer ? getNextDealer(G.dealer) : G.dealer,
        winningPlayer: null,
        spadesBroken: false,
        winningBook: {},
        collectedBooks: {
            0: [],
            1: [],
            2: [],
            3: [],
        }
    });
}

export default setupG

export const initialSetup = ctx => {
    const initialOrder = ctx.random.Shuffle([0, 1, 2, 3]);
    const dealer = initialOrder[3];

    const G = {
        scores: [0, 0, 0, 0],
        dealer,
        lastWinner: null,
    };
    return setupG(ctx, G);
};
