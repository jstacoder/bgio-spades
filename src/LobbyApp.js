import './App.css';
import { Client, Lobby } from 'boardgame.io/react'
import { SocketIO } from 'boardgame.io/multiplayer'
import { Spades } from './game'
import { Board } from './board'


const LobbyClient = props =>
  <Lobby
    gameServer={`http://${window.location.hostname}:5656`}
    lobbyServer={`http://${window.location.hostname}:5656`}
    gameComponents={[
      {game: Spades, board: Board}
    ]}  
    debug
  />

const MyClient = Client({
  game: Spades,
  numPlayers: 4,
  board: Board,
  multiplayer: SocketIO({server: 'localhost:5656'}),
  
})

const App = props => 
  <LobbyClient {...props} />

export default App;
