import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { AlertCircle, CheckCircle2, ChevronRight, Gift, History, QrCode, Ticket, Wallet, Copy, Trophy, Timer, Zap, Sparkles, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Separator } from '@/app/components/ui/separator';
import { toast } from "sonner";
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router';
import { RewardRedemptionModal } from '@/app/components/RewardRedemptionModal';
import { db, Reward } from '@/app/lib/db';

const CountUp = ({ to }: { to: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    const increment = to / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [to]);
  
  return <>{count.toLocaleString()}</>;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function RewardsWallet() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(db.getCurrentUser().turboPointsBalance);
  const [showModal, setShowModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  
  // Use activity log from DB for history
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
      // Subscribe to DB updates
      const handleUpdate = () => {
          setBalance(db.getCurrentUser().turboPointsBalance);
          setRewards(db.getRewards());
          // Ideally fetch activity log here too if DB supported it nicely
      };
      
      // Initial Load
      setRewards(db.getRewards());
      
      window.addEventListener('db-update', handleUpdate);
      return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  const handleRedeem = (reward: Reward) => {
    if (balance >= reward.pointCost) {
      // Use DB to deduct points
      db.updateUserPoints(-reward.pointCost, `Redeemed - ${reward.title}`);
      
      setSelectedReward(reward);
      setShowModal(true);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EF4444', '#3B82F6', '#EAB308'] // Red, Blue, Yellow
      });
    } else {
      toast.error("Insufficient Fuel", {
        description: `You need ${reward.pointCost - balance} more points to redeem this reward.`,
      });
    }
  };

  const handleInvite = () => {
    navigator.clipboard.writeText("https://pitstop.plus/ref/JOHN123");
    toast.success("Crew Link Copied!", {
      description: "Recruit friends to your pit crew and earn 500 pts each.",
      icon: <Copy className="text-blue-500" />
    });
  };

  const handleSpin = () => {
    navigate('/spin');
  }

  const SPONSORS = [
    { id: 1, name: "GripX Racing Tires", image: "https://images.unsplash.com/photo-1764699186616-8f707281e4f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjB0aXJlcyUyMHN0YWNrJTIwbmV3fGVufDF8fHx8MTc3MTY5NTkyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", tag: "Official Tire Partner" },
    { id: 2, name: "UltraLube Pro", image: "https://images.unsplash.com/photo-1753153012179-12b677adbcaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvciUyMG9pbCUyMGJvdHRsZSUyMHBvdXJpbmclMjBlbmdpbmV8ZW58MXx8fHwxNzcxNjk1OTIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", tag: "Performance Fluids" },
    { id: 3, name: "SparkMax Ignition", image: "https://images.unsplash.com/photo-1662973947884-782d1d46a217?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBzcGFyayUyMHBsdWd8ZW58MXx8fHwxNzcxNjk1NzQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", tag: "Ignition Systems" },
    { id: 4, name: "AeroSpeed Racing", image: "https://images.unsplash.com/photo-1742812044873-193d948de3bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWNpbmclMjBoZWxtZXQlMjBvbiUyMHRhYmxlfGVufDF8fHx8MTc3MTY5NTkyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", tag: "Safety Gear" },
    { id: 5, name: "NitroRush Energy", image: "https://images.unsplash.com/photo-1560689189-65b6ed6228e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmVyZ3klMjBkcmluayUyMGNhbiUyMGJldmVyYWdlfGVufDF8fHx8MTc3MTY5NTc0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", tag: "Official Energy Drink" },
  ];

  return (
    <div className="min-h-screen bg-transparent pb-20 md:pb-0 font-sans text-slate-900">
      
      {/* Header Section */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-8 pb-16 rounded-b-[3rem] shadow-2xl relative overflow-hidden text-white"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
        
        {/* Animated Speed Lines Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate('/')} 
                    className="text-white hover:bg-white/20 rounded-full"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                    <span className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><Wallet className="w-6 h-6 text-yellow-400" /></span> 
                    Sponsor Wallet
                </h1>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" size="icon" className="text-yellow-400 border-white/20 bg-white/10 hover:bg-white/20 hover:text-yellow-300 rounded-xl" onClick={handleSpin}>
                    <Trophy className="h-5 w-5" />
                </Button>
            </div>
          </div>
          
          <div className="text-center mb-12 relative">
            <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full transform scale-150"
            />
            <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.2em] mb-4">Current Fuel Level</p>
            <motion.div 
              key={balance}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center gap-2 relative z-10"
            >
              <span className="text-8xl font-black tracking-tighter drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-100">
                <CountUp to={balance} />
              </span>
              <span className="text-3xl font-black text-yellow-400 italic mt-8 rotate-[-5deg]">pts</span>
            </motion.div>
          </div>

          <motion.div 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 cursor-pointer hover:bg-white/20 transition-all group max-w-md mx-auto shadow-lg"
             onClick={() => navigate('/rewards/status')}
          >
            <div className="flex justify-between text-sm mb-4">
              <span className="text-white font-bold flex items-center gap-2 uppercase tracking-wide">
                 <Trophy className="w-4 h-4 text-yellow-400" /> Gold License
              </span>
              <span className="text-blue-200 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-wide text-xs">
                 Next Tier: Platinum <ChevronRight className="w-4 h-4" />
              </span>
            </div>
            {/* Custom Progress Bar */}
            <div className="h-4 bg-black/20 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 relative"
                 >
                     <motion.div 
                        animate={{ x: ["0%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] w-1/2"
                     />
                 </motion.div>
            </div>
            <p className="text-center text-xs text-blue-200 mt-3 font-mono font-medium">450 pts remaining to unlock Platinum</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-4 -mt-8 relative z-20 max-w-5xl mx-auto">
        
        {/* Sponsor Grid Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
        >
            <h2 className="text-xs font-bold text-white/90 uppercase tracking-[0.2em] mb-4 pl-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-yellow-400" /> Official Partners
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {SPONSORS.map((sponsor) => (
                    <motion.div 
                        key={sponsor.id}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/60 hover:border-yellow-400/30 transition-all group overflow-hidden relative shadow-lg"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none z-0" />

                        <div className="w-10 h-10 mb-2 rounded-full overflow-hidden border-2 border-white/20 shadow-sm relative z-10 group-hover:border-yellow-400 transition-colors">
                            <img src={sponsor.image} alt={sponsor.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="text-xs font-black text-white italic tracking-wide leading-tight relative z-10 group-hover:text-yellow-400 transition-colors">{sponsor.name}</h3>
                        <p className="text-[9px] text-slate-300 mt-0.5 relative z-10 uppercase font-medium tracking-wider">{sponsor.tag}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>

        <Tabs defaultValue="rewards" className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-16 bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-1.5 mb-8 border border-slate-100">
            <TabsTrigger value="rewards" className="rounded-xl font-black italic uppercase tracking-wider data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-slate-400 hover:text-slate-600">
                REWARDS
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl font-black italic uppercase tracking-wider data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-slate-400 hover:text-slate-600">
                TRACK RECORD
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rewards" className="space-y-8">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tight flex items-center gap-2">
                <Ticket className="w-6 h-6 text-blue-600" />
                Claim Sponsor Gear
              </h2>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {rewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  variants={itemVariants}
                  whileHover={{ y: -12, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="overflow-hidden border-slate-200 bg-white shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 h-full flex flex-col group rounded-3xl relative">
                    <div className="h-52 bg-slate-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                      <img 
                        src={reward.imageUrl || "https://images.unsplash.com/photo-1764267408655-ba0f7cb2500c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080&.jpg"} 
                        alt={reward.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 z-20 pointer-events-none" />
                      
                      <Badge className="absolute top-4 left-4 bg-yellow-400 text-slate-900 border-none font-black z-20 shadow-lg px-3 py-1 text-sm">
                        {reward.pointCost.toLocaleString()} PTS
                      </Badge>
                      <Badge variant="outline" className="absolute top-4 right-4 bg-black/50 text-white border-white/20 backdrop-blur-md z-20 font-bold text-[10px] uppercase">
                        {reward.category}
                      </Badge>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1 relative bg-white">
                        {/* Cutout effect for ticket look */}
                        <div className="absolute -top-3 left-0 w-4 h-8 bg-[#f8fafc] rounded-r-full shadow-inner" />
                        <div className="absolute -top-3 right-0 w-4 h-8 bg-[#f8fafc] rounded-l-full shadow-inner" />
                        <div className="absolute top-0 left-6 right-6 border-t-2 border-dashed border-slate-300/50" />

                        <div className="flex-1 mt-2">
                            <h3 className="font-black text-xl text-slate-900 mb-2 leading-tight uppercase italic">{reward.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 font-medium">{reward.stock > 0 ? `${reward.stock} remaining in stock` : "Out of Stock"}</p>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                             <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                <Timer className="w-3 h-3 mr-1" /> No Expiry
                             </div>
                             <Button 
                                size="sm" 
                                className={`rounded-xl font-bold shadow-md transition-all ${
                                    balance >= reward.pointCost && reward.stock > 0
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:shadow-blue-300' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100'
                                }`}
                                onClick={() => handleRedeem(reward)}
                                disabled={balance < reward.pointCost || reward.stock === 0}
                             >
                                {reward.stock === 0 ? 'SOLD OUT' : (balance >= reward.pointCost ? 'CLAIM NOW' : 'LOCKED')}
                             </Button>
                        </div>
                    </div>
                  </Card>
                </motion.div>
            ))}
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none mt-8 cursor-pointer overflow-hidden relative shadow-xl rounded-3xl" onClick={handleInvite}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                {/* Animated Gradient Blob */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>
                
                <CardContent className="p-10 flex items-center justify-between relative z-10">
                    <div className="max-w-lg">
                    <h3 className="font-black text-3xl mb-2 italic uppercase tracking-tight">Expand Your Crew</h3>
                    <p className="text-blue-100 mb-6 text-lg">Recruit friends to join the platform and both of you earn a <span className="text-yellow-400 font-black italic bg-white/10 px-2 rounded">500 PTS Nitro Boost</span>!</p>
                    <Button variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50 font-black gap-2 shadow-lg h-12 px-6 rounded-xl border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 transition-all">
                        <Copy className="w-4 h-4" /> COPY RECRUIT LINK
                    </Button>
                    </div>
                    <motion.div 
                        animate={{ rotate: [0, 10, 0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    >
                        <Gift className="h-32 w-32 text-white/20 absolute right-8 -bottom-8 rotate-12" />
                    </motion.div>
                </CardContent>
                </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white border-slate-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6">
                <CardTitle className="text-xl font-black text-slate-900 italic uppercase tracking-tight flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-400" /> Track Record
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium">Your pit stop and rewards history.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] w-full">
                  <div className="p-6 space-y-3">
                    {[
                      { id: 1, action: "Pit Stop Earned - Oil Change", date: "Oct 24, 2023", points: "+150" },
                      { id: 2, action: "Redeemed - Car Wash", date: "Oct 15, 2023", points: "-500" },
                      { id: 3, action: "Pit Stop Earned - Service Check", date: "Oct 10, 2023", points: "+50" },
                      { id: 4, action: "Rookie Bonus", date: "Oct 01, 2023", points: "+200" },
                    ].map((item, index) => (
                      <motion.div 
                        key={item.id} 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 5, backgroundColor: "rgba(241, 245, 249, 1)" }} // bg-slate-100
                        className="flex justify-between items-center p-4 rounded-2xl border border-slate-100 transition-colors cursor-default group"
                      >
                        <div className="flex items-center gap-5">
                          <div className={`p-4 rounded-2xl shadow-sm ${item.points.startsWith('+') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            {item.points.startsWith('+') ? <CheckCircle2 size={24} /> : <Ticket size={24} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">{item.action}</p>
                            <p className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wider mt-1">{item.date}</p>
                          </div>
                        </div>
                        <span className={`font-black text-xl italic ${item.points.startsWith('+') ? 'text-green-600' : 'text-slate-400'}`}>
                          {item.points}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button for Scan */}
      <div className="fixed bottom-24 right-6 md:hidden z-50">
        <Button size="icon" className="h-16 w-16 rounded-full bg-yellow-400 text-slate-900 shadow-xl shadow-yellow-400/30 hover:bg-yellow-300 border-4 border-white" onClick={() => toast("QR Scanner", { description: "Pit Crew Scanner Activated" })}>
          <QrCode className="h-8 w-8" />
        </Button>
      </div>

      <RewardRedemptionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        rewardName={selectedReward?.title || ""}
        pointsSpent={selectedReward?.pointCost || 0}
        newBalance={balance}
      />
    </div>
  );
}
