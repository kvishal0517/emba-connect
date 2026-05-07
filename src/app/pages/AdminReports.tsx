import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line, FunnelChart, Funnel, LabelList } from 'recharts';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Trophy, 
  TrendingUp, 
  PieChart as PieIcon,
  Settings, 
  Bell, 
  Search, 
  Menu,
  MoreVertical,
  Filter,
  Download,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Activity,
  LogOut,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  MoreHorizontal,
  Wrench,
  Zap,
  Flag,
  X,
  Gamepad2,
  Mail,
  MousePointer,
  LayoutTemplate,
  Copy,
  Trash2,
  Edit,
  Plus,
  Play,
  Pause,
  Target,
  Megaphone,
  Send,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Ticket,
  Image as ImageIcon,
  Type,
  MessageSquare,
  Shield,
  Lock,
  FileText,
  AlertTriangle,
  UserCog,
  Globe,
  Smartphone,
  Store,
  Share2,
  RefreshCw,
  Code,
  Webhook,
  Brain,
  Sparkles,
  Bot,
  Heart,
  Smile,
  Frown,
  DollarSign,
  ArrowUpRight,
  MessageCircle,
  UserPlus,
  Lightbulb,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { db, GameConfig } from '@/app/lib/db';
import { Switch } from '@/app/components/ui/switch';
import { Input } from '@/app/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/app/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Progress } from "@/app/components/ui/progress";
import { Label } from "@/app/components/ui/label";

