import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/api/auth.service';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import HeaderDash from '@/components/layout/HeaderDash';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Mail, Phone, Calendar, Shield, Camera, 
  Lock, Trash2, Save, Loader2, Image, CheckCircle,
  AlertTriangle, Clock
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FaceCamera } from '@/components/camera/FaceCamera';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  
  // Profile state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Face update state
  const [showFaceCamera, setShowFaceCamera] = useState(false);
  const [facePassword, setFacePassword] = useState('');
  const [isUpdatingFace, setIsUpdatingFace] = useState(false);
  
  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // Stats
  const [matchedPhotos, setMatchedPhotos] = useState<any[]>([]);
  
  useEffect(() => {
    // Load matched photos from localStorage for statistics
    const photos = localStorage.getItem('matched_photos');
    if (photos) {
      setMatchedPhotos(JSON.parse(photos));
    }
  }, []);
  
  // Calculate statistics
  const totalPhotos = matchedPhotos.length;
  const uniqueEvents = new Set(matchedPhotos.map(p => p.metadata?.event_name)).size;
  const avgMatchRate = matchedPhotos.length > 0 
    ? (matchedPhotos.reduce((acc, p) => acc + (1 - (p.distance || 0)), 0) / matchedPhotos.length * 100).toFixed(1)
    : 0;
  
  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      toast({ title: 'Error', description: 'Full name is required', variant: 'destructive' });
      return;
    }
    
    setIsUpdatingProfile(true);
    try {
      const response = await authService.updateProfile({ full_name: fullName, phone: phone || undefined });
      if (response.success && response.data) {
        updateUser(response.data);
        toast({ title: 'Success', description: 'Profile updated successfully' });
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.error || error.message || 'Failed to update profile', 
        variant: 'destructive' 
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: 'Error', description: 'All password fields are required', variant: 'destructive' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      if (response.success) {
        toast({ title: 'Success', description: 'Password changed successfully. Please login again.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Optionally logout user after password change
        setTimeout(() => logout(), 2000);
      } else {
        throw new Error(response.error || 'Failed to change password');
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.error || error.message || 'Failed to change password', 
        variant: 'destructive' 
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleFaceCapture = async (imageData: string) => {
    if (!facePassword) {
      toast({ title: 'Error', description: 'Please enter your password for verification', variant: 'destructive' });
      return;
    }
    
    setIsUpdatingFace(true);
    try {
      const response = await authService.updateFaceBiometric(imageData, facePassword);
      if (response.success) {
        toast({ title: 'Success', description: 'Face biometric updated successfully' });
        setShowFaceCamera(false);
        setFacePassword('');
      } else {
        throw new Error(response.error || 'Failed to update face');
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.error || error.message || 'Failed to update face biometric', 
        variant: 'destructive' 
      });
    } finally {
      setIsUpdatingFace(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!deletePassword || deleteConfirmation !== 'DELETE MY ACCOUNT') {
      toast({ title: 'Error', description: 'Please enter password and confirmation text', variant: 'destructive' });
      return;
    }
    
    setIsDeletingAccount(true);
    try {
      const response = await authService.deleteAccount(deletePassword, deleteConfirmation);
      if (response.success) {
        toast({ title: 'Account Deleted', description: 'Your account has been deleted. Goodbye!' });
        logout();
      } else {
        throw new Error(response.error || 'Failed to delete account');
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.error || error.message || 'Failed to delete account', 
        variant: 'destructive' 
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderDash />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profile_photo} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl font-bold">{user?.full_name}</h1>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                    <Badge variant="secondary" className="capitalize">
                      <Shield className="h-3 w-3 mr-1" />
                      {user?.role || 'user'}
                    </Badge>
                    {user?.is_verified ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-lg">
                    <Image className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-2xl font-bold">{totalPhotos}</p>
                    <p className="text-xs text-muted-foreground">Photos</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-2xl font-bold">{uniqueEvents}</p>
                    <p className="text-xs text-muted-foreground">Events</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <CheckCircle className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-2xl font-bold">{avgMatchRate}%</p>
                    <p className="text-xs text-muted-foreground">Avg Match</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Account Info Card 
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">{formatDate(user?.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">{formatDate(user?.last_login)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>*/}
          
          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="face">Face ID</TabsTrigger>
              <TabsTrigger value="danger">Account</TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Edit Profile
                  </CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        value={user?.email || ''} 
                        disabled 
                        className="pl-10 bg-muted" 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="fullName" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile} className="w-full">
                    {isUpdatingProfile ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Password Tab */}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password"
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <Button onClick={handleChangePassword} disabled={isChangingPassword} className="w-full">
                    {isChangingPassword ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Changing...</>
                    ) : (
                      <><Lock className="mr-2 h-4 w-4" /> Change Password</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Face ID Tab */}
            <TabsContent value="face">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Update Face ID
                  </CardTitle>
                  <CardDescription>Re-register your face for better recognition accuracy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!showFaceCamera ? (
                    <>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Update your face biometric to improve photo matching accuracy.
                          You'll need to verify with your password.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="facePassword">Password Verification</Label>
                        <Input 
                          id="facePassword" 
                          type="password"
                          value={facePassword} 
                          onChange={(e) => setFacePassword(e.target.value)}
                          placeholder="Enter your password"
                        />
                      </div>
                      
                      <Button 
                        onClick={() => setShowFaceCamera(true)} 
                        disabled={!facePassword}
                        className="w-full"
                      >
                        <Camera className="mr-2 h-4 w-4" /> Start Face Capture
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <FaceCamera 
                        onCapture={handleFaceCapture}
                        isProcessing={isUpdatingFace}
                        mode="register"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => setShowFaceCamera(false)}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Danger Zone Tab */}
            <TabsContent value="danger">
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>Irreversible actions for your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <h4 className="font-medium text-destructive mb-2">Delete Account</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. All your data will be permanently removed.
                    </p>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete My Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove all your data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="deletePassword">Password</Label>
                            <Input 
                              id="deletePassword" 
                              type="password"
                              value={deletePassword} 
                              onChange={(e) => setDeletePassword(e.target.value)}
                              placeholder="Enter your password"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="deleteConfirmation">
                              Type <span className="font-mono font-bold">DELETE MY ACCOUNT</span> to confirm
                            </Label>
                            <Input 
                              id="deleteConfirmation" 
                              value={deleteConfirmation} 
                              onChange={(e) => setDeleteConfirmation(e.target.value)}
                              placeholder="DELETE MY ACCOUNT"
                            />
                          </div>
                        </div>
                        
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={isDeletingAccount || deleteConfirmation !== 'DELETE MY ACCOUNT'}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeletingAccount ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                            ) : (
                              'Delete Account'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
