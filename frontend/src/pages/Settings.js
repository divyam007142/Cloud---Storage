import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, LogOut, User, Settings as SettingsIcon, Shield, Palette } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Settings = () => {
  const { token, user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // User settings state
  const [theme, setTheme] = useState('system');
  const [layoutPreference, setLayoutPreference] = useState('grid');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analyticsAutoRefresh, setAnalyticsAutoRefresh] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // User profile with settings
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profile = response.data.user;
      setUserProfile(profile);
      
      // Set profile data
      if (profile.displayName) {
        setDisplayName(profile.displayName);
      } else if (profile.email) {
        setDisplayName(profile.email.split('@')[0]);
      } else if (profile.phoneNumber) {
        setDisplayName(profile.phoneNumber);
      }

      // Set settings data
      if (profile.settings) {
        setTheme(profile.settings.theme || 'system');
        setLayoutPreference(profile.settings.layoutPreference || 'grid');
        setSidebarCollapsed(profile.settings.sidebarCollapsed || false);
        setAnalyticsAutoRefresh(profile.settings.analyticsAutoRefresh !== false);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.put(
        `${API}/user/profile`,
        { displayName },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update user in context
      setUser({ ...user, displayName });
      setSuccess('Display name updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        logout();
        navigate('/');
      } else {
        setError(error.response?.data?.detail || 'Failed to update display name');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    setError('');
    setSuccess('');
    setSettingsLoading(true);

    try {
      await axios.put(
        `${API}/user/settings`,
        {
          theme,
          layoutPreference,
          sidebarCollapsed,
          analyticsAutoRefresh
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Update settings error:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        logout();
        navigate('/');
      } else {
        setError(error.response?.data?.detail || 'Failed to update settings');
      }
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Global Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-500 bg-green-50">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your display name and personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">
                This name will be displayed in your greeting message
              </p>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="text"
                value={user?.email || 'N/A'}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="text"
                value={user?.phoneNumber || 'N/A'}
                disabled
                className="bg-gray-50"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>
            Customize your dashboard experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Choose your preferred color scheme
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Dashboard Layout</Label>
            <Select value={layoutPreference} onValueChange={setLayoutPreference}>
              <SelectTrigger>
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Default layout for displaying items
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Collapsed Sidebar</Label>
              <p className="text-sm text-gray-500">
                Start with sidebar collapsed
              </p>
            </div>
            <Switch
              checked={sidebarCollapsed}
              onCheckedChange={setSidebarCollapsed}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-refresh Analytics</Label>
              <p className="text-sm text-gray-500">
                Automatically refresh analytics data
              </p>
            </div>
            <Switch
              checked={analyticsAutoRefresh}
              onCheckedChange={setAnalyticsAutoRefresh}
            />
          </div>

          <Button onClick={handleUpdateSettings} disabled={settingsLoading}>
            {settingsLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Last Login</Label>
            <Input
              type="text"
              value={formatDate(userProfile?.lastLogin)}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label>Account Created</Label>
            <Input
              type="text"
              value={formatDate(userProfile?.createdAt)}
              disabled
              className="bg-gray-50"
            />
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Session Management</h4>
            <p className="text-sm text-gray-500 mb-4">
              Logging out will end your current session. You'll need to log in again to access your account.
            </p>
            <Button onClick={handleLogout} variant="destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout from This Device
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
