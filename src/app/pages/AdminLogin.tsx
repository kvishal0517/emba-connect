import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate secure authentication
    setTimeout(() => {
      setLoading(false);
      if (email && password) {
        toast.success("Authentication Successful", {
          description: "Redirecting to secure dashboard...",
          icon: <ShieldCheck className="text-emerald-500" />
        });
        navigate('/admin/dashboard'); 
      } else {
        toast.error("Authentication Failed", {
          description: "Invalid credentials provided."
        });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0F172A]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1611494173983-f20777a1b837?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjBibHVlJTIwdGVjaG5vbG9neSUyMHNlY3VyaXR5JTIwZ2VvbWV0cmljfGVufDF8fHx8MTc3MTY1MzcxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
          alt="Security Background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#0F172A]/95 to-[#1E3A8A]/40 mix-blend-multiply"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px] px-4"
      >
        <div className="mb-8 text-center space-y-2">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20 mb-4 ring-4 ring-blue-600/20"
          >
            <ShieldCheck className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-slate-400 text-sm font-medium">Pitstop+ Loyalty CRM System</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/5 backdrop-blur-md ring-1 ring-white/10">
          <CardHeader className="space-y-1 pb-6 pt-8">
            <CardTitle className="text-xl font-semibold text-white text-center">Secure Login</CardTitle>
            <CardDescription className="text-slate-400 text-center text-sm">
              Enter your enterprise credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="admin@pitstop.plus" 
                    className="pl-10 h-11 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••••••" 
                    className="pl-10 pr-10 h-11 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] rounded-lg mt-2"
                disabled={loading}
              >
                {loading ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <span className="flex items-center justify-center">
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center pt-2 pb-6 border-t border-white/5 mx-6 mt-2">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-4">
              <Server className="w-3 h-3" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center">
          <Button 
            variant="link" 
            className="text-slate-500 hover:text-slate-300 text-xs font-normal transition-colors"
            onClick={() => navigate('/')}
          >
            &larr; Return to Customer Site
          </Button>
        </div>
      </motion.div>
    </div>
  );
}