import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, Car, Settings, AlertCircle, ArrowLeft, MapPin, Pencil, History, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { db, Vehicle, Service } from '@/app/lib/db';
import { useNavigate, useSearchParams } from 'react-router';
import { Badge } from '@/app/components/ui/badge';
import { VehicleImage } from '@/app/components/VehicleImage';

const SERVICES_LIST = [
  { id: 1, name: "Premium Oil Change", duration: "45 min", price: "$65", points: 150, image: "https://images.unsplash.com/photo-1771340742493-52fbd5476ccb?auto=format&fit=crop&q=80&w=300" },
  { id: 2, name: "Tire Rotation & Balance", duration: "30 min", price: "$45", points: 100, image: "https://images.unsplash.com/photo-1713949145294-5f569bb65567?auto=format&fit=crop&q=80&w=300" },
  { id: 3, name: "Full Detail Package", duration: "180 min", price: "$200", points: 300, image: "https://images.unsplash.com/photo-1771491237209-b89bc7290588?auto=format&fit=crop&q=80&w=300" },
  { id: 4, name: "Brake Inspection", duration: "60 min", price: "Free", points: 50, image: "https://images.unsplash.com/photo-1769218402167-b0ef15eaf7cc?auto=format&fit=crop&q=80&w=300" },
];

