import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Trophy, Timer, AlertTriangle, Play, RotateCcw, Zap, Flag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { db } from '@/app/lib/db';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

type GameState = 'idle' | 'ready' | 'waiting' | 'go' | 'finished' | 'false-start';

export default function ReactionGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [lights, setLights] = useState<boolean[]>([false, false, false, false, false]);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  const startGame = () => {
    setGameState('ready');
    setLights([false, false, false, false, false]);
    setReactionTime(null);
    
    // Sequence
    let currentLight = 0;
    
    const interval = setInterval(() => {
      if (currentLight < 5) {
        setLights(prev => {
          const newLights = [...prev];
          newLights[currentLight] = true;
          return newLights;
        });
        currentLight++;
      } else {
        clearInterval(interval);
        setGameState('waiting');
        
        // Random delay between 0.5s and 3s before lights go out
        const randomDelay = 500 + Math.random() * 2500;
        
        const timeout = setTimeout(() => {
          setLights([false, false, false, false, false]);
          setGameState('go');
          startTimeRef.current = performance.now();
        }, randomDelay);
        
        timeoutRefs.current.push(timeout);
      }
    }, 1000); // 1 second between lights
    
    // Store interval to clear if needed (though we clear it in the callback)
    // For this simple logic, we can rely on state checks or just let it run if user doesn't click early
  };

  const handleInteraction = () => {
    if (gameState === 'idle' || gameState === 'finished' || gameState === 'false-start') {
      return;
    }

    if (gameState === 'go') {
      const endTime = performance.now();
      const time = Math.round(endTime - startTimeRef.current);
      setReactionTime(time);
      setGameState('finished');
      
      // Update Best Time
      if (!bestTime || time < bestTime) {
        setBestTime(time);
      }

      // Award Points
      let points = 0;
      let message = "";
      
      if (time < 200) {
        points = 500;
        message = "UNBELIEVABLE! F1 DRIVER LEVEL!";
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#EF4444', '#3B82F6', '#EAB308']
        });
      } else if (time < 300) {
        points = 250;
        message = "Podium Finish! Great reaction.";
        confetti({ particleCount: 50, spread: 50 });
      } else if (time < 400) {
        points = 100;
        message = "Points Finish. Good start.";
      } else {
        points = 10;
        message = "A bit slow off the line.";
      }

      if (points > 0) {
        db.updateUserPoints(points, 'Reaction Game');
        toast.success(`+${points} PTS: ${message}`);
      }

    } else if (gameState === 'ready' || gameState === 'waiting') {
      // False Start
      setGameState('false-start');
      timeoutRefs.current.forEach(clearTimeout);
      setLights([true, true, true, true, true]); // All red
      toast.error("JUMP START! -50 PTS Penalty");
      db.updateUserPoints(-50, 'False Start Penalty');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none" onMouseDown={handleInteraction} onTouchStart={handleInteraction}>
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
      
      {/* Header */}
      <div className="absolute top-6 left-6 z-20">
        <Button variant="ghost" className="text-white hover:bg-white/10" onClick={(e) => { e.stopPropagation(); navigate('/'); }}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Pit Lane
        </Button>
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-12">
        
        {/* Lights Container */}
        <div className="bg-black/80 p-6 rounded-3xl border-4 border-slate-800 shadow-2xl flex gap-4 md:gap-8">
          {lights.map((isOn, i) => (
            <div key={i} className="relative">
              {/* Light Housing */}
              <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-800 rounded-full border-4 border-slate-700 shadow-inner flex items-center justify-center overflow-hidden">
                {/* The Light */}
                <motion.div 
                  initial={false}
                  animate={{ 
                    opacity: isOn ? 1 : 0.1,
                    scale: isOn ? 1.1 : 1,
                    boxShadow: isOn ? "0 0 50px 10px rgba(239, 68, 68, 0.8)" : "none"
                  }}
                  className="w-full h-full bg-red-600 rounded-full"
                />
                {/* Gloss Effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Game Status / Result */}
        <div className="h-32 flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
                {gameState === 'idle' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <h1 className="text-4xl md:text-6xl font-black italic text-white tracking-tighter uppercase mb-2">
                            Lights Out
                        </h1>
                        <p className="text-slate-400 text-lg font-medium">Test your reaction time. Click anywhere when lights go out.</p>
                    </motion.div>
                )}
                {(gameState === 'ready' || gameState === 'waiting') && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-yellow-400 font-bold text-2xl animate-pulse uppercase tracking-widest">
                        Hold Clutch...
                    </motion.div>
                )}
                {gameState === 'go' && (
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} className="text-green-500 font-black text-6xl uppercase italic tracking-tighter">
                        GO! GO! GO!
                    </motion.div>
                )}
                {gameState === 'false-start' && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-red-500">
                        <AlertTriangle className="w-16 h-16 mb-2" />
                        <h2 className="text-4xl font-black uppercase italic">JUMP START!</h2>
                        <p className="text-red-300 font-bold mt-2">Penalty: -50 PTS</p>
                    </motion.div>
                )}
                {gameState === 'finished' && reactionTime !== null && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                        <div className="flex items-baseline gap-2 text-white">
                            <span className="text-8xl font-black italic tracking-tighter tabular-nums text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                                {reactionTime}
                            </span>
                            <span className="text-2xl font-bold text-slate-400">ms</span>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <Badge className={`px-3 py-1 text-lg font-black italic uppercase ${reactionTime < 250 ? 'bg-yellow-400 text-black' : reactionTime < 400 ? 'bg-slate-200 text-slate-900' : 'bg-orange-500 text-white'}`}>
                                {reactionTime < 250 ? 'F1 PRO' : reactionTime < 400 ? 'ROOKIE' : 'SLOW START'}
                            </Badge>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex gap-4 z-20">
            {gameState === 'idle' && (
                <Button size="lg" onClick={(e) => { e.stopPropagation(); startGame(); }} className="bg-green-600 hover:bg-green-500 text-white font-black italic text-xl px-12 py-8 rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all hover:scale-105 active:scale-95 border-b-4 border-green-800">
                    <Play className="w-6 h-6 mr-2 fill-current" /> START ENGINE
                </Button>
            )}
            {(gameState === 'finished' || gameState === 'false-start') && (
                 <Button size="lg" onClick={(e) => { e.stopPropagation(); startGame(); }} className="bg-white hover:bg-slate-200 text-slate-900 font-black italic text-xl px-12 py-8 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 border-b-4 border-slate-300">
                    <RotateCcw className="w-6 h-6 mr-2" /> TRY AGAIN
                </Button>
            )}
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-8">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 text-center min-w-[120px]">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Best Time</p>
                <p className="text-2xl font-black text-white italic">{bestTime ? `${bestTime}ms` : '--'}</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 text-center min-w-[120px]">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Avg F1 Driver</p>
                <p className="text-2xl font-black text-yellow-500 italic">200ms</p>
            </div>
        </div>

      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={`rounded-lg shadow-sm ${className}`}>{children}</span>
}
