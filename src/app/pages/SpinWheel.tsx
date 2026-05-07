import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Trophy, Flag, Gauge, Disc, Zap } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/app/components/ui/badge';
import { db } from '@/app/lib/db';
import { toast } from 'sonner';

const PRIZES = [
  { label: "500 PTS", points: 500, color: "#EF4444", textColor: "white" }, // Red
  { label: "FREE WASH", points: 0, perk: true, color: "#F8FAFC", textColor: "#0F172A" }, // Slate-50
  { label: "250 PTS", points: 250, color: "#EAB308", textColor: "white" }, // Yellow
  { label: "10% OFF", points: 0, perk: true, color: "#3B82F6", textColor: "white" }, // Blue
  { label: "100 PTS", points: 100, color: "#A855F7", textColor: "white" }, // Purple
  { label: "1000 PTS", points: 1000, color: "#22C55E", textColor: "white" } // Green
];

const SEGMENT_ANGLE = 360 / PRIZES.length;

export default function SpinWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [charge, setCharge] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const controls = useAnimation();
  const chargeInterval = useRef<NodeJS.Timeout | null>(null);
  const rotationRef = useRef(0);

  const startCharging = () => {
    if (isSpinning) return;
    setIsCharging(true);
    setCharge(0);
    setResult(null);
    
    // Rapidly increase charge
    chargeInterval.current = setInterval(() => {
      setCharge(prev => {
        if (prev >= 100) return 0; // Cycle back
        return prev + 4;
      });
    }, 20);
  };

  const stopCharging = () => {
    if (!isCharging) return;
    setIsCharging(false);
    if (chargeInterval.current) clearInterval(chargeInterval.current);
    
    handleSpin(charge);
  };

  // Cleanup
  useEffect(() => {
      return () => {
          if (chargeInterval.current) clearInterval(chargeInterval.current);
      }
  }, []);

  const handleSpin = async (power: number) => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    // Determine winner purely random for now, but could be weighted
    const winnerIndex = Math.floor(Math.random() * PRIZES.length);
    const win = PRIZES[winnerIndex];
    
    const centerAngle = winnerIndex * SEGMENT_ANGLE + (SEGMENT_ANGLE / 2);
    // target position is 360 - centerAngle (top)
    const targetRemainder = (360 - centerAngle) % 360;
    const currentRemainder = rotationRef.current % 360;
    let distance = targetRemainder - currentRemainder;
    if (distance <= 0) distance += 360;

    const spinCount = 3 + Math.floor((power / 100) * 7); 
    const randomOffset = (Math.random() * 20) - 10;
    
    const finalRotation = rotationRef.current + (360 * spinCount) + distance + randomOffset;
    rotationRef.current = finalRotation;

    await controls.start({
      rotate: finalRotation,
      transition: { 
        duration: 3 + (power / 100) * 2, // Longer spin for more power
        ease: [0.15, 0, 0.2, 1] // Bezier for spin physics
      }
    });

    setIsSpinning(false);
    setResult(win.label);

    if (win.points > 0) {
        db.updateUserPoints(win.points, 'Spin');
        toast.success(`You won ${win.points} Turbo Points!`);
    } else {
        db.updateUserPoints(0, 'Spin');
        toast.success(`You won: ${win.label}`);
    }
    
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#EAB308', '#EF4444', '#FFFFFF']
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-slate-100 to-slate-200 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-0 pointer-events-none"></div>

        <div className="w-full max-w-md space-y-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
                <Link to="/">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-slate-200 shadow-sm backdrop-blur-sm">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-slate-700 font-bold font-mono">DAILY JACKPOT</span>
                </div>
            </div>

            <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl border border-slate-200 text-slate-900 overflow-hidden relative rounded-3xl">
                <CardContent className="p-8 flex flex-col items-center relative z-10">
                    <div className="text-center mb-8">
                        <Badge className="bg-red-600 text-white font-black italic tracking-widest mb-2 border-2 border-red-800 shadow-lg shadow-red-500/30 px-3 py-1">
                            PIT CREW SPECIAL
                        </Badge>
                        <h2 className="text-4xl font-black italic tracking-tighter mb-1 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">SPIN THE WHEEL</h2>
                        <p className="text-slate-500 font-medium text-sm">Hold button to charge power!</p>
                    </div>

                    <motion.div 
                        className="relative w-72 h-72 mb-10 group"
                        animate={isSpinning ? { scale: [1, 1.02, 1] } : {}}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    >
                        {/* Outer Glow Ring */}
                        <div className={`absolute -inset-4 rounded-full bg-gradient-to-r from-yellow-400 via-red-400 to-purple-400 blur-xl transition-opacity duration-300 ${isCharging || isSpinning ? 'opacity-60 animate-pulse' : 'opacity-20'}`}></div>
                        
                        {/* Pointer */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-lg">
                            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-600"></div>
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-800 rounded-full border border-red-400"></div>
                        </div>

                        {/* Wheel Container */}
                        <div className="w-full h-full rounded-full border-[8px] border-white shadow-2xl relative bg-white overflow-hidden ring-4 ring-slate-100">
                            <motion.div 
                                className="w-full h-full relative"
                                animate={controls}
                                style={{ borderRadius: "50%" }}
                            >
                                {/* Conic Gradient Background */}
                                <div 
                                    className="absolute inset-0 w-full h-full"
                                    style={{
                                        background: `conic-gradient(
                                            ${PRIZES.map((p, i) => `${p.color} ${i * SEGMENT_ANGLE}deg ${(i + 1) * SEGMENT_ANGLE}deg`).join(', ')}
                                        )`,
                                        borderRadius: '50%'
                                    }}
                                />

                                {/* Segment Text Labels */}
                                {PRIZES.map((prize, index) => {
                                    const rotation = index * SEGMENT_ANGLE + (SEGMENT_ANGLE / 2);
                                    return (
                                        <div 
                                            key={index}
                                            className="absolute top-0 left-0 w-full h-full flex justify-center pt-6 pointer-events-none"
                                            style={{ transform: `rotate(${rotation}deg)` }}
                                        >
                                            <div className="flex flex-col items-center" style={{ color: prize.textColor }}>
                                                <span className="font-black text-xs italic tracking-tighter" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                                                    {prize.label}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* Wheel Hub */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-slate-100 shadow-xl flex items-center justify-center z-20">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200">
                                        <Disc className={`w-6 h-6 text-slate-400 ${isSpinning ? 'animate-spin' : ''}`} />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Power Bar */}
                    <div className="w-full h-4 bg-slate-100 rounded-full mb-4 overflow-hidden border border-slate-200 relative">
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">Power Level</span>
                        </div>
                        <motion.div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-red-500"
                            style={{ width: `${charge}%` }}
                        />
                    </div>

                    <div className="w-full">
                        <Button 
                            size="lg" 
                            onMouseDown={startCharging}
                            onMouseUp={stopCharging}
                            onMouseLeave={stopCharging}
                            onTouchStart={startCharging}
                            onTouchEnd={stopCharging}
                            disabled={isSpinning}
                            className={`
                                w-full font-black text-xl py-8 rounded-2xl shadow-xl transition-all transform select-none
                                ${isSpinning 
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 hover:from-yellow-300 hover:to-yellow-400 shadow-yellow-500/20 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1'
                                }
                            `}
                        >
                            {isSpinning ? (
                                <span className="flex items-center gap-2">
                                    <Gauge className="animate-spin" /> REVVING UP...
                                </span>
                            ) : isCharging ? (
                                <span className="flex items-center gap-2 animate-pulse text-red-900">
                                    <Zap className="fill-current" /> CHARGING... {charge}%
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2 italic">
                                    <Flag className="w-6 h-6" /> HOLD TO SPIN
                                </span>
                            )}
                        </Button>
                    </div>

                    <AnimatePresence>
                        {result && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="absolute bottom-4 left-0 right-0 z-50 text-center bg-white/95 backdrop-blur-xl border border-yellow-400 rounded-2xl p-6 shadow-2xl m-4"
                            >
                                <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-1">Finish Line Result</p>
                                <p className="text-4xl font-black text-slate-900 italic drop-shadow-sm">
                                    {result}
                                </p>
                                <Button size="sm" variant="ghost" className="mt-2 text-slate-500 hover:text-slate-900" onClick={() => setResult(null)}>
                                    Close
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            <div className="text-center">
                <p className="text-slate-500 text-xs font-mono mb-1">NEXT PIT WINDOW OPENS IN</p>
                <div className="flex justify-center gap-2 text-slate-700 font-mono text-xl font-bold bg-white p-2 rounded-lg border border-slate-200 w-fit mx-auto shadow-sm">
                    <span>14</span><span className="animate-pulse">:</span><span>22</span><span className="animate-pulse">:</span><span>05</span>
                </div>
            </div>
        </div>
    </div>
  );
}