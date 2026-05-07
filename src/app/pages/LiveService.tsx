import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, Thermometer, Gauge, CheckCircle2, Clock, Wrench, AlertCircle, PlayCircle, BarChart3, Database, Zap } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useNavigate, useParams } from 'react-router';
import { db, Service } from '@/app/lib/db';
import { toast } from 'sonner';

// Mock Telemetry Data Component
const TelemetryGraph = ({ label, color, value, unit }: { label: string, color: string, value: number, unit: string }) => {
  const bars = 20;
  return (
    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{label}</span>
        <span className={`text-xl font-black font-mono ${color}`}>{value} <span className="text-xs text-slate-500">{unit}</span></span>
      </div>
      <div className="flex items-end gap-1 h-12">
        {[...Array(bars)].map((_, i) => {
          const height = Math.random() * 100;
          return (
            <motion.div
              key={i}
              initial={{ height: '20%' }}
              animate={{ height: `${Math.max(10, Math.random() * 100)}%` }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }}
              className={`flex-1 rounded-sm ${i > bars - 5 ? 'bg-red-500' : 'bg-blue-500'} opacity-60`}
              style={{ backgroundColor: color.replace('text-', 'bg-').split(' ')[0] }} // Rough color mapping
            />
          );
        })}
      </div>
    </div>
  );
};

