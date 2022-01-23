import { INVALID_MOVE } from 'boardgame.io/core'


export const isSameCard = (cardA, cardB)=>{
    let rtn = false
    if(cardA.value===cardB.value){
        if(cardA.suit===cardB.suit){
            rtn = true
        }
    }
    return rtn
}


export const contains = ({suit: currentSuit, value: currentValue}, lst) =>{
    let rtn = false
    lst.forEach(({suit, value})=>{
        if(suit===currentSuit){
            if(value == null){
                return true
            }
            if(value===currentValue){
                rtn = true
            }
        }
    })
    return rtn
}

export const playCard = () => (G, ctx, card) => {
    ctx.log.setMetadata(`player: ${ctx.currentPlayer} ${card.playerID}`);
    const currentTurn = parseInt(
        G.turnCount / 4
    );
    let hand = G.hands[ctx.currentPlayer];
    if (hand) {
        hand = hand.filter(curr => !isSameCard(curr, card));

        if (G.leadingSuit !== null) {
            if (card.suit !== G.leadingSuit) {
                if (contains({ suit: G.leadingSuit }, hand)) {
                    return INVALID_MOVE;
                }
            }
        } else {
            G.leadingSuit = card.suit;
        }
        if (card.suit === "spades" && !G.spadesBroken) {
            G.spadesBroken = true;
        }
    }
    if (ctx.currentPlayer === card.playerID) {
        const book = G.books[G.turnIndex];
        book.push(
            {
                player: ctx.currentPlayer,
                card
            }
        );
        G.books[currentTurn] = book;
        G.hands[ctx.currentPlayer] = hand;
    }

    ctx.events.endTurn();
    return G;
};
