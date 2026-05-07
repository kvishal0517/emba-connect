import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Progress } from '@/app/components/ui/progress';
import { 
  Trophy, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  ArrowRight, 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle,
  BarChart3,
  PieChart as PieChartIcon,
  ShieldCheck,
  Briefcase,
  Car,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Users
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useNavigate, useParams } from 'react-router';
import { VehicleImage } from '@/app/components/VehicleImage';

// --- Mock Data Database ---

const MOCK_CUSTOMERS = [
  {
    id: "C-1024",
    name: "Marcus Speedwell",
    email: "marcus.speed@example.com",
    phone: "+1 (555) 019-2834",
    avatar: "https://images.unsplash.com/photo-1554765345-6ad6a5417cde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNYW4lMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzE3Mzk1NTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    tier: "Elite",
    joinDate: "Jan 15, 2023",
    totalSpend: "$4,250",
    pointsBalance: 12450,
    vehicles: [
        { name: "2022 Porsche 911 GT3", img: "https://images.unsplash.com/photo-1697177913021-bc10f8d2e20f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQb3JzY2hlJTIwOTExJTIwR1QzJTIwY2FyJTIwZnJvbnQlMjB2aWV3fGVufDF8fHx8MTc3MTczOTU0MXww&ixlib=rb-4.1.0&q=80&w=1080" },
        { name: "2020 Tesla Model S", img: "https://images.unsplash.com/photo-1716558964076-1abe07448abf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUZXNsYSUyME1vZGVsJTIwUyUyMFBsYWlkfGVufDF8fHx8MTc3MTczOTU0NXww&ixlib=rb-4.1.0&q=80&w=1080" }
    ],
    lastVisit: "2 weeks ago",
    healthScore: 85,
    churnRisk: "Low",
    churnProb: "12%",
    engagementScore: 88,
    nextBestAction: {
        title: "Schedule 30k Mile Service",
        desc: "Vehicle Porsche 911 GT3 is approaching 30,000 miles based on avg usage.",
        action: "Send Reminder",
        type: "service"
    },
    upsell: {
        title: "Premium Detail Package",
        desc: "Customer frequently washes vehicle. High propensity for detailing upsell.",
        prob: "High",
        action: "View Offer Script"
    }
  },
  {
    id: "C-1042",
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    phone: "+1 (555) 998-2122",
    avatar: "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxXb21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTczOTU2Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    tier: "Pro",
    joinDate: "Mar 22, 2023",
    totalSpend: "$1,850",
    pointsBalance: 4200,
    vehicles: [
        { name: "2021 Audi RS Q8", img: "https://images.unsplash.com/photo-1615063029891-497bebd4f03c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBdWRpJTIwUlMlMjBROHxlbnwxfHx8fDE3NzE3Mzk1NDh8MA&ixlib=rb-4.1.0&q=80&w=1080" }
    ],
    lastVisit: "3 months ago",
    healthScore: 62,
    churnRisk: "Medium",
    churnProb: "45%",
    engagementScore: 54,
    nextBestAction: {
        title: "Re-engagement Campaign",
        desc: "Customer hasn't visited in 90 days. Send 'We Miss You' offer.",
        action: "Send Promo Code",
        type: "marketing"
    },
    upsell: {
        title: "Winter Tire Package",
        desc: "Seasonal opportunity based on vehicle model and region.",
        prob: "Medium",
        action: "View Offer Script"
    }
  },
  {
    id: "C-1089",
    name: "David Chen",
    email: "d.chen88@example.com",
    phone: "+1 (555) 443-9910",
    avatar: "https://images.unsplash.com/photo-1620204389674-ef76805d76b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxZb3VuZyUyMGFzaWFuJTIwbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcxNzM5NTY3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    tier: "Rookie",
    joinDate: "Nov 05, 2023",
    totalSpend: "$320",
    pointsBalance: 850,
    vehicles: [
        { name: "2019 Honda Civic Type R", img: "https://images.unsplash.com/photo-1686074449582-6374eaebacf3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxIb25kYSUyMENpdmljJTIwVHlwZSUyMFJ8ZW58MXx8fHwxNzcxNzM5NTU0fDA&ixlib=rb-4.1.0&q=80&w=1080" }
    ],
    lastVisit: "1 week ago",
    healthScore: 92,
    churnRisk: "Very Low",
    churnProb: "5%",
    engagementScore: 95,
    nextBestAction: {
        title: "App Onboarding",
        desc: "New user hasn't completed profile setup or garage details.",
        action: "Send Guide",
        type: "onboarding"
    },
    upsell: {
        title: "Oil Change Bundle",
        desc: "High value starter pack for new performance car owners.",
        prob: "High",
        action: "View Offer Script"
    }
  }
];

