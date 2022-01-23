/** @jsxRuntime classic */
/** @jsx jsx */
/** @flow */
import { jsx, Box, Text, Themed } from 'theme-ui'
import { useState, useEffect, useMemo, StrictMode, useRef, Fragment, useCallback } from 'react'
import some from 'mout/collection/some'
import map from 'mout/array/map'
import reduce from 'mout/array/reduce'
import get from 'mout/object/get'
import { MdPerson } from 'react-icons/md'
import { useSafeTimeout } from '@primer/react'


import { GiSpades, GiHearts, GiClubs, GiDiamonds } from 'react-icons/gi'


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

const BaseCard = ({children, onClick, canSelect, selected, selectedHover, ...props})=>{
    const baseStyles = {
        border: '1px solid black',
        borderRadius: '3px',
        px: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '200px',
        width: 'fit-content',
        justifyContent:'space-evenly', 
        mx: 2,
    }
    if(canSelect&&!selected){
        baseStyles['bg'] = 'lightGrey'
     // baseStyles['color'] = 'white'
        baseStyles[":hover"] = {
            bg: 'white',
            color: 'black',
            cursor: 'pointer',
        }
    }
    if(selectedHover){
        baseStyles[':hover'] = {
            bg: 'lightGrey',
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



const Card = ({playerID, phase, suit, value, selectCard, selected, leadingSuit, spadesBroken, hand}) =>{

    const canSelect = useMemo(()=>{
        if(phase!=='play'){
            return false
        }
        console.log(leadingSuit)
        if(leadingSuit===null||leadingSuit===undefined){
            // if no leading suit, play anything but spades 
            // unless spades have been broken            
            return spadesBroken ? true : suit!=='spades'
        }else{
            // if there is a leading suit 
            // can only select if the cards
            // suit matches or if the player
            // has none of that suit left in their hand
            if(suit===leadingSuit){
                return true
            }
            // return false//!contains({suit: leadingSuit}, hand)             
            return !some(hand, ({suit:innerSuit})=> innerSuit===leadingSuit)
        }
    }, [leadingSuit, hand, spadesBroken, suit, phase])
    // const canSelect = useMemo(()=> suit != 'spades',[])
    const onClick = () =>{
        if(canSelect){
            selectCard({suit, value, playerID})
        }
    }
    return (
        <BaseCard selected={selected} canSelect={canSelect} onClick={onClick}>
            <Box sx={{fontSize: '30px'}}>
              {value}
            </Box>
            <Box>
                <Suit suit={suit}/>
            </Box>
        </BaseCard>
    )
}

const sortBySuit = (hand = []) =>{
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

export const Board = ({ G, ctx, moves, playerID = '0', isActive, events, ...props }) =>{    
    const bidCount = useMemo(()=>{
        return Object.keys(G.bids).length
    } ,[G.bids])

    const startNumber = useRef(10)
    const bidRef = useRef(bidCount)

    const [selectedCard, setSelectedCard] = useState(null)    
    const {safeSetTimeout, safeClearTimeout} = useSafeTimeout()
    const [timerTime, setTimerTime] = useState(startNumber.current)
    const [displayWinningBook, setDisplayWinningBook] = useState(false)
    
    const toggleDisplayWinningBook = useCallback(()=> setDisplayWinningBook(!displayWinningBook), [displayWinningBook])

    const timeoutIdRef = useRef()
    const phaseRef = useRef(ctx.phase)

    const MyBox = ({value, bid}) =>{
        const onClick = () =>{
            setTimerTime(10)
            safeClearTimeout(timeoutIdRef.current)
            bid(value)
        }
        return (
            <BaseCard selected selectedHover canSelect onClick={onClick}>
                <Box m={2} p={2}>
                    {value}
                </Box>
            </BaseCard>
        )
    }

    useEffect(()=>{

        if(ctx.phase==='bid' && isActive){
            if(timerTime>0){
                timeoutIdRef.current = safeSetTimeout(()=>{
                    setTimerTime(timerTime=> timerTime-1)
                }, 1000)
            }else{
                
                safeClearTimeout(timeoutIdRef.current)
                setTimerTime(10)
                if(isActive){
                    moves.bid(1)
                }
            }
        } 
        return ()=>safeClearTimeout(timeoutIdRef.current)

    },[timeoutIdRef, ctx.phase, ctx.currentPlayer, safeSetTimeout, timerTime, moves, safeClearTimeout])


    useEffect(()=>{
        if(bidCount !== bidRef.current){
            safeClearTimeout(timeoutIdRef.current)
        }
    }, [G.bids, bidCount, safeClearTimeout, timeoutIdRef])

    useEffect(()=>{

        selectedCard !== null 
        && selectedCard.playerID === ctx.currentPlayer 
        && moves.playCard(selectedCard)

    }, [selectedCard, moves, ctx.currentPlayer])

    useEffect(()=>{
        let timeoutId = null
        console.log(`changed from ${phaseRef.current} to ${ctx.phase}`)
        phaseRef.current = ctx.phase
        if(ctx.phase === 'displayWinningBook'){
            // toggleDisplayWinningBook()
            // timeoutId = safeSetTimeout(()=>{
            //     toggleDisplayWinningBook()
            //     ctx.events.endPhase()
            // },5000)
        }                

        return ()=> {
            timeoutId !== null && safeClearTimeout(timeoutId)
        }
    }, [ctx.phase, safeClearTimeout, toggleDisplayWinningBook, safeSetTimeout, ctx.events])


    const hand = useMemo(()=> G.hands[playerID?playerID:0], [playerID, G.hands])

    const bidArray = new Array(14).fill(0).map((_, idx)=> idx)

    // console.log(bidArray)

    const currentTurn = parseInt(
        G.turnCount/4
    )

    const selectedCards = G.turnCount ? G.books[currentTurn] : []


    const PlayerBox = ({currentPlayer, playerID, collectedBooks, bids, activePlayer}) =>{
        const playerTextColor = currentPlayer === `${playerID}` ? 'white' : 'black'
        const playerBg = currentPlayer === `${playerID}` ? 'grey' : 'white'
        return (            
        <Box sx={{display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'baseline'}}>
            <Text sx={{
                color: playerTextColor,
                bg: playerBg,
                px: 2,
                py: 1, 
            }} as='p'>Player {playerID}{'  '}</Text>
            <Text as='p' sx={{ml: 3, px:2, py:2, fontSize: 3}}>
                {collectedBooks[playerID].length}/{bids[playerID]||0}
            </Text>
            <Box sx={{display: 'flex', width: '100%', justifyContent: 'center'}}>
                <MdPerson size={25}/>
            </Box>
            <Box sx={{
                visibility: activePlayer==playerID ? 'visible' : 'hidden', 
                borderBottom: '2px dashed red', 
                alignSelf: 'center',
                width:'20px' }}/>
            
        </Box>
        )
    }

    const PlayerBoxs = ({bids, collectedBooks}) =>{

        const PlayerZeroBox = ({currentPlayer}) =>
            <PlayerBox activePlayer={playerID} currentPlayer={currentPlayer} playerID={0} collectedBooks={collectedBooks} bids={bids}/>

        const PlayerOneBox = ({currentPlayer}) =>
            <PlayerBox activePlayer={playerID} currentPlayer={currentPlayer} playerID={1} collectedBooks={collectedBooks} bids={bids}/>

        const PlayerTwoBox = ({currentPlayer}) =>
            <PlayerBox activePlayer={playerID} currentPlayer={currentPlayer} playerID={2} collectedBooks={collectedBooks} bids={bids}/>

        const PlayerThreeBox = ({currentPlayer}) =>
            <PlayerBox activePlayer={playerID} currentPlayer={currentPlayer} playerID={3} collectedBooks={collectedBooks} bids={bids}/>

        const border = '.5px solid grey'

        return (
            <Box sx={{p:3  , display:'flex', flexDirection: 'column', border, maxWidth: '400px'}}>                
                <Box sx={{flex:1, display: 'flex', flexDirection: 'row', justifyContent: 'center', minWidth: '250px'}}>
                    <PlayerZeroBox currentPlayer={ctx.currentPlayer}/>
                </Box>
                <Box sx={{flex:2, display: 'flex', flexDirection: 'row', alignItems: 'space-between'}}>
                    <Box sx={{flexGrow: 1, flexShrink: 0}}>                        
                        <PlayerThreeBox currentPlayer={ctx.currentPlayer}/>
                    </Box>
                    <Box sx={{flexGrow: 3}}>
                    </Box>
                    <Box sx={{flexGrow:12, display: 'flex', justifyContent: 'flex-end'}}>                                        
                        <PlayerOneBox currentPlayer={ctx.currentPlayer}/>
                    </Box>
                </Box>
                <Box sx={{flex:1, display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>                    
                    <PlayerTwoBox currentPlayer={ctx.currentPlayer}/>
                </Box>
            </Box>
        )        
    }

    const ScoreBox = ({currentPlayer, playerID, score, stats}) =>{        
            const playerTextColor = currentPlayer === `${playerID}` ? 'white' : 'black'
            const playerBg = currentPlayer === `${playerID}` ? 'grey' : 'white'
            const playerStats = map(Object.keys(stats), i=> get(stats[i], String(playerID)))
            const playerBagCount = reduce(map(playerStats, o=> get(o, 'bags')), (a,b)=> a + b, 0)
            return (            
                <Box sx={{display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'baseline'}}>
                    <Text sx={{
                        color: playerTextColor,
                        bg: playerBg,
                        px: 2,
                        py: 1, 
                        border: '1px solid black',                
                    }} 
                    as='p'>
                        Player {playerID}{'  '}
                    </Text>
                <Box sx={{border: '1px solid black', width: '100%',display: 'flex', justifyContent: 'flex-end', flexDirection: 'row'}}>
                    <Text as='p' sx={{ml: 3, px:2, py:2, fontSize: 3}}>
                        {score}
                    </Text>
                </Box>
                <Box sx={{border: '1px solid black', width: '100%', display: 'flex', justifyContent: 'flex-end', flexDirection: 'row'}}>
                    <Text as='p' sx={{ml: 3, px:2, py:2, fontSize: 3}}>
                        {playerBagCount}
                    </Text>
                </Box>
            </Box>
        )
    }

    const PlayerScores = ({scores, currentPlayer}) =>{
        return (
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 5}}>
                <Text>Scores:</Text>
                <Box sx={{ display:'flex'}} >
                    <Box>
                        <Box sx={{px: 2, py: 1, border: '1px solid black'}}>
                            player
                        </Box>
                        <Box sx={{px: 2, py: 2, fontSize: 3, border: '1px solid black'}}>
                            score
                        </Box>
                        <Box sx={{px: 2, py: 2, border: '1px solid black', fontSize: 3}}>
                            bags
                        </Box>
                    </Box>

                    {Object.keys(scores).map(key=>{
                        const score = scores[key]

                        return (
                            <ScoreBox stats={G.stats} currentPlayer={currentPlayer} playerID={key} key={key} score={score}/>
                        )
                    })}
                </Box>
            </Box>
        )
    }

    return ctx.gameover ? (
        <Box>
            winner: player {ctx.gameover.winner}
        </Box>
    ) : (
        <Box sx={{p: 4}}>
            <StrictMode>

            <Box sx={{ display: 'flex', justifyContent: 'space-around'}}>
                
                <PlayerBoxs collectedBooks={G.collectedBooks} bids={G.bids}/>
                <Box sx={{visibility: G.winningPlayer ? 'visible' : 'hidden'}}>
                    <Text>
                        Last winner: player[{G.winningPlayer}]
                    </Text>
                    <Themed.pre>
                        {JSON.stringify(G.winningBook, null, 4)}
                    </Themed.pre>
                </Box>
                <PlayerScores scores={G.scores} currentPlayer={ctx.currentPlayer}/>

            </Box>
                    
            {
            ctx.phase === 'bid' ? (<Box>
            <Box m={3}> 
                <Text as='h2'>
                    Player Bidding: {ctx.currentPlayer}
                </Text>
                <Text as='p'>
                    Time Left: {timerTime}
                </Text>
            </Box>
    
            <Box
            sx={{
                //border: '1px solid grey',
                display: 'flex',
                /* justifyContent: 'space-around', */
                flexWrap: 'wrap',
                height: '26em',
                alignItems: 'center',
                marginLeft: '20%',
                maxWidth: '46%',
                marginTop: '0%'
            }}
        >
            {bidArray.map(bid=>(
                    <MyBox bid={moves.bid} value={bid}/>
            ))}
        </Box>

            </Box>) : null}
            {
                ctx.phase === 'play'? (
                    <Box>
                        <Text>
                            current player: {ctx.currentPlayer}
                        </Text>

                        <Text as='p'>
                            {G.lastWinner ? `last winner: ${G.lastWinner}` : null}
                        </Text>
                    </Box>

                ) : null
            }
            {
                ctx.phase === 'displayWinningBook' && isActive ? (
                    <button onClick={()=> events.endPhase({next: 'play'})}>push me</button>
                ) : null
            }
            <Box sx={{display: 'flex', minHeight:'220px'}}>        
                <Box sx={{visibility: ctx.phase==='play' && selectedCards.length ? 'visible':'hidden'}}>
                  Selected cards:
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                    {selectedCards.map(({card, player})=>(
                        <Box sx={{display:'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <Text>Player {player}</Text>
                            <Card selected {...card}/>
                        </Box>
                      )
                    )}
                </Box>                                      
            </Box>
            <Box
                sx={{
                    //border: '1px solid grey',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    height: '75px',
                    alignItems: 'center',
                    marginLeft: '2%',
                    maxWidth: '88%',
                    marginTop: '5%'
                }}
            >
            {sortBySuit(hand).map(({suit, value})=>(
                <Card playerID={playerID} phase={ctx.phase} hand={hand} leadingSuit={G.leadingSuit} spadesBroken={G.spadesBroken} selectCard={setSelectedCard} suit={suit} value={value} key={`${suit}-${value}`}/>
            ))}
        </Box>
        </StrictMode>
        </Box>
    )
}

