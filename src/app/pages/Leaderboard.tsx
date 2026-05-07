import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Trophy, Medal, Crown, TrendingUp, Shield, Lock, Star, Zap, Flag, Timer, AlertCircle, ArrowUp, ArrowDown, Minus, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/app/lib/db';

export default function Leaderboard() {
  const [period, setPeriod] = useState('Weekly');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [currentUserData, setCurrentUserData] = useState<any>(null);

  // Simulate live updates and load initial data
  useEffect(() => {
    const loadData = () => {
        const users = db.getAllUsers().map((user, index) => ({
            ...user,
            rank: index + 1,
            points: user.turboPointsBalance,
            change: index < 2 ? "+5%" : "0%", // Mock change
            movement: index < 2 ? "up" : "same" // Mock movement
        }));
        setLeaderboardData(users);
        
        // Find current user (SpeedRacer / ID 1)
        const me = users.find(u => u.id === 1);
        if (me) setCurrentUserData(me);
    };

    loadData();

    // Mock live updates for visual effect
    const interval = setInterval(() => {
        setLeaderboardData(prev => {
            // Only shuffle occasionally for effect, but keeping top 1 stable usually
            if (Math.random() > 0.8) {
               // Reload from DB just in case
               const users = db.getAllUsers().map((user, index) => ({
                    ...user,
                    rank: index + 1,
                    points: user.turboPointsBalance,
                    change: "0%",
                    movement: "same"
                }));
               return users;
            }
            return prev;
        });
    }, 5000);

    const handleUpdate = () => loadData();
    window.addEventListener('db-update', handleUpdate);

    return () => {
        clearInterval(interval);
        window.removeEventListener('db-update', handleUpdate);
    };
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500 drop-shadow-md" />;
      case 2: return <Medal className="h-6 w-6 text-slate-400 fill-slate-300 drop-shadow-md" />;
      case 3: return <Medal className="h-6 w-6 text-amber-700 fill-amber-700 drop-shadow-md" />;
      default: return <span className="font-black text-slate-400 w-6 text-center text-lg italic">#{rank}</span>;
    }
  };

  const getRowStyle = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-50 hover:bg-yellow-100/80 border-l-4 border-l-yellow-500 shadow-sm z-10 scale-[1.01]";
      case 2: return "bg-slate-50 hover:bg-slate-100 border-l-4 border-l-slate-400";
      case 3: return "bg-blue-50/50 hover:bg-blue-100/50 border-l-4 border-l-blue-500 ring-2 ring-blue-500/20"; // User is rank 3 in mock data
      default: return "bg-white hover:bg-slate-50 border-l-4 border-l-transparent border-b border-b-slate-100";
    }
  };

  const getMovementIcon = (movement: string) => {
      switch (movement) {
          case 'up': return <ArrowUp className="w-3 h-3 text-green-500" />;
          case 'down': return <ArrowDown className="w-3 h-3 text-red-500" />;
          default: return <Minus className="w-3 h-3 text-slate-300" />;
      }
  }

  return (
    <div className="min-h-screen bg-transparent pb-20 md:pb-0 font-sans text-slate-900">
      
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase flex items-center gap-3">
                <Flag className="w-8 h-8 text-red-600" />
                Racing Grid
            </h1>
            <div className="flex items-center gap-2 text-slate-500 font-mono text-sm">
              <Shield className="h-4 w-4" />
              <span>OFFICIAL STANDINGS • UPDATED LIVE</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
                Your "Standing" is your current rank in the global leaderboard based on Turbo Points earned this season. Top 3 racers win exclusive rewards!
            </p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            {['Weekly', 'Monthly', 'Season'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all uppercase tracking-wider relative ${
                  period === p 
                    ? 'text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {period === p && (
                    <motion.div 
                        layoutId="activePeriod"
                        className="absolute inset-0 bg-blue-600 rounded-lg"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
                <span className="relative z-10">{p}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Podium / Stats Section */}
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          
          {/* Your Stats */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2"
          >
            <Card className="border-none shadow-xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white overflow-hidden relative h-full rounded-3xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                
                <CardContent className="p-8 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-yellow-400 shadow-lg shadow-yellow-500/20">
                            <AvatarFallback className="bg-white text-3xl font-black text-slate-900 italic">
                                {currentUserData?.initials || "SR"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-3 -right-3 bg-yellow-400 text-slate-900 font-black text-sm px-3 py-1 rounded-lg shadow-md border-2 border-slate-900 rotate-3">
                            #{currentUserData?.rank || "-"}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-200 uppercase tracking-widest bg-blue-900/50 px-2 py-0.5 rounded backdrop-blur-sm border border-blue-500/30">Your Standing</span>
                        </div>
                        <h2 className="text-3xl font-black italic tracking-tight">{currentUserData?.name || "SpeedRacer"}</h2>
                        <div className="flex items-center gap-3 text-blue-100 text-sm mt-2 font-mono">
                            <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/50 backdrop-blur-sm">
                            {currentUserData?.tier || "Rookie"} License
                            </Badge>
                            <span>|</span>
                            <span className="flex items-center gap-1 text-green-300 font-bold"><TrendingUp className="w-4 h-4" /> Top {currentUserData?.rank <= 3 ? "1%" : "10%"}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-blue-200 uppercase tracking-widest font-bold mb-1">Season Points</p>
                    <motion.p 
                        key={currentUserData?.points} // Animate when points change
                        initial={{ scale: 1.2, color: "#fff" }}
                        animate={{ scale: 1, color: "#fff" }}
                        className="text-6xl font-black italic tracking-tighter drop-shadow-md"
                    >
                        {currentUserData?.points?.toLocaleString() || 0}
                    </motion.p>
                    {currentUserData?.rank > 1 && (
                        <p className="text-xs text-blue-200 mt-2 font-mono">Next Overtake: <span className="text-white font-bold">350 pts</span></p>
                    )}
                    {currentUserData?.rank === 1 && (
                        <p className="text-xs text-yellow-300 mt-2 font-mono font-bold">Leader of the Pack!</p>
                    )}
                </div>
                </CardContent>
            </Card>
          </motion.div>

          {/* Bonus Card */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             whileHover={{ y: -5 }}
          >
            <Card className="border-yellow-200 bg-yellow-50 shadow-lg shadow-yellow-100 h-full flex flex-col justify-center relative overflow-hidden rounded-3xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-pulse"></div>
                <CardContent className="p-6 text-center space-y-3 relative z-10">
                <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                    className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-1 border border-yellow-200 shadow-sm"
                >
                    <Zap className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                </motion.div>
                <h3 className="font-black text-xl text-slate-900 uppercase italic leading-none">Pole Position Bonus</h3>
                <p className="text-sm text-slate-600">Finish the week at <span className="font-bold text-yellow-600 bg-yellow-100 px-1 rounded">#1</span> to claim the grand prize.</p>
                <Badge className="bg-yellow-500 text-white hover:bg-yellow-600 mt-2 text-md py-1.5 px-4 font-black shadow-lg shadow-yellow-500/20 border-none cursor-pointer">
                    +1,000 PTS
                </Badge>
                </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Leaderboard Table */}
        <Card className="border-slate-200 bg-white shadow-xl overflow-hidden rounded-3xl">
          <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
            <div className="flex justify-between items-center">
                <CardTitle className="text-slate-900 flex items-center gap-2 font-black italic uppercase tracking-tight">
                    <Timer className="w-5 h-5 text-slate-500" /> Top 10 Drivers
                </CardTitle>
                <div className="text-[10px] font-bold font-mono text-slate-500 flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    LIVE TIMING
                </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white hover:bg-white border-slate-100">
                  <TableHead className="w-[100px] pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Pos</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Driver</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">License</TableHead>
                  <TableHead className="text-right pr-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                {leaderboardData.map((user) => (
                  <motion.tr 
                    key={user.name} // Use name as key to track movement
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`transition-colors border-slate-100 relative group ${getRowStyle(user.rank)}`}
                  >
                    <TableCell className="font-medium pl-6 py-4 relative z-10">
                      <div className="flex items-center gap-3">
                        {getRankIcon(user.rank)}
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-0.5 opacity-50">
                            {getMovementIcon(user.movement as any)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 relative z-10">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 bg-slate-100 border border-slate-200 group-hover:border-blue-300 transition-colors">
                          <AvatarFallback className="text-xs text-slate-600 font-bold">
                            {user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className={`font-bold text-lg leading-none ${user.rank <= 3 ? 'text-slate-900 italic' : 'text-slate-700'}`}>
                            {user.name} 
                            {user.rank === 3 && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border border-blue-200 align-middle">You</span>}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">{user.team || "Independent"}</span>
                          {user.rank === 1 && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 uppercase tracking-wide animate-pulse mt-1">
                              <Star className="h-3 w-3 fill-yellow-600" />
                              Race Leader
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 relative z-10">
                      <Badge variant="outline" className={`
                        font-bold border-none px-2 py-1 text-[10px] uppercase tracking-wider
                        ${user.tier === 'Platinum' ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200' : ''}
                        ${user.tier === 'Elite' ? 'bg-red-100 text-red-700 ring-1 ring-red-200' : ''}
                        ${user.tier === 'Legend' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' : ''}
                        ${user.tier === 'Gold' ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200' : ''}
                        ${user.tier === 'Silver' ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' : ''}
                        ${user.tier === 'Rookie' ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-200' : ''}
                        ${user.tier === 'Pro' ? 'bg-green-100 text-green-700 ring-1 ring-green-200' : ''}
                      `}>
                        {user.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4 relative z-10">
                      <div className="flex flex-col items-end">
                        <span className="font-black text-xl text-slate-900 tracking-tight">{user.points?.toLocaleString() || 0}</span>
                        <span className={`text-[10px] font-mono font-bold ${user.change?.startsWith('+') ? 'text-green-600' : 'text-slate-400'}`}>
                          {user.change}
                        </span>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}