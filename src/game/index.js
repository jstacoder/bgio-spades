import { TurnOrder } from 'boardgame.io/core'

import { enumerate } from './ai'
import setupG, { initialSetup, dealCard } from './setup-g'
import { assignWinningBook } from './moves/assignWinningBook'
import { bid } from './moves/bid'
import { playCard } from './moves/playCard'
import { MyPlayOrder } from './MyPlayOrder'
import { calculateScore, compareSuitAndVal } from './utils'


export const Spades = {

    ai: { enumerate },

    name: 'Spades',

    setup: initialSetup,

    turn: {
        order: MyPlayOrder,
    },

    playerView:(G, ctx, playerID) =>{
        return {
            ...G,
            hand: G.hands[playerID],
            hands: {
                [playerID]: G.hands[playerID]
            }
        }      
    },
    phases : {
        deal: {
            turn: {
                order:  MyPlayOrder,
                maxMoves: 1,
                onBegin: (G, ctx)=> {
                    dealCard(G, ctx)
                    ctx.events.endTurn()
                    return G
                },
                onEnd: (G, ctx)=>{
                    if(G.hands[ctx.currentPlayer].length===13){
                        G.hands[ctx.currentPlayer].sort(compareSuitAndVal)      
                    }
                }
            },
            moves: {           
            },
            
            start: true,
            next: 'bid',
            endIf: (G, ctx)=> G.deck.length === 0,
        },
        bid: {
            moves: {
                bid
            },
            turn: {
                order: MyPlayOrder,
                maxMoves: 1,
            },
            next: 'play',
            endIf: (G, ctx)=> Object.keys(G.bids).length === 4,            
        },
        play: {
            moves: {
              playCard: {                
                  move: playCard
              }
            },
            onBegin: (G, ctx)=> {
                G.turnCount = 0
                G.leadingSuit = null
                return G
            },
            turn: {
                order: MyPlayOrder,                
                onMove: (G, ctx)=>{
                    G.turnCount += 1
                    G.currentTurn = parseInt(
                        G.turnCount/4
                    )
                    return G
                },
                onEnd: (G, ctx)=>{
                    if(G.currentTurn && G.currentTurn === G.turnCount/4){
                        ctx.events.endPhase({next: 'assignWinningBook'})                        
                    }
                }
            },
            next: (G, ctx)=>{
                if(G.books.every(book=> book.length===4)){
                    return 'showRoundWinner'
                }
                return 'assignWinningBook'
            }
        },
        assignWinningBook:{
            onBegin:(G, ctx)=> assignWinningBook(G, ctx),            
            turn:{
                order: TurnOrder.CONTINUE,
                maxMoves: 1,
            },
            moves: { assignWinningBook },
            next: 'displayWinningBook'
        },
        displayWinningBook: {
            // onBegin: (G, ctx)=> {
            //     setTimeout(()=> ctx.events.endPhase({next: 'play'}), 5000)
            // },
            turn:{
                order: TurnOrder.CONTINUE,
                maxMoves: 1,
            },
            onEnd: (G, ctx)=> ({
                ...G,
                turnIndex: G.turnIndex+1,
                winningPlayer: null, 
                lastWinner: G.winningPlayer, 
            }),
            moves: {},
            next: 'play'
        },
        showRoundWinner:{
            moves: {},
            onBegin: (G, ctx)=>{
                let highestScore = 0
                let winningPlayer = null
                const scores = [...G.scores]
                const stats = {...G.stats}
                const roundStats = {}
                Object.keys(G.bids).forEach(playerID=>{
                    const bid = G.bids[playerID]
                    const bookCount = G.collectedBooks[playerID].length

                    const currentScore = scores[playerID] || 0

                    const {score, bags} = calculateScore({bid, bookCount})

                    const latestScore = score + currentScore
                    scores[playerID] = latestScore
                    
                    roundStats[playerID] = {
                        bid,
                        bookCount,
                        bags,
                    }
                    if(latestScore>highestScore){
                        highestScore = latestScore
                        winningPlayer = playerID
                    }
                })
                stats[G.round] = roundStats
                G.scores = scores       
                G.stats = stats
                if(highestScore>=150){
                    ctx.events.endGame({scores, winner: winningPlayer, score: highestScore})
                }else{
                    ctx.events.endPhase()
                }
            },
            onEnd: (G, ctx)=>{
                return setupG(ctx, G, true, G.round + 1)
            },
            next: 'deal'
        }
    },
    minPlayers: 4,
    maxPlayers: 4,    
}