// Engagement History
const ENGAGEMENT_DATA = [
  { month: 'Jan', score: 65 },
  { month: 'Feb', score: 70 },
  { month: 'Mar', score: 68 },
  { month: 'Apr', score: 75 },
  { month: 'May', score: 82 },
  { month: 'Jun', score: 88 },
];

export default function CustomerIntelligence() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Find customer by ID or default to first one
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
      if (id) {
          const index = MOCK_CUSTOMERS.findIndex(c => c.id === id);
          if (index !== -1) {
              setCurrentIndex(index);
          }
      }
  }, [id]);

  const customer = MOCK_CUSTOMERS[currentIndex];

  const handleNext = () => {
      const nextIndex = (currentIndex + 1) % MOCK_CUSTOMERS.length;
      navigate(`/admin/customer-intelligence/${MOCK_CUSTOMERS[nextIndex].id}`);
  };

  const handlePrev = () => {
      const prevIndex = (currentIndex - 1 + MOCK_CUSTOMERS.length) % MOCK_CUSTOMERS.length;
      navigate(`/admin/customer-intelligence/${MOCK_CUSTOMERS[prevIndex].id}`);
  };

  // Derived Data for Charts
  const healthData = [
    { name: 'Score', value: customer.healthScore, fill: customer.healthScore > 70 ? '#10b981' : customer.healthScore > 50 ? '#f59e0b' : '#ef4444' },
    { name: 'Remaining', value: 100 - customer.healthScore, fill: '#e2e8f0' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-6 md:p-10">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/admin/dashboard')}>CRM</span>
            <span>/</span>
            <span>Customer Intelligence</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">{customer.id}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Customer Intelligence</h1>
          <p className="text-slate-500">AI-driven insights and predictive analytics</p>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Navigation Controls */}
            <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8 text-slate-500 hover:text-blue-600">
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    {currentIndex + 1} / {MOCK_CUSTOMERS.length}
                </div>
                <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 text-slate-500 hover:text-blue-600">
                    <ChevronRightIcon className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex gap-2">
                <Button variant="outline" className="bg-white">
                    <Mail className="w-4 h-4 mr-2" /> Email
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Phone className="w-4 h-4 mr-2" /> Call
                </Button>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN - MAIN ANALYTICS (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top Row Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Health Score Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Customer Health</CardTitle>
              </CardHeader>
              <CardContent className="relative flex flex-col items-center justify-center pt-0 pb-6">
                 <div className="h-[120px] w-full relative" style={{ minHeight: '120px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={healthData}
                          cx="50%"
                          cy="80%"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={0}
                          dataKey="value"
                        >
                          <Cell key="score" fill={healthData[0].fill} />
                          <Cell key="remaining" fill={healthData[1].fill} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-end justify-center pb-0">
                       <span className="text-4xl font-bold text-slate-900">{customer.healthScore}</span>
                    </div>
                 </div>
                 <p className={`text-sm font-medium mt-2 flex items-center ${customer.healthScore > 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    <TrendingUp className="w-4 h-4 mr-1" /> {customer.healthScore > 70 ? 'Trending Up' : 'Needs Attention'}
                 </p>
                 <p className="text-xs text-slate-400 mt-1">Based on recent activity & spend</p>
              </CardContent>
            </Card>

            {/* Churn Risk Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Churn Risk</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-2 pb-6">
                 <div className="relative mb-3">
                    <AlertTriangle className={`w-12 h-12 opacity-20 ${customer.churnRisk === 'Low' || customer.churnRisk === 'Very Low' ? 'text-emerald-500' : 'text-amber-500'}`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className={`text-xl font-bold ${customer.churnRisk === 'Low' || customer.churnRisk === 'Very Low' ? 'text-emerald-600' : 'text-amber-600'}`}>
                           {customer.churnRisk}
                       </span>
                    </div>
                 </div>
                 <div className="text-4xl font-bold text-slate-900 mb-1">{customer.churnProb}</div>
                 <p className="text-xs text-slate-400 text-center px-4">
                    Probability of leaving in next 30 days.
                 </p>
              </CardContent>
            </Card>

            {/* Engagement Score */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Engagement</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                 <div className="flex items-end justify-between mb-2">
                    <span className="text-4xl font-bold text-blue-600">
                        {customer.engagementScore > 80 ? 'High' : customer.engagementScore > 50 ? 'Medium' : 'Low'}
                    </span>
                    <span className="text-sm font-medium text-slate-500">Score: {customer.engagementScore}/100</span>
                 </div>
                 <Progress value={customer.engagementScore} className="h-2 mb-4 bg-slate-100" />
                 <div className="h-[50px] w-full" style={{ minHeight: '50px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ENGAGEMENT_DATA}>
                            <defs>
                                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEngagement)" />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Section */}
          <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-100 shadow-sm">
             <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                   <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Zap className="w-5 h-5 text-violet-600" />
                   </div>
                   <div>
                      <CardTitle className="text-lg text-slate-900">AI Next Best Action</CardTitle>
                      <CardDescription className="text-violet-700/80">Machine learning recommendations based on 12 data points</CardDescription>
                   </div>
                </div>
             </CardHeader>
             <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-white p-4 rounded-xl border border-violet-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                         <Badge className="bg-violet-100 text-violet-700 border-none">Top Recommendation</Badge>
                         <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-600 transition-colors" />
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1">{customer.nextBestAction.title}</h4>
                      <p className="text-sm text-slate-500 mb-3">{customer.nextBestAction.desc}</p>
                      <Button size="sm" className="w-full bg-violet-600 hover:bg-violet-700 text-white">{customer.nextBestAction.action}</Button>
                   </div>

                   <div className="bg-white p-4 rounded-xl border border-violet-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                         <Badge className="bg-emerald-100 text-emerald-700 border-none">Upsell Opportunity</Badge>
                         <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1">{customer.upsell.title}</h4>
                      <p className="text-sm text-slate-500 mb-3">{customer.upsell.desc}</p>
                      <Button size="sm" variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">{customer.upsell.action}</Button>
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* Detailed Upsell Panel */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
             <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <div className="flex justify-between items-center">
                   <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-slate-500" /> Active Opportunities
                   </CardTitle>
                   <Button variant="ghost" size="sm" className="text-blue-600">View All</Button>
                </div>
             </CardHeader>
             <div className="divide-y divide-slate-100">
                {[
                   { name: "Annual Maintenance Plan", prob: "High", value: "$1,200", status: "Not Presented" },
                   { name: "Performance Tire Upgrade", prob: "Medium", value: "$1,800", status: "Email Sent" },
                   { name: "Winter Storage Package", prob: "Low", value: "$450", status: "Declined" }
                ].map((item, i) => (
                   <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                         <p className="font-semibold text-slate-900">{item.name}</p>
                         <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                               item.prob === 'High' ? 'bg-green-100 text-green-700' : 
                               item.prob === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                               {item.prob} Probability
                            </span>
                            <span className="text-xs text-slate-400">• Est. Value: {item.value}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-medium text-slate-500">{item.status}</span>
                         <Button variant="outline" size="sm" className="h-8">Action</Button>
                      </div>
                   </div>
                ))}
             </div>
          </Card>

        </div>

        {/* RIGHT COLUMN - PROFILE (1/3 width) */}
        <div className="space-y-6">
           
           {/* Profile Card */}
           <Card className="border-slate-200 shadow-md bg-white overflow-hidden group">
              <div className="h-32 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1766246099181-2055091f8721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBnYXJhZ2UlMjB3b3Jrc2hvcCUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzcxNzM5NTM4fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Cover" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                 <div className="absolute top-4 right-4">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md shadow-sm">
                       <ShieldCheck className="w-3 h-3 mr-1" /> {customer.tier} Member
                    </Badge>
                 </div>
              </div>
              <div className="px-6 pb-6 relative">
                 <div className="relative -top-12 mb-[-40px]">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-xl ring-1 ring-slate-100">
                       <AvatarImage src={customer.avatar} />
                       <AvatarFallback>MS</AvatarFallback>
                    </Avatar>
                 </div>
                 
                 <div className="mt-12 text-center md:text-left">
                    <h2 className="text-xl font-bold text-slate-900">{customer.name}</h2>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                       <Mail className="w-3 h-3" /> {customer.email}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                       <Phone className="w-3 h-3" /> {customer.phone}
                    </p>
                 </div>

                 <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                       <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">LTV Spend</p>
                       <p className="text-lg font-bold text-slate-900">{customer.totalSpend}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                       <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Points</p>
                       <p className="text-lg font-bold text-amber-600">{customer.pointsBalance.toLocaleString()}</p>
                    </div>
                 </div>

                 <div className="mt-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2"><Car className="w-4 h-4"/> Vehicle Fleet</h3>
                    {customer.vehicles.map((v: any, i: number) => (
                       <div key={i} className="flex items-center gap-3 p-2 border border-slate-100 rounded-xl hover:bg-slate-50 hover:shadow-sm transition-all cursor-pointer group">
                          <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shadow-sm relative">
                             <div className="w-full h-full group-hover:scale-110 transition-transform duration-500">
                                <VehicleImage src={v.img} alt={v.name} className="w-full h-full object-cover" />
                             </div>
                          </div>
                          <div className="flex-1 overflow-hidden">
                             <p className="text-sm font-bold text-slate-900 truncate">{v.name}</p>
                             <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <p className="text-xs text-emerald-600 font-medium">Road Ready</p>
                             </div>
                          </div>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 group-hover:text-blue-500"><ArrowRight className="w-4 h-4"/></Button>
                       </div>
                    ))}
                 </div>
              </div>
           </Card>

           {/* Recent Activity Timeline */}
           <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Touchpoints</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {[
                       { type: "Service", title: "Premium Service Completed", date: "2 days ago", icon: CheckCircle2, color: "text-emerald-500" },
                       { type: "Email", title: "Opened 'Summer Promo'", date: "5 days ago", icon: Mail, color: "text-blue-500" },
                       { type: "Call", title: "Inbound: Scheduling Query", date: "1 week ago", icon: Phone, color: "text-purple-500" },
                       { type: "Web", title: "Visited 'My Garage'", date: "2 weeks ago", icon: ArrowRight, color: "text-slate-400" },
                    ].map((item, i) => (
                       <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                             <item.icon className={`w-3 h-3 ${item.color}`} />
                          </div>
                          
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded bg-white border border-slate-100 shadow-sm ml-4 md:ml-0 md:mr-0">
                             <div className="flex items-center justify-between space-x-2 mb-1">
                                <div className="font-bold text-slate-900 text-xs">{item.type}</div>
                                <time className="font-mono text-[10px] text-slate-500">{item.date}</time>
                             </div>
                             <div className="text-slate-500 text-xs">{item.title}</div>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           {/* Loyalty Tier Progress */}
           <Card className="border-slate-200 shadow-sm bg-slate-900 text-white">
              <CardContent className="p-6">
                 <div className="flex justify-between items-center mb-4">
                    <div>
                       <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Current Tier</p>
                       <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                           {customer.tier === 'Rookie' ? 'ROOKIE' : customer.tier === 'Pro' ? 'PRO' : customer.tier === 'Elite' ? 'ELITE' : 'LEGEND'}
                       </h3>
                    </div>
                    <Trophy className="w-8 h-8 text-yellow-500" />
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-300">
                       <span>Progress to Next Tier</span>
                       <span>72%</span>
                    </div>
                    <Progress value={72} className="h-2 bg-slate-800 [&>div]:bg-yellow-500" />
                    <p className="text-xs text-slate-400 mt-2">Earn more points to unlock next status.</p>
                 </div>
              </CardContent>
           </Card>

        </div>
      </div>
    </div>
  );
}