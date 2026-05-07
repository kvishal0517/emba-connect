import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Timer, Wrench, RefreshCw, Trophy } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/app/components/ui/badge';
import { db } from '@/app/lib/db';
import { toast } from 'sonner';

type GameState = 'idle' | 'playing' | 'finished';

interface LugNut {
  id: number;
  active: boolean; // true = needs to be tapped (tightened/loosened)
  completed: boolean;
  x: number;
  y: number;
}

export default function PitCrew() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [lugNuts, setLugNuts] = useState<LugNut[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Define 5 lug nut positions (pentagon shape)
  const calculatePositions = () => {
      const radius = 80; // px
      const center = { x: 0, y: 0 };
      const nuts: LugNut[] = [];
      for (let i = 0; i < 5; i++) {
          const angle = (i * 72 - 90) * (Math.PI / 180); // Start at top (-90 deg)
          nuts.push({
              id: i,
              active: true,
              completed: false,
              x: center.x + radius * Math.cos(angle),
              y: center.y + radius * Math.sin(angle),
          });
      }
      return nuts;
  };

  const startGame = () => {
    setGameState('playing');
    setLugNuts(calculatePositions());
    setStartTime(performance.now());
    setElapsedTime(0);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
        setElapsedTime((performance.now() - startTime) / 1000);
    }, 10);
  };

  const tapLugNut = (id: number) => {
    if (gameState !== 'playing') return;

    setLugNuts(prev => {
        const newNuts = prev.map(nut => {
            if (nut.id === id && !nut.completed) {
                // Play sound effect here if possible
                return { ...nut, completed: true };
            }
            return nut;
        });

        // Check win condition
        if (newNuts.every(n => n.completed)) {
            finishGame();
        }

        return newNuts;
    });
  };

  const finishGame = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      const endTime = performance.now();
      const finalTime = (endTime - startTime) / 1000;
      setElapsedTime(finalTime);
      setGameState('finished');
      
      // Update best time
      if (bestTime === null || finalTime < bestTime) {
          setBestTime(finalTime);
      }

      // Calculate Points
      let points = 0;
      let message = "";
      
      // F1 pit stops are ~2-3s. A click game is slower.
      // < 1.5s = Godlike
      // < 2.5s = Pro
      // < 4.0s = Rookie

      if (finalTime < 1.5) {
          points = 1000;
          message = "WORLD RECORD PACE! UNBELIEVABLE!";
          confetti({ particleCount: 200, spread: 150, colors: ['#3b82f6', '#ffffff'] });
      } else if (finalTime < 2.5) {
          points = 500;
          message = "Pro Pit Crew Speed!";
          confetti({ particleCount: 100, spread: 70 });
      } else if (finalTime < 4.0) {
          points = 200;
          message = "Solid stop. Good job.";
          confetti({ particleCount: 50 });
      } else {
          points = 50;
          message = "Slow stop. Keep practicing.";
      }

      if (points > 0) {
          db.updateUserPoints(points, 'Pit Crew Challenge');
          toast.success(`+${points} PTS: ${message}`);
      }
  };

  useEffect(() => {
      // Update timer visually while playing
      if (gameState === 'playing') {
          timerRef.current = setInterval(() => {
             setElapsedTime((performance.now() - startTime) / 1000);
          }, 50);
      }
      return () => {
          if (timerRef.current) clearInterval(timerRef.current);
      };
  }, [gameState, startTime]);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 overflow-hidden relative font-sans">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-transparent to-blue-900/20 z-0 pointer-events-none"></div>

        <div className="w-full max-w-md space-y-6 relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <Link to="/">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-slate-800 hover:text-white rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 shadow-sm backdrop-blur-sm">
                    <Wrench className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-200 font-bold font-mono text-sm uppercase">Pit Crew Challenge</span>
                </div>
            </div>

            <Card className="border-none shadow-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 text-slate-100 overflow-hidden relative rounded-3xl min-h-[500px]">
                <CardContent className="p-6 flex flex-col items-center justify-center relative z-10 h-full min-h-[500px]">
                    
                    {/* Timer Display */}
                    <div className="mb-8 text-center">
                        <div className="text-6xl font-black italic tabular-nums tracking-tighter text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                            {elapsedTime.toFixed(3)}<span className="text-2xl text-slate-500 ml-1 not-italic">s</span>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Pit Stop Timer</p>
                    </div>

                    {/* Wheel Interaction Area */}
                    <div className="relative w-80 h-80 mb-8 flex items-center justify-center">
                        {/* Wheel Image */}
                        <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl border-4 border-slate-800">
                             <img 
                                src="https://images.unsplash.com/photo-1658058765602-1e8a21f477fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBhbGxveSUyMHdoZWVsJTIwY2xvc2UlMjB1cHxlbnwxfHx8fDE3NzE2OTM5MjR8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                                alt="Alloy Wheel" 
                                className="w-full h-full object-cover scale-110"
                             />
                             {/* Dark Overlay for contrast if needed */}
                             <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                        </div>

                        {/* Lug Nuts */}
                        <AnimatePresence>
                            {gameState !== 'idle' && lugNuts.map((nut) => (
                                <motion.button
                                    key={nut.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ 
                                        scale: nut.completed ? 0.8 : 1, 
                                        opacity: 1,
                                        rotate: nut.completed ? 90 : 0
                                    }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`absolute w-14 h-14 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-2 transition-all flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                                        ${nut.completed 
                                            ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-[0_0_20px_rgba(34,197,94,0.8)] z-0' 
                                            : 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-200 hover:brightness-110 shadow-[0_0_20px_rgba(250,204,21,0.6)] z-10 animate-bounce-subtle'
                                        }
                                    `}
                                    style={{ 
                                        left: '50%', 
                                        top: '50%',
                                        marginLeft: nut.x,
                                        marginTop: nut.y
                                    }}
                                    onClick={() => tapLugNut(nut.id)}
                                    disabled={nut.completed || gameState === 'finished'}
                                >
                                    {nut.completed ? (
                                        <div className="w-4 h-4 bg-white/90 rounded-full shadow-inner blur-[1px]" />
                                    ) : (
                                        // Realistic Lug Nut Hex Look
                                        <div className="w-8 h-8 bg-slate-800 clip-path-polygon-[50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%] flex items-center justify-center shadow-inner">
                                            <div className="w-4 h-4 rounded-full bg-slate-600/50"></div>
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                        
                         {gameState === 'idle' && (
                             <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/60 rounded-full">
                                 <div className="text-center">
                                    <Wrench className="w-16 h-16 text-white mx-auto mb-2 opacity-80" />
                                    <p className="text-white font-black text-lg uppercase tracking-wider">Tap Nuts Fast!</p>
                                 </div>
                             </div>
                         )}
                    </div>


                    {/* Controls */}
                    <div className="w-full mt-auto space-y-4">
                        {gameState === 'idle' ? (
                             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                                <p className="text-center text-slate-400 text-sm mb-4">Tap all 5 lug nuts as fast as possible!</p>
                                <Button 
                                    className="w-full py-8 text-xl font-black bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wider"
                                    onClick={startGame}
                                >
                                    Start Pit Stop
                                </Button>
                             </motion.div>
                        ) : gameState === 'finished' ? (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full">
                                <div className="flex justify-center mb-6">
                                    <Badge className={`px-3 py-1 text-lg font-bold ${elapsedTime < 2.5 ? 'bg-yellow-400 text-black' : 'bg-slate-700 text-white'}`}>
                                        {elapsedTime < 2.5 ? 'LEGENDARY CREW' : 'ROOKIE CREW'}
                                    </Badge>
                                </div>
                                <Button onClick={startGame} className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold py-6 rounded-xl border-b-4 border-slate-300 active:border-b-0 active:translate-y-1">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Next Wheel
                                </Button>
                            </motion.div>
                        ) : (
                             <p className="text-center text-blue-400 animate-pulse font-bold tracking-widest uppercase text-sm">GO! GO! GO!</p>
                        )}
                    </div>

                </CardContent>
            </Card>
        </div>
    </div>
  );
}