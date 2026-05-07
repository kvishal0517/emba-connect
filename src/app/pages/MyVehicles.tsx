import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Plus, Car, Calendar, AlertTriangle, CheckCircle2, Wrench, Gauge, X, Grid, Monitor, Eye, Activity, Zap, Thermometer } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { db } from '@/app/lib/db';
import { VehicleImage } from '@/app/components/VehicleImage';

// Import custom vehicle assets
// Replaced with high-quality Unsplash images for reliable loading
const CAR_IMAGES = {
    sedan: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1080", // Audi A5
    suv: "https://images.unsplash.com/photo-1615063029891-497bebd4f03c?auto=format&fit=crop&w=1080", // Audi RS Q8
    truck: "https://images.unsplash.com/photo-1764420518503-529b20493bba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwcGlja3VwJTIwdHJ1Y2slMjByZWFsaXN0aWMlMjBwaG90b3xlbnwxfHx8fDE3NzE2OTUzNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    coupe: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=1080", // McLaren
    hypercar: "https://images.unsplash.com/photo-1621687947477-8898144b6335?auto=format&fit=crop&w=1080", // Hypercar/Supercar
    compact: "https://images.unsplash.com/photo-1686074449582-6374eaebacf3?auto=format&fit=crop&w=1080", // Honda Civic Type R
    city: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1080", // Blue Hatchback
    budget: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1080", // White Sedan
    project: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=1080", // Old Car
    convertible: "https://images.unsplash.com/photo-1707406767361-acbd5c264bd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibXclMjBjb252ZXJ0aWJsZSUyMHNpZGUlMjB2aWV3fGVufDF8fHx8MTc3MTY5NTcwNHww&ixlib=rb-4.1.0&q=80&w=1080",
    van: "https://images.unsplash.com/photo-1768400554801-2002b63e0591?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXNzZW5nZXIlMjB2YW4lMjBzaWRlJTIwdmlld3xlbnwxfHx8fDE3NzE2OTU2OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    classic: "https://images.unsplash.com/photo-1669882571612-4a9c7822cd4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbXVzY2xlJTIwY2FyJTIwbXVzdGFuZyUyMHNpZGUlMjB2aWV3fGVufDF8fHx8MTc3MTY5NTY5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    electric: "https://images.unsplash.com/photo-1770287872690-45c8bd1e8d1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlbGVjdHJpYyUyMGNhciUyMHNpZGUlMjB2aWV3fGVufDF8fHx8MTc3MTY5NTY5Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    hatchback: "https://images.unsplash.com/photo-1595342274661-480b44488999?auto=format&fit=crop&w=1080", // Grey Hatchback
    default: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1080"
};

type CarType = keyof typeof CAR_IMAGES;

