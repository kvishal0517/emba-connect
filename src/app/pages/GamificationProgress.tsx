import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Trophy, Star, Crown, Shield, CheckCircle2, Lock, ArrowLeft, Car, Gift, Zap, Flag } from 'lucide-react';
import { motion, useScroll } from 'framer-motion';
import { useNavigate } from 'react-router';
import { db } from '@/app/lib/db';

// Track Configuration
const TRACK_NODES = [
  { id: 'start', type: 'start', points: 0, label: 'Start Your Engines', icon: Flag },
  { id: 'reward-1', type: 'reward', points: 500, label: 'Free Air Freshener', icon: Gift },
  { id: 'rookie', type: 'tier', points: 1000, label: 'Rookie License', icon: Shield, color: 'text-orange-500', bg: 'bg-orange-100', tier: 'Rookie' },
  { id: 'reward-2', type: 'reward', points: 1500, label: '10% Off Service', icon: Zap },
  { id: 'pro', type: 'tier', points: 2500, label: 'Pro License', icon: Star, color: 'text-slate-500', bg: 'bg-slate-100', tier: 'Pro' },
  { id: 'reward-3', type: 'reward', points: 3500, label: 'Free Oil Change', icon: Gift },
  { id: 'elite', type: 'tier', points: 5000, label: 'Elite License', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100', tier: 'Elite' },
  { id: 'reward-4', type: 'reward', points: 7500, label: 'VIP Track Day', icon: Flag },
  { id: 'legend', type: 'tier', points: 10000, label: 'Legend License', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100', tier: 'Legend' },
];

export default function GamificationProgress() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const user = db.getCurrentUser();
  
  // User Progress
  const currentPoints = user.turboPointsBalance; 
  const currentRank = user.tier;
  
  // Auto-scroll to current position on load
  useEffect(() => {
    if (scrollContainerRef.current) {
        // Simple calculation to center the user's progress roughly
        const scrollWidth = scrollContainerRef.current.scrollWidth;
        const containerWidth = scrollContainerRef.current.clientWidth;
        const progressRatio = currentPoints / 10000;
        const targetScroll = (scrollWidth * progressRatio) - (containerWidth / 2);
        
        scrollContainerRef.current.scrollTo({
            left: Math.max(0, targetScroll),
            behavior: 'smooth'
        });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-20 relative">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/rewards-wallet')} className="text-slate-500 hover:bg-slate-100 rounded-full">
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-2">
                    <Flag className="w-6 h-6 text-red-600" /> Season Pass
                </h1>
                <p className="text-xs font-mono font-bold text-slate-500">TRACK PROGRESS • UNLOCK TIERS • EARN REWARDS</p>
            </div>
        </div>
        <div className="text-right">
            <Badge className="bg-blue-600 text-white font-black text-lg px-4 py-1 shadow-lg shadow-blue-500/20 border-none uppercase italic transform -skew-x-12">
                {currentPoints.toLocaleString()} PTS
            </Badge>
        </div>
      </div>

      {/* Main Track Area */}
      <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-slate-900 flex flex-col justify-center overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-800/50 to-slate-900/50 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)]"></div>

        <div className="relative z-10 w-full overflow-x-auto scrollbar-hide py-20 px-10 cursor-grab active:cursor-grabbing" ref={scrollContainerRef}>
            <div className="flex items-center gap-20 min-w-max px-20 relative">
                
                {/* Connecting Line (Track) */}
                <div className="absolute top-1/2 left-0 w-full h-4 bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
                     {/* Progress Fill */}
                     <motion.div 
                        className="h-full bg-gradient-to-r from-blue-600 via-purple-500 to-yellow-500 relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (currentPoints / 10000) * 100)}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                     >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/checkered-pattern.png')] opacity-20 mix-blend-overlay animate-[slide_1s_linear_infinite]"></div>
                     </motion.div>
                </div>

                {/* Nodes */}
                {TRACK_NODES.map((node, index) => {
                    const isUnlocked = currentPoints >= node.points;
                    const isNext = !isUnlocked && (index === 0 || currentPoints >= TRACK_NODES[index - 1].points);
                    
                    const NodeIcon = node.icon;
                    
                    return (
                        <div key={node.id} className="relative group z-10 flex flex-col items-center">
                            
                            {/* Node Circle */}
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`
                                    w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-xl transition-all duration-300 relative
                                    ${isUnlocked 
                                        ? 'bg-white border-blue-500 scale-110 shadow-blue-500/50' 
                                        : 'bg-slate-800 border-slate-600 text-slate-500 grayscale'
                                    }
                                    ${node.type === 'tier' ? 'w-24 h-24 border-8' : ''}
                                    ${isNext ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
                                `}
                            >
                                {isUnlocked && (
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-md z-20">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                )}
                                
                                <NodeIcon className={`${node.type === 'start' || node.type === 'reward' ? 'w-8 h-8' : 'w-10 h-10'} ${
                                    isUnlocked 
                                        ? (node.type === 'tier' ? node.color : node.type === 'reward' ? 'text-yellow-500' : 'text-blue-600') 
                                        : 'text-slate-600'
                                }`} />
                            </motion.div>

                            {/* Label */}
                            <div className="mt-4 text-center w-40">
                                <p className={`font-black uppercase text-sm mb-1 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{node.label}</p>
                                <Badge variant="outline" className={`border font-mono text-[10px] ${isUnlocked ? 'border-blue-500 text-blue-400' : 'border-slate-700 text-slate-600'}`}>
                                    {node.points.toLocaleString()} PTS
                                </Badge>
                            </div>

                            {/* Tooltip for Reward */}
                            {node.type === 'reward' && !isUnlocked && (
                                <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 px-3 py-2 rounded-lg text-xs font-bold shadow-lg whitespace-nowrap pointer-events-none transform -translate-y-2 group-hover:translate-y-0 transition-transform">
                                    Locked Reward
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {/* User Car Marker (Floating) */}
                {/* We calculate this position dynamically or just cheat with a fixed offset for now */}
            </div>
            
            {/* Floating Car Indicator on Track */}
            {/* Note: In a real app, calculate actual pixel offset. Here we use a separate layer for visual effect */}
        </div>

        {/* Legend/Info Footer */}
        <div className="absolute bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-6 z-20 flex justify-center gap-8 text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
             <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-blue-500 rounded-full"></div> Unlocked
             </div>
             <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-slate-700 border border-slate-500 rounded-full"></div> Locked
             </div>
             <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div> Next Goal
             </div>
        </div>

      </div>
    </div>
  );
}