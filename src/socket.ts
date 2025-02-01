import { io } from 'socket.io-client';

const SOCKET_URL = 'https://board-clash-server.onrender.com';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket']
});

export const connectToGame = (roomId: string, playerId: string) => {
  socket.connect();
  socket.emit('join-room', { roomId, playerId });
};

export const disconnectFromGame = () => {
  socket.disconnect();
};

export const makeMove = (roomId: string, move: any) => {
  socket.emit('make-move', { roomId, move });
};

// Socket event listeners
socket.on('connect', () => {
  console.log('Connected to game server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from game server');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});