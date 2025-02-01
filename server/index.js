import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const games = new Map();

const INITIAL_PIECES = [
  // Red team starting positions (top row)
  { type: 'red', position: 0 }, { type: 'red', position: 1 },
  { type: 'red', position: 2 }, { type: 'red', position: 3 },
  { type: 'red', position: 4 }, { type: 'red', position: 5 },
  { type: 'red', position: 6 }, { type: 'red', position: 7 },
  // Second row
  { type: 'red', position: 8 }, { type: 'red', position: 9 },
  { type: 'red', position: 10 }, { type: 'red', position: 11 },
  { type: 'red', position: 12 }, { type: 'red', position: 13 },
  { type: 'red', position: 14 }, { type: 'red', position: 15 },
  // Blue team starting positions (bottom row)
  { type: 'blue', position: 48 }, { type: 'blue', position: 49 },
  { type: 'blue', position: 50 }, { type: 'blue', position: 51 },
  { type: 'blue', position: 52 }, { type: 'blue', position: 53 },
  { type: 'blue', position: 54 }, { type: 'blue', position: 55 },
  // Second to last row
  { type: 'blue', position: 56 }, { type: 'blue', position: 57 },
  { type: 'blue', position: 58 }, { type: 'blue', position: 59 },
  { type: 'blue', position: 60 }, { type: 'blue', position: 61 },
  { type: 'blue', position: 62 }, { type: 'blue', position: 63 },
];

const isValidCapture = (from, to, pieces, currentTurn) => {
  const fromRow = Math.floor(from / 8);
  const fromCol = from % 8;
  const toRow = Math.floor(to / 8);
  const toCol = to % 8;

  const rowDiff = Math.abs(fromRow - toRow);
  const colDiff = Math.abs(fromCol - toCol);

  if (rowDiff > 2 || colDiff > 2 || (rowDiff === 0 && colDiff === 0)) {
    return false;
  }

  const midRow = Math.floor((fromRow + toRow) / 2);
  const midCol = Math.floor((fromCol + toCol) / 2);
  const capturedPosition = midRow * 8 + midCol;

  const capturedPiece = pieces.find(p => p.position === capturedPosition);
  return !!capturedPiece && capturedPiece.type !== currentTurn;
};

const isValidMove = (from, to, pieces, currentTurn) => {
  if (pieces.some(p => p.position === to)) {
    return false;
  }

  if (isValidCapture(from, to, pieces, currentTurn)) {
    return true;
  }

  const fromRow = Math.floor(from / 8);
  const fromCol = from % 8;
  const toRow = Math.floor(to / 8);
  const toCol = to % 8;
  
  const rowDiff = Math.abs(fromRow - toRow);
  const colDiff = Math.abs(fromCol - toCol);
  
  return rowDiff <= 1 && colDiff <= 1;
};

const checkWinner = (pieces) => {
  const redPieces = pieces.filter(p => p.type === 'red').length;
  const bluePieces = pieces.filter(p => p.type === 'blue').length;

  if (redPieces === 0) return 'Blue';
  if (bluePieces === 0) return 'Red';

  return null;
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', ({ roomId, playerId }) => {
    socket.join(roomId);
    
    if (!games.has(roomId)) {
      games.set(roomId, {
        pieces: [...INITIAL_PIECES],
        currentTurn: 'red',
        players: { red: playerId },
        startTime: Date.now()
      });
    } else {
      const game = games.get(roomId);
      if (!game.players.blue) {
        game.players.blue = playerId;
      }
    }

    io.to(roomId).emit('game-state', games.get(roomId));
  });

  socket.on('make-move', ({ roomId, move }) => {
    const game = games.get(roomId);
    if (!game) return;

    const { from, to, player } = move;
    if (player !== game.currentTurn) return;

    const piece = game.pieces.find(p => p.position === from);
    if (!piece || piece.type !== player) return;

    if (!isValidMove(from, to, game.pieces, player)) return;

    if (isValidCapture(from, to, game.pieces, player)) {
      const fromRow = Math.floor(from / 8);
      const fromCol = from % 8;
      const toRow = Math.floor(to / 8);
      const toCol = to % 8;
      const midRow = Math.floor((fromRow + toRow) / 2);
      const midCol = Math.floor((fromCol + toCol) / 2);
      const capturedPosition = midRow * 8 + midCol;

      game.pieces = game.pieces.filter(p => p.position !== capturedPosition);
    }

    game.pieces = game.pieces.map(p => 
      p.position === from ? { ...p, position: to } : p
    );

    game.currentTurn = game.currentTurn === 'red' ? 'blue' : 'red';
    
    const winner = checkWinner(game.pieces);
    if (winner) {
      game.winner = winner;
      const duration = (Date.now() - game.startTime) / 1000;
      io.to(roomId).emit('game-over', {
        winner,
        redPieces: game.pieces.filter(p => p.type === 'red').length,
        bluePieces: game.pieces.filter(p => p.type === 'blue').length,
        duration
      });
    }

    io.to(roomId).emit('game-state', game);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});