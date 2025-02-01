import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sword, ArrowLeft, Timer, Shield, Users, Copy, Check } from 'lucide-react';
import { GameBoard } from '../components/GameBoard';
import { socket, connectToGame, disconnectFromGame, makeMove } from '../socket';
import { auth, saveGameResult } from '../firebase';
import { Piece, GameTimer } from '../types';
import { format } from 'date-fns';

const INITIAL_TIME = 10 * 60; // 10 minutes in seconds

export function OnlineGame() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<{
    pieces: Piece[];
    currentTurn: 'red' | 'blue';
    players: { red?: string; blue?: string };
    winner?: string | null;
  } | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [playerColor, setPlayerColor] = useState<'red' | 'blue' | null>(null);
  const [timer, setTimer] = useState<GameTimer>({ timeLeft: INITIAL_TIME });
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initGame = async () => {
      try {
        await auth.signInAnonymously();
        if (roomId && auth.currentUser) {
          connectToGame(roomId, auth.currentUser.uid);
        }
      } catch (error) {
        console.error('Failed to initialize game:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initGame();

    return () => {
      disconnectFromGame();
    };
  }, [roomId]);

  useEffect(() => {
    socket.on('game-state', (state) => {
      setGameState(state);
      if (auth.currentUser) {
        if (state.players.red === auth.currentUser.uid) {
          setPlayerColor('red');
        } else if (state.players.blue === auth.currentUser.uid) {
          setPlayerColor('blue');
        }
      }
    });

    socket.on('game-over', async ({ winner, redPieces, bluePieces, duration }) => {
      if (auth.currentUser) {
        await saveGameResult(winner, redPieces, bluePieces, duration);
      }
    });

    return () => {
      socket.off('game-state');
      socket.off('game-over');
    };
  }, []);

  const handleSquareClick = (index: number) => {
    if (!gameState || gameState.currentTurn !== playerColor || gameState.winner) return;

    const move = {
      from: selectedPiece,
      to: index,
      player: playerColor
    };

    if (selectedPiece === null) {
      const piece = gameState.pieces.find(p => p.position === index);
      if (piece?.type === playerColor) {
        setSelectedPiece(index);
      }
    } else {
      makeMove(roomId!, move);
      setSelectedPiece(null);
    }
  };

  const copyRoomLink = () => {
    const url = `${window.location.origin}/online/${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin text-blue-500">
          <Sword size={32} />
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">Failed to load game state</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex flex-col items-center justify-center p-4"
         style={{
           backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
         }}>
      <div className="mb-8 flex items-center justify-between w-full max-w-[700px]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            ONLINE MATCH
          </h1>
        </div>
        <button
          onClick={copyRoomLink}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors text-blue-400"
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      <div className="flex items-center justify-center w-full max-w-[700px] mb-6">
        <div className="flex items-center justify-between w-full bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-3 rounded-lg border border-blue-500/30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-blue-400">
              <Timer size={20} />
              <span className="text-xl font-mono">
                {format(timer.timeLeft * 1000, 'mm:ss')}
              </span>
            </div>
            <div className="h-8 w-px bg-blue-500/20" />
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-red-500" />
                <span className="text-red-400">
                  {gameState.pieces.filter(p => p.type === 'red').length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-blue-500" />
                <span className="text-blue-400">
                  {gameState.pieces.filter(p => p.type === 'blue').length}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-1 rounded bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
              <span className={`text-sm font-semibold ${gameState.currentTurn === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                {gameState.currentTurn.toUpperCase()}'s Turn
              </span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Users size={20} />
              <span className="text-sm">
                {Object.keys(gameState.players).length}/2
              </span>
            </div>
          </div>
        </div>
      </div>

      <GameBoard
        pieces={gameState.pieces}
        selectedPiece={selectedPiece}
        currentTurn={gameState.currentTurn}
        onSquareClick={handleSquareClick}
        winner={gameState.winner}
      />

      {gameState.winner && (
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            {gameState.winner} Team Wins!
          </h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all"
          >
            Back to Menu
          </button>
        </div>
      )}
    </div>
  );
}