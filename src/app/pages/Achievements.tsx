import React, { useEffect } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { motion, useAnimation } from 'framer-motion';
import { Award, Trophy, Zap, Users, Star, Lock, CheckCircle2, Wrench, DollarSign, Clock, ArrowLeft, Flame, Gauge, Flag } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import confetti from 'canvas-confetti';

// Badge Component with Progress Ring
const BadgeItem = ({ badge, index }: { badge: any, index: number }) => {
  const isUnlocked = badge.progress >= 100;
  const radius = 32; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (badge.progress / 100) * circumference;
  const controls = useAnimation();

  useEffect(() => {
    if (isUnlocked) {
        controls.start({
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
            transition: { duration: 0.5, delay: index * 0.2 }
        });
    }
  }, [isUnlocked, controls, index]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="relative flex flex-col items-center group cursor-pointer perspective-1000"
      whileHover={{ y: -10, scale: 1.05 }}
      onClick={(e) => {
        if (isUnlocked) {
            // Confetti burst from the cursor position
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;
            
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { x, y },
                colors: ['#EAB308', '#FFFFFF', '#3B82F6'],
                zIndex: 9999
            });
        }
      }}
    >
      {/* Glow Effect for Unlocked */}
      {isUnlocked && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.2, 0.4] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-30 -z-10 group-hover:opacity-50 transition-opacity"
        />
      )}

      {/* Progress Ring Container */}
      <div className="relative w-32 h-32 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-3">
        <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#e2e8f0" // slate-200
            strokeWidth="6"
            fill="transparent"
            className="opacity-30"
          />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${isUnlocked ? 'text-yellow-500' : 'text-blue-600'} transition-all duration-1000 ease-out`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (badge.progress / 100) * circumference }}
          />
        </svg>
        
        {/* Badge Icon */}
        <motion.div 
            animate={controls}
            className={`absolute inset-0 flex items-center justify-center`}
        >
          <div 
            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-2xl transition-all duration-300 relative overflow-hidden group-hover:shadow-yellow-500/40 ${
              isUnlocked 
                ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 border-white text-slate-900' 
                : 'bg-slate-100 border-slate-200 text-slate-400 grayscale'
            }`}
          >
            {isUnlocked && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>}
            {isUnlocked && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>}
            
            {isUnlocked ? badge.icon : <Lock className="w-8 h-8 opacity-50" />}
          </div>
        </motion.div>
        
        {/* Checkmark for completed */}
        {isUnlocked && (
           <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ type: "spring", stiffness: 500, delay: 0.5 + (index * 0.1) }}
             className="absolute bottom-4 right-4 bg-green-500 text-white rounded-full p-1 border-2 border-white shadow-lg z-20 group-hover:scale-110 transition-transform"
           >
             <CheckCircle2 className="w-4 h-4" />
           </motion.div>
        )}
      </div>

      <div className="text-center space-y-2 px-2 w-full">
        <h3 className={`font-black italic uppercase text-sm tracking-wider ${isUnlocked ? 'text-slate-900' : 'text-slate-400'} group-hover:text-blue-600 transition-colors`}>{badge.title}</h3>
        <p className="text-xs text-slate-500 line-clamp-2 min-h-[2.5em] font-medium">{badge.description}</p>
        <div className="mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
           <Badge variant="outline" className={`
             border font-bold text-[10px] px-2 py-0.5 h-auto uppercase tracking-widest
             ${isUnlocked ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-slate-100 text-slate-400 border-slate-200'}
           `}>
             {badge.progress}% Complete
           </Badge>
        </div>
      </div>
    </motion.div>
  );
};

export default function Achievements() {
  const navigate = useNavigate();

  const BADGES = [
    {
      id: 1,
      title: "First Pit Stop",
      description: "Complete your first car service.",
      progress: 100,
      icon: <Wrench className="w-8 h-8" />
    },
    {
      id: 2,
      title: "High Mileage",
      description: "Service history spans 5+ visits.",
      progress: 60,
      icon: <Gauge className="w-8 h-8" />
    },
    {
      id: 3,
      title: "Big Spender",
      description: "Invest over $10k in upgrades.",
      progress: 35,
      icon: <DollarSign className="w-8 h-8" />
    },
    {
      id: 4,
      title: "Crew Builder",
      description: "Refer 5 friends to the team.",
      progress: 20,
      icon: <Users className="w-8 h-8" />
    },
    {
      id: 5,
      title: "Gold License",
      description: "Achieve Gold tier status.",
      progress: 100,
      icon: <Star className="w-8 h-8" />
    },
    {
      id: 6,
      title: "Pole Position",
      description: "Book a service before 8 AM.",
      progress: 0,
      icon: <Flag className="w-8 h-8" />
    },
    {
      id: 7,
      title: "Nitro Boost",
      description: "Earn 1000 points in a single day.",
      progress: 100,
      icon: <Flame className="w-8 h-8" />
    },
    {
      id: 8,
      title: "Perfect Lap",
      description: "Complete 3 services with 5-star rating.",
      progress: 66,
      icon: <Trophy className="w-8 h-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-transparent pb-20 md:pb-0 font-sans text-slate-900">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-slate-100 pt-8 pb-16 px-4 rounded-b-[3rem] relative overflow-hidden mb-12 border-b border-slate-200 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none mix-blend-multiply"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" onClick={() => navigate('/rewards-wallet')} className="text-slate-500 hover:bg-white hover:shadow-sm rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm transition-all">
                  <ArrowLeft className="w-5 h-5" />
               </Button>
               <div>
                  <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">
                      <span className="bg-yellow-400 p-2 rounded-xl shadow-lg shadow-yellow-400/20"><Trophy className="w-6 h-6 text-white" /></span> Trophy Case
                  </h1>
                  <p className="text-slate-500 font-mono text-sm mt-1 font-medium">Unlock milestones to earn bonus points</p>
               </div>
           </div>
           
           <motion.div 
             whileHover={{ scale: 1.05 }}
             className="bg-white/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/60 flex items-center gap-4 shadow-lg self-start md:self-auto transform hover:shadow-xl transition-all"
           >
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                  <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Unlocked</p>
                  <p className="font-black text-2xl italic text-slate-900">3 / 8</p>
              </div>
           </motion.div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 p-6 md:p-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-8">
            {BADGES.map((badge, index) => (
              <BadgeItem key={badge.id} badge={badge} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}