// --- Mock Data for Enterprise Charts ---

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminReports() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");
  const [loyaltyView, setLoyaltyView] = useState<'analytics' | 'tiers'>('tiers');
  const [tiers, setTiers] = useState([
    { id: 'bronze', name: "Bronze", color: "bg-amber-700", points: 0, multiplier: 1.0, benefits: ["Basic App Access", "Service History"] },
    { id: 'silver', name: "Silver", color: "bg-slate-400", points: 2500, multiplier: 1.25, benefits: ["5% Parts Discount", "Priority Booking"] },
    { id: 'gold', name: "Gold", color: "bg-yellow-400", points: 7500, multiplier: 1.5, benefits: ["10% Labor Discount", "Free Diagnostics", "Valet Service"] },
    { id: 'platinum', name: "Platinum", color: "bg-slate-900", points: 15000, multiplier: 2.0, benefits: ["Dedicated Advisor", "20% All Services", "Track Day Invite", "Free Loaner"] },
  ]);
  const [users] = useState(db.getAllUsers());
  const [retentionRate, setRetentionRate] = useState("89%");

  useEffect(() => {
      // Calculate Retention Rate dynamically based on Service History
      // Definition: % of users with a service visit in the last 6 months
      const services = db.getAllServices();
      const vehicles = db.getAllVehicles();
      const allUsers = db.getAllUsers();

      if (allUsers.length === 0) return;

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const recentServices = services.filter(s => new Date(s.date) > sixMonthsAgo);
      const activeVehicleIds = new Set(recentServices.map(s => s.vehicleId));
      
      const activeUserIds = new Set();
      vehicles.forEach(v => {
          if (activeVehicleIds.has(v.id)) {
              activeUserIds.add(v.ownerId);
          }
      });

      // Calculate rate
      const calculatedRate = (activeUserIds.size / allUsers.length) * 100;
      setRetentionRate(`${calculatedRate.toFixed(1)}%`);
  }, []);
  
  // --- Loyalty Modal States ---
  const [createTierOpen, setCreateTierOpen] = useState(false);
  const [globalRulesOpen, setGlobalRulesOpen] = useState(false);
  const [configureTierOpen, setConfigureTierOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [newTierData, setNewTierData] = useState({ name: '', points: 0, multiplier: 1.0, color: 'bg-slate-500' });
  const [globalRules, setGlobalRules] = useState({
      autoUpgrade: true,
      downgradeLogic: true,
      pointExpiration: 365
  });

  const handleCreateTier = () => {
      const id = newTierData.name.toLowerCase().replace(/\s+/g, '-');
      const newTier = {
          id,
          name: newTierData.name,
          color: newTierData.color,
          points: Number(newTierData.points),
          multiplier: Number(newTierData.multiplier),
          benefits: ["Basic App Access"]
      };
      setTiers([...tiers, newTier]);
      setCreateTierOpen(false);
      setNewTierData({ name: '', points: 0, multiplier: 1.0, color: 'bg-slate-500' });
      toast.success(`New Tier '${newTier.name}' Created`);
  };

  const handleUpdateGlobalRules = () => {
      setGlobalRulesOpen(false);
      toast.success("Global Rules Updated", { description: "Changes will apply immediately." });
  };
  
  // --- Real-time Activity State ---
  const [liveActivities, setLiveActivities] = useState([
    { id: 1, type: 'redeem', user: 'Alex M.', avatar: 'https://images.unsplash.com/photo-1700770956385-9c0bdf08e314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100', detail: 'Redeemed Free Oil Change', time: 'Just now', icon: Ticket, color: 'bg-emerald-100 text-emerald-600' },
    { id: 2, type: 'book', user: 'Sarah J.', avatar: 'https://images.unsplash.com/photo-1623849353448-e74d73294da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100', detail: 'Booked 30k Service', time: '2m ago', icon: Calendar, color: 'bg-blue-100 text-blue-600' },
    { id: 3, type: 'tier', user: 'Mike T.', avatar: 'https://images.unsplash.com/photo-1759405185685-c6009021adec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100', detail: 'Upgraded to Elite', time: '5m ago', icon: Trophy, color: 'bg-amber-100 text-amber-600' },
    { id: 4, type: 'game', user: 'Lisa R.', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80', detail: 'Won Spin Wheel (500 pts)', time: '12m ago', icon: Gamepad2, color: 'bg-purple-100 text-purple-600' },
    { id: 5, type: 'login', user: 'David S.', avatar: 'https://github.com/shadcn.png', detail: 'Active Session', time: '15m ago', icon: Users, color: 'bg-slate-100 text-slate-600' },
  ]);

  const [activeUsersCount, setActiveUsersCount] = useState(142);
  const [pointsIssuedRealtime, setPointsIssuedRealtime] = useState(12500);

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Add Activity
      const types = ['redeem', 'book', 'tier', 'game', 'login'];
      const type = types[Math.floor(Math.random() * types.length)];
      const names = ['John D.', 'Emily W.', 'Chris P.', 'Jessica L.', 'David S.', 'Robert K.', 'Amanda B.'];
      const avatars = [
        'https://images.unsplash.com/photo-1700770956385-9c0bdf08e314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100',
        'https://images.unsplash.com/photo-1623849353448-e74d73294da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100',
        'https://images.unsplash.com/photo-1759405185685-c6009021adec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100',
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80'
      ];
      
      const name = names[Math.floor(Math.random() * names.length)];
      const avatar = avatars[Math.floor(Math.random() * avatars.length)];
      
      let detail = '';
      let icon = Activity;
      let color = 'bg-slate-100 text-slate-600';

      if (type === 'redeem') { detail = 'Redeemed $10 Voucher'; icon = Ticket; color = 'bg-emerald-100 text-emerald-600'; }
      else if (type === 'book') { detail = 'Scheduled Maintenance'; icon = Calendar; color = 'bg-blue-100 text-blue-600'; }
      else if (type === 'tier') { detail = 'Reached Pro Tier'; icon = Trophy; color = 'bg-amber-100 text-amber-600'; }
      else if (type === 'game') { detail = 'Played Daily Trivia'; icon = Gamepad2; color = 'bg-purple-100 text-purple-600'; }
      else { detail = 'Logged In'; icon = Users; color = 'bg-slate-100 text-slate-600'; }

      const newActivity = { id: Date.now(), type, user: name, avatar, detail, time: 'Just now', icon, color };
      setLiveActivities(prev => [newActivity, ...prev.slice(0, 9)]);

      // 2. Update Counters (Random walk)
      setActiveUsersCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      if (Math.random() > 0.7) setPointsIssuedRealtime(prev => prev + Math.floor(Math.random() * 100));

    }, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState<string | null>(null);
  const [filterSpend, setFilterSpend] = useState<number | null>(null);
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const [filterLastService, setFilterLastService] = useState<number | null>(null);

  // --- Analytics View State ---
  const [analyticsDateRange, setAnalyticsDateRange] = useState("30d");
  const [revenueChartType, setRevenueChartType] = useState<'revenue' | 'profit'>('revenue');
  const [funnelBreakdown, setFunnelBreakdown] = useState('all');
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);

  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { 
        role: 'assistant', 
        content: "Good morning! Based on yesterday's data, I noticed a **8% spike in churn risk** among Gold Tier members.",
        action: "Launch Retention Workflow"
    },
    {
        role: 'user',
        content: "Why is the churn increasing?"
    },
    {
        role: 'assistant',
        content: "Analysis of 45 negative reviews suggests **longer wait times on weekends** are the primary driver.",
        stats: { wait: "45 mins", sentiment: "-12%" }
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const userText = chatInput.trim();
    const newMsg = { role: 'user', content: userText };
    
    // Check context (last message) to see if we should generate a report
    // We use the current state 'chatMessages' which doesn't include the new user message yet
    const lastMsg = chatMessages[chatMessages.length - 1];
    const isResponseToReportPrompt = lastMsg?.role === 'assistant' && 
                                     lastMsg.content.includes("generate a full report");

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput("");
    setIsTyping(true);

    // Dynamic processing time based on complexity
    const processingTime = userText.length > 20 || isResponseToReportPrompt ? 1500 : 700;

    setTimeout(() => {
        let responseMsg;
        const lowerUserText = userText.toLowerCase();

        // 0. SEARCH KNOWLEDGE BASE FIRST (Deep Understanding)
        const kb = db.getAIKnowledge();
        let bestMatch = null;
        let maxScore = 0;

        for (const item of kb) {
            let score = 0;
            // Calculate score based on keyword matches
            for (const kw of item.keywords) {
                if (lowerUserText.includes(kw.toLowerCase())) {
                    score += 1;
                }
            }
            
            if (score > maxScore) {
                maxScore = score;
                bestMatch = item;
            }
        }

        // 1. REPORT GENERATION INTENT (Contextual)
        const isReportConfirm = isResponseToReportPrompt && /yes|sure|please|ok|do it|generate/i.test(lowerUserText);
        
        if (isReportConfirm) {
             responseMsg = {
                role: 'assistant',
                content: `**Executive Strategy Report Generated**<br/><br/>` +
                         `**1. Diagnosis:** Customer churn in Gold Tier is currently **${churnRate}%**, correlated with **weekend wait times** exceeding 45 mins.<br/>` +
                         `**2. Strategy:** Dynamic staffing adjustment and opening a dedicated 'Express Lane' for tier members.<br/>` +
                         `**3. Impact:** Projected revenue recovery of **$${(totalRevenue * 0.15).toLocaleString()}**.<br/><br/>` +
                         `I have prepared the schedule adjustments for your approval.`,
                action: "Approve Staffing Changes",
                stats: { wait: "18 mins", sentiment: "+24%" }
            };
        } 
        // 2. HIGH CONFIDENCE KNOWLEDGE BASE MATCH (Specific Questions)
        else if (bestMatch && maxScore >= 2) {
             responseMsg = {
                role: 'assistant',
                content: bestMatch.response,
                action: bestMatch.actionLabel ? bestMatch.actionLabel : null
            };
        }
        // 3. LIVE DATA QUERIES (Generic Stats)
        else if (lowerUserText.includes("revenue") || lowerUserText.includes("sales") || lowerUserText.includes("income")) {
            responseMsg = {
                role: 'assistant',
                content: `**Live Financial Data:**<br/>Current total revenue is **$${totalRevenue.toLocaleString()}**, trending **+12%** month-over-month. <br/><br/>The **${tiers.find(t=>t.id==='platinum')?.name || 'Platinum'}** tier is your strongest performer, contributing 40% of total volume despite making up only 15% of the user base.`,
                action: "View Revenue Breakdown",
                stats: { revenue: `$${totalRevenue.toLocaleString()}`, trend: "+12%" }
            };
        }
        else if (lowerUserText.includes("churn") || lowerUserText.includes("risk") || lowerUserText.includes("retention")) {
            const riskCount = Math.floor(activeMembers * 0.08);
            responseMsg = {
                role: 'assistant',
                content: `**Churn Risk Analysis:**<br/>Current churn rate is **${churnRate}%**. I've identified **${riskCount} at-risk members** who show signs of disengagement (low login frequency).<br/><br/>Most are in the **${tiers[0].name}** tier and haven't booked a service in 6+ months.`,
                action: "Launch Retention Campaign",
                stats: { risk: "High", count: `${riskCount} Users` }
            };
        }
        else if (lowerUserText.includes("user") || lowerUserText.includes("active") || lowerUserText.includes("traffic")) {
             responseMsg = {
                role: 'assistant',
                content: `**Platform Activity:**<br/>There are **${activeUsersCount} active users** online right now.<br/><br/>New user signups are up **15%** this week, driven primarily by the recent social media campaign.`,
                action: "View Live Traffic",
                stats: { active: activeUsersCount.toString(), trend: "Rising" }
            };
        }
        else if (lowerUserText.includes("campaign") || lowerUserText.includes("email") || lowerUserText.includes("marketing")) {
            responseMsg = {
                role: 'assistant',
                content: `**Campaign Performance:**<br/>Your recent **'Summer Service Special'** campaign is performing well with a **45% open rate**.<br/><br/>Recommendation: Resend to non-openers on Tuesday at 10 AM for optimal engagement.`,
                action: "Manage Campaigns",
                stats: { openRate: "45%", ctr: "12%" }
            };
        }
        // 4. LOW CONFIDENCE KB MATCH (Single keyword match that didn't trigger live data)
        else if (bestMatch && maxScore >= 1) {
             responseMsg = {
                role: 'assistant',
                content: bestMatch.response,
                action: bestMatch.actionLabel ? bestMatch.actionLabel : null
            };
        }
        // 5. GREETINGS
        else if (lowerUserText.match(/^(hi|hello|hey|greetings|good morning|yo)/)) {
             responseMsg = {
                role: 'assistant',
                content: "Hello! I am your **Executive AI Assistant**, trained on Pitstop+ loyalty dynamics, revenue forecasting, and churn intelligence. Ask me about **'Platform Vision'**, **'Churn Calculation'**, or **'Revenue Forecasts'**.",
                action: null
            };
        }
        // 6. DEFAULT FALLBACK
        else {
            const responses = [
                "I'm analyzing the latest data stream... One moment. I've noticed a positive correlation between **Service History** depth and **Loyalty Tier** progression.",
                `Based on predictive modeling, targeting the **'${tiers[1].name}'** tier with a 'Double Points' weekend could boost revenue by **8%**.`,
                `I've flagged ${Math.floor(Math.random() * 20)} high-value customers who haven't visited in 6 months. A personalized SMS campaign usually converts 12% of this segment.`,
                "Revenue is projected to increase by **12%** if we optimize the service scheduling algorithm to reduce gaps.",
                "Sentiment analysis indicates a **positive trend** in the last 48 hours, likely due to the new rewards catalog update.",
                "I can help you dig deeper. Try asking specific questions like **'How is churn calculated?'** or **'What is the revenue model?'**."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            responseMsg = { role: 'assistant', content: randomResponse };
        }

        setChatMessages(prev => [...prev, responseMsg]);
        setIsTyping(false);
    }, processingTime);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSendMessage();
  };

  const [gameSettings, setGameSettings] = useState<GameConfig[]>(db.getGameSettings());
  
  const handleToggleGame = (id: string, enabled: boolean) => {
      db.updateGameStatus(id, enabled);
      setGameSettings(db.getGameSettings());
      toast.success(enabled ? "Game enabled" : "Game disabled");
  };

  const augmentedUsers = useMemo(() => {
    return users.map(user => ({
      ...user,
      totalSpend: Math.floor(Math.random() * 10000) + 500, 
      location: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'][Math.floor(Math.random() * 5)],
      lastServiceDaysAgo: Math.floor(Math.random() * 365)
    }));
  }, [users]);

  const filteredUsers = useMemo(() => {
    return augmentedUsers.filter((user) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.id.toString().includes(term);
      
      const matchesTier = filterTier ? user.tier === filterTier : true;
      const matchesSpend = filterSpend ? user.totalSpend >= filterSpend : true;
      const matchesLocation = filterLocation ? user.location === filterLocation : true;
      const matchesLastService = filterLastService ? user.lastServiceDaysAgo <= filterLastService : true;

      return matchesSearch && matchesTier && matchesSpend && matchesLocation && matchesLastService;
    });
  }, [augmentedUsers, searchTerm, filterTier, filterSpend, filterLocation, filterLastService]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Tier', 'Total Spend', 'Location', 'Last Service (Days Ago)'];
    const rows = filteredUsers.map(user => [
      user.id,
      user.name,
      user.email,
      user.tier,
      `$${user.totalSpend}`,
      user.location,
      `${user.lastServiceDaysAgo} days`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'customer_segmentation.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success("Exported to CSV");
  };

  const handleExportDashboard = () => {
    const headers = ['Metric', 'Value', 'Trend'];
    const rows = [
        ['Active Users', activeUsersCount.toString(), '+12%'],
        ['Points Issued', pointsIssuedRealtime.toLocaleString(), '+5.4%'],
        ['Redemptions Today', '48', 'vs 32 yesterday'],
        ['Engagement Score', '94/100', 'High'],
        ['Total Revenue', `$${totalRevenue.toLocaleString()}`, '+12%'],
        ['Churn Rate', `${churnRate}%`, 'Stable']
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'dashboard_metrics.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success("Dashboard Report Exported");
  };

  const handleExportAnalytics = () => {
    const headers = ['Month', 'Organic Revenue', 'Rewards Revenue', 'Total'];
    const rows = revenueImpactData.map(d => [
        d.month,
        d.organic.toString(),
        d.rewards.toString(),
        (d.organic + d.rewards).toString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'analytics_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success("Analytics Data Exported");
  };

  const handleUpdateTier = (tierId: string, field: 'points' | 'multiplier' | 'name', value: string) => {
    setTiers(prev => prev.map(t => {
      if (t.id === tierId) {
        const val = field === 'name' ? value : Number(value);
        return { ...t, [field]: val };
      }
      return t;
    }));
  };

  const handleAddBenefit = (tierId: string) => {
    const benefit = window.prompt("Enter new benefit:");
    if (benefit) {
      setTiers(prev => prev.map(t => {
        if (t.id === tierId) {
          return { ...t, benefits: [...t.benefits, benefit] };
        }
        return t;
      }));
      toast.success("Benefit added");
    }
  };

  const handleRemoveBenefit = (tierId: string, index: number) => {
    setTiers(prev => prev.map(t => {
      if (t.id === tierId) {
        const newBenefits = [...t.benefits];
        newBenefits.splice(index, 1);
        return { ...t, benefits: newBenefits };
      }
      return t;
    }));
    toast.success("Benefit removed");
  };

  const handleSaveConfiguration = () => {
      toast.success("Configuration Saved", {
          description: "Loyalty tier settings have been updated successfully."
      });
  };

  const [services] = useState(db.getAllServices());
  const [vehicles] = useState(db.getAllVehicles());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- KPI Calculations & Mock Data ---
  const totalRevenue = services.reduce((acc, curr) => acc + curr.cost, 0);
  const activeMembers = users.length;
  const churnRate = 2.4; 
  const pointsIssued = services.reduce((acc, curr) => acc + curr.pointsEarned, 0);
  const rewardsRedeemed = Math.floor(pointsIssued * 0.65); // Mocked
  const clv = 4500; // Mocked CLV

  // --- Chart Data ---
  
  // 1. Tier Distribution (Donut)
  const tierDistribution = useMemo(() => {
    const dist: Record<string, number> = { Rookie: 0, Pro: 0, Elite: 0, Legend: 0 };
    users.forEach(u => {
        if (dist[u.tier] !== undefined) dist[u.tier]++;
    });
    return Object.entries(dist).map(([name, value], index) => ({ 
        name, 
        value,
        fill: index === 0 ? '#94a3b8' : index === 1 ? '#3b82f6' : index === 2 ? '#f59e0b' : '#10b981'
    }));
  }, [users]);

  // 2. Engagement Heatmap (Bar)
  const engagementData = [
    { name: 'Mon', visits: 120, services: 45 },
    { name: 'Tue', visits: 132, services: 52 },
    { name: 'Wed', visits: 101, services: 38 },
    { name: 'Thu', visits: 154, services: 65 },
    { name: 'Fri', visits: 190, services: 85 },
    { name: 'Sat', visits: 230, services: 110 },
    { name: 'Sun', visits: 180, services: 75 },
  ];

  // 3. Points Earned vs Redeemed (Line)
  const pointsTrendData = [
      { month: 'Jan', earned: 45000, redeemed: 32000 },
      { month: 'Feb', earned: 52000, redeemed: 38000 },
      { month: 'Mar', earned: 49000, redeemed: 41000 },
      { month: 'Apr', earned: 62000, redeemed: 55000 },
      { month: 'May', earned: 58000, redeemed: 48000 },
      { month: 'Jun', earned: 71000, redeemed: 62000 },
  ];

  // 4. ROI & Revenue Trend (Area)
  const roiData = [
      { month: 'Jan', revenue: 45000, cost: 20000, profit: 25000 },
      { month: 'Feb', revenue: 52000, cost: 22000, profit: 30000 },
      { month: 'Mar', revenue: 49000, cost: 21000, profit: 28000 },
      { month: 'Apr', revenue: 62000, cost: 25000, profit: 37000 },
      { month: 'May', revenue: 58000, cost: 24000, profit: 34000 },
      { month: 'Jun', revenue: 75000, cost: 28000, profit: 47000 },
  ];

  // 6. CRM Analytics Data
  const revenueImpactData = [
      { month: 'Jan', organic: 35000, rewards: 10000 },
      { month: 'Feb', organic: 37000, rewards: 15000 },
      { month: 'Mar', organic: 32000, rewards: 17000 },
      { month: 'Apr', organic: 38000, rewards: 24000 },
      { month: 'May', organic: 35000, rewards: 23000 },
      { month: 'Jun', organic: 45000, rewards: 30000 },
  ];

  const funnelData = [
      { value: 1000, name: 'Site Visits', fill: '#94a3b8' },
      { value: 800, name: 'Scheduled', fill: '#60a5fa' },
      { value: 720, name: 'Completed', fill: '#3b82f6' },
      { value: 450, name: 'Repeated', fill: '#1d4ed8' },
  ];

  // 7. Retention Trend Data (New)
  const retentionTrendData = [
      { month: 'Jan', rookie: 62, pro: 72, elite: 88, legend: 96 },
      { month: 'Feb', rookie: 60, pro: 75, elite: 89, legend: 97 },
      { month: 'Mar', rookie: 65, pro: 74, elite: 86, legend: 95 },
      { month: 'Apr', rookie: 68, pro: 78, elite: 90, legend: 98 },
      { month: 'May', rookie: 65, pro: 80, elite: 92, legend: 98 },
      { month: 'Jun', rookie: 70, pro: 82, elite: 94, legend: 99 },
  ];

  // 5. Milestone Completion (Bar)
  const milestoneData = [
      { name: 'Profile Complete', value: 85 },
      { name: 'First Service', value: 72 },
      { name: '5x Visit Streak', value: 45 },
      { name: 'Referral', value: 28 },
      { name: 'Elite Status', value: 12 },
  ];

  // --- Components ---

  const KpiCard = ({ title, value, trend, trendValue, icon: Icon, colorClass, onClick }: any) => (
    <Card className={`border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer hover:border-blue-300 hover:ring-2 hover:ring-blue-100' : ''}`} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          </div>
          <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs font-medium">
          <span className={`flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {trendValue}
          </span>
          <span className="text-slate-400 ml-2">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className={`
          bg-slate-900 text-slate-300 flex-shrink-0 transition-all duration-300 ease-in-out border-r border-slate-800
          ${sidebarOpen ? 'w-64' : 'w-20'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && <span className="font-bold text-white text-lg tracking-tight">Pitstop+ CRM</span>}
           </div>
        </div>

        <nav className="p-4 space-y-1">
           {[
             { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
             { id: 'analytics', icon: PieIcon, label: 'CRM Analytics' },
             { id: 'campaigns', icon: Megaphone, label: 'Campaign Mgmt' },
             { id: 'customers', icon: Users, label: 'Customers' },
             { id: 'customer-intel', icon: Brain, label: 'Customer Intel.', action: () => navigate('/admin/customer-intelligence') },
             { id: 'loyalty', icon: Trophy, label: 'Loyalty Prog.' },
             { id: 'games', icon: Gamepad2, label: 'Game Mgmt' },
             { id: 'roi', icon: TrendingUp, label: 'ROI & Insights' },
             { id: 'admin', icon: Shield, label: 'Admin & Roles' },
             { id: 'integrations', icon: Globe, label: 'Integrations' },
             { id: 'ai-training', icon: Bot, label: 'AI Training', action: () => navigate('/admin/ai-training') },
           ].map((item) => (
             <button
                key={item.id}
                onClick={() => item.action ? item.action() : setActiveView(item.id)}
                className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeView === item.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                        : 'hover:bg-slate-800 text-slate-400 hover:text-white'}
                `}
             >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
             </button>
           ))}
           
           <div className="pt-4 mt-4 border-t border-slate-800">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>Settings</span>}
              </button>
           </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-slate-700">
                  <Menu className="w-5 h-5" />
              </Button>
              <div className="relative hidden md:block">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search..." className="pl-9 w-64 bg-slate-50 border-slate-200 focus:bg-white transition-all" />
              </div>
           </div>

           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative text-slate-500">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </Button>
              <div className="h-6 w-px bg-slate-200"></div>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                          <Avatar className="h-8 w-8 border border-slate-200">
                              <AvatarImage src="https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100" />
                              <AvatarFallback>AD</AvatarFallback>
                          </Avatar>
                          <div className="hidden md:block text-left">
                              <p className="text-sm font-medium text-slate-700">Admin User</p>
                              <p className="text-xs text-slate-500">System Manager</p>
                          </div>
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                      <DropdownMenuItem>Billing</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => navigate('/login')}>
                          <LogOut className="w-4 h-4 mr-2" /> Log out
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
           </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
           <div className="max-w-7xl mx-auto space-y-6">
              
              {/* --- OVERVIEW VIEW --- */}
              {activeView === 'overview' && (
                 <div className="space-y-6">
                     {/* Hero Banner */}
                     <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-xl mb-2 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 z-0"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1549047608-55b2fd4b8427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBhdXRvJTIwZ2FyYWdlJTIwd29ya3Nob3AlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzE2OTU2NDd8MA&ixlib=rb-4.1.0&q=80&w=1600" 
                            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000" 
                            alt="Dashboard Background"
                        />
                        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                                        <Activity className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-md">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                                        Live System
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-sm">
                                    Enterprise Dashboard
                                </h1>
                                <p className="text-blue-200/80 font-medium max-w-lg text-sm md:text-base">
                                    Real-time monitoring of fleet operations, customer engagement, and loyalty rewards performance.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex flex-col items-end mr-4">
                                    <span className="text-xs text-blue-200/60 font-mono uppercase tracking-widest">System Status</span>
                                    <span className="text-sm font-bold text-white flex items-center gap-2">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> 
                                        Operational
                                    </span>
                                </div>
                                <Button onClick={handleExportDashboard} className="bg-white text-slate-900 hover:bg-blue-50 border-none shadow-lg font-bold h-12 px-6">
                                    <Download className="w-4 h-4 mr-2"/> Export Report
                                </Button>
                            </div>
                        </div>
                     </div>

                    {/* Real-time KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-3 opacity-10"><Users className="w-16 h-16" /></div>
                           <CardContent className="p-6">
                               <p className="text-sm font-medium text-slate-500">Active Users Now</p>
                               <div className="flex items-baseline gap-2 mt-1">
                                   <h3 className="text-3xl font-bold text-slate-900">{activeUsersCount}</h3>
                                   <span className="text-xs font-medium text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                       <TrendingUp className="w-3 h-3 mr-1" /> +12%
                                   </span>
                               </div>
                           </CardContent>
                       </Card>

                       <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-3 opacity-10"><Trophy className="w-16 h-16" /></div>
                           <CardContent className="p-6">
                               <p className="text-sm font-medium text-slate-500">Points Issued (Live)</p>
                               <div className="flex items-baseline gap-2 mt-1">
                                   <h3 className="text-3xl font-bold text-slate-900">{pointsIssuedRealtime.toLocaleString()}</h3>
                                   <span className="text-xs font-medium text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                       <TrendingUp className="w-3 h-3 mr-1" /> +5.4%
                                   </span>
                               </div>
                           </CardContent>
                       </Card>

                       <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-3 opacity-10"><Ticket className="w-16 h-16" /></div>
                           <CardContent className="p-6">
                               <p className="text-sm font-medium text-slate-500">Redemptions Today</p>
                               <div className="flex items-baseline gap-2 mt-1">
                                   <h3 className="text-3xl font-bold text-slate-900">48</h3>
                                   <span className="text-xs font-medium text-slate-500">vs 32 yesterday</span>
                               </div>
                           </CardContent>
                       </Card>

                        <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-md relative overflow-hidden border-none">
                           <div className="absolute top-0 right-0 p-3 opacity-20"><Zap className="w-16 h-16 text-white" /></div>
                           <CardContent className="p-6">
                               <p className="text-sm font-medium text-indigo-100">Engagement Score</p>
                               <div className="flex items-baseline gap-2 mt-1">
                                   <h3 className="text-3xl font-bold text-white">94/100</h3>
                                   <span className="text-xs font-medium text-white bg-white/20 px-1.5 py-0.5 rounded-full">
                                       High
                                   </span>
                               </div>
                           </CardContent>
                       </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                       {/* Engagement Chart (Left) */}
                       <Card className="lg:col-span-2 border border-slate-200 shadow-sm bg-white">
                           <CardHeader>
                               <div className="flex justify-between items-center">
                                   <CardTitle className="flex items-center gap-2">
                                       <Activity className="w-4 h-4 text-slate-400" /> Engagement Velocity
                                   </CardTitle>
                                   <div className="flex gap-2">
                                       <span className="flex items-center gap-1 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Visits</span>
                                       <span className="flex items-center gap-1 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Services</span>
                                   </div>
                               </div>
                           </CardHeader>
                           <CardContent>
                               <div className="h-[300px] w-full min-w-0" style={{ minHeight: '300px' }}>
                                   <ResponsiveContainer width="99%" height="100%">
                                       <AreaChart data={engagementData}>
                                            <defs>
                                               <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                               </linearGradient>
                                               <linearGradient id="colorServices" x1="0" y1="0" x2="0" y2="1">
                                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                               </linearGradient>
                                           </defs>
                                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                           <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" />
                                           <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
                                           <Tooltip />
                                           <Area type="monotone" dataKey="visits" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={2} />
                                           <Area type="monotone" dataKey="services" stroke="#10b981" fillOpacity={1} fill="url(#colorServices)" strokeWidth={2} />
                                       </AreaChart>
                                   </ResponsiveContainer>
                               </div>
                           </CardContent>
                       </Card>

                       {/* Live Feed (Right) */}
                       <Card className="border border-slate-200 shadow-sm bg-white h-[400px] flex flex-col">
                           <CardHeader className="border-b border-slate-100 pb-3 bg-slate-50/50">
                               <div className="flex justify-between items-center">
                                   <CardTitle className="text-sm font-bold flex items-center gap-2">
                                       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                       Live Feed
                                   </CardTitle>
                                   <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400"><MoreHorizontal className="w-4 h-4" /></Button>
                               </div>
                           </CardHeader>
                           <CardContent className="flex-1 overflow-y-auto p-0">
                               <div className="divide-y divide-slate-100">
                                   {liveActivities.map((activity: any) => (
                                       <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-top-2 duration-300">
                                           <div className="flex gap-3">
                                               <div className="relative">
                                                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                                      <AvatarImage src={activity.avatar} />
                                                      <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                                                  </Avatar>
                                                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${activity.color} ring-2 ring-white`}>
                                                      <activity.icon className="w-2.5 h-2.5" />
                                                  </div>
                                               </div>
                                               <div className="flex-1 min-w-0">
                                                   <div className="flex justify-between items-start">
                                                       <p className="text-sm font-medium text-slate-900 truncate">{activity.user}</p>
                                                       <span className="text-[10px] text-slate-400 whitespace-nowrap">{activity.time}</span>
                                                   </div>
                                                   <p className="text-xs text-slate-500 truncate">{activity.detail}</p>
                                               </div>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           </CardContent>
                           <div className="p-2 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-500">
                               Auto-updating every 3s...
                           </div>
                       </Card>
                    </div>

                    {/* Leaderboard Updates */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <Card className="border border-slate-200 shadow-sm bg-white">
                             <CardHeader className="pb-2">
                                 <CardTitle className="text-base flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-500" /> Leaderboard Movers
                                 </CardTitle>
                             </CardHeader>
                             <CardContent>
                                 <div className="space-y-4">
                                     {[1,2,3,4].map(i => (
                                         <div key={i} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer">
                                             <div className="font-bold text-lg text-slate-300 w-6 text-center">#{i}</div>
                                             <Avatar className="w-10 h-10 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                                                <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${i*13}`} />
                                             </Avatar>
                                             <div className="flex-1">
                                                 <p className="text-sm font-bold text-slate-900">Racer {i}</p>
                                                 <p className="text-xs text-green-600 font-medium flex items-center">
                                                     <ArrowUp className="w-3 h-3 mr-0.5" /> +{i*150} pts
                                                 </p>
                                             </div>
                                             <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400"><ChevronRight className="w-4 h-4"/></Button>
                                         </div>
                                     ))}
                                 </div>
                             </CardContent>
                         </Card>

                         {/* Trending Rewards - Visual Heavy */}
                         <Card className="border border-slate-200 shadow-sm bg-white">
                             <CardHeader className="pb-2">
                                 <CardTitle className="text-base flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-purple-500" /> Trending Redemptions
                                 </CardTitle>
                             </CardHeader>
                             <CardContent>
                                <div className="space-y-3">
                                   {[
                                      { name: "Premium Detailing Kit", cost: "2,500 pts", img: "https://images.unsplash.com/photo-1763797833964-df8db924f20c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkZXRhaWxpbmclMjBraXQlMjBwcm9kdWN0fGVufDF8fHx8MTc3MTY3MDU1OXww&ixlib=rb-4.1.0&q=80&w=1080", trend: "+12%" },
                                      { name: "Synthetic Motor Oil", cost: "1,200 pts", img: "https://images.unsplash.com/photo-1727233432251-b254881e01a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzeW50aGV0aWMlMjBtb3RvciUyMG9pbCUyMGJvdHRsZXxlbnwxfHx8fDE3NzE2NzA1NTl8MA&ixlib=rb-4.1.0&q=80&w=1080", trend: "+8%" },
                                      { name: "Official Racing Tee", cost: "800 pts", img: "https://images.unsplash.com/photo-1759503407492-e45b8dd0d5e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWNpbmclMjB0LXNoaXJ0JTIwbWVyY2hhbmRpc2V8ZW58MXx8fHwxNzcxNjcwNTU5fDA&ixlib=rb-4.1.0&q=80&w=1080", trend: "+24%" }
                                   ].map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                                         <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-slate-100 relative">
                                            <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-1 rounded-bl-md">HOT</div>
                                         </div>
                                         <div className="flex-1">
                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                               <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 text-[10px] h-5 px-1.5 border-none">
                                                  {item.cost}
                                               </Badge>
                                               <span className="text-xs font-medium text-emerald-600 flex items-center">
                                                  <TrendingUp className="w-3 h-3 mr-0.5" /> {item.trend}
                                               </span>
                                            </div>
                                         </div>
                                         <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 group-hover:text-blue-500"><ArrowRight className="w-4 h-4"/></Button>
                                      </div>
                                   ))}
                                </div>
                             </CardContent>
                         </Card>
                     </div>

                 </div>
              )}

              {/* --- ANALYTICS VIEW --- */}
              {activeView === 'analytics' && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <h2 className="text-2xl font-bold text-slate-900">CRM Analytics</h2>
                            <p className="text-slate-500">Deep dive into customer behavior and revenue metrics</p>
                          </div>
                          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                              {['7d', '30d', '90d', 'ytd'].map((range) => (
                                  <button
                                      key={range}
                                      onClick={() => setAnalyticsDateRange(range)}
                                      className={`px-3 py-1.5 text-xs font-bold rounded-md uppercase transition-all ${
                                          analyticsDateRange === range 
                                              ? 'bg-slate-900 text-white shadow-sm' 
                                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                      }`}
                                  >
                                      {range}
                                  </button>
                              ))}
                              <div className="w-px h-4 bg-slate-200 mx-1" />
                              <Button onClick={handleExportAnalytics} size="sm" variant="ghost" className="h-7 px-2 text-slate-500 hover:text-blue-600">
                                  <Download className="w-4 h-4" />
                              </Button>
                          </div>
                      </div>

                      {/* KPI Grid - Clickable */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <KpiCard 
                              title="Customer Lifetime Value" 
                              value={analyticsDateRange === '7d' ? "$4,250" : "$4,500"} 
                              trend="up" 
                              trendValue={analyticsDateRange === '7d' ? "1.2%" : "5%"} 
                              icon={Users} 
                              colorClass="bg-blue-500 text-blue-600" 
                              onClick={() => setSelectedKpi('clv')}
                          />
                          <KpiCard 
                              title="Avg Revenue Per User" 
                              value={analyticsDateRange === '7d' ? "$310" : "$320"} 
                              trend="up" 
                              trendValue={analyticsDateRange === '7d' ? "8%" : "12%"} 
                              icon={CreditCard} 
                              colorClass="bg-emerald-500 text-emerald-600"
                              onClick={() => setSelectedKpi('arpu')}
                          />
                          <KpiCard 
                              title="Repeat Service Rate" 
                              value={analyticsDateRange === '7d' ? "65%" : "68%"} 
                              trend="up" 
                              trendValue="3.2%" 
                              icon={TrendingUp} 
                              colorClass="bg-purple-500 text-purple-600"
                              onClick={() => setSelectedKpi('retention')}
                          />
                      </div>

                      {/* Charts Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Revenue Impact Chart */}
                          <Card className="border-slate-200 shadow-sm bg-white">
                              <CardHeader>
                                  <div className="flex justify-between items-center">
                                      <div>
                                          <CardTitle>Revenue Impact</CardTitle>
                                          <CardDescription>Organic vs Rewards-Driven</CardDescription>
                                      </div>
                                      <div className="flex bg-slate-100 p-1 rounded-lg">
                                          <button 
                                              onClick={() => setRevenueChartType('revenue')}
                                              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${revenueChartType === 'revenue' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                                          >
                                              Revenue
                                          </button>
                                          <button 
                                              onClick={() => setRevenueChartType('profit')}
                                              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${revenueChartType === 'profit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                                          >
                                              Profit
                                          </button>
                                      </div>
                                  </div>
                              </CardHeader>
                              <CardContent>
                                  <div className="h-[300px] w-full min-w-0" style={{ minHeight: '300px' }}>
                                      <ResponsiveContainer width="99%" height="100%">
                                          <AreaChart data={revenueImpactData}>
                                              <defs>
                                                  <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                                                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                                                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                                                  </linearGradient>
                                                  <linearGradient id="colorRewards" x1="0" y1="0" x2="0" y2="1">
                                                      <stop offset="5%" stopColor={revenueChartType === 'revenue' ? "#3b82f6" : "#10b981"} stopOpacity={0.3}/>
                                                      <stop offset="95%" stopColor={revenueChartType === 'revenue' ? "#3b82f6" : "#10b981"} stopOpacity={0}/>
                                                  </linearGradient>
                                              </defs>
                                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                              <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#64748b" dy={10} />
                                              <YAxis axisLine={false} tickLine={false} stroke="#64748b" tickFormatter={(v) => `$${v/1000}k`} />
                                              <Tooltip 
                                                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                  formatter={(value: number) => [`$${value.toLocaleString()}`, revenueChartType === 'revenue' ? 'Revenue' : 'Profit']}
                                              />
                                              <Legend />
                                              <Area 
                                                  type="monotone" 
                                                  dataKey={revenueChartType === 'revenue' ? "organic" : "rewards"} 
                                                  stackId="1" 
                                                  stroke="#94a3b8" 
                                                  fill="url(#colorOrganic)" 
                                                  fillOpacity={1} 
                                                  name={revenueChartType === 'revenue' ? "Organic Base" : "Operational Cost"} 
                                              />
                                              <Area 
                                                  type="monotone" 
                                                  dataKey={revenueChartType === 'revenue' ? "rewards" : "organic"} 
                                                  stackId="1" 
                                                  stroke={revenueChartType === 'revenue' ? "#3b82f6" : "#10b981"} 
                                                  fill="url(#colorRewards)" 
                                                  fillOpacity={1} 
                                                  name={revenueChartType === 'revenue' ? "Rewards Program" : "Net Profit"} 
                                              />
                                          </AreaChart>
                                      </ResponsiveContainer>
                                  </div>
                              </CardContent>
                          </Card>

                          {/* Retention Trend Analysis (Replacing Funnel) */}
                          <Card className="border-slate-200 shadow-sm bg-white">
                              <CardHeader>
                                  <div className="flex justify-between items-center">
                                      <div>
                                          <CardTitle>Retention Rate Analysis</CardTitle>
                                          <CardDescription>Monthly retention by Loyalty Tier</CardDescription>
                                      </div>
                                      <div className="flex items-center gap-2">
                                         <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Avg: 89%</Badge>
                                      </div>
                                  </div>
                              </CardHeader>
                              <CardContent>
                                  <div className="h-[300px] w-full min-w-0" style={{ minHeight: '300px' }}>
                                      <ResponsiveContainer width="99%" height="100%">
                                          <LineChart data={retentionTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                              <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#64748b" dy={10} fontSize={12} />
                                              <YAxis domain={[50, 100]} axisLine={false} tickLine={false} stroke="#64748b" tickFormatter={(v) => `${v}%`} fontSize={12} />
                                              <Tooltip 
                                                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                  itemStyle={{ fontSize: '12px' }}
                                                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                              />
                                              <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                                              <Line type="monotone" dataKey="legend" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Legend Tier" />
                                              <Line type="monotone" dataKey="elite" stroke="#f59e0b" strokeWidth={2} dot={{r: 3}} name="Elite Tier" />
                                              <Line type="monotone" dataKey="pro" stroke="#3b82f6" strokeWidth={2} dot={{r: 3}} name="Pro Tier" />
                                              <Line type="monotone" dataKey="rookie" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{r: 3}} name="Rookie Tier" />
                                          </LineChart>
                                      </ResponsiveContainer>
                                  </div>
                              </CardContent>
                          </Card>
                      </div>

                      {/* Cohort Analysis Table */}
                      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                          <CardHeader className="flex flex-row items-center justify-between">
                              <div>
                                  <CardTitle>Retention Cohort Analysis</CardTitle>
                                  <CardDescription>Percentage of users returning after first service</CardDescription>
                              </div>
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">View Full Report</Button>
                          </CardHeader>
                          <div className="overflow-x-auto">
                              <Table>
                                  <TableHeader>
                                      <TableRow className="bg-slate-50">
                                          <TableHead className="w-[150px]">Cohort</TableHead>
                                          <TableHead className="w-[100px]">Users</TableHead>
                                          <TableHead className="text-center">Month 1</TableHead>
                                          <TableHead className="text-center">Month 2</TableHead>
                                          <TableHead className="text-center">Month 3</TableHead>
                                          <TableHead className="text-center">Month 4</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {[
                                          { month: 'Jan', users: 150, retention: [100, 85, 70, 65] },
                                          { month: 'Feb', users: 180, retention: [100, 82, 68, 0] },
                                          { month: 'Mar', users: 160, retention: [100, 78, 0, 0] },
                                          { month: 'Apr', users: 200, retention: [100, 0, 0, 0] },
                                      ].map((row, i) => (
                                          <TableRow key={i} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                              <TableCell className="font-medium group-hover:text-blue-600">{row.month} 2023</TableCell>
                                              <TableCell>{row.users}</TableCell>
                                              {row.retention.map((val, j) => (
                                                  <TableCell key={j} className="p-1 text-center">
                                                      {val > 0 ? (
                                                          <div 
                                                              className={`p-2 rounded text-xs font-bold transition-all hover:scale-105 cursor-help ${
                                                                  val >= 80 ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 
                                                                  val >= 60 ? 'bg-blue-400 text-white' : 
                                                                  val >= 40 ? 'bg-blue-200 text-blue-900' : 
                                                                  'bg-blue-50 text-blue-900'
                                                              }`}
                                                              title={`${val}% returned in Month ${j+1}`}
                                                          >
                                                              {val}%
                                                          </div>
                                                      ) : (
                                                          <span className="text-slate-300">-</span>
                                                      )}
                                                  </TableCell>
                                              ))}
                                          </TableRow>
                                      ))}
                                  </TableBody>
                              </Table>
                          </div>
                      </Card>

                      {/* Detail Modal */}
                      <Dialog open={!!selectedKpi} onOpenChange={(o) => !o && setSelectedKpi(null)}>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    Metric Deep Dive
                                </DialogTitle>
                                <DialogDescription>
                                    Detailed analysis for {selectedKpi === 'clv' ? 'Customer Lifetime Value' : selectedKpi === 'arpu' ? 'Average Revenue Per User' : 'Retention Rate'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-slate-500">Current Value</span>
                                        <span className="text-2xl font-bold text-slate-900">
                                            {selectedKpi === 'clv' ? "$4,500" : selectedKpi === 'arpu' ? "$320" : "68%"}
                                        </span>
                                    </div>
                                    <Progress value={75} className="h-2" />
                                    <p className="text-xs text-slate-500 mt-2">Top 5% of industry benchmark</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">Contributing Factors</h4>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-sm text-slate-600">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" /> High rewards program engagement
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-slate-600">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" /> Increased frequency of oil change services
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-slate-600">
                                            <AlertCircle className="w-4 h-4 text-amber-500" /> Slightly higher churn in Rookie tier
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedKpi(null)}>Close</Button>
                                <Button>Download Report</Button>
                            </DialogFooter>
                        </DialogContent>
                      </Dialog>
                  </div>
              )}

              {/* --- CAMPAIGNS VIEW --- */}
              {activeView === 'campaigns' && (
                  <div className="space-y-6">
                      <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-2xl font-bold text-slate-900">Campaign Management</h2>
                            <p className="text-slate-500">Design, automate, and track marketing campaigns.</p>
                          </div>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => toast.success("New campaign draft created")}>
                            <Plus className="w-4 h-4 mr-2" /> Create Campaign
                          </Button>
                      </div>

                      {/* Top Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Card className="border-slate-200 shadow-sm">
                             <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-600"><Mail className="w-6 h-6"/></div>
                                <div>
                                   <p className="text-sm font-medium text-slate-500">Avg Open Rate</p>
                                   <h3 className="text-2xl font-bold text-slate-900">42.5%</h3>
                                   <p className="text-xs text-emerald-600 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> +2.4% vs last month</p>
                                </div>
                             </CardContent>
                          </Card>
                          <Card className="border-slate-200 shadow-sm">
                             <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 rounded-full bg-purple-100 text-purple-600"><MousePointer className="w-6 h-6"/></div>
                                <div>
                                   <p className="text-sm font-medium text-slate-500">Avg Click Rate</p>
                                   <h3 className="text-2xl font-bold text-slate-900">14.8%</h3>
                                   <p className="text-xs text-emerald-600 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> +1.1% vs last month</p>
                                </div>
                             </CardContent>
                          </Card>
                          <Card className="border-slate-200 shadow-sm">
                             <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 rounded-full bg-emerald-100 text-emerald-600"><Target className="w-6 h-6"/></div>
                                <div>
                                   <p className="text-sm font-medium text-slate-500">Conversion Rate</p>
                                   <h3 className="text-2xl font-bold text-slate-900">4.2%</h3>
                                   <p className="text-xs text-emerald-600 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> +0.5% vs last month</p>
                                </div>
                             </CardContent>
                          </Card>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Campaign List */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                               <CardHeader className="border-b border-slate-100 pb-4">
                                  <div className="flex items-center justify-between">
                                     <CardTitle>Recent Campaigns</CardTitle>
                                     <div className="flex gap-2">
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100">Active</Badge>
                                        <Badge variant="outline" className="text-slate-500 cursor-pointer hover:bg-slate-50">Scheduled</Badge>
                                        <Badge variant="outline" className="text-slate-500 cursor-pointer hover:bg-slate-50">Drafts</Badge>
                                     </div>
                                  </div>
                               </CardHeader>
                               <div className="overflow-x-auto">
                                  <Table>
                                     <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                           <TableHead>Campaign Name</TableHead>
                                           <TableHead>Status</TableHead>
                                           <TableHead>Metrics</TableHead>
                                           <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                     </TableHeader>
                                     <TableBody>
                                        {[
                                           { name: "Summer Service Special", status: "Active", type: "Email", sent: 1250, open: "45%", click: "12%", icon: Mail, color: "bg-blue-100 text-blue-600" },
                                           { name: "Win Back: 90 Days", status: "Active", type: "SMS", sent: 450, open: "88%", click: "24%", icon: MessageSquare, color: "bg-green-100 text-green-600" },
                                           { name: "New Model Test Drive", status: "Scheduled", type: "Email", sent: 0, open: "-", click: "-", icon: Calendar, color: "bg-amber-100 text-amber-600" },
                                           { name: "Flash Sale: Tires", status: "Draft", type: "Push", sent: 0, open: "-", click: "-", icon: Bell, color: "bg-purple-100 text-purple-600" },
                                        ].map((c, i) => (
                                           <TableRow key={i} className="group cursor-pointer hover:bg-slate-50">
                                              <TableCell>
                                                 <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${c.color}`}>
                                                       <c.icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                       <p className="font-semibold text-slate-900">{c.name}</p>
                                                       <p className="text-xs text-slate-500">{c.type} • {c.sent > 0 ? `${c.sent} sent` : 'Not sent'}</p>
                                                    </div>
                                                 </div>
                                              </TableCell>
                                              <TableCell>
                                                 <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 
                                                    c.status === 'Scheduled' ? 'bg-amber-100 text-amber-800' : 
                                                    'bg-slate-100 text-slate-800'
                                                 }`}>
                                                    {c.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>}
                                                    {c.status}
                                                 </div>
                                              </TableCell>
                                              <TableCell>
                                                 <div className="flex flex-col gap-1">
                                                    <div className="flex items-center text-xs text-slate-600">
                                                       <Eye className="w-3 h-3 mr-1 text-slate-400"/> {c.open}
                                                    </div>
                                                    <div className="flex items-center text-xs text-slate-600">
                                                       <MousePointer className="w-3 h-3 mr-1 text-slate-400"/> {c.click}
                                                    </div>
                                                 </div>
                                              </TableCell>
                                              <TableCell className="text-right">
                                                 <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600"><Edit className="w-4 h-4"/></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4"/></Button>
                                                 </div>
                                              </TableCell>
                                           </TableRow>
                                        ))}
                                     </TableBody>
                                  </Table>
                               </div>
                            </Card>

                            {/* Segmentation Selector */}
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-500" /> Audience Segmentation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Loyalty Tier</label>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">All</Badge>
                                                <Badge variant="outline" className="cursor-pointer bg-slate-100 border-slate-300">Rookie</Badge>
                                                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">Pro</Badge>
                                                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">Elite</Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Vehicle Type</label>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">Sedan</Badge>
                                                <Badge variant="outline" className="cursor-pointer bg-slate-100 border-slate-300">SUV</Badge>
                                                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">Truck</Badge>
                                                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">EV</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                           {/* A/B Testing Card */}
                           <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
                              <CardHeader className="pb-2">
                                 <div className="flex items-center justify-between">
                                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none">A/B Testing Active</Badge>
                                    <Activity className="w-4 h-4 text-indigo-400" />
                                 </div>
                                 <CardTitle className="text-lg mt-2">Subject Line Test</CardTitle>
                                 <CardDescription>Campaign: Summer Service Special</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                       <span className="font-medium text-slate-700">Variant A: "Is your AC ready?"</span>
                                       <span className="font-bold text-slate-900">42% Open</span>
                                    </div>
                                    <Progress value={42} className="h-2 bg-indigo-100" />
                                 </div>
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                       <span className="font-medium text-slate-700">Variant B: "Beat the heat..."</span>
                                       <span className="font-bold text-emerald-600">48% Open</span>
                                    </div>
                                    <Progress value={48} className="h-2 bg-indigo-100 [&>div]:bg-emerald-500" />
                                 </div>
                                 <Button variant="outline" className="w-full bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50">View Detailed Report</Button>
                              </CardContent>
                           </Card>

                           {/* Builder Preview */}
                           <Card className="border-slate-200 shadow-sm border-dashed border-2 bg-slate-50/50">
                              <CardHeader className="pb-2">
                                 <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <LayoutTemplate className="w-4 h-4" /> Builder Preview
                                 </CardTitle>
                              </CardHeader>
                              <CardContent>
                                 <div className="bg-white rounded-lg p-4 shadow-sm space-y-3 pointer-events-none select-none opacity-90 border border-slate-200">
                                    <div className="h-24 bg-slate-100 rounded w-full flex items-center justify-center text-slate-400 text-xs flex-col gap-1">
                                        <ImageIcon className="w-6 h-6 opacity-50" />
                                        <span>Hero Image Block</span>
                                    </div>
                                    <div className="space-y-2 p-2">
                                       <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                       <div className="h-4 bg-slate-100 rounded w-full"></div>
                                       <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                                    </div>
                                    <div className="h-10 bg-blue-600 rounded w-1/2 mx-auto flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                        Book Now
                                    </div>
                                 </div>
                                 <div className="mt-4">
                                    <p className="text-xs text-center text-slate-500 mb-2 font-medium">Drag blocks to customize</p>
                                    <div className="flex justify-center gap-2">
                                       <div className="p-2 bg-white border rounded shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all" title="Image"><ImageIcon className="w-4 h-4 text-slate-600"/></div>
                                       <div className="p-2 bg-white border rounded shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all" title="Text"><Type className="w-4 h-4 text-slate-600"/></div>
                                       <div className="p-2 bg-white border rounded shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all" title="Button"><MousePointer className="w-4 h-4 text-slate-600"/></div>
                                    </div>
                                 </div>
                              </CardContent>
                           </Card>
                        </div>
                      </div>
                  </div>
              )}

              {/* --- CUSTOMERS VIEW --- */}
              {activeView === 'customers' && (
                  <div className="space-y-6">
                      <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-2xl font-bold text-slate-900">Customer Segmentation</h2>
                            <p className="text-slate-500">Build audiences for targeted campaigns</p>
                          </div>
                          <div className="flex gap-2">
                             <Button variant="outline" className="text-slate-600 bg-white border-slate-200 shadow-sm" onClick={handleExportCSV}>
                                <Download className="w-4 h-4 mr-2" /> Export CSV
                             </Button>
                             <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm">
                                <Megaphone className="w-4 h-4 mr-2" /> Export to Campaign
                             </Button>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Segmentation Builder */}
                          <Card className="lg:col-span-2 border border-slate-200 shadow-sm bg-white">
                              <CardHeader className="border-b border-slate-100 pb-4">
                                  <div className="flex justify-between items-center">
                                      <CardTitle className="text-base flex items-center gap-2">
                                          <Filter className="w-4 h-4 text-slate-500" /> Filter Criteria
                                      </CardTitle>
                                      <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 text-xs h-7" onClick={() => {
                                          setFilterTier(null);
                                          setFilterSpend(null);
                                          setFilterLocation(null);
                                          setFilterLastService(null);
                                      }}>Clear All</Button>
                                  </div>
                              </CardHeader>
                              <CardContent className="p-6 space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Tier Filter */}
                                      <div className="space-y-1.5">
                                          <label className="text-xs font-semibold text-slate-500 uppercase">Loyalty Tier</label>
                                          <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                  <Button variant="outline" className="w-full justify-between bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                                                      <span className="flex items-center gap-2">
                                                          <Trophy className="w-4 h-4 text-slate-400" />
                                                          {filterTier || "All Tiers"}
                                                      </span>
                                                      <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                                  </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent className="w-56">
                                                  <DropdownMenuItem onClick={() => setFilterTier(null)}>All Tiers</DropdownMenuItem>
                                                  {['Rookie', 'Pro', 'Elite', 'Legend'].map(t => (
                                                      <DropdownMenuItem key={t} onClick={() => setFilterTier(t)}>{t}</DropdownMenuItem>
                                                  ))}
                                              </DropdownMenuContent>
                                          </DropdownMenu>
                                      </div>

                                      {/* Spend Filter (Mock) */}
                                      <div className="space-y-1.5">
                                          <label className="text-xs font-semibold text-slate-500 uppercase">Total Spend</label>
                                          <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                  <Button variant="outline" className="w-full justify-between bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                                                      <span className="flex items-center gap-2">
                                                          <CreditCard className="w-4 h-4 text-slate-400" />
                                                          {filterSpend ? `> $${filterSpend}` : "Any Amount"}
                                                      </span>
                                                      <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                                  </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent className="w-56">
                                                  <DropdownMenuItem onClick={() => setFilterSpend(null)}>Any Amount</DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setFilterSpend(500)}>&gt; $500</DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setFilterSpend(1000)}>&gt; $1,000</DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setFilterSpend(5000)}>&gt; $5,000</DropdownMenuItem>
                                              </DropdownMenuContent>
                                          </DropdownMenu>
                                      </div>

                                      {/* Location Filter */}
                                      <div className="space-y-1.5">
                                          <label className="text-xs font-semibold text-slate-500 uppercase">Location</label>
                                          <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                  <Button variant="outline" className="w-full justify-between bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                                                      <span className="flex items-center gap-2">
                                                          <MapPin className="w-4 h-4 text-slate-400" />
                                                          {filterLocation || "All Locations"}
                                                      </span>
                                                      <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                                  </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent className="w-56">
                                                  <DropdownMenuItem onClick={() => setFilterLocation(null)}>All Locations</DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setFilterLocation('New York')}>New York</DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setFilterLocation('Los Angeles')}>Los Angeles</DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setFilterLocation('Chicago')}>Chicago</DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setFilterLocation('Houston')}>Houston</DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setFilterLocation('Miami')}>Miami</DropdownMenuItem>
                                              </DropdownMenuContent>
                                          </DropdownMenu>
                                      </div>

                                      {/* Last Service Date */}
                                      <div className="space-y-1.5">
                                          <label className="text-xs font-semibold text-slate-500 uppercase">Last Service</label>
                                          <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                  <Button variant="outline" className="w-full justify-between bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                                                      <span className="flex items-center gap-2">
                                                          <Calendar className="w-4 h-4 text-slate-400" />
                                                          {filterLastService ? `Last ${filterLastService} Days` : "Any Time"}
                                                      </span>
                                                      <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                                  </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent className="w-56">
                                                  <DropdownMenuItem onClick={() => setFilterLastService(null)}>Any Time</DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setFilterLastService(30)}>Last 30 Days</DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setFilterLastService(90)}>Last 90 Days</DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setFilterLastService(180)}>Last 6 Months</DropdownMenuItem>
                                              </DropdownMenuContent>
                                          </DropdownMenu>
                                      </div>
                                  </div>

                                  <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
                                      <div className="flex items-center gap-2">
                                          <div className="bg-slate-100 rounded px-2 py-1 text-xs font-medium text-slate-600">
                                              {filteredUsers.length} Users Matching
                                          </div>
                                      </div>
                                      <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                          Save Segment
                                      </Button>
                                  </div>
                              </CardContent>
                          </Card>

                          {/* Segment Visual */}
                          <Card className="border border-slate-200 shadow-sm bg-white">
                              <CardHeader>
                                  <CardTitle className="text-sm">Segment Distribution</CardTitle>
                              </CardHeader>
                              <CardContent className="flex flex-col items-center justify-center pt-0">
                                  <div className="h-[200px] w-full relative min-w-0" style={{ minHeight: '200px' }}>
                                      <ResponsiveContainer width="100%" height="100%">
                                          <PieChart>
                                              <Pie
                                                  data={[
                                                      { name: 'Selected', value: filteredUsers.length, fill: '#3b82f6' },
                                                      { name: 'Others', value: users.length - filteredUsers.length, fill: '#e2e8f0' }
                                                  ]}
                                                  innerRadius={60}
                                                  outerRadius={80}
                                                  paddingAngle={0}
                                                  dataKey="value"
                                                  startAngle={90}
                                                  endAngle={-270}
                                              >
                                                  <Cell fill="#3b82f6" />
                                                  <Cell fill="#f1f5f9" />
                                              </Pie>
                                          </PieChart>
                                      </ResponsiveContainer>
                                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                          <span className="text-3xl font-bold text-slate-900">{Math.round((filteredUsers.length / users.length) * 100)}%</span>
                                          <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">of Total</span>
                                      </div>
                                  </div>
                                  <div className="w-full space-y-2 mt-2">
                                      <div className="flex justify-between text-sm">
                                          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Selected</span>
                                          <span className="font-bold">{filteredUsers.length}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-200"></div> Total Base</span>
                                          <span className="font-bold text-slate-500">{users.length}</span>
                                      </div>
                                  </div>
                              </CardContent>
                          </Card>
                      </div>

                      <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
                          <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                             <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input 
                                  placeholder="Search within segment..." 
                                  className="pl-9 bg-white border-slate-200" 
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute right-1 top-1 h-7 w-7 text-slate-400 hover:text-slate-600"
                                    onClick={() => setSearchTerm('')}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                             </div>
                          </div>
                          <div className="overflow-x-auto">
                              <Table>
                                  <TableHeader>
                                      <TableRow className="bg-slate-50 border-b border-slate-200">
                                          <TableHead className="font-semibold text-slate-600">Customer</TableHead>
                                          <TableHead className="font-semibold text-slate-600">Status</TableHead>
                                          <TableHead className="font-semibold text-slate-600">Balance</TableHead>
                                          <TableHead className="font-semibold text-slate-600">Vehicles</TableHead>
                                          <TableHead className="font-semibold text-slate-600">Joined</TableHead>
                                          <TableHead className="text-right font-semibold text-slate-600">Action</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {filteredUsers.length === 0 ? (
                                          <TableRow>
                                              <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                                  No customers found matching your criteria.
                                              </TableCell>
                                          </TableRow>
                                      ) : (
                                          filteredUsers.map((user) => (
                                              <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                                              <TableCell className="p-4">
                                                  <div className="flex items-center gap-3">
                                                      <Avatar className="h-9 w-9 border border-slate-200 bg-white text-slate-500">
                                                          <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name}`} />
                                                          <AvatarFallback>{user.initials}</AvatarFallback>
                                                      </Avatar>
                                                      <div>
                                                          <p className="font-medium text-slate-900 text-sm">{user.name}</p>
                                                          <p className="text-xs text-slate-500">{user.email}</p>
                                                      </div>
                                                  </div>
                                              </TableCell>
                                              <TableCell>
                                                  <Badge variant="outline" className={`font-normal ${
                                                      user.tier === 'Legend' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                                      user.tier === 'Elite' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                      'bg-slate-50 text-slate-700 border-slate-200'
                                                  }`}>
                                                      {user.tier}
                                                  </Badge>
                                              </TableCell>
                                              <TableCell>
                                                  <span className="font-mono font-medium text-slate-700">{user.turboPointsBalance.toLocaleString()}</span>
                                              </TableCell>
                                              <TableCell>
                                                  <span className="text-sm text-slate-600">2 Vehicles</span>
                                              </TableCell>
                                              <TableCell>
                                                  <span className="text-sm text-slate-500">{new Date(user.joinedDate).toLocaleDateString()}</span>
                                              </TableCell>
                                              <TableCell className="text-right">
                                                  <Sheet>
                                                      <SheetTrigger asChild>
                                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600">
                                                              <ChevronRight className="w-4 h-4" />
                                                          </Button>
                                                      </SheetTrigger>
                                                      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                                                          <SheetHeader className="pb-6 border-b border-slate-100">
                                                              <div className="flex items-center gap-4 mb-4">
                                                                  <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                                                                      <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name}`} />
                                                                      <AvatarFallback>{user.initials}</AvatarFallback>
                                                                  </Avatar>
                                                                  <div>
                                                                      <SheetTitle className="text-xl">{user.name}</SheetTitle>
                                                                      <SheetDescription>{user.email}</SheetDescription>
                                                                  </div>
                                                              </div>
                                                              <div className="flex gap-4 text-sm text-slate-500">
                                                                  <div className="flex items-center gap-1"><Phone className="w-3 h-3"/> +1 (555) 123-4567</div>
                                                                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3"/> New York, USA</div>
                                                              </div>
                                                          </SheetHeader>
                                                          
                                                          <div className="py-6 space-y-6">
                                                              <div>
                                                                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Loyalty Status</h3>
                                                                  <Card className="bg-slate-50 border-slate-200 shadow-none">
                                                                      <CardContent className="p-4">
                                                                          <div className="flex justify-between items-center mb-2">
                                                                              <span className="text-sm font-medium">{user.tier} Member</span>
                                                                              <span className="text-xs text-slate-500">{user.turboPointsBalance} / 50,000 pts</span>
                                                                          </div>
                                                                          <Progress value={(user.turboPointsBalance / 50000) * 100} className="h-2" />
                                                                      </CardContent>
                                                                  </Card>
                                                              </div>

                                                              <div>
                                                                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Recent Interaction History</h3>
                                                                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                                                                      {[1,2,3].map((_, i) => (
                                                                          <div key={i} className="p-3 flex gap-3 text-sm">
                                                                              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                                                              <div>
                                                                                  <p className="font-medium text-slate-900">Completed Service: Oil Change</p>
                                                                                  <p className="text-slate-500 text-xs">Oct 24, 2023 • +150 pts</p>
                                                                              </div>
                                                                          </div>
                                                                      ))}
                                                                  </div>
                                                              </div>

                                                              <div>
                                                                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Social Media Engagement</h3>
                                                                  <div className="grid grid-cols-2 gap-4">
                                                                      <div className="p-3 bg-blue-50 rounded border border-blue-100">
                                                                          <p className="text-xs text-blue-600 mb-1">Facebook</p>
                                                                          <p className="font-semibold text-blue-900">2 Shares</p>
                                                                      </div>
                                                                      <div className="p-3 bg-pink-50 rounded border border-pink-100">
                                                                          <p className="text-xs text-pink-600 mb-1">Instagram</p>
                                                                          <p className="font-semibold text-pink-900">12 Likes</p>
                                                                      </div>
                                                                  </div>
                                                              </div>

                                                              <div className="pt-4 flex flex-col gap-3">
                                                                  <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white" onClick={() => navigate('/admin/customer-intelligence')}>
                                                                    <Brain className="w-4 h-4 mr-2" /> View Customer Intelligence
                                                                  </Button>
                                                                  <div className="flex gap-3">
                                                                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                                                                        <Zap className="w-4 h-4 mr-2" /> Award Bonus
                                                                    </Button>
                                                                    <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                                                        <Flag className="w-4 h-4 mr-2" /> Report
                                                                    </Button>
                                                                  </div>
                                                              </div>
                                                          </div>
                                                      </SheetContent>
                                                  </Sheet>
                                              </TableCell>
                                          </TableRow>
                                      )))}
                                  </TableBody>
                              </Table>
                          </div>
                      </Card>
                  </div>
              )}

              {/* --- LOYALTY & GAMIFICATION VIEW --- */}
              {activeView === 'loyalty' && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                      {/* Header Section */}
                      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-6 border-b border-slate-200">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-200">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Loyalty Program Management</h2>
                            </div>
                            <p className="text-slate-500 font-medium max-w-2xl text-lg">Manage tiers, configure rewards multipliers, and analyze member engagement performance.</p>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                              <div className="bg-slate-100/80 p-1.5 rounded-xl flex gap-1 shadow-inner">
                                  <Button 
                                    variant={loyaltyView === 'tiers' ? 'default' : 'ghost'}
                                    onClick={() => setLoyaltyView('tiers')}
                                    className={`rounded-lg px-6 font-bold transition-all ${loyaltyView === 'tiers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                  >
                                    <LayoutDashboard className="w-4 h-4 mr-2" /> Tiers
                                  </Button>
                                  <Button 
                                    variant={loyaltyView === 'analytics' ? 'default' : 'ghost'}
                                    onClick={() => setLoyaltyView('analytics')}
                                    className={`rounded-lg px-6 font-bold transition-all ${loyaltyView === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                  >
                                    <TrendingUp className="w-4 h-4 mr-2" /> Analytics
                                  </Button>
                              </div>
                              <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 px-6 font-bold rounded-xl" onClick={() => setCreateTierOpen(true)}>
                                  <Plus className="w-4 h-4 mr-2" /> Create New Tier
                              </Button>
                          </div>
                      </div>

                      {loyaltyView === 'tiers' ? (
                          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                              {/* Left: Tier Cards Grid */}
                              <div className="xl:col-span-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                  {tiers.map((tier) => {
                                      // Determine styles based on tier name
                                      const style = tier.name.toLowerCase().includes('bronze') 
                                          ? { bg: "bg-white", border: "border-orange-100", accent: "from-orange-400 to-orange-600", badge: "bg-orange-50 text-orange-700 border-orange-200", shadow: "shadow-orange-100", icon: "text-orange-500" }
                                          : tier.name.toLowerCase().includes('silver')
                                          ? { bg: "bg-white", border: "border-slate-200", accent: "from-slate-400 to-slate-600", badge: "bg-slate-50 text-slate-700 border-slate-200", shadow: "shadow-slate-100", icon: "text-slate-500" }
                                          : tier.name.toLowerCase().includes('gold')
                                          ? { bg: "bg-white", border: "border-yellow-100", accent: "from-yellow-400 to-amber-500", badge: "bg-yellow-50 text-yellow-700 border-yellow-200", shadow: "shadow-yellow-100", icon: "text-yellow-500" }
                                          : { bg: "bg-white", border: "border-cyan-100", accent: "from-cyan-400 to-blue-600", badge: "bg-cyan-50 text-cyan-700 border-cyan-200", shadow: "shadow-cyan-100", icon: "text-cyan-500" };
                                      
                                      return (
                                          <Card key={tier.id} className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${style.border} ${style.bg} ${style.shadow} group`}>
                                              {/* Top Gradient Border */}
                                              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${style.accent}`} />
                                              
                                              <CardContent className="p-6 flex flex-col h-full">
                                                  {/* Header */}
                                                  <div className="flex justify-between items-start mb-6">
                                                      <div>
                                                          <Badge variant="outline" className={`mb-3 font-bold uppercase tracking-wider px-3 py-1 ${style.badge}`}>
                                                              {tier.name}
                                                          </Badge>
                                                          <div className="flex items-baseline gap-1.5 relative group/edit">
                                                              <Input 
                                                                  type="number"
                                                                  defaultValue={tier.points}
                                                                  onChange={(e) => handleUpdateTier(tier.id, 'points', e.target.value)}
                                                                  className="text-3xl font-black text-slate-900 tracking-tight border-none bg-transparent p-0 h-auto w-32 focus-visible:ring-0 focus-visible:bg-slate-50/50 rounded shadow-none"
                                                              />
                                                              <span className="text-xs font-bold text-slate-400 uppercase">pts required</span>
                                                              <Edit className="w-3 h-3 text-slate-300 opacity-0 group-hover/edit:opacity-100 absolute -right-4 top-2 pointer-events-none" />
                                                          </div>
                                                      </div>
                                                      <div className={`p-3 rounded-full bg-slate-50 ${style.icon}`}>
                                                          <Trophy className="w-6 h-6" />
                                                      </div>
                                                  </div>

                                                  {/* Multipliers */}
                                                  <div className="grid grid-cols-2 gap-3 mb-6">
                                                      <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 group-hover:bg-slate-50 transition-colors relative group/edit">
                                                          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Multiplier</p>
                                                          <div className="flex items-center gap-1">
                                                              <Input 
                                                                  type="number"
                                                                  step="0.1"
                                                                  defaultValue={tier.multiplier}
                                                                  onChange={(e) => handleUpdateTier(tier.id, 'multiplier', e.target.value)}
                                                                  className="text-xl font-black text-slate-900 border-none bg-transparent p-0 h-auto w-16 focus-visible:ring-0 shadow-none"
                                                              />
                                                              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                          </div>
                                                      </div>
                                                      <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 group-hover:bg-slate-50 transition-colors">
                                                          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Bonus</p>
                                                          <p className="text-xl font-black text-slate-900 flex items-center gap-1">
                                                              +{Math.floor((tier.multiplier - 1) * 10)}%
                                                          </p>
                                                      </div>
                                                  </div>

                                                  {/* Benefits List */}
                                                  <div className="flex-1 space-y-3 mb-8">
                                                      <div className="flex justify-between items-center mb-2">
                                                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Benefits</p>
                                                          <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="h-6 px-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={() => handleAddBenefit(tier.id)}
                                                          >
                                                              <Plus className="w-3 h-3 mr-1" /> Add
                                                          </Button>
                                                      </div>
                                                      <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                                                          {tier.benefits.map((benefit, i) => (
                                                              <div key={i} className="flex items-center justify-between p-2 rounded-md bg-slate-50/50 hover:bg-slate-100 transition-colors group/item border border-transparent hover:border-slate-200">
                                                                  <div className="flex items-center gap-2">
                                                                    <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${style.icon}`} />
                                                                    <span className="text-sm font-medium text-slate-700 leading-tight">{benefit}</span>
                                                                  </div>
                                                                  <button 
                                                                    type="button"
                                                                    onClick={() => handleRemoveBenefit(tier.id, i)}
                                                                    className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-100"
                                                                    title="Remove Benefit"
                                                                  >
                                                                    <X className="w-3 h-3" />
                                                                  </button>
                                                              </div>
                                                          ))}
                                                          {tier.benefits.length === 0 && (
                                                              <div className="text-xs text-slate-400 italic p-2 text-center">No benefits configured</div>
                                                          )}
                                                      </div>
                                                  </div>

                                                  {/* Progress Visual */}
                                                  <div className="mb-6">
                                                      <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                                                          <span>Tier Population</span>
                                                          <span>{Math.floor(Math.random() * 40) + 10}%</span>
                                                      </div>
                                                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                          <div className={`h-full bg-gradient-to-r ${style.accent} w-[30%] rounded-full`} />
                                                      </div>
                                                  </div>

                                                  {/* Actions */}
                                                  <div className="flex gap-2 mt-auto">
                                                      <Button 
                                                        variant="outline" 
                                                        className="flex-1 font-bold border-2 hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700" 
                                                        onClick={() => { setSelectedTier(tier); setConfigureTierOpen(true); }}
                                                      >
                                                          Configure
                                                      </Button>
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="border-2 border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600"
                                                        onClick={() => toast.success(`Viewing members in ${tier.name}`)}
                                                      >
                                                          <Users className="w-4 h-4" />
                                                      </Button>
                                                  </div>
                                              </CardContent>
                                          </Card>
                                      );
                                  })}
                              </div>

                              {/* Bottom: Quick Config Rules */}
                              <div className="xl:col-span-4">
                                  <Card className="border-slate-200 shadow-sm bg-slate-50/50">
                                      <CardContent className="p-6 flex flex-col md:flex-row gap-8 items-center justify-between">
                                          <div className="flex items-center gap-4">
                                              <div className="p-3 bg-white rounded-full shadow-sm border border-slate-200 text-slate-500">
                                                  <Settings className="w-6 h-6" />
                                              </div>
                                              <div>
                                                  <h3 className="text-lg font-bold text-slate-900">Global Rules Configuration</h3>
                                                  <p className="text-slate-500 text-sm">Manage expiration, auto-downgrades, and point vesting periods.</p>
                                              </div>
                                          </div>
                                          <div className="flex gap-4">
                                              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                                                  <span className="text-sm font-semibold text-slate-700">Point Expiration:</span>
                                                  <span className="text-sm font-mono text-slate-500">{globalRules.pointExpiration} Days</span>
                                              </div>
                                              <Button className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm font-bold" onClick={() => setGlobalRulesOpen(true)}>
                                                  <Settings className="w-4 h-4 mr-2"/> Configure Rules
                                              </Button>
                                          </div>
                                      </CardContent>
                                  </Card>
                              </div>
                          

                          {/* --- MODALS --- */}
                          
                          {/* Create Tier Modal */}
                          <Dialog open={createTierOpen} onOpenChange={setCreateTierOpen}>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Create New Loyalty Tier</DialogTitle>
                                <DialogDescription>Define a new tier level for your members.</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Tier Name</Label>
                                  <Input placeholder="e.g. Diamond" value={newTierData.name} onChange={(e) => setNewTierData({...newTierData, name: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Required Points</Label>
                                    <Input type="number" value={newTierData.points} onChange={(e) => setNewTierData({...newTierData, points: Number(e.target.value)})} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Multiplier (x)</Label>
                                    <Input type="number" step="0.1" value={newTierData.multiplier} onChange={(e) => setNewTierData({...newTierData, multiplier: Number(e.target.value)})} />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Color Theme</Label>
                                  <div className="flex gap-2">
                                    {['bg-slate-500', 'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'].map(c => (
                                      <div 
                                        key={c} 
                                        className={`w-8 h-8 rounded-full cursor-pointer border-2 ${c} ${newTierData.color === c ? 'border-black' : 'border-transparent'}`}
                                        onClick={() => setNewTierData({...newTierData, color: c})}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setCreateTierOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateTier}>Create Tier</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {/* Global Rules Modal */}
                          <Dialog open={globalRulesOpen} onOpenChange={setGlobalRulesOpen}>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Global Rules Configuration</DialogTitle>
                                <DialogDescription>Set the logic for tier progression and point validity.</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <Label>Auto-Upgrade</Label>
                                    <p className="text-xs text-slate-500">Automatically promote users when points threshold is met</p>
                                  </div>
                                  <Switch checked={globalRules.autoUpgrade} onCheckedChange={(c) => setGlobalRules({...globalRules, autoUpgrade: c})} />
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <Label>Downgrade Logic</Label>
                                    <p className="text-xs text-slate-500">Demote users after 12 months of inactivity</p>
                                  </div>
                                  <Switch checked={globalRules.downgradeLogic} onCheckedChange={(c) => setGlobalRules({...globalRules, downgradeLogic: c})} />
                                </div>
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                  <Label>Point Expiration (Days)</Label>
                                  <Input type="number" value={globalRules.pointExpiration} onChange={(e) => setGlobalRules({...globalRules, pointExpiration: Number(e.target.value)})} />
                                  <p className="text-xs text-slate-500">Points older than this window will expire automatically.</p>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setGlobalRulesOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateGlobalRules}>Save Rules</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {/* Configure Tier Modal */}
                          <Dialog open={configureTierOpen} onOpenChange={setConfigureTierOpen}>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Configure {selectedTier?.name} Tier</DialogTitle>
                                <DialogDescription>Advanced settings and benefits management.</DialogDescription>
                              </DialogHeader>
                              {selectedTier && (
                                <div className="space-y-6 py-4">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                      <Label>Display Name</Label>
                                      <Input defaultValue={selectedTier.name} onChange={(e) => handleUpdateTier(selectedTier.id, 'name', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Points Threshold</Label>
                                      <Input type="number" defaultValue={selectedTier.points} onChange={(e) => handleUpdateTier(selectedTier.id, 'points', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Point Multiplier</Label>
                                      <Input type="number" step="0.1" defaultValue={selectedTier.multiplier} onChange={(e) => handleUpdateTier(selectedTier.id, 'multiplier', e.target.value)} />
                                    </div>
                                     <div className="space-y-2">
                                      <Label>Tier Color</Label>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full ${selectedTier.color}`}></div>
                                        <span className="text-xs text-slate-500">Color is set by theme</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-3">
                                      <Label>Benefits Included</Label>
                                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2 max-h-[200px] overflow-y-auto">
                                          {selectedTier.benefits.map((benefit: string, i: number) => (
                                              <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                                                  <span className="text-sm">{benefit}</span>
                                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveBenefit(selectedTier.id, i)} className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"><X className="w-4 h-4" /></Button>
                                              </div>
                                          ))}
                                          <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => handleAddBenefit(selectedTier.id)}>
                                              <Plus className="w-4 h-4 mr-2" /> Add New Benefit
                                          </Button>
                                      </div>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button onClick={() => setConfigureTierOpen(false)}>Close Configuration</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          </div>
                      ) : (
                          /* Analytics Tab Content */
                          <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                  {[
                                      { label: "Total Active Members", value: users.length * 12, change: "+12%", trend: "up", color: "blue" },
                                      { label: "Points Redeemed (MoM)", value: "854k", change: "+8.5%", trend: "up", color: "emerald" },
                                      { label: "Avg. Engagement Rate", value: "42%", change: "+2.1%", trend: "up", color: "indigo" },
                                      { label: "Retention Rate (6mo)", value: retentionRate, change: "-0.5%", trend: "down", color: "amber" },
                                  ].map((stat, i) => (
                                      <Card key={i} className="border-slate-200 shadow-sm bg-white">
                                          <CardContent className="p-6">
                                              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">{stat.label}</p>
                                              <div className="flex items-baseline justify-between">
                                                  <h3 className="text-2xl font-black text-slate-900">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</h3>
                                                  <Badge variant={stat.trend === 'up' ? 'default' : 'destructive'} className={stat.trend === 'up' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : 'bg-red-100 text-red-700 hover:bg-red-100 border-none'}>
                                                      {stat.change}
                                                  </Badge>
                                              </div>
                                          </CardContent>
                                      </Card>
                                  ))}
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                  {/* Tier Distribution Chart */}
                                  <Card className="border-slate-200 shadow-sm bg-white">
                                      <CardHeader>
                                          <CardTitle className="text-base font-bold">Tier Distribution</CardTitle>
                                          <CardDescription>Member breakdown by tier status</CardDescription>
                                      </CardHeader>
                                      <CardContent>
                                          <div className="h-[250px] w-full min-w-0 relative" style={{ minHeight: '250px' }}>
                                              <ResponsiveContainer width="99%" height="100%">
                                                  <PieChart>
                                                      <Pie
                                                          data={tierDistribution}
                                                          innerRadius={60}
                                                          outerRadius={80}
                                                          paddingAngle={5}
                                                          dataKey="value"
                                                      >
                                                          {tierDistribution.map((entry, index) => (
                                                              <Cell key={`cell-${index}`} fill={entry.fill} />
                                                          ))}
                                                      </Pie>
                                                      <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} itemStyle={{fontWeight: 'bold'}} />
                                                  </PieChart>
                                              </ResponsiveContainer>
                                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                                                  <span className="text-3xl font-black text-slate-900">{users.length}</span>
                                                  <span className="text-xs font-bold text-slate-400 uppercase">Members</span>
                                              </div>
                                          </div>
                                          <div className="flex flex-wrap gap-2 justify-center mt-2">
                                            {tierDistribution.map(t => (
                                                <div key={t.name} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: t.fill}} />
                                                    {t.name}
                                                </div>
                                            ))}
                                          </div>
                                      </CardContent>
                                  </Card>

                                  {/* Points Economy Chart */}
                                  <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white">
                                      <CardHeader>
                                          <CardTitle className="text-base font-bold">Points Economy</CardTitle>
                                          <CardDescription>Earned vs. Redeemed Points over time</CardDescription>
                                      </CardHeader>
                                      <CardContent>
                                          <div className="h-[250px] w-full min-w-0" style={{ minHeight: '250px' }}>
                                              <ResponsiveContainer width="99%" height="100%">
                                                  <AreaChart data={pointsTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                      <defs>
                                                          <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                                                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                          </linearGradient>
                                                          <linearGradient id="colorRedeemed" x1="0" y1="0" x2="0" y2="1">
                                                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                                                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                                          </linearGradient>
                                                      </defs>
                                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                      <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#94a3b8" dy={10} fontSize={12} />
                                                      <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" tickFormatter={(v) => `${v/1000}k`} fontSize={12} />
                                                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                      <Legend iconType="circle" />
                                                      <Area type="monotone" dataKey="earned" name="Points Earned" stroke="#3b82f6" fill="url(#colorEarned)" strokeWidth={3} />
                                                      <Area type="monotone" dataKey="redeemed" name="Points Redeemed" stroke="#f59e0b" fill="url(#colorRedeemed)" strokeWidth={3} />
                                                  </AreaChart>
                                              </ResponsiveContainer>
                                          </div>
                                      </CardContent>
                                  </Card>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Engagement Rate */}
                                  <Card className="border-slate-200 shadow-sm bg-white">
                                      <CardHeader>
                                          <CardTitle className="text-base font-bold">Engagement by Tier</CardTitle>
                                          <CardDescription>Average weekly app sessions</CardDescription>
                                      </CardHeader>
                                      <CardContent>
                                          <div className="h-[200px] w-full min-w-0" style={{ minHeight: '200px' }}>
                                              <ResponsiveContainer width="99%" height="100%">
                                                  <BarChart data={[
                                                      { name: 'Bronze', value: 2.4, fill: '#fdba74' },
                                                      { name: 'Silver', value: 4.1, fill: '#cbd5e1' },
                                                      { name: 'Gold', value: 6.8, fill: '#fcd34d' },
                                                      { name: 'Platinum', value: 9.2, fill: '#67e8f9' },
                                                  ]}>
                                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                      <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#94a3b8" fontSize={12} />
                                                      <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" fontSize={12} />
                                                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                      <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                                                  </BarChart>
                                              </ResponsiveContainer>
                                          </div>
                                      </CardContent>
                                  </Card>

                                  {/* Revenue Contribution */}
                                  <Card className="border-slate-200 shadow-sm bg-white">
                                      <CardHeader>
                                          <CardTitle className="text-base font-bold">Revenue Contribution</CardTitle>
                                          <CardDescription>Average annual spend per member</CardDescription>
                                      </CardHeader>
                                      <CardContent>
                                          <div className="h-[200px] w-full min-w-0" style={{ minHeight: '200px' }}>
                                              <ResponsiveContainer width="99%" height="100%">
                                                  <BarChart layout="vertical" data={[
                                                      { name: 'Bronze', value: 450, fill: '#fdba74' },
                                                      { name: 'Silver', value: 1200, fill: '#cbd5e1' },
                                                      { name: 'Gold', value: 3500, fill: '#fcd34d' },
                                                      { name: 'Platinum', value: 8200, fill: '#67e8f9' },
                                                  ]} margin={{left: 20}}>
                                                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                                      <XAxis type="number" hide />
                                                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} width={60} />
                                                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value) => `$${value}`} />
                                                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} background={{ fill: '#f1f5f9' }} />
                                                  </BarChart>
                                              </ResponsiveContainer>
                                          </div>
                                      </CardContent>
                                  </Card>
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {/* --- ROI & BUSINESS INSIGHTS --- */}
              {activeView === 'roi' && (
                  <div className="space-y-6">
                      <div>
                          <h2 className="text-2xl font-bold text-slate-900">ROI & Business Insights</h2>
                          <p className="text-slate-500">Revenue, Profitability & Growth Trends</p>
                      </div>

                      {/* Main ROI Chart */}
                      <Card className="border border-slate-200 shadow-sm bg-white">
                          <CardHeader>
                              <CardTitle>Program Profitability Analysis</CardTitle>
                              <CardDescription>Revenue vs. Cost vs. Net Profit</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <div className="h-[400px] w-full min-w-0" style={{ minHeight: '400px' }}>
                                  <ResponsiveContainer width="99%" height="100%">
                                      <AreaChart data={roiData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                          <defs>
                                              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                              </linearGradient>
                                          </defs>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                          <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#64748b" dy={10} />
                                          <YAxis axisLine={false} tickLine={false} stroke="#64748b" tickFormatter={(v) => `$${v/1000}k`} />
                                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                          <Legend />
                                          <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#3b82f6" fill="transparent" strokeWidth={2} />
                                          <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" fill="url(#colorProfit)" strokeWidth={2} />
                                          <Area type="monotone" dataKey="cost" name="Program Cost" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                                      </AreaChart>
                                  </ResponsiveContainer>
                              </div>
                          </CardContent>
                      </Card>

                      {/* Insight Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Card className="border border-slate-200 shadow-sm bg-white">
                              <CardHeader className="pb-2">
                                  <CardTitle className="text-lg">Customer Lifetime Value</CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <div className="flex items-baseline gap-2">
                                      <h3 className="text-3xl font-bold text-slate-900">$4,500</h3>
                                      <span className="text-green-600 text-sm font-medium">+12%</span>
                                  </div>
                                  <p className="text-sm text-slate-500 mt-1">Avg. value per active member</p>
                                  <div className="mt-4 h-1 bg-slate-100 rounded overflow-hidden">
                                      <div className="h-full bg-blue-500 w-[70%]"></div>
                                  </div>
                              </CardContent>
                          </Card>
                          
                          <Card className="border border-slate-200 shadow-sm bg-white">
                              <CardHeader className="pb-2">
                                  <CardTitle className="text-lg">Repeat Purchase Rate</CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <div className="flex items-baseline gap-2">
                                      <h3 className="text-3xl font-bold text-slate-900">78%</h3>
                                      <span className="text-green-600 text-sm font-medium">+4.2%</span>
                                  </div>
                                  <p className="text-sm text-slate-500 mt-1">Customers returning within 90 days</p>
                                  <div className="mt-4 h-1 bg-slate-100 rounded overflow-hidden">
                                      <div className="h-full bg-indigo-500 w-[78%]"></div>
                                  </div>
                              </CardContent>
                          </Card>

                          <Card className="border border-slate-200 shadow-sm bg-white">
                              <CardHeader className="pb-2">
                                  <CardTitle className="text-lg">Retention Growth</CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <div className="flex items-baseline gap-2">
                                      <h3 className="text-3xl font-bold text-slate-900">+2.1%</h3>
                                      <span className="text-green-600 text-sm font-medium">MoM</span>
                                  </div>
                                  <p className="text-sm text-slate-500 mt-1">Reduction in churn rate</p>
                                  <div className="mt-4 h-1 bg-slate-100 rounded overflow-hidden">
                                      <div className="h-full bg-emerald-500 w-[65%]"></div>
                                  </div>
                              </CardContent>
                          </Card>
                      </div>
                  </div>
              )}



              {/* --- GAMES VIEW --- */}
              {activeView === 'games' && (
                  <div className="space-y-6">
                      <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-2xl font-bold text-slate-900">Game & Feature Flags</h2>
                            <p className="text-slate-500">Enable or disable gamification features globally</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {gameSettings.map((game) => (
                              <Card key={game.id} className={`shadow-sm transition-all ${game.enabled ? 'border-green-200 bg-green-50/20' : 'border-slate-200 bg-white opacity-75'}`}>
                                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                                      <div className="space-y-1">
                                          <CardTitle className="text-lg font-bold text-slate-900">{game.name}</CardTitle>
                                          <CardDescription>{game.description}</CardDescription>
                                      </div>
                                      <Switch 
                                          checked={game.enabled} 
                                          onCheckedChange={(c) => handleToggleGame(game.id, c)} 
                                      />
                                  </CardHeader>
                                  <CardContent>
                                      <div className="mt-2">
                                          <Badge variant={game.enabled ? "default" : "outline"} className={game.enabled ? "bg-green-600 hover:bg-green-700 border-none" : "text-slate-500"}>
                                              {game.enabled ? "Active" : "Disabled"}
                                          </Badge>
                                      </div>
                                  </CardContent>
                              </Card>
                          ))}
                      </div>
                  </div>
              )}

              {/* --- ADMIN VIEW --- */}
              {activeView === 'admin' && (
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin & Role Management</h1>
                        <p className="text-slate-500 mt-1">Manage system access, permissions, and security settings</p>
                    </div>

                    {/* Roles & Permissions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Role List */}
                        <Card className="border-slate-200 shadow-sm bg-white">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">System Roles</CardTitle>
                                    <Button size="sm" variant="outline" onClick={() => toast.success("Role creation modal opened")}><Plus className="w-4 h-4 mr-2"/> Add Role</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {['Super Admin', 'Marketing Manager', 'Support Agent', 'Store Manager'].map((role, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${i===0 ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                                                    <UserCog className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{role}</p>
                                                    <p className="text-xs text-slate-500">{i === 0 ? 'Full Access' : i === 1 ? 'Campaigns & Analytics' : 'User Management'}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity"><Edit className="w-4 h-4 text-slate-400"/></Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Permission Matrix */}
                        <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white">
                            <CardHeader>
                                 <CardTitle className="text-lg">Permission Matrix: Marketing Manager</CardTitle>
                                 <CardDescription>Configure access levels for this role</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Feature Module</TableHead>
                                            <TableHead className="text-center">View</TableHead>
                                            <TableHead className="text-center">Edit</TableHead>
                                            <TableHead className="text-center">Delete</TableHead>
                                            <TableHead className="text-center">Export</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[
                                            { name: 'Customer Data', view: true, edit: false, delete: false, export: true },
                                            { name: 'Campaigns', view: true, edit: true, delete: true, export: true },
                                            { name: 'Loyalty Rewards', view: true, edit: true, delete: false, export: false },
                                            { name: 'Financial Reports', view: true, edit: false, delete: false, export: false },
                                            { name: 'System Settings', view: false, edit: false, delete: false, export: false },
                                        ].map((perm, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium text-slate-700">{perm.name}</TableCell>
                                                <TableCell className="text-center"><Switch checked={perm.view} /></TableCell>
                                                <TableCell className="text-center"><Switch checked={perm.edit} /></TableCell>
                                                <TableCell className="text-center"><Switch checked={perm.delete} /></TableCell>
                                                <TableCell className="text-center"><Switch checked={perm.export} /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Security & Audit */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Fraud Alerts */}
                        <Card className="border-red-100 shadow-sm bg-red-50/30">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                     <AlertTriangle className="w-5 h-5 text-red-600" />
                                     <CardTitle className="text-red-900">Security & Fraud Alerts</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 {[
                                     { msg: "Suspicious login attempt from new IP (Russia)", time: "10 mins ago", severity: "High" },
                                     { msg: "Bulk point redemption detected (User #8821)", time: "1 hour ago", severity: "Medium" },
                                     { msg: "Failed login threshold exceeded (Admin Portal)", time: "3 hours ago", severity: "Low" },
                                 ].map((alert, i) => (
                                     <div key={i} className="bg-white p-3 rounded border border-red-100 flex items-start gap-3">
                                         <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0"></div>
                                         <div>
                                             <p className="text-sm font-medium text-slate-900">{alert.msg}</p>
                                             <p className="text-xs text-slate-500 mt-1">{alert.time} • Severity: {alert.severity}</p>
                                         </div>
                                     </div>
                                 ))}
                            </CardContent>
                        </Card>

                        {/* Audit Logs */}
                        <Card className="border-slate-200 shadow-sm bg-white">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                     <FileText className="w-5 h-5 text-slate-500" />
                                     <CardTitle>Audit Logs</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                                    {[
                                        { user: "Sarah J. (Admin)", action: "Changed Global Point Value", time: "Today, 10:42 AM" },
                                        { user: "Mike T. (Support)", action: "Refunded Transaction #9921", time: "Today, 09:15 AM" },
                                        { user: "System", action: "Automated Backup Completed", time: "Today, 04:00 AM" },
                                        { user: "Sarah J. (Admin)", action: "Added New User Role 'Store Manager'", time: "Yesterday, 02:30 PM" },
                                        { user: "David L. (Marketing)", action: "Published 'Summer Sale' Campaign", time: "Yesterday, 11:00 AM" },
                                    ].map((log, i) => (
                                        <div key={i} className="flex gap-3 text-sm border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                                            <div className="text-slate-400 font-mono text-xs w-24 flex-shrink-0">{log.time.split(',')[1]}</div>
                                            <div>
                                                <p className="text-slate-900 font-medium">{log.action}</p>
                                                <p className="text-slate-500 text-xs">by {log.user}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
              )}

              {/* --- INTEGRATIONS VIEW --- */}
              {activeView === 'integrations' && (
                  <div className="space-y-6">
                      <div>
                          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Omnichannel Integrations</h1>
                          <p className="text-slate-500 mt-1">Manage connections across all your customer touchpoints</p>
                      </div>

                      {/* Integration Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[
                              { name: 'Official Website', type: 'Web', status: 'connected', sync: '2 mins ago', icon: Globe, color: 'text-blue-600 bg-blue-100' },
                              { name: 'Pitstop+ Mobile App', type: 'Mobile', status: 'connected', sync: 'Just now', icon: Smartphone, color: 'text-purple-600 bg-purple-100' },
                              { name: 'POS System (Square)', type: 'In-Store', status: 'error', sync: 'Failed 2h ago', icon: Store, color: 'text-orange-600 bg-orange-100' },
                              { name: 'Email Marketing', type: 'Messaging', status: 'connected', sync: '1 hour ago', icon: Mail, color: 'text-emerald-600 bg-emerald-100' },
                              { name: 'SMS Gateway', type: 'Messaging', status: 'connected', sync: '1 hour ago', icon: MessageSquare, color: 'text-indigo-600 bg-indigo-100' },
                              { name: 'Social Media', type: 'Social', status: 'warning', sync: 'Token exp. soon', icon: Share2, color: 'text-pink-600 bg-pink-100' },
                          ].map((integration, i) => (
                              <Card key={i} className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
                                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                                      <div className={`p-3 rounded-xl ${integration.color}`}>
                                          <integration.icon className="w-6 h-6" />
                                      </div>
                                      <Badge variant={integration.status === 'connected' ? 'default' : 'secondary'} 
                                             className={`${integration.status === 'connected' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                                                          integration.status === 'error' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 
                                                          'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'} border-none`}>
                                          {integration.status === 'connected' ? 'Active' : integration.status === 'error' ? 'Error' : 'Warning'}
                                      </Badge>
                                  </CardHeader>
                                  <CardContent>
                                      <h3 className="font-bold text-slate-900 text-lg">{integration.name}</h3>
                                      <p className="text-sm text-slate-500 mb-4">{integration.type} Integration</p>
                                      
                                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                                          <RefreshCw className="w-3 h-3" />
                                          <span>Last sync: {integration.sync}</span>
                                      </div>

                                      <div className="flex gap-2">
                                          <Button variant="outline" size="sm" className="w-full">Configure</Button>
                                          <Button variant="ghost" size="sm" className="px-2"><MoreHorizontal className="w-4 h-4 text-slate-400" /></Button>
                                      </div>
                                  </CardContent>
                              </Card>
                          ))}
                      </div>

                      {/* API & Sync Logs */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* API Config */}
                          <Card className="lg:col-span-1 border-slate-200 shadow-sm bg-white">
                               <CardHeader>
                                   <div className="flex items-center gap-2">
                                       <Code className="w-5 h-5 text-slate-500" />
                                       <CardTitle>API Configuration</CardTitle>
                                   </div>
                               </CardHeader>
                               <CardContent className="space-y-4">
                                   <div className="space-y-2">
                                       <label className="text-sm font-medium text-slate-700">Public Key</label>
                                       <div className="flex gap-2">
                                           <Input readOnly value="pk_live_51Mz..." className="bg-slate-50 font-mono text-xs" />
                                           <Button variant="outline" size="icon"><Copy className="w-4 h-4" /></Button>
                                       </div>
                                   </div>
                                   <div className="space-y-2">
                                       <label className="text-sm font-medium text-slate-700">Secret Key</label>
                                       <div className="flex gap-2">
                                           <Input type="password" readOnly value="sk_live_Wait..." className="bg-slate-50 font-mono text-xs" />
                                           <Button variant="outline" size="icon"><Eye className="w-4 h-4" /></Button>
                                       </div>
                                   </div>
                                   <div className="space-y-2">
                                       <label className="text-sm font-medium text-slate-700">Webhook URL</label>
                                       <Input placeholder="https://your-domain.com/hooks" className="bg-white" />
                                   </div>
                                   <Button className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white">
                                       <Webhook className="w-4 h-4 mr-2" /> Update Webhooks
                                   </Button>
                               </CardContent>
                          </Card>

                          {/* Sync Activity Log */}
                          <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white">
                               <CardHeader className="flex flex-row items-center justify-between">
                                   <div className="flex items-center gap-2">
                                       <Activity className="w-5 h-5 text-slate-500" />
                                       <CardTitle>Data Sync Activity Log</CardTitle>
                                   </div>
                                   <Button variant="ghost" size="sm" className="text-slate-500">View All</Button>
                               </CardHeader>
                               <CardContent>
                                   <div className="relative overflow-x-auto">
                                       <table className="w-full text-sm text-left">
                                           <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                               <tr>
                                                   <th className="px-4 py-3">Status</th>
                                                   <th className="px-4 py-3">Source</th>
                                                   <th className="px-4 py-3">Event</th>
                                                   <th className="px-4 py-3">Time</th>
                                                   <th className="px-4 py-3 text-right">Latency</th>
                                               </tr>
                                           </thead>
                                           <tbody className="divide-y divide-slate-100">
                                               {[
                                                   { status: 'success', source: 'Mobile App', event: 'User Profile Update', time: 'Just now', latency: '45ms' },
                                                   { status: 'success', source: 'Website', event: 'New Order #8821', time: '2 mins ago', latency: '120ms' },
                                                   { status: 'failed', source: 'POS System', event: 'Inventory Sync', time: '2 hours ago', latency: 'Timeout' },
                                                   { status: 'success', source: 'Email', event: 'Campaign Sent', time: '3 hours ago', latency: '80ms' },
                                                   { status: 'success', source: 'Social', event: 'Post Published', time: '5 hours ago', latency: '210ms' },
                                               ].map((log, i) => (
                                                   <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                       <td className="px-4 py-3">
                                                           {log.status === 'success' ? 
                                                               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Success</span> : 
                                                               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Failed</span>
                                                           }
                                                       </td>
                                                       <td className="px-4 py-3 font-medium text-slate-900">{log.source}</td>
                                                       <td className="px-4 py-3 text-slate-600">{log.event}</td>
                                                       <td className="px-4 py-3 text-slate-500">{log.time}</td>
                                                       <td className="px-4 py-3 text-right font-mono text-xs text-slate-400">{log.latency}</td>
                                                   </tr>
                                               ))}
                                           </tbody>
                                       </table>
                                   </div>
                               </CardContent>
                          </Card>
                      </div>
                  </div>
              )}

              {/* --- AI INSIGHTS VIEW --- */}
              {activeView === 'ai' && (
                  <div className="flex gap-6 animate-in fade-in duration-500">
                      {/* Left Column: Analytics & Recommendations (66%) */}
                      <div className="flex-1 space-y-6">
                          {/* Header */}
                          <div className="flex justify-between items-end">
                              <div>
                                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                      <Brain className="w-8 h-8 text-violet-600" />
                                      AI CRM Assistant
                                      <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 ml-2">Enterprise</Badge>
                                  </h1>
                                  <p className="text-slate-500 mt-1">Intelligent decision support & predictive analytics</p>
                              </div>
                              <Button variant="outline" className="gap-2">
                                  <Download className="w-4 h-4" /> Export Report
                              </Button>
                          </div>

                          {/* 1. AI Executive Summary Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-100 shadow-sm hover:shadow-md transition-all">
                                  <CardContent className="p-4 flex flex-col justify-between h-full">
                                      <div className="flex justify-between items-start">
                                          <div className="bg-white p-2 rounded-lg border border-violet-100 shadow-sm">
                                              <TrendingUp className="w-5 h-5 text-violet-600" />
                                          </div>
                                          <Badge className="bg-red-100 text-red-700 hover:bg-red-200">+8% Risk</Badge>
                                      </div>
                                      <div className="mt-4">
                                          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Churn Risk Forecast</p>
                                          <h3 className="text-2xl font-bold text-slate-900 mt-1">High Alert</h3>
                                          <p className="text-xs text-slate-400 mt-1">Compared to last week</p>
                                      </div>
                                  </CardContent>
                              </Card>
                              
                              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm hover:shadow-md transition-all">
                                  <CardContent className="p-4 flex flex-col justify-between h-full">
                                      <div className="flex justify-between items-start">
                                          <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-sm">
                                              <DollarSign className="w-5 h-5 text-blue-600" />
                                          </div>
                                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200">+12% YoY</Badge>
                                      </div>
                                      <div className="mt-4">
                                          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Revenue Prediction</p>
                                          <h3 className="text-2xl font-bold text-slate-900 mt-1">$482.5k</h3>
                                          <p className="text-xs text-slate-400 mt-1">Next 30 days forecast</p>
                                      </div>
                                  </CardContent>
                              </Card>

                              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                                  <CardContent className="p-4 flex flex-col justify-between h-full">
                                      <div className="flex justify-between items-start">
                                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 shadow-sm">
                                              <Activity className="w-5 h-5 text-slate-600" />
                                          </div>
                                          <Badge variant="outline" className="text-slate-600">Stable</Badge>
                                      </div>
                                      <div className="mt-4">
                                          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Loyalty Engagement</p>
                                          <h3 className="text-2xl font-bold text-slate-900 mt-1">78/100</h3>
                                          <p className="text-xs text-slate-400 mt-1">AI Score (Top 20%)</p>
                                      </div>
                                  </CardContent>
                              </Card>

                              <Card className="bg-red-50 border-red-100 shadow-sm hover:shadow-md transition-all">
                                  <CardContent className="p-4 flex flex-col justify-between h-full">
                                      <div className="flex justify-between items-start">
                                          <div className="bg-white p-2 rounded-lg border border-red-100 shadow-sm">
                                              <AlertTriangle className="w-5 h-5 text-red-600" />
                                          </div>
                                          <Badge className="bg-red-200 text-red-800 animate-pulse">Action Req</Badge>
                                      </div>
                                      <div className="mt-4">
                                          <p className="text-red-600 text-xs font-medium uppercase tracking-wide">Critical Alerts</p>
                                          <h3 className="text-2xl font-bold text-slate-900 mt-1">12 Users</h3>
                                          <p className="text-xs text-red-400 mt-1">High value at risk</p>
                                      </div>
                                  </CardContent>
                              </Card>
                          </div>

                          {/* 2. Predictive Analytics Charts */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <Card className="border-slate-200 shadow-sm bg-white">
                                  <CardHeader className="pb-2">
                                      <CardTitle className="text-base flex items-center gap-2">
                                          <TrendingUp className="w-4 h-4 text-slate-500" />
                                          Retention vs Churn Prediction
                                      </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="h-[200px] w-full min-w-0" style={{ minHeight: '200px' }}>
                                           <ResponsiveContainer width="99%" height="100%">
                                              <AreaChart data={[
                                                  { month: 'Jan', retention: 85, churn: 15 },
                                                  { month: 'Feb', retention: 82, churn: 18 },
                                                  { month: 'Mar', retention: 80, churn: 20 },
                                                  { month: 'Apr', retention: 75, churn: 25 }, // Predicted
                                                  { month: 'May', retention: 72, churn: 28 }, // Predicted
                                              ]}>
                                                  <defs>
                                                      <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                                                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                                      </linearGradient>
                                                      <linearGradient id="colorRet" x1="0" y1="0" x2="0" y2="1">
                                                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                      </linearGradient>
                                                  </defs>
                                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                                  <Tooltip />
                                                  <Area type="monotone" dataKey="churn" stroke="#ef4444" fill="url(#colorChurn)" strokeWidth={2} name="Churn Risk %" />
                                                  <Area type="monotone" dataKey="retention" stroke="#10b981" fill="url(#colorRet)" strokeWidth={2} name="Retention %" />
                                              </AreaChart>
                                          </ResponsiveContainer>
                                      </div>
                                  </CardContent>
                              </Card>

                              <Card className="border-slate-200 shadow-sm bg-white">
                                  <CardHeader className="pb-2">
                                      <CardTitle className="text-base flex items-center gap-2">
                                          <Target className="w-4 h-4 text-slate-500" />
                                          Tier Upgrade Probability
                                      </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="space-y-4">
                                          {[
                                              { tier: 'Silver to Gold', prob: 78, count: 142 },
                                              { tier: 'Gold to Platinum', prob: 45, count: 38 },
                                              { tier: 'Bronze to Silver', prob: 62, count: 890 },
                                          ].map((item, i) => (
                                              <div key={i} className="space-y-1">
                                                  <div className="flex justify-between text-sm">
                                                      <span className="font-medium text-slate-700">{item.tier}</span>
                                                      <span className="text-slate-500">{item.count} users</span>
                                                  </div>
                                                  <div className="flex items-center gap-3">
                                                      <Progress value={item.prob} className={`h-2 flex-1 ${i === 0 ? 'bg-amber-100' : 'bg-slate-100'}`} indicatorClassName={i===0 ? 'bg-amber-500' : 'bg-slate-600'} />
                                                      <span className="text-xs font-bold text-slate-700 w-8">{item.prob}%</span>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </CardContent>
                              </Card>
                          </div>

                          {/* 3. Smart Recommendations Engine */}
                          <div className="space-y-4">
                              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                                  AI Suggested Actions
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <Card className="bg-white border-l-4 border-l-violet-500 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                      <CardContent className="p-4">
                                          <Badge className="bg-violet-100 text-violet-700 mb-2">Campaign</Badge>
                                          <h4 className="font-bold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">Launch "Win-Back"</h4>
                                          <p className="text-xs text-slate-500 mb-3">Target 142 inactive Gold members.</p>
                                          <Button size="sm" variant="outline" className="w-full text-xs h-8">Preview Campaign</Button>
                                      </CardContent>
                                  </Card>
                                  
                                  <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                      <CardContent className="p-4">
                                          <Badge className="bg-blue-100 text-blue-700 mb-2">Upsell</Badge>
                                          <h4 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">Winter Tire Promo</h4>
                                          <p className="text-xs text-slate-500 mb-3">Predicted 24% conversion for SUV owners.</p>
                                          <Button size="sm" variant="outline" className="w-full text-xs h-8">View Segment</Button>
                                      </CardContent>
                                  </Card>

                                  <Card className="bg-white border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                      <CardContent className="p-4">
                                          <Badge className="bg-green-100 text-green-700 mb-2">Reward</Badge>
                                          <h4 className="font-bold text-slate-900 mb-1 group-hover:text-green-600 transition-colors">2x Points Multiplier</h4>
                                          <p className="text-xs text-slate-500 mb-3">Boost engagement on Tuesdays.</p>
                                          <Button size="sm" variant="outline" className="w-full text-xs h-8">Apply Rule</Button>
                                      </CardContent>
                                  </Card>
                              </div>
                          </div>

                          {/* 4. AI Customer Insights Panel */}
                          <Card className="border-slate-200 shadow-sm bg-white">
                              <CardHeader className="pb-2 border-b border-slate-50">
                                  <div className="flex justify-between items-center">
                                      <CardTitle className="text-base">High-Risk Customer Focus</CardTitle>
                                      <Button variant="ghost" size="sm" className="text-xs text-slate-500">View All</Button>
                                  </div>
                              </CardHeader>
                              <CardContent className="p-0">
                                  <div className="divide-y divide-slate-50">
                                      {[
                                          { name: "Robert Fox", car: "BMW X5", risk: 92, sentiment: "Negative", spend: "$4,200", last: "45 days ago" },
                                          { name: "Esther Howard", car: "Audi Q7", risk: 88, sentiment: "Neutral", spend: "$3,150", last: "60 days ago" },
                                          { name: "Jenny Wilson", car: "Mercedes GLE", risk: 75, sentiment: "Positive", spend: "$8,900", last: "12 days ago" },
                                      ].map((customer, i) => (
                                          <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                              <div className="flex items-center gap-3">
                                                  <Avatar className="h-10 w-10 bg-slate-100 border border-slate-200">
                                                      <AvatarFallback className="text-slate-600 font-bold">{customer.name.charAt(0)}</AvatarFallback>
                                                  </Avatar>
                                                  <div>
                                                      <h5 className="text-sm font-bold text-slate-900">{customer.name}</h5>
                                                      <p className="text-xs text-slate-500">{customer.car} • Last seen {customer.last}</p>
                                                  </div>
                                              </div>
                                              <div className="flex items-center gap-6">
                                                  <div className="text-right">
                                                      <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">LTV</p>
                                                      <p className="text-sm font-mono font-bold text-slate-900">{customer.spend}</p>
                                                  </div>
                                                  <div className="text-right w-24">
                                                      <div className="flex justify-between items-center mb-1">
                                                          <span className="text-xs text-slate-500">Churn Risk</span>
                                                          <span className={`text-xs font-bold ${customer.risk > 80 ? 'text-red-600' : 'text-amber-600'}`}>{customer.risk}%</span>
                                                      </div>
                                                      <Progress value={customer.risk} className={`h-1.5 ${customer.risk > 80 ? 'bg-red-100' : 'bg-amber-100'}`} indicatorClassName={customer.risk > 80 ? 'bg-red-500' : 'bg-amber-500'} />
                                                  </div>
                                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400"><MoreHorizontal className="w-4 h-4" /></Button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </CardContent>
                          </Card>
                      </div>

                      {/* Right Column: Conversational AI (33%) */}
                      <div className="w-full lg:w-[380px] flex-shrink-0 flex flex-col h-[calc(100vh-140px)] sticky top-6">
                          <Card className="flex-1 flex flex-col border-violet-200 shadow-lg bg-white overflow-hidden relative">
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500" />
                              <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/50">
                                  <div className="flex items-center gap-2">
                                      <div className="p-2 bg-violet-600 rounded-lg shadow-sm shadow-violet-200">
                                          <Bot className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                          <CardTitle className="text-base">CRM Assistant</CardTitle>
                                          <CardDescription className="text-xs flex items-center gap-1">
                                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                              Online • GPT-4 Turbo
                                          </CardDescription>
                                      </div>
                                  </div>
                              </CardHeader>
                              <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30">
                                  {chatMessages.map((msg, i) => (
                                      <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                          {msg.role === 'assistant' ? (
                                              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 border border-violet-200">
                                                  <Sparkles className="w-4 h-4 text-violet-600" />
                                              </div>
                                          ) : (
                                              <Avatar className="w-8 h-8 border border-slate-200">
                                                  <AvatarImage src="https://github.com/shadcn.png" />
                                                  <AvatarFallback>AD</AvatarFallback>
                                              </Avatar>
                                          )}
                                          
                                          <div className={`${msg.role === 'assistant' ? 'bg-white border-slate-200 rounded-tl-none text-slate-700' : 'bg-violet-600 text-white rounded-tr-none'} border rounded-2xl p-3 shadow-sm text-sm max-w-[85%]`}>
                                              <p dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                                              
                                              {/* Optional Action Button for Assistant */}
                                              {msg.action && (
                                                  <div className="mt-2 pt-2 border-t border-slate-100">
                                                      <p className="text-xs text-slate-500 font-medium mb-1">Recommended Action:</p>
                                                      <Button variant="outline" size="sm" className="w-full text-xs justify-start bg-slate-50 hover:bg-white border-slate-200 text-violet-700 h-auto py-2">
                                                          <Zap className="w-3 h-3 mr-2 text-violet-500" /> {msg.action}
                                                      </Button>
                                                  </div>
                                              )}

                                              {/* Optional Stats for Assistant */}
                                              {msg.stats && (
                                                  <div className="mt-3 grid grid-cols-2 gap-2">
                                                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                                          <span className="text-xs text-slate-500 block">Avg Wait</span>
                                                          <span className="text-sm font-bold text-red-600">{msg.stats.wait}</span>
                                                      </div>
                                                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                                          <span className="text-xs text-slate-500 block">Sentiment</span>
                                                          <span className="text-sm font-bold text-red-600">{msg.stats.sentiment}</span>
                                                      </div>
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  ))}
                                  {isTyping && (
                                      <div className="flex gap-3">
                                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 border border-violet-200">
                                              <Sparkles className="w-4 h-4 text-violet-600" />
                                          </div>
                                          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm text-sm text-slate-500 max-w-[85%] flex items-center gap-1">
                                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                          </div>
                                      </div>
                                  )}
                                  <div ref={chatEndRef} />
                              </CardContent>
                              
                              <div className="p-3 border-t border-slate-100 bg-white">
                                  <div className="flex gap-2 mb-2 overflow-x-auto pb-1 no-scrollbar">
                                      {["Suggest strategy", "High value list", "Revenue forecast"].map((suggestion, i) => (
                                          <button key={i} onClick={() => setChatInput(suggestion)} className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700 border border-slate-200 hover:border-violet-200 transition-colors">
                                              {suggestion}
                                          </button>
                                      ))}
                                  </div>
                                  <div className="relative">
                                      <Input 
                                          placeholder="Ask AI about your data..." 
                                          className="pr-10 bg-slate-50 border-slate-200 focus-visible:ring-violet-500" 
                                          value={chatInput}
                                          onChange={(e) => setChatInput(e.target.value)}
                                          onKeyDown={handleKeyDown}
                                      />
                                      <Button 
                                          size="icon" 
                                          className="absolute right-1 top-1 h-7 w-7 bg-violet-600 hover:bg-violet-700 text-white rounded-md"
                                          onClick={handleSendMessage}
                                          disabled={!chatInput.trim() || isTyping}
                                      >
                                          <ArrowUpRight className="w-4 h-4" />
                                      </Button>
                                  </div>
                              </div>
                          </Card>
                      </div>
                  </div>
              )}

           </div>
        </main>
      </div>
      {/* Floating Action Button for Pitstop AI */}
      <div className="fixed bottom-24 right-6 z-50">
          <Button 
            className={`
                h-14 w-14 rounded-full shadow-2xl transition-all duration-300 ease-in-out border-4 border-white
                ${activeView === 'ai' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:scale-110 animate-bounce-subtle'}
            `}
            onClick={() => setActiveView(activeView === 'ai' ? 'overview' : 'ai')}
          >
              {activeView === 'ai' ? <X className="w-6 h-6 text-white" /> : <Bot className="w-8 h-8 text-white" />}
          </Button>
          {activeView !== 'ai' && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] text-white font-bold items-center justify-center">1</span>
              </span>
          )}
      </div>

    </div>
  );
}