import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { History, Calendar, DollarSign, Wrench, ArrowLeft, Car, CheckCircle2, Clock, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { db, Service, Vehicle } from '@/app/lib/db';
import { toast } from 'sonner';

export default function ServiceHistory() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('history');

  useEffect(() => {
    const data = db.getRecentServices();
    setServices(data);
    setVehicles(db.getMyVehicles());

    // Auto-switch to upcoming if there are scheduled services and no history, or just preference
    const hasUpcoming = data.some(s => s.status === 'Scheduled' || s.status === 'In Progress');
    if (hasUpcoming) {
        setActiveTab('upcoming');
    }
  }, []);

  const getVehicleName = (vehicleId: number) => {
    const v = vehicles.find(v => v.id === vehicleId);
    return v ? `${v.year} ${v.make} ${v.model}` : `Vehicle #${vehicleId}`;
  };

  const getVehicleImage = (vehicleId: number) => {
      const v = vehicles.find(v => v.id === vehicleId);
      // Fallback if the vehicle record doesn't have an image for some reason, though DB ensures it does.
      return v?.imageUrl || "https://images.unsplash.com/photo-1764267408655-ba0f7cb2500c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080&.jpg";
  }

  const upcomingServices = services.filter(s => s.status === 'Scheduled' || s.status === 'In Progress');
  const pastServices = services.filter(s => s.status === 'Completed');

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
    <div className="min-h-screen bg-transparent pb-24 md:pb-8 font-sans text-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-slate-500" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">
                    <span className="bg-slate-100 p-2 rounded-xl"><History className="w-6 h-6 text-slate-500" /></span> 
                    Service Log
                    </h1>
                    <p className="text-slate-500 font-medium">Manage appointments and view service records.</p>
                </div>
            </div>
            
            {/* Custom Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl self-start md:self-auto">
                <button 
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'upcoming' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Upcoming <span className="ml-1 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-[10px]">{upcomingServices.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    History
                </button>
            </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-600 text-white border-none shadow-lg">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Total Services</p>
                        <p className="text-3xl font-black italic">{pastServices.length}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                        <Wrench className="w-6 h-6 text-white" />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Spent</p>
                        <p className="text-3xl font-black italic text-slate-900">
                            ${pastServices.reduce((acc, s) => acc + s.cost, 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                        <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                </CardContent>
            </Card>
             <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Points Earned</p>
                        <p className="text-3xl font-black italic text-yellow-500">
                            {pastServices.reduce((acc, s) => acc + s.pointsEarned, 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                        <CheckCircle2 className="w-6 h-6 text-yellow-600" />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Content Area */}
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm min-h-[400px]">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                <CardTitle className="text-lg font-bold text-slate-800">
                    {activeTab === 'upcoming' ? 'Scheduled Appointments' : 'Recent Activity'}
                </CardTitle>
                <CardDescription>
                    {activeTab === 'upcoming' 
                        ? 'Your upcoming pit stops and maintenance schedules.' 
                        : 'Your service timeline sorted by most recent.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[600px] w-full p-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'upcoming' ? (
                            <motion.div
                                key="upcoming"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {upcomingServices.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                            <Calendar className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-bold text-lg">No Upcoming Bookings</p>
                                            <p className="text-slate-500 text-sm max-w-xs mx-auto">Your fleet is road ready! Check back when you book your next service.</p>
                                        </div>
                                        <Button onClick={() => navigate('/bookings')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                                            Book Service Now
                                        </Button>
                                    </div>
                                ) : (
                                    upcomingServices.map((service) => (
                                        <motion.div 
                                            key={service.id} 
                                            variants={itemVariants}
                                        >
                                            <Card className="border-l-4 border-l-blue-600 shadow-md hover:shadow-lg transition-all overflow-hidden">
                                                <div className="flex flex-col md:flex-row">
                                                    <div className="w-full md:w-48 h-48 md:h-auto relative">
                                                        <img 
                                                            src={getVehicleImage(service.vehicleId)} 
                                                            alt="Vehicle" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                                            <p className="text-white font-bold text-sm">{getVehicleName(service.vehicleId)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-2 py-1 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> Scheduled
                                                                </Badge>
                                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">ID: #{service.id}</p>
                                                            </div>
                                                            <h3 className="text-xl font-black italic text-slate-900 mb-1">{service.serviceName}</h3>
                                                            <div className="flex items-center gap-4 text-sm text-slate-600 mt-3">
                                                                <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md font-medium"><Calendar className="w-4 h-4 text-slate-400" /> {service.date}</span>
                                                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> Main Service Center</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                                            <span className="text-slate-500 text-sm">Estimated Cost: <span className="font-bold text-slate-900">${service.cost}</span></span>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="text-xs font-bold uppercase tracking-wider hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all cursor-pointer"
                                                                onClick={() => {
                                                                    toast.success("Reschedule Initiated", { description: "Redirecting to booking calendar..." });
                                                                    navigate('/bookings');
                                                                }}
                                                            >
                                                                Reschedule
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="history"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6 relative"
                            >
                                {/* Timeline Line */}
                                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 hidden md:block"></div>

                                {pastServices.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <p>No past service history found.</p>
                                    </div>
                                ) : (
                                    pastServices.map((service) => (
                                        <motion.div 
                                            key={service.id} 
                                            variants={itemVariants}
                                            className="relative pl-0 md:pl-12 group"
                                        >
                                            {/* Timeline Dot */}
                                            <div className="absolute left-[11px] top-6 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md z-10 hidden md:block group-hover:scale-125 transition-transform"></div>

                                            <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all group-hover:border-blue-200 overflow-hidden">
                                                <div className="flex flex-col md:flex-row">
                                                    {/* Date Column */}
                                                    <div className="bg-slate-50 p-4 md:w-32 flex flex-row md:flex-col items-center justify-center md:justify-start gap-2 border-b md:border-b-0 md:border-r border-slate-100">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        <span className="font-bold text-slate-700 text-sm">{service.date}</span>
                                                    </div>
                                                    
                                                    {/* Vehicle Image - Now visible on mobile too */}
                                                    <div className="w-full md:w-32 h-32 md:h-auto overflow-hidden relative border-r border-slate-100">
                                                        <img 
                                                            src={getVehicleImage(service.vehicleId)} 
                                                            alt="Vehicle" 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-4 flex-1 flex flex-col justify-center">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <div>
                                                                    <h3 className="font-black text-lg text-slate-900 italic">{service.serviceName}</h3>
                                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mt-1">
                                                                        <Car className="w-3 h-3" /> {getVehicleName(service.vehicleId)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Badge className="bg-green-100 text-green-700 border-transparent font-bold uppercase tracking-wider text-[10px]">
                                                                {service.status}
                                                            </Badge>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 border-dashed">
                                                            <span className="font-medium text-slate-500 text-sm">Cost: <span className="text-slate-900 font-bold">${service.cost.toFixed(2)}</span></span>
                                                            <span className="font-black text-green-600 text-sm flex items-center gap-1">
                                                                +{service.pointsEarned} PTS
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </ScrollArea>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}