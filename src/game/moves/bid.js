import { INVALID_MOVE } from 'boardgame.io/core';

export const bid = (G, ctx, bid) => {

    if (bid < 0) {
        return INVALID_MOVE;
    }
    G.bids[ctx.currentPlayer] = bid;
    return G;
};
