import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../game/Game';
import { soundManager } from '../game/SoundManager';

type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

const BillionsSlicer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isSoundEnabled());

  useEffect(() => {
    if (canvasRef.current) {
      gameRef.current = new Game(canvasRef.current, {
        onStateChange: setGameState,
        onScoreUpdate: setScore,
        onTimerUpdate: setTimer,
        onGameOver: (finalScore: number, finalTime: number) => {
          setFinalScore(finalScore);
          setFinalTime(finalTime);
          setGameState('GAME_OVER');
        }
      });

      return () => {
        if (gameRef.current) {
          gameRef.current.destroy();
        }
      };
    }
  }, []);

  const startGame = () => {
    if (gameRef.current) {
      gameRef.current.start();
    }
  };

  const pauseGame = () => {
    if (gameRef.current) {
      gameRef.current.pause();
    }
  };

  const resumeGame = () => {
    if (gameRef.current) {
      gameRef.current.resume();
    }
  };

  const restartGame = () => {
    if (gameRef.current) {
      gameRef.current.restart();
    }
  };

  const goToMenu = () => {
    if (gameRef.current) {
      gameRef.current.goToMenu();
    }
  };
  
  const toggleSound = () => {
    const newState = soundManager.toggleSound();
    setSoundEnabled(newState);
    
    // Play a test sound when enabling
    if (newState) {
      soundManager.play('click');
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === 'PLAYING') {
          pauseGame();
        } else if (gameState === 'PAUSED') {
          resumeGame();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (gameState === 'GAME_OVER' || gameState === 'PLAYING') {
          restartGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-radial from-blue-900/30 to-gray-900">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Sound Toggle Button - Always visible */}
        <div className="absolute top-4 right-4 pointer-events-auto z-10">
          <button
            onClick={toggleSound}
            className={`p-3 rounded-full backdrop-blur-md border transition-all duration-200 ${
              soundEnabled 
                ? 'bg-billions-blue/70 border-billions-blue/50 text-white hover:bg-billions-blue/60' 
                : 'bg-gray-600/70 border-gray-400/50 text-gray-300 hover:bg-gray-500/70'
            }`}
            title={soundEnabled ? 'Sound On' : 'Sound Off'}
          >
            {soundEnabled ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            )}
          </button>
        </div>
        {/* Game UI */}
        {gameState === 'PLAYING' && (
          <>
            {/* Score */}
            <div className="absolute top-8 left-8 pointer-events-none">
              <div className="bg-billions-blue/70 backdrop-blur-md rounded-xl px-6 py-4 border border-billions-blue/50">
                <div className="text-white font-bold text-3xl font-mono">
                  {score.toLocaleString()}
                </div>
                <div className="text-blue-200 text-sm uppercase tracking-wide">
                  Score
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="absolute top-20 right-8 pointer-events-none mt-16">
              <div className="bg-billions-blue/70 backdrop-blur-md rounded-xl px-6 py-4 border border-billions-blue/50">
                <div className="text-white font-bold text-3xl font-mono">
                  {timer.toFixed(1)}s
                </div>
                <div className="text-blue-200 text-sm uppercase tracking-wide">
                  Time
                </div>
              </div>
            </div>
          </>
        )}

        {/* Menu Screen */}
        {gameState === 'MENU' && (
          <div className="flex flex-col items-center justify-center h-full pointer-events-auto">
            <div className="bg-billions-blue/70 backdrop-blur-md rounded-2xl px-12 py-16 border border-billions-blue/50 text-center max-w-lg">
              {/* Logo */}
              <img
                src="/billions-logo.jpg"
                alt="Billions Logo"
                className="w-24 h-24 mx-auto mb-6 drop-shadow-2xl rounded-xl"
              />
              
              {/* Title */}
              <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-billions-blue via-billions-pink to-billions-green drop-shadow-lg">
                BILLIONS SLICER
              </h1>
              
              {/* Instructions */}
              <p className="text-blue-200 text-lg mb-12 leading-relaxed">
                Hold left mouse and slice objects!<br/>
                Stay sharp, don't miss.
              </p>
              
              {/* Start Button */}
              <button
                onClick={() => {
                  soundManager.play('click');
                  startGame();
                }}
                className="bg-gradient-to-r from-billions-blue via-billions-pink to-billions-orange hover:from-billions-blue/80 hover:via-billions-pink/80 hover:to-billions-orange/80 text-white font-bold py-4 px-12 rounded-xl text-xl uppercase tracking-wide transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-billions-blue/25"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Pause Screen */}
        {gameState === 'PAUSED' && (
          <div className="flex flex-col items-center justify-center h-full pointer-events-auto">
            <div className="bg-billions-blue/90 backdrop-blur-md rounded-2xl px-12 py-16 border border-billions-blue/50 text-center">
              <h1 className="text-5xl font-bold mb-12 text-white drop-shadow-lg">
                PAUSED
              </h1>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    soundManager.play('click');
                    resumeGame();
                  }}
                  className="block w-full bg-billions-green hover:bg-billions-green/80 text-white font-bold py-4 px-8 rounded-xl text-lg uppercase tracking-wide transition-colors duration-200"
                >
                  Continue
                </button>
                
                <button
                  onClick={() => {
                    soundManager.play('click');
                    restartGame();
                  }}
                  className="block w-full bg-billions-orange hover:bg-billions-orange/80 text-white font-bold py-4 px-8 rounded-xl text-lg uppercase tracking-wide transition-colors duration-200"
                >
                  Restart
                </button>
                
                <button
                  onClick={() => {
                    soundManager.play('click');
                    goToMenu();
                  }}
                  className="block w-full bg-billions-pink hover:bg-billions-pink/80 text-white font-bold py-4 px-8 rounded-xl text-lg uppercase tracking-wide transition-colors duration-200"
                >
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'GAME_OVER' && (
          <div className="flex flex-col items-center justify-center h-full pointer-events-auto">
            <div className="bg-billions-blue/90 backdrop-blur-md rounded-2xl px-12 py-16 border border-billions-pink/50 text-center">
              <h1 className="text-5xl font-bold mb-8 text-billions-pink drop-shadow-lg">
                GAME OVER
              </h1>
              
              <div className="mb-12">
                <div className="text-4xl font-bold text-white mb-2">
                  {finalScore.toLocaleString()}
                </div>
                <div className="text-blue-200 text-lg mb-4">
                  Final score in {finalTime.toFixed(1)}s
                </div>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    soundManager.play('click');
                    restartGame();
                  }}
                  className="block w-full bg-gradient-to-r from-billions-blue via-billions-pink to-billions-orange hover:from-billions-blue/80 hover:via-billions-pink/80 hover:to-billions-orange/80 text-white font-bold py-4 px-8 rounded-xl text-lg uppercase tracking-wide transition-all duration-300 hover:scale-105"
                >
                  Play Again
                </button>
                
                <button
                  onClick={() => {
                    soundManager.play('click');
                    goToMenu();
                  }}
                  className="block w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-4 px-8 rounded-xl text-lg uppercase tracking-wide transition-colors duration-200"
                >
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillionsSlicer;
