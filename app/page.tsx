"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Heart, HeartCrack, Clock, Search } from 'lucide-react';
import { gameData, LevelData } from '@/lib/gameData';

export default function GamePage() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [lives, setLives] = useState(5);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  
  // Animation states
  const [isShaking, setIsShaking] = useState(false);
  const [incorrectTap, setIncorrectTap] = useState<{ x: number, y: number } | null>(null);

  const currentLevel: LevelData = gameData[currentLevelIndex];

  // Timer Logic
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('lost');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const handleImageTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = ((e.clientX - rect.left) / rect.width) * 100;
    const touchY = ((e.clientY - rect.top) / rect.height) * 100;
    
    console.log(`[DEBUG] Clicked coordinates -> xPercent: ${touchX.toFixed(1)}, yPercent: ${touchY.toFixed(1)}`);
    
    // Check if the tap hits any unfound difference
    const hit = currentLevel.differences.find(diff => {
      if (foundIds.includes(diff.id)) return false;
      const distance = Math.sqrt(
        Math.pow(touchX - diff.xPercent, 2) + Math.pow(touchY - diff.yPercent, 2)
      );
      // To account for aspect ratio distortion slightly, we just use a generic percentage distance.
      // Usually radiusPercent is sufficient for relative hits.
      return distance <= diff.radiusPercent;
    });

    if (hit) {
      // Correct Tap
      const newFoundIds = [...foundIds, hit.id];
      setFoundIds(newFoundIds);
      
      if (newFoundIds.length === currentLevel.differences.length) {
        setGameState('won');
      }
    } else {
      // Incorrect Tap
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('lost');
        }
        return newLives;
      });
      
      // Trigger Shake and temporary Red X
      setIsShaking(true);
      setIncorrectTap({ x: touchX, y: touchY });
      
      setTimeout(() => {
        setIsShaking(false);
        setIncorrectTap(null);
      }, 500); // 500ms matches animate-shake duration
    }
  };

  const nextStage = () => {
    if (currentLevelIndex + 1 < gameData.length) {
      setCurrentLevelIndex(prev => prev + 1);
    } else {
      setCurrentLevelIndex(0);
    }
    setFoundIds([]);
    setLives(5);
    setTimeLeft(90);
    setGameState('playing');
    setIsShaking(false);
    setIncorrectTap(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      
      {/* Sticky HUD / Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/70 border-b border-slate-800 p-4 shadow-xl shadow-black/20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Level {currentLevel.id}
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Timer */}
            <div className={`flex items-center space-x-2 text-xl font-mono ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
              <Clock className="w-5 h-5" />
              <span>00:{timeLeft.toString().padStart(2, '0')}</span>
            </div>
            
            {/* Lives */}
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  {i < lives ? (
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                  ) : (
                    <HeartCrack className="w-6 h-6 text-slate-700 animate-heart-break" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
        
        {/* Game Container with Shake Animation */}
        <div 
          className={`w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 ${isShaking ? 'animate-shake' : ''}`}
        >
          {/* Original Image */}
          <div 
            className="relative rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl shadow-cyan-900/20 cursor-crosshair group bg-slate-900"
            onClick={handleImageTap}
          >
            <img 
              src={currentLevel.originalImage} 
              alt="Original" 
              className="w-full h-auto block select-none pointer-events-none"
              draggable="false"
            />
            {/* Render Found Differences (Mirror Sync) */}
            {currentLevel.differences.map(diff => (
              foundIds.includes(diff.id) && (
                <div 
                  key={`orig-${diff.id}`}
                  className="absolute w-12 h-12 -ml-6 -mt-6 border-4 border-emerald-400 rounded-full animate-pulse-ring pointer-events-none drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  style={{ left: `${diff.xPercent}%`, top: `${diff.yPercent}%` }}
                />
              )
            ))}
            {/* Incorrect Tap Temporary Marker */}
            {incorrectTap && (
              <div 
                className="absolute text-rose-500 pointer-events-none font-bold text-3xl drop-shadow-md -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${incorrectTap.x}%`, top: `${incorrectTap.y}%` }}
              >
                ✕
              </div>
            )}
          </div>

          {/* Modified Image */}
          <div 
            className="relative rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl shadow-blue-900/20 cursor-crosshair group bg-slate-900"
            onClick={handleImageTap}
          >
            <img 
              src={currentLevel.modifiedImage} 
              alt="Modified" 
              className="w-full h-auto block select-none pointer-events-none"
              draggable="false"
            />
            {/* Render Found Differences (Mirror Sync) */}
            {currentLevel.differences.map(diff => (
              foundIds.includes(diff.id) && (
                <div 
                  key={`mod-${diff.id}`}
                  className="absolute w-12 h-12 -ml-6 -mt-6 border-4 border-emerald-400 rounded-full animate-pulse-ring pointer-events-none drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  style={{ left: `${diff.xPercent}%`, top: `${diff.yPercent}%` }}
                />
              )
            ))}
            {/* Incorrect Tap Temporary Marker */}
            {incorrectTap && (
              <div 
                className="absolute text-rose-500 pointer-events-none font-bold text-3xl drop-shadow-md -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${incorrectTap.x}%`, top: `${incorrectTap.y}%` }}
              >
                ✕
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer / Progress Bar */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4">
        <div className="max-w-xl mx-auto flex flex-col space-y-2">
          <div className="flex justify-between text-sm font-medium text-slate-400">
            <span>Differences Found</span>
            <span className="text-cyan-400">{foundIds.length} / {currentLevel.differences.length}</span>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${(foundIds.length / currentLevel.differences.length) * 100}%` }}
            />
          </div>
        </div>
      </footer>

      {/* Modals Overlay */}
      {gameState !== 'playing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/95 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
            {gameState === 'won' ? (
              <>
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-emerald-400 mb-2">Level Cleared!</h2>
                <p className="text-slate-400 mb-8">You found all differences with {timeLeft} seconds remaining.</p>
                <button 
                  onClick={nextStage}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-emerald-500/25"
                >
                  Next Stage
                </button>
              </>
            ) : (
              <>
                <div className="rounded-2xl overflow-hidden mb-6 border-4 border-rose-500/20 shadow-lg">
                  <img src="https://picsum.photos/seed/gameover/600/400" alt="Game Over" className="w-full h-48 object-cover" />
                </div>
                <h2 className="text-3xl font-bold text-rose-500 mb-2">Game Over</h2>
                <p className="text-slate-400 mb-8">
                  {lives <= 0 ? "You ran out of lives." : "Time's up!"}
                </p>
                <button 
                  onClick={nextStage}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-rose-500/25"
                >
                  Next Stage
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
