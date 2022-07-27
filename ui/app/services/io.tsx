import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import type { Card, Player, Room, Log } from '~/types/global';

const url = 'http://10.0.30.137:5555';

class SocketIO {
  socket: Socket;
  player?: Player;
  room?: Room;
  logs: Log[];

  constructor() {
    const socket = io(url);

    this.socket = socket;
    this.player = undefined;
    this.room = undefined;
    this.logs = [];
  }

  joinGame({ name, roomId }: { name: string; roomId: string }) {
    this.socket.emit('join room', { name, roomId });
  }

  startGame({ roomId }: { roomId: string }) {
    this.socket.emit('start game', { roomId });
  }

  swap({ playerOne, playerTwo }: { playerOne: Player; playerTwo: Player }) {
    this.socket.emit('swap', { roomId: this.room?.id, playerOne, playerTwo });
  }

  view({ players }: { players: Player[] }) {
    this.socket.emit('view', { roomId: this.room?.id, players });
  }

  play({ card }: { card: Card }) {
    this.socket.emit('play', { roomId: this.room?.id, card });
  }

  knockOut() {
    this.socket.emit('knock out', { roomId: this.room?.id });
  }

  startNewRound() {
    this.socket.emit('start new round', { roomId: this.room?.id });
  }

  onJoinedRoom(callback: (data: any) => void) {
    this.socket.on('joined room', data => {
      this.player = data.player as Player;
      this.room = data.room as Room;

      callback(data);
    });
  }

  onPlayerJoined(callback: (data: any) => void) {
    this.socket.on('player joined', data => {
      this.room = data.room;

      callback(data);
    });
  }

  onStartingGame(callback: (data: any) => void) {
    this.socket.on('starting game', data => {
      updateGameState(this, data);

      this.logs = [];

      callback(data);
    });
  }

  onDeckDealt(callback: (data: any) => void) {
    this.socket.on('deck dealt', data => {
      updateGameState(this, data);

      callback(data);
    });
  }

  onSwapComplete(callback: (data: any) => void) {
    this.socket.on('swap complete', data => {
      updateGameState(this, data);

      callback(data);
    });
  }

  onLog() {
    this.socket.on('log', data => {
      const { message, timestamp } = data.event;

      if (!this.logs.find(log => log.timestamp === timestamp)) {
        this.logs.push({ message, timestamp });
      }
    });
  }

  onNextPlayer(callback: (data: any) => void) {
    this.socket.on('next player', data => {
      updateGameState(this, data);

      callback(data);
    });
  }

  onRemainingPlayers(callback: (data: any) => void) {
    this.socket.on('remaining players', data => {
      updateGameState(this, data);

      callback(data);
    });
  }

  onGameOver(callback: (data: any) => void) {
    this.socket.on('game over', data => {
      updateGameState(this, data);

      callback(data);
    });
  }
}

function updateGameState(ctx: any, data: any) {
  ctx.player = data.room.players.find((p: Player) => p.id === ctx.player?.id);
  ctx.room = data.room;
}

export default new SocketIO();
