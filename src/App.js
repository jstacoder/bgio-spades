///** @jsx jsx */
//import { jsx } from 'theme-ui'
import './App.css';
import { useRef, forwardRef, useEffect } from 'react'
import { Client, Lobby } from 'boardgame.io/react'
import { SocketIO, Local } from 'boardgame.io/multiplayer'
import { composeWithDevTools } from 'redux-devtools-extension'
import { Spades } from './game'
import { Board } from './board'


const LobbyClient = forwardRef((props, ref)  =>
  <Lobby
    ref={ref}
    gameServer={`http://${window.location.hostname}:5656`}
    lobbyServer={`http://${window.location.hostname}:5656`}
    gameComponents={[
      {game: Spades, board: Board}
    ]}  
    debug
  />
)

const MyClient = Client({
  game: Spades,
  numPlayers: 4,
  board: Board,
  //multiplayer: SocketIO({server: 'localhost:5656'}),
  multiplayer: Local(),
  enhancer: (
    window.__REDUX_DEVTOOLS_EXTENSION__
    && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
})

const App = props => {
  const clientRef = useRef()

  useEffect(()=>{
    const doIt = async function(){
      if(clientRef.current!==null&&clientRef.current.connection!==undefined){
        const games = await clientRef.current.connection.client.listGames()
        console.log(games)
      }
    }
    doIt()
  }, [])

  return <MyClient ref={clientRef} playerID={'0'} {...props} />
}

export default App;
