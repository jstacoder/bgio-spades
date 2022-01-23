export const enumerate = (G, ctx)=> {
    const moves = []

    const hand = G.hands[ctx.currentPlayer]
    const phase = ctx.phase

    if(phase=='play'){
        hand.forEach(card=> {
            if(G.leadingSuit!==null){
                if(card.suit === G.leadingSuit){
                    
                        moves.push({
                            move: 'playCard',
                            args: [{
                                ...card,
                                playerID: ctx.currentPlayer
                            }]
                        })
                    
                }
            }else{
                if(card.suit==="spades"&&G.spadesBroken){
                    moves.push({
                        move: 'playCard',
                        args: [{
                            ...card,
                            playerID: ctx.currentPlayer
                        }]
                    })
                }else{
                    if(card.suit!=='spades'){
                moves.push({
                    move: 'playCard',
                    args: [{
                        ...card,
                        playerID: ctx.currentPlayer
                    }]
                })
            }
            }
        }

            
        })
    }else if(phase=='bid'){
        [0,1,2,3,4,5,6,7,8,9,10,11,12,13].forEach(n=> moves.push({move: 'bid', args: [n]}))
    }else if(phase=='assignWinningBook'){
        
    }
    return moves
}
