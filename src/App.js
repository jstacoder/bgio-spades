import './App.css';
import { Client } from 'boardgame.io/react'
import { SocketIO } from 'boardgame.io/multiplayer'
import { Spades } from './game'
import { Board } from './board'

const MyClient = Client({
  game: Spades,
  numPlayers: 4,
  board: Board,
  multiplayer: SocketIO({server: 'localhost:5555'}),
  
})

const App = props => 
  <MyClient playerID='1' />

export default App;
