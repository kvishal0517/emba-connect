import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Link, useNavigate } from 'react-router';
import { Car, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        toast.success("Account created successfully!", {
            description: "Welcome to Pitstop+ Rewards.",
        });
        navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-slate-100">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <motion.div 
                whileHover={{ rotate: -10, scale: 1.1 }}
                className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-600/20"
              >
                <Car className="h-8 w-8 text-white" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-slate-900">Create an account</CardTitle>
            <CardDescription className="text-center text-slate-500">
              Enter your email below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form onSubmit={handleSignUp} className="grid gap-4">
                <div className="grid grid-cols-2 gap-6">
                <Button variant="outline" type="button">
                    Google
                </Button>
                <Button variant="outline" type="button">
                    Apple
                </Button>
                </div>
                <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or continue with</span>
                </div>
                </div>
                <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-blue-600 underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
            <p className="px-8 text-center text-xs text-slate-500">
              By clicking continue, you agree to our{" "}
              <Link to="/terms" className="underline underline-offset-4 hover:text-slate-900">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline underline-offset-4 hover:text-slate-900">
                Privacy Policy
              </Link>
              .
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}