export default function LiveService() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  
  const STEPS = [
    { title: "Vehicle Check-In", duration: 2000 },
    { title: "Diagnostic Scan", duration: 4000 },
    { title: "Service Execution", duration: 8000 },
    { title: "Quality Inspection", duration: 3000 },
    { title: "Final Polish", duration: 2000 }
  ];

  useEffect(() => {
    // In a real app, fetch by ID. Here we just get the first "In Progress" or recently completed one.
    const services = db.getRecentServices();
    const target = services.find(s => s.id.toString() === id) || services.find(s => s.status === 'In Progress') || services[0];
    setService(target);

    // Simulate progress
    let currentStep = 0;
    const interval = setInterval(() => {
        setProgress(p => {
            if (p >= 100) {
                clearInterval(interval);
                return 100;
            }
            // Logic to advance steps based on progress
            const stepSize = 100 / STEPS.length;
            const calculatedStep = Math.floor((p + 1) / stepSize);
            if (calculatedStep !== currentStep && calculatedStep < STEPS.length) {
                setActiveStep(calculatedStep);
                currentStep = calculatedStep;
            }
            return p + 0.5;
        });
    }, 100);

    return () => clearInterval(interval);
  }, [id]);

  if (!service) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Telemetry...</div>;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white relative overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.5)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>
        
        {/* Header */}
        <header className="relative z-10 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl p-4 flex justify-between items-center sticky top-0">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-xl font-black italic uppercase tracking-wider flex items-center gap-2 text-white">
                        <Activity className="w-5 h-5 text-green-500 animate-pulse" /> Live Telemetry
                    </h1>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        CONNECTED: STATION_ALPHA_1
                    </div>
                </div>
            </div>
            <Badge variant="outline" className="border-blue-500 text-blue-400 font-mono text-xs px-3 py-1 animate-pulse">
                DATA STREAM ACTIVE
            </Badge>
        </header>

        <main className="relative z-10 p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Status & Progress */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Main Status Card */}
                <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-shimmer"></div>
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-3xl font-black italic text-white uppercase mb-1">{service.serviceName}</h2>
                                <p className="text-slate-400 font-mono text-sm">RO ID: #{service.id} • {new Date().toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-black font-mono text-blue-400 tabular-nums">
                                    {Math.round(progress)}%
                                </div>
                                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Completion</div>
                            </div>
                        </div>

                        {/* Visual Progress Track */}
                        <div className="relative py-8">
                            <div className="absolute top-1/2 left-0 w-full h-2 bg-slate-800 rounded-full -translate-y-1/2"></div>
                            <motion.div 
                                className="absolute top-1/2 left-0 h-2 bg-blue-500 rounded-full -translate-y-1/2 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            ></motion.div>
                            
                            <div className="relative flex justify-between z-10">
                                {STEPS.map((step, i) => {
                                    const isActive = i === activeStep;
                                    const isCompleted = i < activeStep;
                                    
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-3 group">
                                            <motion.div 
                                                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                                    isCompleted ? 'bg-blue-600 border-blue-500 text-white' : 
                                                    isActive ? 'bg-slate-900 border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-110' : 
                                                    'bg-slate-900 border-slate-700 text-slate-600'
                                                }`}
                                            >
                                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-mono font-bold">{i + 1}</span>}
                                            </motion.div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-white' : 'text-slate-600'}`}>
                                                {step.title}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Live Data Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <TelemetryGraph label="Engine Temp" value={195} unit="°F" color="text-orange-500" />
                    <TelemetryGraph label="Oil Pressure" value={42} unit="PSI" color="text-green-500" />
                    <TelemetryGraph label="Battery" value={14.2} unit="V" color="text-yellow-400" />
                    <TelemetryGraph label="Tire Status" value={100} unit="%" color="text-blue-500" />
                </div>

                {/* Mechanic Live Feed (Mock) */}
                <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md overflow-hidden">
                    <CardContent className="p-0">
                        <div className="bg-slate-950/50 p-3 border-b border-slate-800 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Database className="w-3 h-3" /> Service Log
                            </span>
                            <Badge className="bg-green-900/30 text-green-400 border border-green-800/50 text-[10px] animate-pulse">LIVE</Badge>
                        </div>
                        <div className="p-4 h-48 overflow-y-auto font-mono text-sm space-y-2">
                            <div className="text-slate-400"><span className="text-blue-500">[10:42:01]</span> Vehicle lifted on Rack 4.</div>
                            <div className="text-slate-400"><span className="text-blue-500">[10:43:15]</span> OBD-II Scan initiated... <span className="text-green-500">Connected.</span></div>
                            <div className="text-slate-400"><span className="text-blue-500">[10:43:45]</span> No critical error codes found.</div>
                            <div className="text-slate-400"><span className="text-blue-500">[10:45:00]</span> Draining oil... Flow rate normal.</div>
                            <div className="text-slate-400"><span className="text-blue-500">[10:48:22]</span> Oil filter removed. Inspection: Clean.</div>
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-white bg-blue-900/20 p-1 rounded border-l-2 border-blue-500 pl-2"
                            >
                                <span className="text-blue-400">[CURRENT]</span> Installing new synthetic filter (Part #PH345)...
                            </motion.div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Visualizer */}
            <div className="space-y-6">
                <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md h-full min-h-[400px] flex flex-col">
                    <CardContent className="p-0 flex-1 relative flex items-center justify-center bg-slate-950/50 overflow-hidden rounded-t-xl">
                        {/* Grid Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(30,41,59,.3)_25%,rgba(30,41,59,.3)_26%,transparent_27%,transparent_74%,rgba(30,41,59,.3)_75%,rgba(30,41,59,.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(30,41,59,.3)_25%,rgba(30,41,59,.3)_26%,transparent_27%,transparent_74%,rgba(30,41,59,.3)_75%,rgba(30,41,59,.3)_76%,transparent_77%,transparent)] bg-[size:50px_50px]"></div>
                        
                        {/* Car Model (Spinning Image Mock) */}
                        <div className="relative z-10 w-64 h-64">
                             <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[spin_10s_linear_infinite]"></div>
                             <div className="absolute inset-4 rounded-full border border-dashed border-blue-500/20 animate-[spin_15s_linear_infinite_reverse]"></div>
                             
                             <img 
                                src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=500&q=80" 
                                alt="Car Analysis" 
                                className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                             />

                             {/* Floating Status Points */}
                             <motion.div 
                                animate={{ scale: [1, 1.2, 1] }} 
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute top-1/4 right-1/4 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"
                             />
                             <motion.div 
                                animate={{ scale: [1, 1.2, 1] }} 
                                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                                className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"
                             />
                        </div>
                    </CardContent>
                    <div className="p-4 border-t border-slate-800 bg-slate-900">
                        <h3 className="text-sm font-bold text-white uppercase mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" /> System Health
                        </h3>
                        <div className="space-y-2">
                             <div className="flex justify-between text-xs text-slate-400">
                                <span>Engine</span>
                                <span className="text-green-400">OPTIMAL</span>
                             </div>
                             <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                 <div className="w-[95%] h-full bg-green-500"></div>
                             </div>

                             <div className="flex justify-between text-xs text-slate-400 mt-2">
                                <span>Brakes</span>
                                <span className="text-green-400">GOOD</span>
                             </div>
                             <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                 <div className="w-[88%] h-full bg-green-500"></div>
                             </div>
                        </div>
                    </div>
                </Card>

                <Card className="bg-blue-900/20 border-blue-800/50 backdrop-blur-md">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-blue-300 font-bold uppercase tracking-wider">Estimated Completion</p>
                            <p className="text-xl font-black text-white">11:15 AM</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </main>
    </div>
  );
}