export default function Bookings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "schedule");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
        setActiveTab(tab);
    }
  }, [searchParams]);

  // Wizard State
  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Edit Dialog State
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const loadData = () => {
        setVehicles(db.getMyVehicles());
        setServices(db.getRecentServices());
    };
    loadData();
    window.addEventListener('db-update', loadData);
    return () => window.removeEventListener('db-update', loadData);
  }, []);

  // Filter services
  const upcomingServices = services.filter(s => s.status === 'Scheduled' || s.status === 'In Progress');
  const pastServices = services.filter(s => s.status === 'Completed');

  // Helper to get vehicle details
  const getVehicle = (id: number | string) => vehicles.find(v => v.id == id);

  // Wizard Handlers
  const handleNext = () => {
    if (step === 1) {
      if (!selectedVehicle) return toast.error("Please select a vehicle");
      if (!selectedService) return toast.error("Please select a service");
    }
    if (step === 2 && (!date || !time)) return toast.error("Please select a date and time");
    setStep(step + 1);
  };

  const handleBooking = () => {
    const serviceData = SERVICES_LIST.find(s => s.id === selectedService);
    if (selectedVehicle && serviceData) {
        db.bookService({
            vehicleId: parseInt(selectedVehicle),
            serviceName: serviceData.name,
            date: date + " " + time,
            cost: parseFloat(serviceData.price.replace('$', '')) || 0
        });
    }

    toast.success("Booking Confirmed!", { description: "We've sent a confirmation email to you." });
    setTimeout(() => {
        setStep(1);
        setSelectedVehicle("");
        setSelectedService(null);
        setDate("");
        setTime("");
        setActiveTab("upcoming"); // Switch to upcoming tab
    }, 1500);
  };

  const handleReschedule = () => {
      if (editingService) {
          // In a real app, update DB. Here we simulate update or just toast.
          // Since db.ts doesn't expose updateService, we'll just toast success and close.
          toast.success("Appointment Rescheduled", {
              description: `New time: ${editDate} at ${editTime}`
          });
          setIsEditDialogOpen(false);
          setEditingService(null);
      }
  };

  const openReschedule = (service: Service) => {
      setEditingService(service);
      setEditDate("Mon 21"); // Default or parse from service.date
      setEditTime("10:00 AM");
      setIsEditDialogOpen(true);
  };

  const selectedServiceData = SERVICES_LIST.find(s => s.id === selectedService);

  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-8 font-sans text-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-slate-100 rounded-full">
                <ArrowLeft className="w-6 h-6 text-slate-500" />
            </Button>
            <div>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">
                <span className="bg-slate-100 p-2 rounded-xl"><CalendarIcon className="w-6 h-6 text-slate-500" /></span> 
                Pit Stop Scheduler
                </h1>
                <p className="text-slate-500 font-medium ml-1">Book services and manage appointments.</p>
            </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-14 bg-white shadow-sm border border-slate-200 rounded-xl p-1 mb-8">
                <TabsTrigger value="schedule" className="rounded-lg font-bold uppercase tracking-wide data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                    Schedule Service
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="rounded-lg font-bold uppercase tracking-wide data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                    Upcoming ({upcomingServices.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg font-bold uppercase tracking-wide data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                    Completed
                </TabsTrigger>
            </TabsList>

            {/* TAB: SCHEDULE SERVICE (WIZARD) */}
            <TabsContent value="schedule">
                <div className="max-w-3xl mx-auto">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-between px-8 relative mb-8">
                        <div className="absolute left-0 w-full h-1 bg-slate-100 top-5 -z-10 hidden md:block">
                            <motion.div 
                                className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
                                style={{ width: `${((step - 1) / 2) * 100}%` }}
                            />
                        </div>
                        {[1, 2, 3].map((s) => (
                        <div key={s} className="flex flex-col items-center relative z-10 group">
                            <motion.div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 ${
                                step >= s ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30 scale-110' : 'bg-white border-slate-200 text-slate-400'
                                }`}
                                whileHover={{ scale: 1.15 }}
                            >
                            {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                            </motion.div>
                            <span className={`text-xs mt-2 font-medium transition-colors ${step >= s ? 'text-blue-600' : 'text-slate-400'}`}>
                            {s === 1 ? 'Details' : s === 2 ? 'Time' : 'Confirm'}
                            </span>
                        </div>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                        >
                        {step === 1 && (
                            <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <Label className="text-base font-semibold flex items-center gap-2">
                                    <Car className="w-5 h-5 text-blue-600" /> Select Vehicle
                                </Label>
                                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                                    <SelectTrigger className="h-12 border-slate-200 bg-slate-50">
                                    <SelectValue placeholder="Choose your vehicle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {vehicles.map(v => (
                                        <SelectItem key={v.id} value={v.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                                                     <VehicleImage src={v.imageUrl} alt={v.model} className="w-full h-full object-cover" />
                                                </div>
                                                <span>{v.year} {v.make} {v.model} ({v.licensePlate})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-base font-semibold flex items-center gap-2 px-1">
                                    <Settings className="w-5 h-5 text-blue-600" /> Select Service Type
                                </Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {SERVICES_LIST.map((service) => (
                                    <motion.div
                                        key={service.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Card 
                                            className={`cursor-pointer transition-all hover:shadow-lg border-2 overflow-hidden h-full ${selectedService === service.id ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-200 ring-offset-2' : 'border-transparent hover:border-blue-100'}`}
                                            onClick={() => setSelectedService(service.id)}
                                        >
                                            <CardContent className="p-4 flex gap-4 h-full">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200 shadow-sm">
                                                <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col justify-between flex-1">
                                                <div>
                                                <h3 className="font-bold text-slate-900 text-sm md:text-base leading-tight mb-1">{service.name}</h3>
                                                <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                                    <Clock className="w-3 h-3" /> {service.duration} • {service.price}
                                                </p>
                                                </div>
                                                <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full border border-emerald-100">
                                                    + {service.points} pts
                                                </div>
                                            </div>
                                            {selectedService === service.id && (
                                                <motion.div 
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-3 right-3 bg-blue-600 rounded-full p-1 shadow-sm"
                                                >
                                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                                </motion.div>
                                            )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                                </div>
                            </div>
                            </div>
                        )}

                        {step === 2 && (
                            <Card className="border-none shadow-lg bg-white">
                            <CardContent className="p-6 space-y-8">
                                <div className="space-y-3">
                                <Label className="text-base font-semibold">Select Date</Label>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    {['Mon 21', 'Tue 22', 'Wed 23', 'Thu 24', 'Fri 25'].map((d) => (
                                    <motion.button
                                        key={d}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setDate(d)}
                                        className={`p-4 rounded-2xl border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                                        date === d ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-sm'
                                        }`}
                                    >
                                        <CalendarIcon className="w-4 h-4 mb-1 opacity-70" />
                                        {d}
                                    </motion.button>
                                    ))}
                                </div>
                                </div>

                                <div className="space-y-3">
                                <Label className="text-base font-semibold">Select Time</Label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {['09:00 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'].map((t) => (
                                    <motion.button
                                        key={t}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setTime(t)}
                                        className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                                        time === t ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-slate-100 hover:border-blue-300'
                                        }`}
                                    >
                                        {t}
                                    </motion.button>
                                    ))}
                                </div>
                                </div>
                            </CardContent>
                            </Card>
                        )}

                        {step === 3 && (
                            <Card className="border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-300 rounded-full blur-2xl opacity-20 -ml-10 -mb-10"></div>

                            <CardContent className="p-8 text-center space-y-8 relative z-10">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg"
                                >
                                <CalendarIcon className="w-8 h-8 text-blue-600" />
                                </motion.div>
                                
                                <div>
                                <h2 className="text-2xl font-bold text-slate-900">Confirm Booking</h2>
                                <p className="text-slate-500 mt-2">You're almost there! Review your details.</p>
                                </div>
                                
                                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-sm text-left space-y-4 max-w-sm mx-auto">
                                    {/* Vehicle Image Preview */}
                                    <div className="flex justify-center mb-4">
                                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden relative bg-slate-100">
                                            <VehicleImage 
                                                src={vehicles.find(v => v.id.toString() === selectedVehicle)?.imageUrl} 
                                                alt="Vehicle" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <span className="text-slate-500 text-sm">Vehicle</span>
                                        <span className="font-semibold text-slate-900 text-right">{vehicles.find(v => v.id.toString() === selectedVehicle)?.make} {vehicles.find(v => v.id.toString() === selectedVehicle)?.model}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <span className="text-slate-500 text-sm">Service</span>
                                        <span className="font-semibold text-slate-900 text-right">{selectedServiceData?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <span className="text-slate-500 text-sm">Time</span>
                                        <span className="font-semibold text-slate-900 text-right">{date}, {time}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-slate-500 text-sm">Total</span>
                                        <span className="font-bold text-2xl text-blue-600">{selectedServiceData?.price}</span>
                                    </div>
                                    
                                    <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-start gap-3">
                                        <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-emerald-800 text-sm font-semibold">Rewards Preview</p>
                                            <p className="text-emerald-600 text-xs mt-0.5">
                                            Earn approx. <span className="font-bold">{selectedServiceData?.points} loyalty points</span>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            </Card>
                        )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Wizard Nav */}
                    <div className="flex justify-between pt-6 border-t border-slate-100 mt-6">
                        <Button 
                        variant="outline" 
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className="hover:bg-slate-100 transition-colors"
                        >
                        Back
                        </Button>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg shadow-blue-600/20"
                            onClick={step === 3 ? handleBooking : handleNext}
                            >
                            {step === 3 ? 'Confirm Booking' : 'Next'} <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </TabsContent>

            {/* TAB: UPCOMING */}
            <TabsContent value="upcoming">
                 <div className="space-y-4">
                    {upcomingServices.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CalendarIcon className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No Upcoming Bookings</h3>
                            <p className="text-slate-500 text-sm mb-4">Your schedule is clear. Ready to book?</p>
                            <Button onClick={() => setActiveTab("schedule")}>Schedule Now</Button>
                        </div>
                    ) : (
                        upcomingServices.map(service => (
                            <Card key={service.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row">
                                    <div className="w-full md:w-48 h-48 md:min-h-full md:self-stretch relative bg-slate-100 shrink-0">
                                        <VehicleImage 
                                            src={getVehicle(service.vehicleId)?.imageUrl}
                                            alt="Vehicle"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 left-2">
                                            <Badge className="bg-white/90 text-blue-700 backdrop-blur-md shadow-sm border-none font-bold">
                                                UPCOMING
                                            </Badge>
                                        </div>
                                    </div>
                                     <CardContent className="flex-1 p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-black italic text-slate-900">{service.serviceName}</h3>
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mt-1">
                                                     <Car className="w-4 h-4" /> {getVehicle(service.vehicleId)?.make} {getVehicle(service.vehicleId)?.model}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-slate-900">{service.date}</p>
                                                <p className="text-xs text-slate-500 font-mono">ID: #{service.id}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center gap-4 pt-4 border-t border-slate-100">
                                            <div className="flex-1 flex gap-4 text-sm">
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded text-slate-600">
                                                    <MapPin className="w-4 h-4" /> Main Center
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded text-slate-600">
                                                    <Wrench className="w-4 h-4" /> Est. ${service.cost}
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="gap-2" onClick={() => openReschedule(service)}>
                                                <Pencil className="w-4 h-4" /> Modify
                                            </Button>
                                        </div>
                                     </CardContent>
                                </div>
                            </Card>
                        ))
                    )}
                 </div>
            </TabsContent>

            {/* TAB: HISTORY (COMPLETED) */}
            <TabsContent value="history">
                <div className="space-y-4">
                    {pastServices.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">No past services found.</div>
                    ) : (
                        pastServices.map(service => (
                            <Card key={service.id} className="bg-slate-50 border-slate-200">
                                <CardContent className="p-4 flex items-center gap-4">
                                     <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                                         <VehicleImage 
                                            src={getVehicle(service.vehicleId)?.imageUrl}
                                            alt="Vehicle"
                                            className="w-full h-full object-cover grayscale opacity-80"
                                        />
                                     </div>
                                     <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h4 className="font-bold text-slate-700">{service.serviceName}</h4>
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Completed</Badge>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-slate-500">{service.date} • {getVehicle(service.vehicleId)?.make} {getVehicle(service.vehicleId)?.model}</p>
                                            <span className="text-green-600 font-bold text-sm">+{service.pointsEarned} pts</span>
                                        </div>
                                     </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </TabsContent>
        </Tabs>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
                Select a new time for your service.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-date" className="text-right">
                    Date
                    </Label>
                    <Select value={editDate} onValueChange={setEditDate}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select Date" />
                        </SelectTrigger>
                        <SelectContent>
                            {['Mon 21', 'Tue 22', 'Wed 23', 'Thu 24', 'Fri 25'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-time" className="text-right">
                    Time
                    </Label>
                    <Select value={editTime} onValueChange={setEditTime}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select Time" />
                        </SelectTrigger>
                        <SelectContent>
                            {['09:00 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
            <Button type="submit" onClick={handleReschedule}>Confirm Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}