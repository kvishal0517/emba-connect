import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Car, Clock, Trophy, Gift, ArrowUpRight, Bell, Search, Zap, ChevronRight, Flag, Timer, Gauge, Sparkles, History, AlertCircle, Calendar, MapPin, Wrench, X, ShoppingBag, Flame } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from "framer-motion";
import { db, Service, Vehicle, Reward, GameConfig } from '@/app/lib/db';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu";

// Number counting animation component
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

export default function Home() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [user, setUser] = useState(db.getCurrentUser());
  const [services, setServices] = useState<Service[]>(db.getRecentServices());
  const [vehicles, setVehicles] = useState<Vehicle[]>(db.getMyVehicles());
  const [gameSettings, setGameSettings] = useState<GameConfig[]>(db.getGameSettings());
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const MOCK_SEARCH_DATA = [
    { id: 's1', title: 'Premium Oil Change', type: 'Service', icon: Wrench, path: '/bookings' },
    { id: 's2', title: 'Tire Rotation', type: 'Service', icon: Gauge, path: '/bookings' },
    { id: 's3', title: 'Brake Inspection', type: 'Service', icon: AlertCircle, path: '/bookings' },
    { id: 'r1', title: '$50 Gas Card', type: 'Reward', icon: Gift, path: '/rewards-wallet' },
    { id: 'r2', title: 'Free Car Wash', type: 'Reward', icon: Sparkles, path: '/rewards-wallet' },
    { id: 'r3', title: 'Pit Crew Cap', type: 'Merch', icon: ShoppingBag, path: '/rewards-wallet' },
  ];

  const filteredResults = searchQuery.length > 1 
    ? MOCK_SEARCH_DATA.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  
  useEffect(() => {
    const handleUpdate = () => {
      setUser(db.getCurrentUser());
      setServices(db.getRecentServices());
      setVehicles(db.getMyVehicles());
      setGameSettings(db.getGameSettings());
    };
    
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Start Your Engines');
    else if (hour < 18) setGreeting('Full Speed Ahead');
    else setGreeting('Race Under The Lights');
  }, []);

  // Filter services
  const historyServices = services.filter(s => s.status === 'Completed');
  // Sort upcoming by date ascending (soonest first)
  const upcomingServices = services
    .filter(s => s.status === 'Scheduled' || s.status === 'In Progress')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const inProgressService = services.find(s => s.status === 'In Progress');

  const nextAppointment = upcomingServices.length > 0 ? upcomingServices[0] : null;

  const getVehicle = (id: number) => vehicles.find(v => v.id === id);

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

  return (
    <div className="min-h-full bg-transparent font-sans text-slate-900 pb-20 md:pb-8">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 backdrop-blur-xl shadow-sm rounded-b-2xl mx-4 mt-2">
        <div className="flex items-center gap-4 flex-1 max-w-lg">
          <div className="relative w-full group z-50">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
              <Input 
                placeholder="Search services, rewards..." 
                className="pl-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl h-10 w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
              {searchQuery && (
                 <button 
                   onClick={() => { setSearchQuery(''); setShowResults(false); }}
                   className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                 >
                   <X className="w-4 h-4" />
                 </button>
              )}
            </div>
            
            <AnimatePresence>
              {showResults && searchQuery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                >
                  {filteredResults.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    <div>
                      <div className="bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Top Results
                      </div>
                      {filteredResults.map((item) => (
                        <div 
                          key={item.id}
                          className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                          onClick={() => {
                            navigate(item.path);
                            setSearchQuery('');
                            setShowResults(false);
                          }}
                        >
                          <div className={`p-2 rounded-lg ${item.type === 'Service' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.type}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                className="relative text-slate-500 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors outline-none"
              >
                <Bell className="h-5 w-5" />
                {upcomingServices.length > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                )}
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-xl shadow-xl border-slate-200 z-50">
              <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">Notifications</span>
                {upcomingServices.length > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px] h-5 px-1.5">
                    {upcomingServices.length} New
                  </Badge>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {upcomingServices.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
                    <Bell className="w-8 h-8 mb-2 opacity-20" />
                    No new notifications
                  </div>
                ) : (
                  upcomingServices.map((service) => (
                    <DropdownMenuItem 
                      key={service.id} 
                      className="p-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 border-b border-slate-50 last:border-0 flex items-start gap-3 outline-none"
                      onClick={() => navigate('/bookings?tab=upcoming')}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600 mt-0.5">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 text-sm leading-none">{service.serviceName}</p>
                        <p className="text-xs text-slate-500">Scheduled for {service.date}</p>
                        <div className="flex gap-2 mt-1">
                           <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200 uppercase tracking-wide">
                              Upcoming
                           </span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500 h-8 hover:text-blue-600" onClick={() => navigate('/bookings?tab=upcoming')}>
                  View Schedule
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group" onClick={() => navigate('/profile')}>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none text-slate-900 group-hover:text-blue-600 transition-colors">{user.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">{user.tier} Tier</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm group-hover:border-blue-200 transition-colors">
                <AvatarImage src="https://images.unsplash.com/photo-1700770956385-9c0bdf08e314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300" />
                <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </motion.div>
          </div>
        </div>
      </header>


      <motion.main 
        className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flag className="w-5 h-5 text-red-600 animate-pulse" />
              <span className="text-red-600 font-bold uppercase tracking-wider text-xs bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Pit Crew Chief</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic drop-shadow-sm">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">{greeting}, Driver!</span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Your vehicle is prepped and ready on the grid.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                    variant="outline" 
                    className="gap-2 flex-1 md:flex-none border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 shadow-sm hover:shadow-md transition-all h-12 px-6 rounded-xl font-bold" 
                    onClick={() => navigate('/rewards-wallet')}
                >
                <Gift className="h-4 w-4 text-purple-600" />
                Rewards
                </Button>
             </motion.div>
             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                    className="bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 gap-2 flex-1 md:flex-none font-black italic border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all h-12 px-8 rounded-xl uppercase tracking-wider" 
                    onClick={() => navigate('/bookings')}
                >
                <Timer className="h-4 w-4" />
                BOOK PIT STOP
                </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* In Progress Service Banner */}
        <AnimatePresence>
          {inProgressService && (
             <motion.div 
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full"
             >
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between shadow-2xl shadow-blue-900/50 relative overflow-hidden border border-slate-800">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.1),transparent)] animate-[shimmer_2s_infinite]"></div>
                    
                    <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500 animate-pulse">
                             <Gauge className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                    LIVE SERVICE
                                </span>
                                <span className="text-slate-400 text-xs font-mono">ID: #{inProgressService.id}</span>
                            </div>
                            <h3 className="font-black italic text-white text-lg leading-none">
                                {inProgressService.serviceName}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto mt-3 sm:mt-0">
                         <div className="hidden md:block text-right mr-4">
                             <p className="text-xs text-slate-400 font-bold uppercase">Current Stage</p>
                             <p className="text-blue-400 font-mono font-bold">DIAGNOSTIC SCAN</p>
                         </div>
                         <Button 
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400 animate-pulse"
                            onClick={() => navigate(`/live-service/${inProgressService.id}`)}
                         >
                            View Telemetry <ArrowUpRight className="w-4 h-4 ml-2" />
                         </Button>
                    </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming Appointment Notification Banner */}
        <AnimatePresence>
        {nextAppointment && (
            <motion.div 
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="w-full mb-6"
            >
                <div className="bg-yellow-400 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between shadow-lg shadow-yellow-500/30 relative overflow-hidden border-b-4 border-yellow-600 group">
                    {/* Decorative Background */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="absolute -right-6 -top-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    
                    {/* Left Side: Vehicle & Info */}
                    <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-lg bg-white/30 backdrop-blur-sm border-2 border-white/50 overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform cursor-pointer" onClick={() => navigate('/bookings')}>
                             <ImageWithFallback 
                                src={getVehicle(nextAppointment.vehicleId)?.imageUrl || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=200&q=80"} 
                                alt="Vehicle" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="bg-slate-900 text-yellow-400 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                    Pit Stop Due
                                </span>
                                <span className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {nextAppointment.date}
                                </span>
                            </div>
                            <h3 className="font-black italic text-slate-900 leading-none text-lg tracking-tight">
                                {nextAppointment.serviceName}
                            </h3>
                        </div>
                    </div>

                    {/* Right Side: Actions */}
                    <div className="flex items-center gap-2 relative z-10 w-full sm:w-auto mt-3 sm:mt-0">
                         <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 text-xs font-bold hover:bg-white/20 text-slate-900 flex-1 sm:flex-none"
                            onClick={() => navigate('/bookings?tab=upcoming')}
                         >
                            Reschedule
                         </Button>
                         <Button 
                            size="sm"
                            className="h-8 bg-slate-900 text-yellow-400 hover:bg-slate-800 text-xs font-black italic border-none shadow-md flex-1 sm:flex-none uppercase tracking-wider"
                            onClick={() => navigate('/bookings?tab=upcoming')}
                         >
                            View Ticket <ChevronRight className="w-3 h-3 ml-1" />
                         </Button>
                    </div>
                </div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Wallet & Points (Span 2) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            
            {/* Points Hero Card */}
            <Card className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 border-none shadow-2xl shadow-blue-900/20 overflow-hidden relative min-h-[260px] group text-white rounded-3xl transform transition-transform hover:scale-[1.01]">
                {/* Animated Background Elements */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-32 -right-32 w-96 h-96 border-[1px] border-white/10 border-dashed rounded-full"
                />
                <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-32 -left-32 w-80 h-80 border-[1px] border-white/10 border-dashed rounded-full"
                />
                
                {/* Glimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full gap-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="space-y-1">
                        <h2 className="text-blue-200 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                             <span className="bg-white/10 p-1 rounded-md"><Gauge className="w-3 h-3 text-yellow-400" /></span>
                             Turbo Points Balance
                        </h2>
                        <div className="flex items-baseline gap-2 relative">
                            {/* Glow behind numbers */}
                            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-50"></div>
                            <span className="text-7xl font-black tracking-tighter text-white drop-shadow-xl relative z-10">
                                <CountUp to={user.turboPointsBalance} />
                            </span>
                            <span className="text-2xl text-yellow-400 font-black italic relative z-10">pts</span>
                        </div>
                    </div>
                    
                    <motion.div 
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 w-full md:w-auto min-w-[200px] shadow-lg"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-green-500/20 p-2 rounded-xl text-green-300 border border-green-500/30">
                            <ArrowUpRight className="h-5 w-5" />
                            </div>
                            <div>
                            <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">Last Lap Earned</p>
                            <p className="text-sm font-bold text-white">Oil Change Service</p>
                            </div>
                        </div>
                        <p className="text-3xl font-black text-white italic">+150 <span className="text-xs font-bold text-blue-200 not-italic">pts</span></p>
                    </motion.div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm items-end">
                        <span className="text-blue-100 font-bold tracking-wide">{user.tier} Tier Status</span>
                        <span className="text-yellow-400 font-black italic">75% to Platinum</span>
                    </div>
                    {/* Racing Style Progress Bar with Stripes Animation */}
                    <div className="h-5 bg-black/30 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "75%" }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 skew-x-[-20deg] origin-left scale-x-110 relative overflow-hidden"
                        >
                            <motion.div 
                                animate={{ x: ["0%", "100%"] }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="absolute inset-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.2)_10px,rgba(255,255,255,0.2)_20px)]"
                            />
                        </motion.div>
                        {/* Tick Marks */}
                        <div className="absolute inset-0 flex justify-between px-2 pointer-events-none">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="w-[1px] h-full bg-white/10 z-10" />
                            ))}
                        </div>
                    </div>
                </div>
                </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* My Garage Widget */}
               <motion.div whileHover={{ y: -8, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                 <Card className="shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer bg-white border-slate-200 h-full rounded-2xl group overflow-hidden" onClick={() => navigate('/vehicles')}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Car size={80} />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="bg-blue-100 p-2 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Car className="w-5 h-5" /> 
                            </span>
                            My Garage
                        </CardTitle>
                        <div className="bg-slate-100 p-1 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="w-20 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm group-hover:ring-2 ring-blue-500/20 transition-all flex items-center justify-center relative">
                                {vehicles.length > 0 && vehicles[0].imageUrl ? (
                                    <ImageWithFallback src={vehicles[0].imageUrl} className="w-full h-full object-cover" alt={vehicles[0].model} />
                                ) : (
                                    <Car className="text-slate-300 w-8 h-8" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                    {vehicles.length > 0 ? `${vehicles[0].year} ${vehicles[0].make} ${vehicles[0].model}` : "No Vehicle"}
                                </p>
                                {vehicles.length > 0 && (
                                    <p className="text-[10px] text-orange-700 font-bold bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-md w-fit mt-1 flex items-center gap-1 animate-pulse">
                                        <AlertCircle className="w-3 h-3" /> Service Due
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                 </Card>
               </motion.div>

               {/* Achievements Widget */}
               <motion.div whileHover={{ y: -8, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                 <Card className="shadow-sm hover:shadow-xl hover:shadow-yellow-500/10 transition-all cursor-pointer bg-white border-slate-200 h-full rounded-2xl group overflow-hidden" onClick={() => navigate('/achievements')}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Trophy size={80} />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="bg-yellow-100 p-2 rounded-lg text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                <Trophy className="w-5 h-5" /> 
                            </span>
                            Trophy Case
                        </CardTitle>
                        <div className="bg-slate-100 p-1 rounded-full group-hover:bg-yellow-50 group-hover:text-yellow-600 transition-colors">
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-yellow-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 group-hover:text-yellow-700 transition-colors">First Service</p>
                                <p className="text-xs text-slate-500 font-medium">+500 pts bonus unlocked</p>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
               </motion.div>
            </div>

            {/* Recent Services Table */}
            <Card className="bg-white border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4 bg-slate-50/50">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2 font-black italic">
                    <History className="w-5 h-5" /> Pit Stop History
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold text-xs uppercase tracking-wider" onClick={() => navigate('/history')}>View Full History</Button>
              </CardHeader>
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-slate-100 hover:bg-slate-50">
                    <TableHead className="text-slate-500 w-[80px] font-bold uppercase text-xs tracking-wider">Vehicle</TableHead>
                    <TableHead className="text-slate-500 w-[150px] font-bold uppercase text-xs tracking-wider">Date</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase text-xs tracking-wider">Service Performed</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase text-xs tracking-wider">Status</TableHead>
                    <TableHead className="text-right text-slate-500 font-bold uppercase text-xs tracking-wider">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyServices.slice(0, 5).map((service, i) => (
                    <motion.tr 
                        key={service.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="border-slate-100 hover:bg-blue-50/50 transition-colors group cursor-default"
                    >
                      <TableCell className="p-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
                            <ImageWithFallback 
                                src={getVehicle(service.vehicleId)?.imageUrl || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=200&q=80"} 
                                alt="car" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600 text-sm group-hover:text-slate-900">
                        {service.date}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{service.serviceName}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border border-green-200 font-bold text-[10px] uppercase tracking-wider group-hover:bg-green-200 transition-colors">
                          {service.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-black text-green-600 group-hover:text-green-700 group-hover:scale-110 origin-right transition-all">
                        +{service.pointsEarned}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </Card>

          </motion.div>

          {/* Right Column - Rewards & Offers (Span 1) */}
          <motion.div variants={itemVariants} className="space-y-6">
            
            {/* Daily Spin Widget */}
            {(gameSettings.find(g => g.id === 'spin')?.enabled ?? true) && (
            <motion.div 
                whileHover={{ scale: 1.03, rotate: 1 }} 
                whileTap={{ scale: 0.98 }}
                className="relative z-10"
            >
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Card 
                    className="overflow-hidden border-none shadow-xl relative h-56 group cursor-pointer bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl" 
                    onClick={() => navigate('/spin')}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <motion.div 
                        animate={{ rotate: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                        className="absolute -top-6 -right-6 p-8 opacity-20 transform"
                    >
                        <Trophy size={140} className="text-white" />
                    </motion.div>
                    
                    <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                        <div className="flex justify-between items-start mb-2">
                             <Badge className="w-fit bg-white/90 backdrop-blur text-orange-600 font-bold border-none shadow-sm flex items-center gap-1">
                                <Sparkles className="w-3 h-3 fill-orange-600" /> Daily Bonus
                            </Badge>
                            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full border border-white/20">Refreshes in 4h</span>
                        </div>
                       
                        <h3 className="text-3xl font-black text-white italic drop-shadow-sm leading-none mb-1 mt-2">SPIN & WIN!</h3>
                        <p className="text-orange-50 text-sm mb-6 font-medium">Daily prizes up to <span className="font-bold text-white bg-white/20 px-1 rounded">1,000 pts</span></p>
                        <Button size="sm" className="w-full bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-xl shadow-lg h-10 uppercase tracking-wide">
                            Spin The Wheel Now
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
            )}

            {/* Reaction Game Widget */}
            {(gameSettings.find(g => g.id === 'reaction')?.enabled ?? true) && (
            <motion.div 
                whileHover={{ scale: 1.03, rotate: -1 }} 
                whileTap={{ scale: 0.98 }}
                className="relative z-10"
            >
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-700 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Card 
                    className="overflow-hidden border-none shadow-xl relative h-48 group cursor-pointer bg-slate-900 text-white rounded-2xl" 
                    onClick={() => navigate('/reaction-game')}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                    
                    <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                        <div className="flex justify-between items-start mb-2">
                             <Badge className="w-fit bg-red-600 text-white font-bold border-none shadow-sm flex items-center gap-1">
                                <Timer className="w-3 h-3" /> Mini Game
                            </Badge>
                        </div>
                       
                        <h3 className="text-2xl font-black text-white italic drop-shadow-sm leading-none mb-1 mt-2 uppercase">Lights Out Challenge</h3>
                        <p className="text-slate-400 text-xs mb-4 font-medium">Test your reaction time. Beat 200ms to win big!</p>
                        <Button size="sm" className="w-full bg-red-600 text-white hover:bg-red-500 font-bold rounded-xl shadow-lg h-9 uppercase tracking-wide border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all">
                            Play Now
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
            )}

            {/* Drag Race Widget */}
            {(gameSettings.find(g => g.id === 'drag')?.enabled ?? true) && (
            <motion.div 
                whileHover={{ scale: 1.03, rotate: 1 }} 
                whileTap={{ scale: 0.98 }}
                className="relative z-10"
            >
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Card 
                    className="overflow-hidden border-none shadow-xl relative h-48 group cursor-pointer bg-slate-900 text-white rounded-2xl" 
                    onClick={() => navigate('/drag-race')}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                    
                    <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                        <div className="flex justify-between items-start mb-2">
                             <Badge className="w-fit bg-violet-500 text-white font-bold border-none shadow-sm flex items-center gap-1">
                                <Flame className="w-3 h-3" /> New Game
                            </Badge>
                        </div>
                       
                        <h3 className="text-2xl font-black text-white italic drop-shadow-sm leading-none mb-1 mt-2 uppercase">Drag Strip Launch</h3>
                        <p className="text-slate-400 text-xs mb-4 font-medium">Perfect your reaction time. Don't red light!</p>
                        <Button size="sm" className="w-full bg-violet-600 text-white hover:bg-violet-500 font-bold rounded-xl shadow-lg h-9 uppercase tracking-wide border-b-4 border-violet-800 active:border-b-0 active:translate-y-1 transition-all">
                            Start Engine
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
            )}

            {/* Pit Crew Widget */}
            {(gameSettings.find(g => g.id === 'pitcrew')?.enabled ?? true) && (
            <motion.div 
                whileHover={{ scale: 1.03, rotate: -1 }} 
                whileTap={{ scale: 0.98 }}
                className="relative z-10"
            >
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Card 
                    className="overflow-hidden border-none shadow-xl relative h-48 group cursor-pointer bg-slate-900 text-white rounded-2xl" 
                    onClick={() => navigate('/pit-crew')}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                    
                    <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                        <div className="flex justify-between items-start mb-2">
                             <Badge className="w-fit bg-blue-500 text-white font-bold border-none shadow-sm flex items-center gap-1">
                                <Wrench className="w-3 h-3" /> Pit Stop
                            </Badge>
                        </div>
                       
                        <h3 className="text-2xl font-black text-white italic drop-shadow-sm leading-none mb-1 mt-2 uppercase">Pit Crew Challenge</h3>
                        <p className="text-slate-400 text-xs mb-4 font-medium">Can you change a tyre in under 2 seconds?</p>
                        <Button size="sm" className="w-full bg-blue-600 text-white hover:bg-blue-500 font-bold rounded-xl shadow-lg h-9 uppercase tracking-wide border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all">
                            Grab The Gun
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
            )}

            {/* Memory Tune Widget */}
            {(gameSettings.find(g => g.id === 'memory')?.enabled ?? true) && (
            <motion.div 
                whileHover={{ scale: 1.03, rotate: 1 }} 
                whileTap={{ scale: 0.98 }}
                className="relative z-10"
            >
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Card 
                    className="overflow-hidden border-none shadow-xl relative h-48 group cursor-pointer bg-slate-900 text-white rounded-2xl" 
                    onClick={() => navigate('/memory-tune')}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                    
                    <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                        <div className="flex justify-between items-start mb-2">
                             <Badge className="w-fit bg-amber-500 text-slate-900 font-bold border-none shadow-sm flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Diagnostic
                            </Badge>
                        </div>
                       
                        <h3 className="text-2xl font-black text-white italic drop-shadow-sm leading-none mb-1 mt-2 uppercase">Memory Tune-Up</h3>
                        <p className="text-slate-400 text-xs mb-4 font-medium">Diagnose engine codes in the correct sequence!</p>
                        <Button size="sm" className="w-full bg-amber-500 text-slate-900 hover:bg-amber-400 font-bold rounded-xl shadow-lg h-9 uppercase tracking-wide border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all">
                            Start Scan
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
            )}


            <div className="flex items-center justify-between px-1 pt-2">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-purple-600" /> Popular Rewards
              </h3>
              <Button variant="link" className="text-blue-600 h-auto p-0 text-xs font-bold uppercase tracking-wider" onClick={() => navigate('/rewards-wallet')}>View All</Button>
            </div>

            <div className="space-y-4">
              {[
                  { title: "Free Oil Change", points: 1000, img: "https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=200&q=80" },
                  { title: "$20 Gas Card", points: 800, img: "https://images.unsplash.com/photo-1588743645013-29487076ef7b?auto=format&fit=crop&w=200&q=80" }
              ].map((reward, i) => (
                <motion.div key={i} whileHover={{ x: 5 }}>
                    <Card className="overflow-hidden border-slate-200 bg-white hover:bg-slate-50 shadow-sm hover:shadow-md transition-all group cursor-pointer rounded-xl" onClick={() => navigate('/rewards-wallet')}>
                    <div className="flex gap-4 p-3 items-center">
                        <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200 relative">
                        <img src={reward.img} alt={reward.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{reward.title}</h4>
                        <div className="flex items-center mt-1">
                             <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100 text-[10px] font-bold px-1.5 py-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {reward.points} PTS
                             </Badge>
                        </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 group-hover:text-blue-600 bg-slate-50 group-hover:bg-white rounded-full">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                    </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-slate-50 to-white border-slate-200 shadow-none border-dashed p-4 flex items-center justify-center text-center">
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Referral Code</p>
                    <p className="text-lg font-black text-slate-900 font-mono tracking-wider selection:bg-blue-100">SPEED25</p>
                 </div>
            </Card>

          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}