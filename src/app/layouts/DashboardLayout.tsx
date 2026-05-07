import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { Home, Wallet, User, Calendar, LogOut, Car, Trophy, Award, Flag, Gauge, ChevronRight, Ticket, Bot } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

import FloatingAIChat from '../components/FloatingAIChat';

// Speed Lines Background Component
const SpeedLinesBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <svg className="absolute w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <pattern id="speed-lines" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M0 100 L100 0" stroke="currentColor" strokeWidth="0.5" className="text-slate-900" />
      </pattern>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#speed-lines)" />
    </svg>
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 blur-[120px] rounded-full mix-blend-multiply" />
    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-400/10 blur-[120px] rounded-full mix-blend-multiply" />
  </div>
);

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  const NAV_ITEMS = [
    { icon: Home, label: 'Pit Lane', path: '/' },
    { icon: Calendar, label: 'Bookings', path: '/bookings' },
    { icon: Car, label: 'My Garage', path: '/vehicles' },
    { icon: Ticket, label: 'Daily Scratch', path: '/scratch' },
    { icon: Bot, label: 'PitStop AI', path: '/ai-assistant' },
    { icon: Wallet, label: 'Sponsors', path: '/rewards-wallet' },
    { icon: Award, label: 'Trophies', path: '/achievements' },
    { icon: Flag, label: 'Standings', path: '/leaderboard' },
    { icon: User, label: 'Driver Profile', path: '/profile' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden selection:bg-yellow-200 selection:text-yellow-900">
      <SpeedLinesBackground />

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-2xl z-20 relative">
        <div className="p-8 flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-blue-500/20"
          >
            <Gauge className="h-7 w-7 text-white" />
          </motion.div>
          <div>
            <span className="font-black text-xl tracking-tighter text-slate-900 italic uppercase block leading-none">Pitstop+</span>
            <span className="text-[10px] text-blue-600 font-bold tracking-widest uppercase bg-blue-50 px-1.5 py-0.5 rounded-sm mt-1 inline-block">Racing Rewards</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto scrollbar-hide">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} to={item.path} className="block relative group">
              {isActive(item.path) && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-blue-50 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive(item.path) 
                  ? 'text-blue-700 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 font-medium hover:bg-slate-50/50'
              }`}>
                <item.icon className={`h-5 w-5 transition-colors ${isActive(item.path) ? 'text-blue-600 fill-blue-600/10' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="tracking-wide text-sm">{item.label}</span>
                
                {isActive(item.path) && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-auto"
                  >
                    <ChevronRight className="h-4 w-4 text-blue-400" />
                  </motion.div>
                )}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 p-3 mb-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow cursor-pointer group">
            <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm group-hover:border-blue-100 transition-colors">
                <AvatarImage src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=300&q=80" />
                <AvatarFallback>SR</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">SpeedRacer</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate flex items-center gap-1">
                Gold License <Award className="w-3 h-3 text-yellow-500" />
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 gap-2 text-xs font-bold uppercase tracking-wider h-10 rounded-xl"
            onClick={() => navigate('/login')}
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <ScrollToTop />
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent p-1">
           <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation (Mobile) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-2 flex justify-between items-center z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const active = isActive(item.path);
            return (
                <Link 
                key={item.path} 
                to={item.path}
                className="relative group p-2"
                >
                {active && (
                    <motion.div
                    layoutId="mobileNav"
                    className="absolute -top-2 left-0 right-0 h-1 bg-blue-600 rounded-b-full mx-auto w-8"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
                <div className={`flex flex-col items-center gap-1 transition-all ${
                    active ? 'text-blue-600 -translate-y-1' : 'text-slate-400'
                }`}>
                    <item.icon className={`h-6 w-6 ${active ? 'fill-blue-600/10' : ''}`} />
                    <span className="text-[9px] font-black uppercase tracking-wider">{item.label.split(' ')[0]}</span>
                </div>
                </Link>
            );
          })}
        </nav>
      </main>
      
      {/* Floating AI Chat Widget */}
      <FloatingAIChat />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}