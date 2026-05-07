import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Checkbox } from '@/app/components/ui/checkbox';
import { BookOpen, ShieldCheck, User, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (role: 'student' | 'admin' | 'professor') => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (email && password) {
        const names = { student: 'Alex', admin: 'Sarah', professor: 'Dr. Johnson' };
        toast.success(`Welcome back, ${names[role]}!`, {
            description: "You have successfully logged in."
        });
        
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userEmail', email);
        }
        
        if (role === 'student') {
          navigate('/student/dashboard');
        } else if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/professor/dashboard');
        }
      } else {
        toast.error("Invalid credentials", {
            description: "Please enter any email and password to demo."
        });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans">
      {/* Left Column: Image & Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-15 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-blue-800/90 to-slate-900/95"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-amber-400 p-3 rounded-xl shadow-lg">
              <BookOpen className="h-8 w-8 text-blue-900" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">EMBA Connect</h1>
          </div>
          <p className="text-blue-100 text-xl max-w-md leading-relaxed">
            The premier academic management platform for executive professionals.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <blockquote className="space-y-2">
            <p className="text-lg italic font-light text-blue-50">
              "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
            </p>
            <footer className="text-sm font-semibold text-amber-400">— Malcolm X</footer>
          </blockquote>
          <div className="flex gap-4 text-xs text-blue-200 uppercase tracking-widest font-medium">
            <span>Class of 2025</span>
            <span>•</span>
            <span>Global Cohort</span>
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo for mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-amber-400 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-900" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">EMBA Connect</h1>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome to EMBA Connect</h2>
            <p className="mt-2 text-slate-500">Sign in to access your academic portal.</p>
          </div>

          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-slate-100">
              <TabsTrigger value="student" className="text-sm font-medium data-[state=active]:bg-blue-900 data-[state=active]:text-white">
                Student
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-sm font-medium data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                Admin
              </TabsTrigger>
              <TabsTrigger value="professor" className="text-sm font-medium data-[state=active]:bg-blue-900 data-[state=active]:text-white">
                Professor
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="student">
              <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
                <CardHeader>
                  <CardTitle>Student Portal</CardTitle>
                  <CardDescription>Access your classes, assignments, and grades.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="email" 
                        placeholder="alex@emba.edu" 
                        className="pl-10" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin('student')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin('student')}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember-student" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <label
                      htmlFor="remember-student"
                      className="text-sm font-medium text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white" 
                    onClick={() => handleLogin('student')}
                    disabled={loading}
                  >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="admin">
              <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
                <CardHeader>
                  <CardTitle>Administrator Access</CardTitle>
                  <CardDescription>Manage courses, users, and system settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="admin-email" 
                        placeholder="admin@emba.edu" 
                        className="pl-10" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin('admin')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-password">Password</Label>
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="admin-password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin('admin')}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember-admin" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <label
                      htmlFor="remember-admin"
                      className="text-sm font-medium text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white border-none"
                    onClick={() => handleLogin('admin')}
                    disabled={loading}
                  >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Admin Login <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="professor">
              <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
                <CardHeader>
                  <CardTitle>Professor Portal</CardTitle>
                  <CardDescription>Manage courses, students, and teaching materials.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="professor-email">Email Address</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="professor-email" 
                        placeholder="professor@emba.edu" 
                        className="pl-10" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin('professor')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="professor-password">Password</Label>
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="professor-password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin('professor')}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember-professor" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <label
                      htmlFor="remember-professor"
                      className="text-sm font-medium text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white" 
                    onClick={() => handleLogin('professor')}
                    disabled={loading}
                  >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="text-center text-sm text-slate-500">
            Need help accessing your account? <a href="#" className="font-medium text-blue-900 hover:underline">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}