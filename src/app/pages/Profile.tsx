import React, { useState } from 'react';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Car, User, Settings, CreditCard, Plus, Trash2, Edit2, ShieldCheck, Mail, Phone, MapPin, Trophy } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { VehicleImage } from '@/app/components/VehicleImage';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { db, Vehicle } from '@/app/lib/db';

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>(db.getMyVehicles());

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile Updated", {
      description: "Your changes have been saved successfully."
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 md:pb-0 font-sans">
      {/* Profile Header */}
      <div className="relative group">
        {/* Cover Image with Checkered Overlay */}
        <div className="h-64 rounded-b-[3rem] overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-slate-900/30 z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent z-10"></div>
            
            {/* Checkered Flag Pattern Overlay */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10 z-10 pointer-events-none" 
                 style={{
                    backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)`,
                    backgroundPosition: '0 0, 10px 10px',
                    backgroundSize: '20px 20px'
                 }}>
            </div>

            <img 
                src="https://images.unsplash.com/photo-1593166978275-5dbc8b293c3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWNlJTIwdHJhY2slMjBmaW5pc2glMjBsaW5lJTIwY2hlY2tlcmVkJTIwZmxhZyUyMGJhY2tncm91bmQlMjBhc3BoYWx0fGVufDF8fHx8MTc3MTY4MDczNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                alt="Cover" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
            />

            {/* Finish Line Strip at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-4 z-20 flex">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-white' : 'bg-black'}`}></div>
                ))}
            </div>
            <div className="absolute bottom-4 left-0 right-0 h-4 z-20 flex">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className={`flex-1 ${i % 2 !== 0 ? 'bg-white' : 'bg-black'}`}></div>
                ))}
            </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute -bottom-24 left-8 md:left-12 flex flex-col md:flex-row items-center md:items-end gap-6 z-30 w-full md:w-auto">
          <div className="relative">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-[6px] border-white shadow-2xl bg-white overflow-hidden relative z-10 ring-4 ring-slate-100">
                <ImageWithFallback 
                src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=300&q=80" 
                alt="Profile" 
                className="w-full h-full object-cover" 
                />
            </div>
            <div className="absolute bottom-2 right-2 z-20 bg-yellow-400 text-slate-900 p-2 rounded-full border-4 border-white shadow-lg">
                <Trophy className="w-5 h-5 fill-yellow-600" />
            </div>
          </div>
          
          <div className="mb-2 text-center md:text-left space-y-2 md:pb-4 md:pt-0 pt-2">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-3">
                <h1 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] bg-slate-900/80 backdrop-blur-sm px-4 py-1 rounded-xl md:bg-transparent md:px-0 md:text-white md:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-2 border-white/20 md:border-none"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    SpeedRacer
                </h1>
                <div className="flex gap-2 mb-1 md:mb-1.5">
                    <Badge className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 border-none px-3 py-1 font-bold italic transform -skew-x-12 shadow-sm">
                        PRO RACER
                    </Badge>
                    <Badge className="bg-slate-900 text-white border-none px-3 py-1 font-bold italic transform -skew-x-12 shadow-sm">
                        #1 DRIVER
                    </Badge>
                </div>
            </div>
            <div className="text-slate-600 font-bold flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm bg-white/80 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none py-1 px-3 rounded-full md:p-0">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Gold Member</span>
                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                <span>Member since 2024</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                <div className="flex -space-x-3">
                    <div className="w-9 h-9 rounded-full border-[3px] border-white bg-slate-200 overflow-hidden shadow-sm">
                        <img src="https://images.unsplash.com/photo-1769636930047-4478f12cf430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100" alt="Team Member" />
                    </div>
                    <div className="w-9 h-9 rounded-full border-[3px] border-white bg-slate-200 overflow-hidden shadow-sm">
                        <img src="https://images.unsplash.com/photo-1745434159123-af6142c7862f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100" alt="Team Member" />
                    </div>
                    <div className="w-9 h-9 rounded-full border-[3px] border-white bg-slate-200 overflow-hidden shadow-sm">
                        <img src="https://images.unsplash.com/photo-1740085565883-ceb868b9f053?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100" alt="Team Member" />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Racing Team</span>
                    <span className="text-sm font-black text-slate-800 italic uppercase tracking-wide">Red Bull Racing</span>
                </div>
            </div>
          </div>
        </div>

        <div className="absolute top-6 right-6 z-30">
          <Button variant="secondary" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-lg gap-2 font-bold uppercase tracking-wider text-xs h-10 px-6 rounded-full transition-all hover:scale-105">
            <Settings className="w-4 h-4" /> Profile Settings
          </Button>
        </div>
      </div>

      <div className="mt-32 md:mt-24">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[400px] mb-8">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }} 
              className="space-y-6"
            >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your personal details and contact info.</CardDescription>
                </div>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                )}
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input defaultValue="Alex Johnson" disabled={!isEditing} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input defaultValue="alex.j@example.com" disabled={!isEditing} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input defaultValue="+1 (555) 123-4567" disabled={!isEditing} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input defaultValue="123 Auto Lane, Detroit, MI" disabled={!isEditing} className="pl-9" />
                  </div>
                </div>
              </CardContent>
              {isEditing && (
                <CardFooter className="flex justify-end gap-2 bg-slate-50 p-4 rounded-b-xl border-t border-slate-100">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave}>Save Changes</Button>
                </CardFooter>
              )}
            </Card>

            {/* Driver Stats */}
            <Card className="bg-slate-900 text-white border-slate-800 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" /> Driver Performance</CardTitle>
                <CardDescription className="text-slate-400">Your rewards and service stats.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between text-sm font-bold tracking-wide">
                         <span>Loyalty Tier Progress (Gold)</span>
                         <span className="text-yellow-400">85%</span>
                      </div>
                      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                         <motion.div 
                            initial={{ width: 0 }} 
                            whileInView={{ width: "85%" }} 
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeOut" }} 
                            className="h-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]" 
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-sm font-bold tracking-wide">
                         <span>Pit Stop Efficiency</span>
                         <span className="text-blue-400">92%</span>
                      </div>
                      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                         <motion.div 
                            initial={{ width: 0 }} 
                            whileInView={{ width: "92%" }} 
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }} 
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-sm font-bold tracking-wide">
                         <span>Service History</span>
                         <span className="text-emerald-400">12 Visits</span>
                      </div>
                      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                         <motion.div 
                            initial={{ width: 0 }} 
                            whileInView={{ width: "60%" }} 
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }} 
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-sm font-bold tracking-wide">
                         <span>Vehicle Health Score</span>
                         <span className="text-green-400">A+</span>
                      </div>
                      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                         <motion.div 
                            initial={{ width: 0 }} 
                            whileInView={{ width: "98%" }} 
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }} 
                            className="h-full bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                         />
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and account security.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <ShieldCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                    </div>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((vehicle, index) => (
                <Card key={vehicle.id} className={`overflow-hidden border-2 transition-all ${index === 0 ? 'border-blue-200 bg-blue-50/30 shadow-md' : 'border-transparent bg-white shadow-sm hover:shadow-md'}`}>
                  <div className="h-32 bg-slate-200 relative group">
                    <VehicleImage 
                      src={vehicle.imageUrl} 
                      alt={vehicle.model} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" 
                    />
                    {index === 0 && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                        Primary
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                        {vehicle.year}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{vehicle.make} {vehicle.model}</CardTitle>
                    <CardDescription className="text-xs font-mono">VIN: {vehicle.vin || 'N/A'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-600 pb-2">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>License Plate</span>
                      <span className="font-bold text-slate-900">{vehicle.licensePlate}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Status</span>
                      <span className={`font-bold ${vehicle.status === 'Service Due' || vehicle.status === 'Urgent' ? 'text-red-600' : 'text-emerald-600'}`}>{vehicle.status}</span>
                    </div>
                    <div className="flex justify-between">
                       <span>Points Earned</span>
                       <span className="font-bold text-blue-600">{vehicle.pointsEarned || 0} pts</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">Edit</Button>
                    <Button variant="ghost" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8">Remove</Button>
                  </CardFooter>
                </Card>
              ))}

              {/* Add New Vehicle Card */}
              <Card 
                className="border-dashed border-2 border-slate-200 shadow-none flex flex-col items-center justify-center p-8 cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-all group min-h-[300px]"
                onClick={() => navigate('/vehicles')}
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Plus className="w-8 h-8 text-slate-400 group-hover:text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Manage Garage</h3>
                <p className="text-slate-500 text-sm text-center mt-1">Go to your garage to add or manage vehicles.</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your login and security history.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-2 rounded-full">
                          <ShieldCheck className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Successful Login</p>
                          <p className="text-xs text-slate-500">Detroit, MI • Chrome on Mac</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">2 hours ago</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}