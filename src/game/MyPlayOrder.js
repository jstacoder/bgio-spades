import { TurnOrder } from 'boardgame.io/core';

export const MyPlayOrder = {
    first: (G, ctx) => {
        const lastWinner = G.lastWinner;
        const afterDealer = (G.dealer + 1) % ctx.numPlayers;
        const afterDealerIndex = ctx.playOrder.indexOf(`${afterDealer}`);
        return parseInt(
            lastWinner != null ?
                lastWinner :
                afterDealerIndex
        );
    },
    next: TurnOrder.DEFAULT.next,
};
