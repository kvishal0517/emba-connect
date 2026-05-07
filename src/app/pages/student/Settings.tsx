import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Separator } from '@/app/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
  Globe, 
  Mail, 
  Phone, 
  Calendar,
  Save,
  Camera
} from 'lucide-react';
import { db } from '@/app/lib/db';
import type { User as UserType } from '@/app/lib/db';
import { toast } from 'sonner';

export default function Settings() {
  const [user, setUser] = useState<UserType | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [assignmentReminders, setAssignmentReminders] = useState(true);
  const [classReminders, setClassReminders] = useState(true);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await db.getCurrentUser();
        setUser(userData);
        
        if (userData) {
          const nameParts = userData.name.split(' ');
          setProfileData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: userData.email,
            phone: '+1 (555) 123-4567' // Mock phone
          });
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
    loadUser();
  }, []);

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      const updatedUser = await db.updateUser(user.id, {
        name: `${profileData.firstName} ${profileData.lastName}`,
        email: profileData.email
      });

      if (updatedUser) {
        setUser(updatedUser);
        toast.success('Settings Saved!', {
          description: 'Your preferences have been updated successfully.'
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleUpdatePassword = () => {
    toast.success('Password Updated!', {
      description: 'Your password has been changed successfully.'
    });
  };

  const handleChangePhoto = () => {
    toast.info('Photo Upload', {
      description: 'Photo upload feature coming soon!'
    });
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-2">Manage your account preferences and notifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardContent className="p-4 space-y-1">
              {[
                { icon: User, label: 'Profile', active: true },
                { icon: Bell, label: 'Notifications', active: false },
                { icon: Lock, label: 'Privacy & Security', active: false },
                { icon: Palette, label: 'Appearance', active: false },
                { icon: Globe, label: 'Language & Region', active: false }
              ].map((item, index) => (
                <button
                  key={index}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${item.active 
                      ? 'bg-blue-900 text-white' 
                      : 'text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and profile photo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>AM</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" onClick={handleChangePhoto}>
                    <Camera className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="email" type="email" className="pl-10" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="phone" type="tel" className="pl-10" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input id="studentId" defaultValue="EMBA-2024-0156" disabled className="bg-slate-50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  <Input id="program" defaultValue="Executive MBA" disabled className="bg-slate-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-slate-500">Receive updates via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-slate-500">Get real-time alerts on your device</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Assignment Reminders</Label>
                  <p className="text-sm text-slate-500">Notify me about upcoming deadlines</p>
                </div>
                <Switch checked={assignmentReminders} onCheckedChange={setAssignmentReminders} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Class Reminders</Label>
                  <p className="text-sm text-slate-500">Alert me 15 minutes before class</p>
                </div>
                <Switch checked={classReminders} onCheckedChange={setClassReminders} />
              </div>
            </CardContent>
          </Card>

          {/* Password & Security */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>Keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" />
              </div>
              <Button variant="outline" className="w-full" onClick={handleUpdatePassword}>
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Timezone Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Timezone & Locale</CardTitle>
              <CardDescription>Configure your regional preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Primary Timezone</Label>
                <select id="timezone" className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm">
                  <option>Asia/Kolkata (IST)</option>
                  <option>America/New_York (EST)</option>
                  <option>America/Los_Angeles (PST)</option>
                  <option>Europe/London (GMT)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select id="language" className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <select id="dateFormat" className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm">
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-blue-900 hover:bg-blue-800 text-white" onClick={handleSaveChanges}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}