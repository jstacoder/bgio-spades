import { getMouseEventOptions } from '@testing-library/user-event/dist/utils'
import { TurnOrder, INVALID_MOVE } from 'boardgame.io/core'
import { PluginPlayer } from 'boardgame.io/plugins'

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

const playerSetup = (playerID)=>({
    hand: [],
    books: [],
})

const getCardValue = value => cardValues.findIndex(e=> e==value)

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
            if(card.suit!=hiSuit){
                if(card.suit==SPADES){
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
        if(suit==currentSuit){
            if(value == null){
                return true
            }
            if(value==currentValue){
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
        const aSuitIndex = SUITS.findIndex(e=> e == a.suit)
        const bSuitIndex = SUITS.findIndex(e=> b.suit == e)

        if(aSuitIndex < bSuitIndex){
            return -1
        }else{
            return 1
        }
    }else{
        const aIndex = cardValues.findIndex(e=> e==a.value)
        const bIndex = cardValues.findIndex(e=> e==b.value)
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
        return this.cards.length == 0
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
    G.collectedBooks[winningPlayer].push(winningBook)
    G.winningPlayer = winningPlayer                                                
    ctx.events.endPhase()
    // ctx.events.endTurn({next: winningPlayer})
}

const isSameCard = (cardA, cardB)=>{
    let rtn = false
    if(cardA.value==cardB.value){
        if(cardA.suit==cardB.suit){
            rtn = true
        }
    }
    return rtn
}

const getNext = num =>{
    if(num==3){
        return '0'
    }
    return `${parseInt(num) + 1}`
}

const dealCard = (G, ctx)=>{
    const hand = G.hands[ctx.currentPlayer] || []
    const deck = [...G.deck]
    hand.push(deck.pop())
    G.hands[ctx.currentPlayer] = hand
    G.deck = deck
    return G
}

const getPlayOrder = first =>{
    const second = getNext(first)
    const third = getNext(second)
    const last = getNext(third)
    const order = [
        String(first),
        second,
        third,
        last,
    ]
    return order
}

const MyPlayOrder = {
    playOrder: (G, ctx) => G.turn_order,
    first: (G, ctx)=> {
        console.log(`CALLING FIRST in ${ctx.phase}`)
        console.log(`${typeof ctx.playOrder[0]}`)
        const lastWinner = G.lastWinner
        const lastWinnerIndex = ctx.playOrder.indexOf(`${lastWinner}`)
        console.log(`lastwinner: ${lastWinner} - lastWinnerIndex: ${lastWinnerIndex}`)
        const afterDealer = (G.dealer+1)%ctx.numPlayers
        const afterDealerIndex = ctx.playOrder.indexOf(`${afterDealer}`)
        console.log(`afterDealer: ${afterDealer} - afterDealerIndex: ${afterDealerIndex}`)
        return parseInt(G.lastWinner ? ctx.playOrder.indexOf(`${G.lastWinner}`) : ctx.playOrder.indexOf(`${(G.dealer+1)%ctx.numPlayers}`))
    },
    next: TurnOrder.DEFAULT.next,
}

export const Spades = {

    setup:(ctx)=>{
        let deck = new Deck


        for(let i=0; i<4;i++){            
            const suit = SUITS[i]

            for(let x=0;x<cardValues.length;x++){
                deck.addCard(
                    new Card(cardValues[x], suit).getCard()
                )    
            }   
        }

        const books = Array(13).fill([])

        const initialOrder = ctx.random.Shuffle([0,1,2,3])
        const dealer = initialOrder[3]
        const initialFirst = dealer < 3 ? [0,1,2,3][dealer+1] : 0
        const order = getPlayOrder(initialFirst)
        
        return ({
            deck: ctx.random.Shuffle(deck.getDeck()), 
            books, 
            turn: 0, 
            turnIndex: 0,
            bids: {}, 
            hands: {},
            turn_order: order,
            dealer,
            winningPlayer: null,
            lastWinner: null,
            spadesBroken: false,
            collectedBooks: {

                0: [],
                1: [],
                2: [],
                3: [],
            }
        })
    },
    turn: {
        order: MyPlayOrder,
    },
    // turn:{
    //     // onEnd:(G, ctx)=>G, 
    //     order:{
    //         first: (G, ctx)=> ctx.playOrder[G.winningPlayer] || 0,
    //         next: (G, ctx)=> ctx.playOrder[G.winningPlayer] || (ctx.playOrderPos+1) % ctx.numPlayers,
    //         playOrder: (G, ctx)=> {                
    //             const initialOrder = ctx.random.Shuffle([0,1,2,3])
    //             const dealer = initialOrder[3]
    //             const initialFirst = dealer < 3 ? [0,1,2,3][dealer+1] : 0
    //             return getPlayOrder(initialFirst)
    //         }
    //     },
    // },

    phases : {
        deal: {
            turn: {
                order: TurnOrder.CUSTOM_FROM('turn_order'),
                maxMoves: 1,
                onBegin: (G, ctx)=> {
                    dealCard(G, ctx)
                    ctx.events.endTurn()
                    return G
                }
            },
            moves: {
                dealCard
            },
            
            start: true,
            next: 'bid',
            endIf: (G, ctx)=> G.deck.length == 0,
            onEnd: (G, ctx)=>{
                Object.keys(
                    G.hands
                ).forEach(currHandIndex=>{
                    // const currentHand = G.hands[currHandIndex]
                    G.hands[currHandIndex].sort(compareSuitAndVal) //= sortBySuit(currentHand)                    
                })
                return G
            }
        },
        bid: {
            moves: {
                bid: (G, ctx, bid)=>{
                    if(bid<0){
                        return INVALID_MOVE
                    }
                    G.bids[ctx.currentPlayer] = bid
                    return G
                }
            },
            turn: {
                order: MyPlayOrder,
                maxMoves: 1,
            },
            next: 'play',
            endIf: (G, ctx)=> Object.keys(G.bids).length == 4,
            
        },
        play: {
            moves: {
              playCard: (G, ctx, card)=>{
                    ctx.log.setMetadata(`player: ${ctx.currentPlayer}`)
                    const currentTurn = parseInt(
                        G.turnCount/4
                    )
                    const hand = G.hands[ctx.currentPlayer].filter(curr=>!isSameCard(curr, card))
                    const book = G.books[G.turnIndex]

                    if(G.leadingSuit!==null){
                        if(card.suit != G.leadingSuit){
                            if(contains({suit: G.leadingSuit}, hand)){
                                return INVALID_MOVE
                            }
                        }
                    }else{
                        G.leadingSuit = card.suit 
                    }
                    if(card.suit=="spades"&&!G.spadesBroken){
                        G.spadesBroken = true
                    }
                    book.push(
                        {
                            player: ctx.currentPlayer, 
                            card
                        }
                    )


                    G.books[currentTurn] = book
                    G.hands[ctx.currentPlayer] = hand

                    return G
                }
            },
            onBegin: (G, ctx)=> {
                G.turnCount = 0
                G.leadingSuit = null
                return G
            },
            turn: {
                order: MyPlayOrder,
                maxMoves: 1,
                onMove: (G, ctx)=>{
                    G.turnCount += 1
                    G.currentTurn = parseInt(
                        G.turnCount/4
                    )
                    if(G.currentTurn && G.currentTurn == G.turnCount/4){
                        ctx.events.endPhase({next: 'assignWinningBook'})                        
                    }
                    return G
                },


            },
            next: 'assignWinningBook'
        },
        assignWinningBook:{
            onBegin:(G, ctx)=> assignWinningBook(G, ctx),
            //endIf: (G, ctx)=> G.winningPlayer !== null ? ({next: G.winningPlayer}) : false,
            onEnd: (G, ctx)=> ({
                ...G,
                turnIndex: G.turnIndex+1,
                winningPlayer: null, 
                lastWinner: G.winningPlayer, 
            }),
            turn:{
                order: TurnOrder.CONTINUE,
                maxMoves: 1,
            },
            moves: {
                assignWinningBook,
            },
            next: 'play'
        }
    },
    endIf: (G, ctx)=> G.books.every(book=> book.length),
    minPlayers: 4,
    maxPlayers: 4,    

}