export default function MyVehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState(db.getMyVehicles());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'showroom'>('showroom');
  const [showHotspots, setShowHotspots] = useState(false);
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [newVehicle, setNewVehicle] = useState({ 
    make: '', 
    model: '', 
    year: '', 
    plate: '',
    type: 'sedan' as CarType 
  });
  
  useEffect(() => {
    const handleUpdate = () => setVehicles(db.getMyVehicles());
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  const handleAddVehicle = () => {
    if (!newVehicle.make || !newVehicle.model || !newVehicle.plate) {
      toast.error("Please fill in all fields");
      return;
    }

    // Determine Image URL
    let imageUrl = CAR_IMAGES[newVehicle.type] || CAR_IMAGES.default;

    db.addVehicle({
      make: newVehicle.make,
      model: newVehicle.model,
      year: parseInt(newVehicle.year) || new Date().getFullYear(),
      licensePlate: newVehicle.plate,
      imageUrl: imageUrl
    });

    setVehicles(db.getMyVehicles());
    setIsAddOpen(false);
    setNewVehicle({ make: '', model: '', year: '', plate: '', type: 'sedan' });
    toast.success("Vehicle Added Successfully", {
      description: `${newVehicle.year} ${newVehicle.make} ${newVehicle.model} has been parked in your garage.`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Service Due': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'Road Ready': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Service Due': return 'PIT STOP NEEDED';
      case 'Urgent': return 'CRITICAL SERVICE';
      case 'Road Ready': return 'RACE READY';
      default: return status.toUpperCase();
    }
  };

  // Hotspot Component
  const Hotspot = ({ top, left, label, status }: { top: string, left: string, label: string, status: 'good' | 'warning' | 'critical' }) => (
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="absolute z-20 group cursor-pointer"
        style={{ top, left }}
        onClick={() => toast(label, { description: `Status: ${status.toUpperCase()} - Inspection Passed` })}
      >
          <div className={`
              w-6 h-6 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-white
              ${status === 'good' ? 'bg-green-500 animate-pulse' : ''}
              ${status === 'warning' ? 'bg-yellow-500 animate-pulse' : ''}
              ${status === 'critical' ? 'bg-red-500 animate-ping' : ''}
          `}>
              {status === 'good' && <CheckCircle2 className="w-3 h-3 text-white" />}
              {status === 'warning' && <AlertTriangle className="w-3 h-3 text-white" />}
              {status === 'critical' && <AlertTriangle className="w-3 h-3 text-white" />}
          </div>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/20">
              {label}
          </div>
      </motion.div>
  );

  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-8 font-sans text-slate-900">
      
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 relative z-10">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/60 shadow-sm">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">
               <span className="bg-slate-100 p-2 rounded-xl"><Car className="w-8 h-8 text-slate-400" /></span> My Garage
            </h1>
            <p className="text-slate-500 font-mono text-xs mt-1 ml-1 font-bold">MANAGE FLEET • TRACK SERVICE • VIEW STATS</p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('showroom')}
                className={`rounded-lg gap-2 text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'showroom' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
             >
                <Monitor className="w-4 h-4" /> Showroom
             </Button>
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('grid')}
                className={`rounded-lg gap-2 text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
             >
                <Grid className="w-4 h-4" /> Grid
             </Button>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-500/20 font-black uppercase tracking-wider h-10 px-4 rounded-xl hover:scale-105 transition-all">
                <Plus className="w-4 h-4" /> Add Car
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white border-slate-200 text-slate-900">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold italic">Add New Vehicle</DialogTitle>
                    <DialogDescription className="text-slate-500">
                    Enter your vehicle details below to track rewards and services.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Image Preview */}
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 relative mb-2 border border-slate-200 shadow-inner group">
                        <VehicleImage 
                            src={CAR_IMAGES[newVehicle.type] || CAR_IMAGES.default} 
                            alt="Vehicle Preview" 
                            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded font-bold uppercase">
                            Preview
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="make" className="text-slate-600">Make</Label>
                        <Input id="make" placeholder="Toyota" className="bg-slate-50 border-slate-200 text-slate-900" value={newVehicle.make} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="model" className="text-slate-600">Model</Label>
                        <Input id="model" placeholder="Camry" className="bg-slate-50 border-slate-200 text-slate-900" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} />
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-slate-600">Body Type</Label>
                            <Select 
                                value={newVehicle.type} 
                                onValueChange={(val: CarType) => setNewVehicle({...newVehicle, type: val})}
                            >
                                <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sedan">Sedan</SelectItem>
                                    <SelectItem value="suv">SUV</SelectItem>
                                    <SelectItem value="truck">Truck</SelectItem>
                                    <SelectItem value="coupe">Coupe</SelectItem>
                                    <SelectItem value="hypercar">Hypercar</SelectItem>
                                    <SelectItem value="compact">Compact / Hatchback</SelectItem>
                                    <SelectItem value="city">City Car / Micro</SelectItem>
                                    <SelectItem value="budget">Budget / Daily Driver</SelectItem>
                                    <SelectItem value="project">Project Car</SelectItem>
                                    <SelectItem value="convertible">Convertible</SelectItem>
                                    <SelectItem value="van">Van</SelectItem>
                                    <SelectItem value="hatchback">Hatchback</SelectItem>
                                    <SelectItem value="electric">Electric / Futuristic</SelectItem>
                                    <SelectItem value="classic">Classic / Muscle</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year" className="text-slate-600">Year</Label>
                            <Input id="year" placeholder="2023" type="number" className="bg-slate-50 border-slate-200 text-slate-900" value={newVehicle.year} onChange={e => setNewVehicle({...newVehicle, year: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="plate" className="text-slate-600">License Plate</Label>
                        <Input id="plate" placeholder="ABC-1234" className="bg-slate-50 border-slate-200 text-slate-900" value={newVehicle.plate} onChange={e => setNewVehicle({...newVehicle, plate: e.target.value})} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleAddVehicle} className="bg-yellow-400 text-slate-900 hover:bg-yellow-500 font-bold w-full">
                        Park Vehicle
                    </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* SHOWROOM MODE */}
        <AnimatePresence mode="wait">
        {viewMode === 'showroom' && (
            <motion.div
                key="showroom"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group"
            >
                {/* Background Garage Image */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1769641241150-26c44a98e17a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBnYXJhZ2UlMjBpbnRlcmlvciUyMGRhcmt8ZW58MXx8fHwxNzcxNjkzOTI0fDA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Garage Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
                </div>

                {/* Horizontal Vehicle Scroller */}
                <div 
                    className="absolute inset-0 z-10 flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-hide px-[10vw]"
                    ref={scrollContainerRef}
                    onScroll={(e) => {
                        // Logic to detect center element could go here to auto-update activeVehicleIndex
                    }}
                >
                    {vehicles.map((vehicle, index) => (
                        <div key={vehicle.id} className="snap-center shrink-0 w-[80vw] max-w-4xl h-full flex flex-col items-center justify-center relative px-4 mx-4">
                            
                            {/* Vehicle Stats Overlay (Top) */}
                            <div className="absolute top-10 left-0 w-full flex justify-between items-start text-white px-8">
                                <div>
                                    <h2 className="text-5xl font-black italic uppercase tracking-tighter drop-shadow-2xl">
                                        {vehicle.make} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{vehicle.model}</span>
                                    </h2>
                                    <p className="text-slate-400 font-mono text-lg font-bold mt-1 bg-black/50 px-3 py-1 rounded-lg inline-block backdrop-blur-md border border-white/10">{vehicle.year} • {vehicle.licensePlate}</p>
                                </div>
                                <div className="text-right">
                                    <Badge className={`${getStatusColor(vehicle.status)} border px-4 py-2 text-lg font-bold shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                                        {getStatusText(vehicle.status)}
                                    </Badge>
                                </div>
                            </div>

                            {/* Main Vehicle Image */}
                            <div className="relative w-full max-w-2xl aspect-[16/9] flex items-center justify-center">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="relative w-full h-full"
                                >
                                    {/* Reflection/Shadow */}
                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] h-20 bg-black/80 blur-2xl rounded-[100%]"></div>
                                    
                                    <VehicleImage 
                                        src={vehicle.imageUrl} 
                                        alt={vehicle.model} 
                                        className="w-full h-full object-contain drop-shadow-2xl relative z-10"
                                    />

                                    {/* Interactive Hotspots */}
                                    <AnimatePresence>
                                        {showHotspots && (
                                            <>
                                                <Hotspot top="40%" left="20%" label="Engine Health" status="good" />
                                                <Hotspot top="60%" left="20%" label="Brakes (Front)" status={Math.random() > 0.8 ? "warning" : "good"} />
                                                <Hotspot top="60%" left="75%" label="Brakes (Rear)" status="good" />
                                                <Hotspot top="45%" left="50%" label="Body Condition" status="good" />
                                            </>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>

                            {/* Controls (Bottom) */}
                            <div className="absolute bottom-10 w-full flex justify-center gap-4 px-8">
                                <Button 
                                    onClick={() => setShowHotspots(!showHotspots)}
                                    className={`
                                        h-12 px-6 rounded-xl font-bold uppercase tracking-wider border transition-all
                                        ${showHotspots ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-black/40 border-white/20 text-white hover:bg-white/10 backdrop-blur-md'}
                                    `}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    {showHotspots ? 'Hide Inspection' : 'Visual Inspection'}
                                </Button>
                                <Button 
                                    className="h-12 px-6 rounded-xl font-bold uppercase tracking-wider bg-yellow-500 hover:bg-yellow-400 text-black border-none shadow-[0_0_20px_rgba(234,179,8,0.5)]"
                                    onClick={() => navigate('/bookings')}
                                >
                                    <Wrench className="w-4 h-4 mr-2" />
                                    Book Service
                                </Button>
                            </div>

                        </div>
                    ))}
                    
                    {/* Add Vehicle Slide */}
                     <div className="snap-center shrink-0 w-[50vw] max-w-md h-full flex items-center justify-center">
                        <div 
                            onClick={() => setIsAddOpen(true)}
                            className="w-64 h-64 rounded-full border-4 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-white/50 transition-all group"
                        >
                            <Plus className="w-16 h-16 text-white/30 group-hover:text-white transition-colors" />
                            <p className="text-white/50 font-bold uppercase tracking-widest mt-4 group-hover:text-white">Add Vehicle</p>
                        </div>
                     </div>
                </div>

                {/* Scroll Indicators */}
                <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 z-20">
                     {vehicles.map((_, i) => (
                         <div key={i} className={`w-2 h-2 rounded-full ${i === activeVehicleIndex ? 'bg-white' : 'bg-white/20'}`} />
                     ))}
                </div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* GRID MODE */}
        <AnimatePresence mode="wait">
        {viewMode === 'grid' && (
            <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {vehicles.map((vehicle, index) => (
                    <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -10 }}
                    >
                    <Card className="overflow-hidden border-slate-200 bg-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group h-full flex flex-col rounded-3xl relative">
                        <div className="relative h-60 overflow-hidden bg-slate-100">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10" />
                        <motion.div 
                            className="w-full h-full"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <VehicleImage 
                                src={vehicle.imageUrl} 
                                alt={`${vehicle.make} ${vehicle.model}`} 
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                        <div className="absolute top-4 right-4 z-20">
                            <Badge className={`${getStatusColor(vehicle.status)} border px-3 py-1 font-bold shadow-lg backdrop-blur-md uppercase tracking-wider`}>
                            {vehicle.status === 'Road Ready' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                            {getStatusText(vehicle.status)}
                            </Badge>
                        </div>
                        <div className="absolute bottom-6 left-6 z-20 text-white">
                            <h3 className="text-3xl font-black italic tracking-tighter uppercase drop-shadow-md">{vehicle.year} {vehicle.make} <span className="text-blue-200">{vehicle.model}</span></h3>
                            <p className="text-slate-900 text-xs font-mono font-bold bg-yellow-400 px-2 py-1 rounded inline-block shadow-lg mt-1 border-2 border-white transform -skew-x-12">{vehicle.licensePlate}</p>
                        </div>
                        </div>
                        
                        <CardContent className="p-6 space-y-5 flex-1 bg-white relative z-10">
                        <div className="flex justify-between items-center py-3 border-b border-slate-100">
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Gauge className="w-4 h-4" /> Lifetime Points</span>
                            <span className="font-black text-lg text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200 shadow-sm">{vehicle.pointsEarned.toLocaleString()} pts</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Last Pit Stop</p>
                            <p className="font-bold text-slate-700 flex items-center gap-1 group-hover:text-blue-700">
                                <Calendar className="w-3 h-3 text-slate-400" /> {vehicle.lastService}
                            </p>
                            </div>
                            <div className={`p-3 rounded-2xl border ${vehicle.status === 'Service Due' ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-100'}`}>
                            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Next Service</p>
                            <p className={`font-bold flex items-center gap-1 ${vehicle.status === 'Service Due' ? 'text-yellow-600' : 'text-slate-700'}`}>
                                <Calendar className="w-3 h-3" /> {vehicle.nextService}
                            </p>
                            </div>
                        </div>
                        </CardContent>

                        <CardFooter className="p-6 pt-0 bg-white">
                        <Button 
                            variant="outline" 
                            className="w-full border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 font-bold uppercase tracking-wider text-xs h-12 rounded-xl"
                            onClick={() => navigate('/history')}
                        >
                            Service History
                        </Button>
                        </CardFooter>
                    </Card>
                    </motion.div>
                ))}
            </motion.div>
        )}
        </AnimatePresence>

      </div>
    </div>
  );
}