import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services';
import type { User } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { PageShell } from '../components/layout/PageShell';
import { useToast } from '../hooks';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<User | null>(user);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSubmittingName, setIsSubmittingName] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Name form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const profile = await userService.getProfile();
        setProfileData(profile);
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle name update
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: 'Error',
        description: 'First name and last name are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmittingName(true);
      const updatedUser = await userService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      setProfileData(updatedUser);
      setUser(updatedUser);
      setIsEditingName(false);

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update profile';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingName(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'All password fields are required',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'New password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New password and confirm password do not match',
        variant: 'destructive',
      });
      return;
    }

    if (currentPassword === newPassword) {
      toast({
        title: 'Error',
        description: 'New password must be different from current password',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmittingPassword(true);
      await userService.changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);

      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to change password';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!profileData) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Failed to load profile</p>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account information</p>
        </div>

        {/* User Info Summary */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 w-full min-w-112.5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg font-semibold">{profileData.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p className="text-lg font-semibold">
                {new Date(profileData.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Name Section */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="w-full min-w-112.5">
            {!isEditingName ? (
              <div className="space-y-4 w-full">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">First Name</p>
                    <p className="text-lg font-semibold">{profileData.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                    <p className="text-lg font-semibold">{profileData.lastName}</p>
                  </div>
                </div>
                <Button onClick={() => setIsEditingName(true)} variant="outline">
                  Edit Name
                </Button>
              </div>
            ) : (
              <form onSubmit={handleUpdateName} className="space-y-4 w-full">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmittingName}>
                    {isSubmittingName ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingName(false);
                      setFirstName(profileData.firstName);
                      setLastName(profileData.lastName);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="w-full min-w-112.5">
            {!isChangingPassword ? (
              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="outline"
                className="w-full"
              >
                Change Password
              </Button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4 w-full">
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="text-sm font-medium">
                    Current Password
                  </label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmittingPassword}>
                    {isSubmittingPassword ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
