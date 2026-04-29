import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services';
import type { User } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { PageShell } from '../components/layout/PageShell';
import { useToast } from '../hooks';

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<User | null>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e: React.FormEvent) => {
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
      setIsSaving(true);
      const updatedUser = await userService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      setProfileData(updatedUser);
      setUser(updatedUser);
      setIsEditing(false);

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save settings';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
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
              <p className="text-center text-muted-foreground">Failed to load settings</p>
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
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings</p>
        </div>

        {/* Profile Section */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="w-full min-w-112.5">
            {!isEditing ? (
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
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg font-semibold">{profileData.email}</p>
                </div>
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Profile
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4 w-full">
                <div className="space-y-2">
                  <label htmlFor="settings-firstName" className="text-sm font-medium">
                    First Name
                  </label>
                  <Input
                    id="settings-firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="settings-lastName" className="text-sm font-medium">
                    Last Name
                  </label>
                  <Input
                    id="settings-lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <Input value={profileData.email} disabled className="bg-muted" />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
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
      </div>
    </PageShell>
  );
}
