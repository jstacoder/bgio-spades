import { TurnOrder, INVALID_MOVE } from 'boardgame.io/core'
import { GiCrystalize } from 'react-icons/gi'

const enumerate = (G, ctx)=> {
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

const HEARTS = 'hearts'
const CLUBS = 'clubs'
const DIAMONDS = 'diamonds'
const SPADES = 'spades'

export const SUITS = [
    HEARTS,
    CLUBS,
    DIAMONDS,
    SPADES,
]

const cardValues = [
    '2', // 0
    '3', // 1
    '4', // 2
    '5', // 3
    '6', // 4
    '7', // 5
    '8', // 6
    '9', // 7
    '10', // 8
    'J', // 9
    'Q', // 10
    'K', // 11
    'A', // 12
]

const zeroCondition = (bid, bookCount) => bookCount === 0

const nonZeroCondition = (bid, bookCount) => bookCount >= bid

const scoreConditions = [
    zeroCondition,
    nonZeroCondition,
]

const calculateScore = ({bid, bookCount}) =>{
    let baseScore = bid !== 0 ? (bid*10) : 100
    let score = 0
    let bags = 0

    let scoreCondition = scoreConditions[bid === 0 ? 0 : 1]

    const passedCondition = scoreCondition(bid, bookCount)

    if(passedCondition){
        score += baseScore
        bags += bookCount - bid
        score += bags
    }else{
        score -= baseScore
    }
    return {score, bags}
}

const getCardValue = value => cardValues.findIndex(e=> e===value)

const findWinningPlayer = book =>{
    console.log(book)
    let winningPlayer = null
    let hiCard = null
    let hiSuit = null
    book.forEach(({player, card})=>{
        const cardValue = getCardValue(card.value)

        if(hiCard==null){
            hiSuit = card.suit
            hiCard = cardValue
            winningPlayer = player
        }else{            
            if(card.suit!==hiSuit){
                if(card.suit===SPADES){
                    hiCard = cardValue
                    hiSuit = card.suit
                    winningPlayer = player
               }
            }else{
                console.log(`${cardValue} > ${hiCard}`, cardValue>hiCard)
                if(cardValue>hiCard){
                    hiCard = cardValue
                    hiSuit = card.suit
                    winningPlayer = player
                    console.log(player)
                }
            }
        }
    })
    return winningPlayer
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

const compareSuitAndVal = (a, b) => {
    // if suits dont match
    if(a.suit !== b.suit){
        // sort by suit index
        const aSuitIndex = SUITS.findIndex(e=> e === a.suit)
        const bSuitIndex = SUITS.findIndex(e=> b.suit === e)

        if(aSuitIndex < bSuitIndex){
            return -1
        }else{
            return 1
        }
    }else{
        const aIndex = cardValues.findIndex(e=> e===a.value)
        const bIndex = cardValues.findIndex(e=> e===b.value)
        if(aIndex < bIndex){
            return -1
        }else{
            return 1
        }
    }
}


class Card
{
    constructor(num, suit){
        this.value = num
        this.suit = suit
    }

    getCard(){
        return {
            value: this.value,
            suit: this.suit,
        }
    }
}

class Deck
{
    constructor(){
        this.cards = []
    }
    addCard(card){
        this.cards.push(card)
    }
    dealCard(){
        const card = this.cards.pop()
        return card
    }
    get isEmpty(){
        return this.cards.length === 0
    }
    getDeck(){
        return this.cards
    }
}

const assignWinningBook =  (G, ctx) =>{
    //G.turnCount = 0
    const winningBook = []
    const JSONG = JSON.parse(JSON.stringify(G))
    const currentBook = JSONG.books[G.currentTurn-1] 
    const winningPlayer = findWinningPlayer(currentBook)
    currentBook.forEach(({player, card})=>{
        winningBook.push(card)                            
    })
    const collectedBooks = G.collectedBooks[winningPlayer] || []
    collectedBooks.push(winningBook)
    G.collectedBooks[winningPlayer] = collectedBooks
    G.winningBook = winningBook
    G.winningPlayer = winningPlayer                                                
    ctx.events.endPhase()
}

const displayWinningBook = (G, ctx) =>{
    ctx.events.endPhase({next: 'play'})
}

const isSameCard = (cardA, cardB)=>{
    let rtn = false
    if(cardA.value===cardB.value){
        if(cardA.suit===cardB.suit){
            rtn = true
        }
    }
    return rtn
}


const dealCard = (G, ctx)=>{
    const hand = G.hands[ctx.currentPlayer] || []
    const deck = [...G.deck]
    hand.push(deck.pop())
    G.hands[ctx.currentPlayer] = hand
    G.deck = deck
    return G
}


const MyPlayOrder = {
    // playOrder: (G, ctx) => G.turn_order,
    first: (G, ctx)=> {
        const lastWinner = G.lastWinner
        const afterDealer = (G.dealer+1)%ctx.numPlayers
        const afterDealerIndex = ctx.playOrder.indexOf(`${afterDealer}`)
        return parseInt(
            lastWinner != null ? 
            lastWinner : 
            afterDealerIndex
        )
    },
    next: TurnOrder.DEFAULT.next,
}

const bid = (G, ctx, bid)=>{
    
    if(bid<0){
        return INVALID_MOVE
    }
    G.bids[ctx.currentPlayer] = bid
    return G
}

const setupG = (ctx, G, changeDealer = false, round = 1)=>{
    let deck = new Deck()


    for(let i=0; i<4;i++){            
        const suit = SUITS[i]

        for(let x=0;x<cardValues.length;x++){
            deck.addCard(
                new Card(cardValues[x], suit).getCard()
            )    
        }   
    }

    const getNextDealer = dealer => dealer < 3 ? [0,1,2,3][dealer+1] : 0

    const books = Array(13).fill([])
    
    if(!G.stats){
        G.stats = {}
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
    })
}

const initialSetup = ctx =>{
    const initialOrder = ctx.random.Shuffle([0,1,2,3])
    const dealer = initialOrder[3]    

    const G = {
        scores: [0,0,0,0],
        dealer,
        lastWinner: null,
        
    }
    return setupG(ctx, G)
}

export const Spades = {

    ai: {
        enumerate
    },

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
                  move: (G, ctx, card)=>{
                    ctx.log.setMetadata(`player: ${ctx.currentPlayer} ${card.playerID}`)
                    const currentTurn = parseInt(
                        G.turnCount/4
                    )
                    let hand = G.hands[ctx.currentPlayer]
                    if(hand){
                        hand = hand.filter(curr=>!isSameCard(curr, card))
                                       
                        if(G.leadingSuit!==null){
                            if(card.suit !== G.leadingSuit){
                                if(contains({suit: G.leadingSuit}, hand)){
                                    return INVALID_MOVE
                                }
                            }
                        }else{
                            G.leadingSuit = card.suit 
                        }
                        if(card.suit==="spades"&&!G.spadesBroken){
                            G.spadesBroken = true
                        }
                    }
                    if(ctx.currentPlayer === card.playerID){
                        const book = G.books[G.turnIndex]
                        book.push(
                            {
                                player: ctx.currentPlayer, 
                                card
                            }
                        )
                        G.books[currentTurn] = book
                        G.hands[ctx.currentPlayer] = hand
                    }

                    ctx.events.endTurn()
                    return G
                }
              }
            },
            onBegin: (G, ctx)=> {
                G.turnCount = 0
                G.leadingSuit = null
                return G
            },
            turn: {
                order: MyPlayOrder,
                //maxMoves: 1,
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
            moves: {
                assignWinningBook,
            },
            next: 'displayWinningBook'
        },
        displayWinningBook: {
            onBegin: (G, ctx)=> {
                setTimeout(()=> ctx.events.endPhase({next: 'play'}), 5000)
            },
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
            moves: {
              // displayWinningBook
            },
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
