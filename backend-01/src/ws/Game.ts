import { WebSocket } from "ws";
import { BLACK, Chess, WHITE } from 'chess.js'
import { GAME_OVER, INIT_GAME, MOVE } from "./message.js";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    public board: Chess;
    private startTime: Date;
    public moveCount = 0;


    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: WHITE
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: BLACK
            }
        }));
    }

    makeMove(socket: WebSocket, move: {
        from: string;
        to: string;
    }) {
        // validation here -> validating the type of move using zod
        // is it this users move
        const isPlayer1Trun = this.moveCount % 2 === 0;
        const isCorrectPlayer = isPlayer1Trun ? socket === this.player1 : socket === this.player2;
        
        if(!isCorrectPlayer) return;
        
        // if(this.board.moves.length % 2 === 0 && socket !== this.player1){
        //     return;
        // }
        // if(this.board.moves.length % 2 === 1 && socket !== this.player2){
        //     return;
        // }
        
        
        // is the move valid
        try{
            this.board.move(move);
            console.log("move was made")
            this.moveCount++
        }catch(err) {
            console.log(err)
            return;
        }

        // update the board
        // push the move
        // -> chess.js library handles the part

        // check if the game is over
        if(this.board.isGameOver()) {
            //send this to both the players
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: move
            }))
            return;
        }


        // if the game is not over

        if(socket === this.player1) {
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: {move, color: WHITE}
            }))
        }else {
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: {move, color: BLACK}
            }))
        }

        
        
        
    }

    
}