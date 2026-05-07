import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Zap, Battery, AlertTriangle, Droplets, Thermometer, Gauge } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/app/components/ui/badge';
import { db } from '@/app/lib/db';
import { toast } from 'sonner';

type GameState = 'idle' | 'showing' | 'playing' | 'gameover';

// The buttons/lights available
const LIGHTS = [
    { id: 0, color: 'text-amber-500', bg: 'bg-amber-500', icon: <Zap className="w-8 h-8" />, label: 'Check Engine' },
    { id: 1, color: 'text-red-500', bg: 'bg-red-500', icon: <Battery className="w-8 h-8" />, label: 'Battery' },
    { id: 2, color: 'text-blue-500', bg: 'bg-blue-500', icon: <Droplets className="w-8 h-8" />, label: 'Oil' },
    { id: 3, color: 'text-rose-500', bg: 'bg-rose-500', icon: <Thermometer className="w-8 h-8" />, label: 'Temp' }
];

export default function MemoryTune() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState<number>(0);
  const [activeLight, setActiveLight] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setGameState('showing');
    setSequence([]);
    setUserStep(0);
    setLevel(1);
    setScore(0);
    addToSequence([]);
  };

  const addToSequence = (currentSeq: number[]) => {
      const nextId = Math.floor(Math.random() * 4);
      const newSeq = [...currentSeq, nextId];
      setSequence(newSeq);
      playSequence(newSeq);
  };

  const playSequence = (seq: number[]) => {
      setGameState('showing');
      setUserStep(0);
      
      let i = 0;
      const interval = setInterval(() => {
          if (i >= seq.length) {
              clearInterval(interval);
              setActiveLight(null);
              setGameState('playing');
              return;
          }

          // Flash light
          setActiveLight(seq[i]);
          
          // Turn off shortly after
          setTimeout(() => {
              setActiveLight(null);
          }, 400);

          i++;
      }, 800);
  };

  const handleLightClick = (id: number) => {
      if (gameState !== 'playing') return;

      // Flash on click
      setActiveLight(id);
      setTimeout(() => setActiveLight(null), 200);

      // Check correctness
      if (id === sequence[userStep]) {
          // Correct
          if (userStep === sequence.length - 1) {
              // Completed full sequence
              setScore(prev => prev + (level * 10));
              setLevel(prev => prev + 1);
              toast.success("Correct! Tuning Next Stage...");
              setTimeout(() => {
                  addToSequence(sequence);
              }, 1000);
          } else {
              // Next step in sequence
              setUserStep(prev => prev + 1);
          }
      } else {
          // Wrong! Game Over
          handleGameOver();
      }
  };

  const handleGameOver = () => {
      setGameState('gameover');
      
      let finalPoints = score;
      let message = "";

      if (level > 10) {
          finalPoints += 500;
          message = "MASTER MECHANIC! Incredible memory.";
          confetti({ particleCount: 200, spread: 100 });
      } else if (level > 5) {
          finalPoints += 100;
          message = "Good diagnostic skills.";
          confetti({ particleCount: 50 });
      } else {
          message = "Engine stalled. Try again.";
      }

      if (finalPoints > 0) {
          db.updateUserPoints(finalPoints, 'Memory Diagnostic');
          toast.success(`+${finalPoints} PTS: ${message}`);
      } else {
        toast.error("Game Over!");
      }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 overflow-hidden relative font-sans">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-slate-900 z-0 pointer-events-none"></div>

        <div className="w-full max-w-md space-y-6 relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <Link to="/">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-slate-800 hover:text-white rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 shadow-sm backdrop-blur-sm">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-200 font-bold font-mono text-sm uppercase">Engine Tune-Up</span>
                </div>
            </div>

            <Card className="border-none shadow-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 text-slate-100 overflow-hidden relative rounded-3xl min-h-[500px]">
                <CardContent className="p-6 flex flex-col items-center relative z-10 h-full min-h-[500px]">
                    
                    {/* Dashboard Display */}
                    <div className="w-full bg-black/60 rounded-xl p-4 mb-8 border border-slate-700 shadow-inner">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Diagnostic Mode</span>
                            <span className="text-amber-500 font-mono text-xs animate-pulse">Scanning...</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 font-mono">
                            <div className="text-center">
                                <span className="block text-xs text-slate-600">LEVEL</span>
                                <span className="text-2xl font-bold text-white">{level}</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xs text-slate-600">SCORE</span>
                                <span className="text-2xl font-bold text-green-400">{score}</span>
                            </div>
                        </div>
                    </div>

                    {/* Game Grid */}
                    <div className="grid grid-cols-2 gap-4 w-full max-w-[300px] mb-8">
                        {LIGHTS.map((light) => (
                            <motion.button
                                key={light.id}
                                whileTap={{ scale: 0.95 }}
                                className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border-4 relative overflow-hidden
                                    ${activeLight === light.id 
                                        ? `${light.bg} border-white shadow-[0_0_30px_rgba(255,255,255,0.5)] scale-105 z-10` 
                                        : 'bg-slate-800 border-slate-700 text-slate-600 hover:bg-slate-750'
                                    }
                                `}
                                onClick={() => handleLightClick(light.id)}
                                disabled={gameState !== 'playing'}
                            >
                                <div className={`transition-colors duration-100 ${activeLight === light.id ? 'text-white' : light.color}`}>
                                    {light.icon}
                                </div>
                                <span className={`text-[10px] font-bold mt-2 uppercase tracking-wide ${activeLight === light.id ? 'text-white' : 'text-slate-500'}`}>
                                    {light.label}
                                </span>
                                
                                {/* Inner glow for "off" state to make it look like a dashboard light */}
                                {activeLight !== light.id && (
                                    <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                                )}
                            </motion.button>
                        ))}
                    </div>

                    {/* Status Text / Button */}
                    <div className="w-full mt-auto">
                        {gameState === 'idle' && (
                             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                                <p className="text-center text-slate-400 text-sm mb-4">Watch the warning lights and repeat the pattern to tune the engine.</p>
                                <Button 
                                    className="w-full py-8 text-xl font-black bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-2xl shadow-lg border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wider"
                                    onClick={startGame}
                                >
                                    Start Diagnostic
                                </Button>
                             </motion.div>
                        )}

                        {gameState === 'gameover' && (
                             <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full">
                                <div className="text-5xl font-black italic text-slate-200 mb-2">CRITICAL FAIL</div>
                                <p className="text-slate-500 mb-6">Diagnostic sequence interrupted.</p>
                                <Button onClick={startGame} className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold py-6 rounded-xl">
                                    Retry Tune-Up
                                </Button>
                             </motion.div>
                        )}
                        
                        {(gameState === 'showing' || gameState === 'playing') && (
                            <p className="text-center text-slate-500 text-sm font-bold uppercase tracking-widest animate-pulse">
                                {gameState === 'showing' ? 'Watch Pattern...' : 'Repeat Pattern!'}
                            </p>
                        )}
                    </div>

                </CardContent>
            </Card>
        </div>
    </div>
  );
}