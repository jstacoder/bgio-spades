/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Box, Button, Select, Text, Card as ThemeUICard } from 'theme-ui'
import { useState, useEffect, useMemo, useCallback } from 'react'
import some from 'mout/collection/some'

import { GiSpades, GiHearts, GiClubs, GiDiamonds } from 'react-icons/gi'

const PlayerDisplay = props =>{
    return (
        <Box>
            {Object.keys(props.bids).map(key=>(
                <Box>
                    player: {key}
                    bid: {props.bids[key]}
                </Box>
            ))}
        </Box>
    )
}

const Heart = props =>
    <GiHearts sx={{fontSize: '30px'}}/>

const Diamond = props=>
    <GiDiamonds sx={{fontSize: '30px'}}/>

const Club = props =>
    <GiClubs sx={{fontSize: '30px'}}/>

const Spade = props =>
    <GiSpades sx={{fontSize: '30px'}} />

const Suit = ({suit}) =>{
    const suits = {
        spades: Spade,
        hearts: Heart,
        clubs: Club,
        diamonds: Diamond,
    }

    const CardSuit = suits[suit]


    return <CardSuit />
}

const BaseCard = ({children, onClick, canSelect, ...props})=>{
    const baseStyles = {
        border: '1px solid black',
        //borderTop: 0,
        //borderBottom: 0,
        px: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '200px',
        justifyContent:'space-evenly', 
    }
    if(canSelect){
        baseStyles[":hover"] = {
            bg: 'grey',
            color: 'white',
            cursor: 'pointer',
        }
    }


    return (
    <Box
        onClick={onClick}
        sx={baseStyles}
    >
       {children}
    </Box>
    )
}

const MyBox = ({value, bid}) =>{
    const onClick = () =>{
        bid(value)
    }
    return (
        <BaseCard canSelect onClick={onClick}>
            <Box m={2} p={2}>
                {value}
            </Box>
        </BaseCard>
    )
}

const Card = ({suit, value, selectCard, leadingSuit, spadesBroken, hand}) =>{

    const canSelect = useMemo(()=>{
        console.log(leadingSuit)
        if(leadingSuit==null||leadingSuit==undefined){
            // if no leading suit, play anything but spades 
            // unless spades have been broken            
            return spadesBroken ? true : suit!='spades'
        }else{
            // if there is a leading suit 
            // can only select if the cards
            // suit matches or if the player
            // has none of that suit left in their hand
            if(suit==leadingSuit){
                return true
            }
            // return false//!contains({suit: leadingSuit}, hand)             
            return !some(hand, ({suit:innerSuit})=> innerSuit==leadingSuit)
        }
    }, [leadingSuit, hand, spadesBroken, suit])
    // const canSelect = useMemo(()=> suit != 'spades',[])
    const onClick = () =>{
        if(canSelect){
            selectCard({suit, value})
        }
    }
    return (
        <BaseCard canSelect={canSelect} onClick={onClick}>
            <Box sx={{fontSize: '30px'}}>
              {value}
            </Box>
            <Box>
                <Suit suit={suit}/>
            </Box>
        </BaseCard>
    )
}

const sortBySuit = hand =>{
    const sorted = []

    const suits = ['hearts', 'clubs', 'diamonds', 'spades']

    suits.forEach(currentSuit=>{
        hand.forEach(({suit, value})=>{
            if(suit===currentSuit){
                sorted.push({suit, value})
            }
        })
    })
    return sorted 
    
}

export const Board = props =>{
    const { G, ctx, moves, events, playerID = '0' } = props

    const [selectedCard, setSelectedCard] = useState(null)    
    const [bidValue, setBidValue] = useState(-1)

    useEffect(()=>{
        selectedCard !== null && moves.playCard(selectedCard)
    }, [selectedCard])

    const onChange = e => {
        const newVal = e.target.value
        moves.bid(newVal)
    }

    const hand = useMemo(()=> G.hands[playerID?playerID:0], [playerID, G.hands])

    const bidArray = new Array(14).fill(0).map((_, idx)=> idx)

    // console.log(bidArray)

    const currentTurn = parseInt(
        G.turnCount/4
    )

    const selectedCards = G.turnCount ? G.books[currentTurn] : []



    return (
        <Box sx={{p: 4}}>
                    
            {
            ctx.phase == 'bid' ? (<Box>
            <Box m={3}> <Text as='h2'>Player Bidding: Player {ctx.currentPlayer}</Text></Box>
    
            <Box
            sx={{
                //border: '1px solid grey',
                display: 'flex',
                /* justifyContent: 'space-around', */
                flexWrap: 'no-wrap',
                height: '75px',
                alignItems: 'center',
                marginLeft: '2%',
                maxWidth: '40%',
                marginTop: '20%'
            }}
        >
            {bidArray.map(bid=>(
                    <MyBox bid={moves.bid} value={bid}/>
            ))}
        </Box>

            </Box>) : null}
            {
                ctx.phase == 'play'? (
                    <Box>current player: {ctx.currentPlayer}</Box>
                ) : null
            }

            {
                ctx.phase=='play' && selectedCards.length ? (
                    <Box>
                        Selected cards: {selectedCards.map(({card, player})=> <Text>Player {player}<Card {...card}/></Text>)}
                    </Box>
                ) : null
            }
        <Box
            sx={{
                //border: '1px solid grey',
                display: 'flex',
                justifyContent: 'space-between',
                height: '75px',
                alignItems: 'center',
                marginLeft: '2%',
                maxWidth: '85%',
                marginTop: '20%'
            }}
        >
            {sortBySuit(hand).map(({suit, value})=>(
                <Card hand={hand} leadingSuit={G.leadingSuit} spadesBroken={G.spadesBroken} selectCard={setSelectedCard} suit={suit} value={value} key={`${suit}-${value}`}/>
            ))}
        </Box>
        </Box>
    )
}

