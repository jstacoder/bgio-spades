import { Server, Origins } from 'boardgame.io/server'
import { Spades } from './game'

const server = Server({
    games: [Spades],
    origins: [Origins.LOCALHOST]
})

server.run(5555)
