import { findWinningPlayer } from "../utils"

export const assignWinningBook = (G, ctx) => {
    //G.turnCount = 0
    const winningBook = [];
    const JSONG = JSON.parse(JSON.stringify(G));
    const currentBook = JSONG.books[G.currentTurn - 1];
    const winningPlayer = findWinningPlayer(currentBook);
    currentBook.forEach(({ player, card }) => {
        winningBook.push(card);
    });
    const collectedBooks = G.collectedBooks[winningPlayer] || [];
    collectedBooks.push(winningBook);
    G.collectedBooks[winningPlayer] = collectedBooks;
    G.winningBook = winningBook;
    G.winningPlayer = winningPlayer;
    ctx.events.endPhase();
};
