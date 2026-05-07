import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Trophy, Gauge, Zap, Timer, Flame } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/app/components/ui/badge';
import { db } from '@/app/lib/db';
import { toast } from 'sonner';

type GameState = 'idle' | 'staging' | 'ready' | 'fault' | 'finished';

export default function DragRace() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [lights, setLights] = useState({
    preStage: false,
    stage: false,
    amber1: false,
    amber2: false,
    amber3: false,
    green: false,
    red: false
  });
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [holdingClutch, setHoldingClutch] = useState(false);
  
  const greenTimeRef = useRef<number>(0);
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    };
  }, []);

  const startStaging = () => {
    if (gameState !== 'idle') return;
    setHoldingClutch(true);
    setGameState('staging');
    
    // Simulate staging process (rolling into beams)
    setTimeout(() => {
        setLights(prev => ({ ...prev, preStage: true }));
        setTimeout(() => {
            setLights(prev => ({ ...prev, stage: true }));
            setGameState('ready');
            startTreeSequence();
        }, 800);
    }, 500);
  };

  const startTreeSequence = () => {
      // Random delay before tree starts (1-3 seconds)
      const delay = 1000 + Math.random() * 2000;
      
      sequenceTimeoutRef.current = setTimeout(() => {
          // Amber 1
          setLights(prev => ({ ...prev, amber1: true }));
          
          sequenceTimeoutRef.current = setTimeout(() => {
              // Amber 2
              setLights(prev => ({ ...prev, amber2: true }));
              
              sequenceTimeoutRef.current = setTimeout(() => {
                  // Amber 3
                  setLights(prev => ({ ...prev, amber3: true }));
                  
                  sequenceTimeoutRef.current = setTimeout(() => {
                      // GREEN LIGHT - GO!
                      setLights(prev => ({ ...prev, green: true }));
                      greenTimeRef.current = performance.now();
                  }, 400); // 0.4s between lights (Pro Tree is usually 0.4 or 0.5)
              }, 400);
          }, 400);
      }, delay);
  };

  const releaseClutch = () => {
    if (!holdingClutch) return;
    setHoldingClutch(false);

    if (gameState === 'staging') {
        // Too early (before tree even started)
        handleFalseStart();
        return;
    }

    if (gameState === 'ready') {
        const now = performance.now();
        
        // If green is lit, calculate time
        if (lights.green) {
            const rt = (now - greenTimeRef.current) / 1000; // seconds
            setReactionTime(rt);
            handleFinish(rt);
        } else {
            // Released before green = Red Light
            handleFalseStart();
        }
    }
  };

  const handleFalseStart = () => {
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
      setGameState('fault');
      setLights(prev => ({ ...prev, red: true, green: false, amber1: false, amber2: false, amber3: false }));
      toast.error("RED LIGHT! False Start!");
      db.updateUserPoints(-50, 'False Start Penalty');
  };

  const handleFinish = (rt: number) => {
      setGameState('finished');
      let points = 0;
      let message = "";

      if (rt < 0.020) {
          points = 1000;
          message = "PERFECT LIGHT! LEGENDARY!";
          confetti({ particleCount: 200, spread: 100, colors: ['#22c55e', '#ffffff'] });
      } else if (rt < 0.050) {
          points = 500;
          message = "Pro Reaction! Incredible speed.";
          confetti({ particleCount: 100, spread: 70 });
      } else if (rt < 0.100) {
          points = 250;
          message = "Great launch!";
          confetti({ particleCount: 50 });
      } else if (rt < 0.500) {
          points = 50;
          message = "Good start.";
      } else {
          points = 10;
          message = "Slow off the line.";
      }

      if (points > 0) {
          db.updateUserPoints(points, 'Drag Race');
          toast.success(`+${points} PTS: ${message}`);
      }
  };

  const resetGame = () => {
      setGameState('idle');
      setLights({
        preStage: false,
        stage: false,
        amber1: false,
        amber2: false,
        amber3: false,
        green: false,
        red: false
      });
      setReactionTime(null);
      setHoldingClutch(false);
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 overflow-hidden relative font-sans">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asphalt-dark.png')] opacity-40 z-0"></div>
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
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-slate-200 font-bold font-mono text-sm uppercase">Launch Control</span>
                </div>
            </div>

            <Card className="border-none shadow-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 text-slate-100 overflow-hidden relative rounded-3xl">
                <CardContent className="p-6 flex flex-col items-center relative z-10 min-h-[500px]">
                    
                    {/* The Christmas Tree */}
                    <div className="flex flex-col items-center gap-3 mb-8 bg-black/40 p-6 rounded-2xl border-4 border-slate-800 shadow-inner w-full max-w-[200px]">
                        {/* Staging Lights */}
                        <div className="flex justify-center gap-4 w-full mb-2">
                            <div className={`w-8 h-8 rounded-full border-2 border-slate-600 ${lights.preStage ? 'bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,1)]' : 'bg-slate-800'}`}></div>
                            <div className={`w-8 h-8 rounded-full border-2 border-slate-600 ${lights.stage ? 'bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,1)]' : 'bg-slate-800'}`}></div>
                        </div>

                        {/* Tree Body */}
                        <div className="flex flex-col gap-3 items-center bg-slate-800 p-3 rounded-xl border border-slate-700 w-20">
                             <div className={`w-12 h-12 rounded-full border-4 border-black transition-all duration-100 ${lights.amber1 ? 'bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,1)] scale-110' : 'bg-slate-900'}`}></div>
                             <div className={`w-12 h-12 rounded-full border-4 border-black transition-all duration-100 ${lights.amber2 ? 'bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,1)] scale-110' : 'bg-slate-900'}`}></div>
                             <div className={`w-12 h-12 rounded-full border-4 border-black transition-all duration-100 ${lights.amber3 ? 'bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,1)] scale-110' : 'bg-slate-900'}`}></div>
                             <div className={`w-12 h-12 rounded-full border-4 border-black transition-all duration-75 ${lights.green ? 'bg-green-500 shadow-[0_0_40px_rgba(34,197,94,1)] scale-110' : 'bg-slate-900'}`}></div>
                             <div className={`w-12 h-12 rounded-full border-4 border-black transition-all duration-75 ${lights.red ? 'bg-red-600 shadow-[0_0_40px_rgba(220,38,38,1)] scale-110' : 'bg-slate-900'}`}></div>
                        </div>
                    </div>

                    {/* Interaction Area */}
                    <div className="w-full mt-auto space-y-4">
                        {gameState === 'idle' && (
                             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                                <p className="text-center text-slate-400 text-sm mb-4">Hold the CLUTCH to stage your car. Release on GREEN.</p>
                                <Button 
                                    className="w-full py-8 text-xl font-black bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
                                    onMouseDown={startStaging}
                                    onTouchStart={startStaging}
                                >
                                    HOLD CLUTCH
                                </Button>
                             </motion.div>
                        )}

                        {(gameState === 'staging' || gameState === 'ready') && (
                            <div className="w-full">
                                <Button 
                                    className="w-full py-8 text-xl font-black bg-yellow-500 hover:bg-yellow-400 text-yellow-900 rounded-2xl shadow-lg border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all scale-[1.02]"
                                    onMouseUp={releaseClutch}
                                    onMouseLeave={releaseClutch}
                                    onTouchEnd={releaseClutch}
                                >
                                    RELEASE TO LAUNCH!
                                </Button>
                                <p className="text-center text-yellow-500/80 text-xs font-mono mt-2 animate-pulse">ENGINE REVVING...</p>
                            </div>
                        )}

                        {gameState === 'fault' && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full">
                                <div className="text-6xl font-black italic text-red-500 mb-2 drop-shadow-lg">FOUL!</div>
                                <p className="text-slate-400 mb-6">You jumped the start.</p>
                                <Button onClick={resetGame} variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                                    Try Again
                                </Button>
                            </motion.div>
                        )}

                        {gameState === 'finished' && reactionTime !== null && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full">
                                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Reaction Time</p>
                                <div className={`text-6xl font-black italic mb-2 tabular-nums drop-shadow-lg ${reactionTime < 0.05 ? 'text-green-400' : 'text-white'}`}>
                                    {reactionTime.toFixed(3)}s
                                </div>
                                <div className="flex justify-center mb-6">
                                    <Badge className={`px-3 py-1 ${reactionTime < 0.05 ? 'bg-green-500 text-black' : 'bg-slate-700 text-white'}`}>
                                        {reactionTime < 0.05 ? 'PRO R/T' : 'SPORTSMAN'}
                                    </Badge>
                                </div>
                                <Button onClick={resetGame} className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold py-6 rounded-xl">
                                    Race Again
                                </Button>
                            </motion.div>
                        )}
                    </div>

                </CardContent>
            </Card>

            <div className="text-center mt-4">
                 <p className="text-slate-500 text-xs font-medium">Pro Tip: React to the last amber light, not the green!</p>
            </div>
        </div>
    </div>
  );
}