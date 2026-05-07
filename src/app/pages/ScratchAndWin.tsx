import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ArrowLeft, Ticket, Trophy, Zap, Sparkles, Timer, CheckCircle2, RotateCcw, Coffee, Film, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router';
import confetti from 'canvas-confetti';
import { db } from '@/app/lib/db';
import { toast } from 'sonner';

import discountImg from "figma:asset/3914f72189df7bfe87c8356e23d3803b52754e82.png";
import ticketImg from "figma:asset/c30353bd6889d23ffbfb6664f415e1b658d23de2.png";
import washImg from "figma:asset/1b58ba12a76adbe8cb2b9a0f7d7ba0f86ade97ca.png";
import mugImg from "figma:asset/10490e1f9c8d8ca7f181caf3ff08d4eaeccda305.png";

export default function ScratchAndWin() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [isScratching, setIsScratching] = useState(false);
  const [reward, setReward] = useState<{ type: string, value: number, label: string, icon: any, image: any } | null>(null);
  const [cooldown, setCooldown] = useState(false);

  // Expanded Reward Data
  const POSSIBLE_REWARDS = [
    { type: 'points', value: 100, label: '100 Turbo Points', icon: Trophy, image: null },
    { type: 'points', value: 250, label: '250 Turbo Points', icon: Trophy, image: null },
    { type: 'points', value: 500, label: '500 Turbo Points', icon: Trophy, image: null },
    { type: 'perk', value: 0, label: 'Free Coffee', icon: Coffee, image: mugImg },
    { type: 'perk', value: 0, label: 'Movie Ticket', icon: Film, image: ticketImg },
    { type: 'perk', value: 0, label: '10% Off Service', icon: ShoppingBag, image: discountImg },
    { type: 'perk', value: 0, label: 'Free Car Wash', icon: Sparkles, image: washImg },
    { type: 'points', value: 50, label: '50 Turbo Points', icon: Trophy, image: null },
  ];

  useEffect(() => {
    // Select a random reward on mount
    const randomReward = POSSIBLE_REWARDS[Math.floor(Math.random() * POSSIBLE_REWARDS.length)];
    setReward(randomReward);
    
    // Slight delay to ensure container is rendered
    setTimeout(initCanvas, 100);
    
    // Handle resize
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, []);


  const initCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Fill with metallic silver gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#94a3b8'); // Slate 400
    gradient.addColorStop(0.25, '#cbd5e1'); // Slate 300
    gradient.addColorStop(0.5, '#f1f5f9'); // Slate 100 (Highlight)
    gradient.addColorStop(0.75, '#cbd5e1'); // Slate 300
    gradient.addColorStop(1, '#94a3b8'); // Slate 400
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise texture for realism
    for (let i = 0; i < 5000; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.2})`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }

    // Add "Scratch Here" text
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = 'rgba(71, 85, 105, 0.5)'; // Slate 600
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2);
    
    // Add Racing Stripes Pattern
    const stripeWidth = 15;
    const spacing = 30;
    
    ctx.save();
    ctx.rotate(Math.PI / 12); // Tilt stripes
    for (let i = -100; i < canvas.width + 100; i += spacing) {
         ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
         ctx.fillRect(i, -100, stripeWidth, canvas.height + 200);
    }
    ctx.restore();
  };

  const handleScratch = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRevealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // If mouse isn't pressed, don't scratch
      if (e.type === 'mousemove' && (e as React.MouseEvent).buttons !== 1) return;
      
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    setIsScratching(true);

    // Erase effect
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 100, 0, Math.PI * 2); // Increased brush size for single scratch
    ctx.fill();

    // Check progress periodically
    if (Math.random() > 0.1) {
        checkProgress();
    }
  };

  const checkProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sample pixels to determine % scratched
    // Optimization: Don't read whole canvas, sample grid points
    const w = canvas.width;
    const h = canvas.height;
    const gap = 15; // Increased gap for faster sampling
    let totalPoints = 0;
    let clearPoints = 0;

    const imageData = ctx.getImageData(0, 0, w, h).data;
    
    for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
            const index = (y * w + x) * 4;
            // Check alpha channel
            if (imageData[index + 3] === 0) {
                clearPoints++;
            }
            totalPoints++;
        }
    }

    const progress = (clearPoints / totalPoints) * 100;
    setScratchProgress(progress);

    if (progress > 15 && !isRevealed) { // Reveal at 15% cleared (single scratch)
      revealPrize();
    }
  };

  const revealPrize = () => {
    if (isRevealed) return; // Prevent double trigger
    setIsRevealed(true);
    setScratchProgress(100);
    
    // Fade out canvas completely
    const canvas = canvasRef.current;
    if (canvas) {
        canvas.style.transition = 'opacity 0.5s ease-out';
        canvas.style.opacity = '0';
    }

    // Confetti Celebration
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
        return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // Update DB
    if (reward) {
        // If points, add them. If perk, maybe just log it or add 0 points but record activity.
        db.updateUserPoints(reward.value, 'Scratch');
        
        if (reward.value > 0) {
            toast.success(`You won ${reward.value} Turbo Points!`);
        } else {
            toast.success(`You won a ${reward.label}!`, {
                description: "Check your rewards wallet to redeem."
            });
        }
    }

    setCooldown(true);
  };

  const stopScratching = () => {
    setIsScratching(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 md:pb-0 overflow-hidden relative">
        {/* Background Texture */}
        <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none z-0"></div>
        <div className="fixed top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-lg mx-auto p-6 pt-10">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate('/rewards-wallet')} className="text-slate-500 hover:bg-white hover:shadow-sm rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-slate-200 shadow-sm backdrop-blur-sm">
                    <Ticket className="w-4 h-4 text-red-500" />
                    <span className="text-slate-700 font-bold font-mono text-sm">DAILY SCRATCH</span>
                </div>
                <div className="w-10"></div> {/* Spacer for alignment */}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
            >
                <Badge className="bg-yellow-400 text-slate-900 hover:bg-yellow-500 border-none font-black italic tracking-widest mb-4 px-3 py-1 shadow-lg shadow-yellow-500/20">
                    <Sparkles className="w-3 h-3 mr-1" /> BONUS ROUND
                </Badge>
                <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 mb-2 uppercase">
                    Scratch & Win
                </h1>
                <p className="text-slate-500 font-medium">Reveal hidden prizes to boost your rank!</p>
            </motion.div>

            {/* Scratch Card Container */}
            <div className="relative perspective-1000">
                <motion.div
                    whileHover={!isRevealed ? { scale: 1.02, rotateX: 2, rotateY: 2 } : {}}
                    className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white ring-1 ring-slate-200 h-[350px]"
                >
                    {/* Perforated Edge Effect (Top) */}
                    <div className="absolute top-0 left-0 right-0 h-4 bg-slate-900 z-20 mask-teeth-top opacity-10"></div>
                    
                    {/* Card Content (Prize) */}
                    <div className="relative bg-white h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50 via-white to-white opacity-50"></div>
                        
                        {/* Hidden Prize Info (Visible when scratched) */}
                        <div className={`relative z-10 flex flex-col items-center transition-all duration-500 w-full ${isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                           {reward && (
                               <>
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={isRevealed ? { y: 0, opacity: 1 } : {}}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className="mb-2 w-full flex justify-center"
                                >
                                    <img 
                                        src="https://images.unsplash.com/photo-1633292176821-17e236396274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVja2VyZWQlMjBmbGFnJTIwcmFjaW5nJTIwd2lubmVyfGVufDF8fHx8MTc3MTY5NjU3NXww&ixlib=rb-4.1.0&q=80&w=1080"
                                        alt="Winner"
                                        className="h-32 object-contain drop-shadow-md"
                                    />
                                </motion.div>
                                
                                <motion.div 
                                    animate={isRevealed ? { rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] } : {}}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                    className="mb-4 bg-yellow-100 p-4 rounded-full border-4 border-yellow-200 shadow-xl relative -mt-4 z-20 flex items-center justify-center overflow-hidden w-24 h-24"
                                >
                                    {reward.image ? (
                                        <img src={reward.image} alt={reward.label} className="w-full h-full object-contain" />
                                    ) : (
                                        <reward.icon className="w-10 h-10 text-yellow-600 drop-shadow-sm" />
                                    )}
                                </motion.div>
                                
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">You Won</h3>
                                <div className="text-3xl font-black italic text-slate-900 mb-4 tracking-tight drop-shadow-sm">
                                    {reward.label}
                                </div>

                                <Button 
                                    onClick={() => {
                                        toast.success("Reward Claimed!");
                                        navigate('/rewards-wallet');
                                    }}
                                    className="w-full max-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-black italic uppercase tracking-wider h-10 rounded-xl shadow-lg shadow-blue-500/30 animate-pulse"
                                >
                                    Claim Prize
                                </Button>
                               </>
                           )}
                        </div>
                    </div>

                    {/* Canvas Overlay (Scratch Layer) */}
                    <div 
                        ref={containerRef}
                        className={`absolute inset-0 cursor-crosshair z-20 transition-opacity duration-700 ${isRevealed ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
                        onMouseUp={stopScratching}
                        onMouseLeave={stopScratching}
                    >
                        <canvas
                            ref={canvasRef}
                            className="w-full h-full touch-none"
                            onMouseMove={handleScratch}
                            onTouchMove={handleScratch}
                            onMouseDown={handleScratch}
                            onTouchStart={handleScratch}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Progress Indicator */}
            {!isRevealed && (
                <div className="mt-6">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                        <span>Reveal Progress</span>
                        <span>{Math.round(scratchProgress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${scratchProgress}%` }}
                        />
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-3 font-medium flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3" /> Scratch thoroughly to claim your prize
                    </p>
                </div>
            )}

            {/* Cooldown / Limit Info */}
            <div className="mt-8 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                        <Timer className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Scratch</p>
                        <p className="font-bold text-slate-900">23h 59m</p>
                    </div>
                </div>
                <div className="h-8 w-[1px] bg-slate-200"></div>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${cooldown ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                        {cooldown ? <CheckCircle2 className="w-5 h-5" /> : <Ticket className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Limit</p>
                        <p className="font-bold text-slate-900">{cooldown ? '0/1 Remaining' : '1/1 Available'}</p>
                    </div>
                </div>
            </div>

            {/* Transparency Note */}
            <p className="text-center text-[10px] text-slate-400 mt-6 max-w-xs mx-auto">
                Prizes are distributed randomly based on probability tiers. 
                <span className="block mt-1">Turbo Points (80%), Discounts (15%), Free Services (5%).</span>
            </p>

        </div>
    </div>
  );
}