import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sword, ArrowLeft, Timer, Shield } from 'lucide-react';
import { GameBoard } from '../components/GameBoard';
import { Piece, GameTimer } from '../types';

const INITIAL_PIECES: Piece[] = [
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

const INITIAL_TIME = 10 * 60; // 10 minutes in seconds

export function LocalGame() {
  const [pieces, setPieces] = useState<Piece[]>(INITIAL_PIECES);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [currentTurn, setCurrentTurn] = useState<'red' | 'blue'>('red');
  const [timer, setTimer] = useState<GameTimer>({ timeLeft: INITIAL_TIME });
  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    let interval: number | null = null;
    
    if (isGameStarted && !checkWinner()) {
      interval = window.setInterval(() => {
        setTimer(prev => ({
          timeLeft: Math.max(0, prev.timeLeft - 1)
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameStarted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isValidCapture = (from: number, to: number): boolean => {
    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;

    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);

    // Must be a jump of 2 squares in any direction
    if (rowDiff > 2 || colDiff > 2 || (rowDiff === 0 && colDiff === 0)) {
      return false;
    }

    // Calculate the position of the captured piece
    const midRow = Math.floor((fromRow + toRow) / 2);
    const midCol = Math.floor((fromCol + toCol) / 2);
    const capturedPosition = midRow * 8 + midCol;

    // Check if there's an opponent's piece to capture
    const capturedPiece = pieces.find(p => p.position === capturedPosition);
    return !!capturedPiece && capturedPiece.type !== currentTurn;
  };

  const isValidMove = (from: number, to: number): boolean => {
    // Can't move to an occupied square
    if (pieces.some(p => p.position === to)) {
      return false;
    }

    // Check for capture moves first
    if (isValidCapture(from, to)) {
      return true;
    }

    // Regular move: one square in any direction
    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    
    return rowDiff <= 1 && colDiff <= 1;
  };

  const handleSquareClick = (index: number) => {
    if (!isGameStarted) {
      setIsGameStarted(true);
    }

    const clickedPiece = pieces.find(p => p.position === index);

    if (selectedPiece === null) {
      if (clickedPiece?.type === currentTurn) {
        setSelectedPiece(index);
      }
    } else {
      if (clickedPiece?.type === currentTurn) {
        // If clicking on another piece of the same color, select that piece instead
        setSelectedPiece(index);
      } else if (isValidMove(selectedPiece, index)) {
        if (isValidCapture(selectedPiece, index)) {
          // Handle capture move
          const fromRow = Math.floor(selectedPiece / 8);
          const fromCol = selectedPiece % 8;
          const toRow = Math.floor(index / 8);
          const toCol = index % 8;
          const midRow = Math.floor((fromRow + toRow) / 2);
          const midCol = Math.floor((fromCol + toCol) / 2);
          const capturedPosition = midRow * 8 + midCol;

          setPieces(pieces.filter(p => p.position !== capturedPosition)
            .map(piece => piece.position === selectedPiece ? { ...piece, position: index } : piece));
        } else {
          // Handle regular move
          setPieces(pieces.map(piece => 
            piece.position === selectedPiece ? { ...piece, position: index } : piece
          ));
        }
        setSelectedPiece(null);
        setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
      }
    }
  };

  const resetGame = () => {
    setPieces(INITIAL_PIECES);
    setSelectedPiece(null);
    setCurrentTurn('red');
    setTimer({ timeLeft: INITIAL_TIME });
    setIsGameStarted(false);
  };

  const checkWinner = () => {
    // Check if any player has no pieces left
    const redPieces = pieces.filter(p => p.type === 'red').length;
    const bluePieces = pieces.filter(p => p.type === 'blue').length;

    if (redPieces === 0) return 'Blue';
    if (bluePieces === 0) return 'Red';

    // Check for time out - player with more pieces wins
    if (timer.timeLeft === 0) {
      return redPieces > bluePieces ? 'Red' : 'Blue';
    }

    return null;
  };

  const winner = checkWinner();

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-black flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
      }}
    >
      <div className="mb-8 flex items-center justify-between w-full max-w-[700px]">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            BOARD CLASH
          </h1>
        </div>
        <button 
          onClick={resetGame}
          className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all"
        >
          <Sword size={20} />
        </button>
      </div>

      <div className="flex items-center justify-center w-full max-w-[700px] mb-6">
        <div className="flex items-center justify-between w-full bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-3 rounded-lg border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-blue-400">
              <Timer size={20} />
              <span className="text-xl font-mono">{formatTime(timer.timeLeft)}</span>
            </div>
            <div className="h-8 w-px bg-blue-500/20" />
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-red-500" />
                <span className="text-red-400">{pieces.filter(p => p.type === 'red').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-blue-500" />
                <span className="text-blue-400">{pieces.filter(p => p.type === 'blue').length}</span>
              </div>
            </div>
          </div>
          <div className="px-4 py-1 rounded bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
            <span className={`text-sm font-semibold ${currentTurn === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
              {currentTurn.toUpperCase()}'s Turn
            </span>
          </div>
        </div>
      </div>

      <GameBoard
        pieces={pieces}
        selectedPiece={selectedPiece}
        currentTurn={currentTurn}
        onSquareClick={handleSquareClick}
        winner={winner}
      />

      {winner && (
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            {winner} Team Wins!
          </h2>
          <button
            onClick={resetGame}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}