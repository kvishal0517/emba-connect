import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { ArrowLeft, CheckCircle2, Calculator, Wrench, Car, User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { db, User as DbUser, Vehicle } from '@/app/lib/db';

const SERVICES = [
  { id: 'oil', name: 'Premium Oil Change', points: 500, cost: 89.99 },
  { id: 'tire', name: 'Tire Rotation & Balance', points: 300, cost: 49.99 },
  { id: 'brake', name: 'Brake Service (Front/Rear)', points: 800, cost: 250.00 },
  { id: 'detail', name: 'Full Detail Package', points: 1000, cost: 199.99 },
  { id: 'inspection', name: 'Multi-Point Inspection', points: 150, cost: 0 },
  { id: 'battery', name: 'Battery Replacement', points: 400, cost: 159.99 },
];

export default function AdminAddService() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [users, setUsers] = useState<DbUser[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [calculatedPoints, setCalculatedPoints] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Load Data
  useEffect(() => {
    setUsers(db.getAllUsers());
    setVehicles(db.getAllVehicles());
  }, []);

  // Update points when service changes
  useEffect(() => {
    if (selectedServiceId) {
      const service = SERVICES.find(s => s.id === selectedServiceId);
      if (service) {
        setCalculatedPoints(service.points);
      }
    } else {
      setCalculatedPoints(0);
    }
  }, [selectedServiceId]);

  // Filter vehicles by selected customer
  const customerVehicles = vehicles.filter(v => v.ownerId.toString() === selectedCustomerId);

  // Reset vehicle when customer changes
  useEffect(() => {
    setSelectedVehicleId('');
  }, [selectedCustomerId]);

  const selectedCustomer = users.find(c => c.id.toString() === selectedCustomerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId || !selectedVehicleId || !selectedServiceId) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields."
      });
      return;
    }

    setLoading(true);

    const serviceInfo = SERVICES.find(s => s.id === selectedServiceId);
    
    if (!serviceInfo) return;

    // Simulate API call delay
    setTimeout(() => {
        db.logService({
            vehicleId: parseInt(selectedVehicleId),
            serviceName: serviceInfo.name,
            date: new Date().toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
            cost: serviceInfo.cost,
            pointsEarned: serviceInfo.points
        });

      setLoading(false);
      toast.success("Service Logged Successfully", {
        description: `${calculatedPoints} points added to ${selectedCustomer?.name}'s account.`,
        icon: <CheckCircle2 className="text-green-500" />
      });
      
      // Reset form
      setSelectedServiceId('');
      setCalculatedPoints(0);
      setNotes('');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')} className="hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Log Service & Points</h1>
            <p className="text-slate-500">Record a completed service and assign loyalty rewards</p>
          </div>
        </div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-none shadow-md bg-white overflow-hidden">
            <div className="h-2 bg-blue-600 w-full"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Wrench className="w-5 h-5 text-blue-600" />
                </div>
                New Service Entry
              </CardTitle>
              <CardDescription>
                Select the customer and service details below. Points are calculated automatically.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Customer Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customer" className="text-slate-700 font-medium">Customer</Label>
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger id="customer" className="bg-slate-50 border-slate-200 h-11">
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4" />
                          <SelectValue placeholder="Select Customer" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.email})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicle" className="text-slate-700 font-medium">Vehicle</Label>
                    <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId} disabled={!selectedCustomerId}>
                      <SelectTrigger id="vehicle" className="bg-slate-50 border-slate-200 h-11">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Car className="w-4 h-4" />
                          <SelectValue placeholder={selectedCustomerId ? "Select Vehicle" : "Select Customer First"} />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {customerVehicles.map(v => (
                          <SelectItem key={v.id} value={v.id.toString()}>{v.year} {v.make} {v.model} ({v.licensePlate})</SelectItem>
                        ))}
                        {customerVehicles.length === 0 && selectedCustomerId && (
                            <SelectItem value="none" disabled>No vehicles found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                {/* Service Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-2">
                    <Label htmlFor="service" className="text-slate-700 font-medium">Service Performed</Label>
                    <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                      <SelectTrigger id="service" className="bg-slate-50 border-slate-200 h-11">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Wrench className="w-4 h-4" />
                          <SelectValue placeholder="Select Service Type" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICES.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            <div className="flex justify-between w-full items-center gap-4">
                              <span>{s.name}</span>
                              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{s.points} pts</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Points Display */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Points to Award</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calculator className="h-5 w-5 text-blue-500" />
                      </div>
                      <Input 
                        readOnly 
                        value={calculatedPoints > 0 ? `+${calculatedPoints} Points` : '0 Points'} 
                        className={`pl-10 h-11 font-bold text-lg ${calculatedPoints > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Points are automatically calculated based on the selected service.
                    </p>
                  </div>
                </div>

                {/* Notes (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-700 font-medium">Technician Notes (Optional)</Label>
                  <Input 
                    id="notes" 
                    placeholder="e.g. Recommended air filter replacement next visit" 
                    className="bg-slate-50 border-slate-200 h-11"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-12 border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() => navigate('/admin/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                    disabled={loading || !selectedCustomerId || !selectedVehicleId || !selectedServiceId}
                  >
                    {loading ? (
                       <span className="flex items-center gap-2">
                         <motion.div 
                           animate={{ rotate: 360 }}
                           transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                           className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                         />
                         Processing...
                       </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Log Service & Add Points
                      </span>
                    )}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Logs (Optional context) */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
             {/* Fetch actual recent logs from DB if wanted, or static placeholder */}
             <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm opacity-60">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                     <CheckCircle2 className="w-5 h-5 text-green-600" />
                   </div>
                   <div>
                     <p className="font-medium text-slate-900">System Ready</p>
                     <p className="text-sm text-slate-500">Ready to log new services</p>
                   </div>
                 </div>
                 <span className="font-bold text-green-600">Active</span>
               </div>
          </div>
        </div>

      </div>
    </div>
  );
}