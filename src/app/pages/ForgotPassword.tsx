import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BookOpen, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
      toast.success("Reset link sent!", {
        description: "Check your email for password reset instructions."
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans">
      {/* Left Column: Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-amber-400 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-900" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">EMBA Connect</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-md">
            Secure password recovery for your academic portal.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex gap-4 text-xs text-blue-200 uppercase tracking-widest font-medium">
            <span>Secure</span>
            <span>•</span>
            <span>Trusted</span>
            <span>•</span>
            <span>Confidential</span>
          </div>
        </div>
      </div>

      {/* Right Column: Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <Button
              variant="ghost"
              className="mb-4 -ml-4 text-slate-600 hover:text-slate-900"
              onClick={() => navigate('/login')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reset Password</h2>
            <p className="mt-2 text-slate-500">
              {emailSent ? "Check your email" : "Enter your email to receive reset instructions"}
            </p>
          </div>

          {!emailSent ? (
            <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
              <CardHeader>
                <CardTitle>Password Recovery</CardTitle>
                <CardDescription>
                  We'll send you a secure link to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="your.email@emba.edu" 
                      className="pl-10" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white" 
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-green-200 bg-green-50 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-2">Email Sent Successfully</h3>
                    <p className="text-slate-600 text-sm">
                      We've sent password reset instructions to <strong>{email}</strong>
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/login')}
                  >
                    Return to Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="text-center text-sm text-slate-500">
            Need more help? <a href="#" className="font-medium text-blue-900 hover:underline">Contact IT Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
