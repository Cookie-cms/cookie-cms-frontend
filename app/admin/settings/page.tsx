"use client";

import React, { useState, useEffect } from 'react';
import Navbar from "@/components/shared/navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Save, Plus, Trash2, Loader2, Divide } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;


export default function AdminSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newLevelName, setNewLevelName] = useState('');
  const [originalSettings, setOriginalSettings] = useState(null);

  useEffect(() => {
    const token = Cookies.get("cookiecms_cookie");

    if (!token) {
      toast.error("Authentication required");
      router.push("/login");
      return;
    }
    fetchSettings();
  }, []);
  const token = Cookies.get("cookiecms_cookie");

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/service/settings`, {
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': `Bearer ${API_KEY}`,
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const result = await response.json();
      if (!result.error) {
        setSettings(result.data);
        setOriginalSettings(JSON.parse(JSON.stringify(result.data))); // Deep copy
      } else {
        toast.error("Failed to load settings");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;
      
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
      
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handlePermissionChange = (level, perm, add) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;

      const newPerms = {...prev.permissions};
      if (add) {
        if (!newPerms[level]?.includes(perm)) {
          newPerms[level] = [...(newPerms[level] || []), perm];
        }
      } else {
        newPerms[level] = newPerms[level]?.filter(p => p !== perm) || [];
      }
      return {...prev, permissions: newPerms};
    });
  };

  const addNewPermissionLevel = () => {
    if (!settings || !newLevelName) return;

    if (!settings.permissions[newLevelName]) {
      setSettings(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [newLevelName]: []
        }
      }));
      setNewLevelName('');
    }
  };

  const removePermissionLevel = (level) => {
    if (!settings) return;

    setSettings(prev => {
      const newPerms = {...prev.permissions};
      delete newPerms[level];
      return {...prev, permissions: newPerms};
    });
  };

  const addServer = () => {
    if (!settings) return;
  
    const newServer = { name: '', ip: '', port: 25565 };
    setSettings(prev => ({
      ...prev,
      servers: {
        ...(prev.servers || {}),
        [`server${Object.keys(prev.servers || {}).length}`]: newServer
      }
    }));
  };

  const removeServer = (serverKey) => {
    if (!settings) return;
  
    setSettings(prev => {
      const newServers = {...(prev.servers || {})};
      delete newServers[serverKey];
      
      // If this was the last server, ensure we're setting an empty object rather than undefined
      return {
        ...prev,
        servers: Object.keys(newServers).length > 0 ? newServers : {}
      };
    });
  };

  const updateServer = (serverKey, field, value) => {
    if (!settings) return;

    setSettings(prev => ({
      ...prev,
      servers: {
        ...prev.servers,
        [serverKey]: {
          ...prev.servers[serverKey],
          [field]: value
        }
      }
    }));
  };

  const saveSettings = async () => {
    if (!settings) return;
  
    setIsSaving(true);
    try {
      const changedData = getChangedSettings();
      
      // If nothing changed, don't make the request
      if (Object.keys(changedData).length === 0) {
        toast.info("No changes detected");
        setIsSaving(false);
        return;
      }
      
      // Add an identifier field to ensure the correct record is updated
      changedData.id = settings.id; // Assuming there's an ID field
      
      // Ensure servers is explicitly set, even if empty
      if ('servers' in settings && (!settings.servers || Object.keys(settings.servers).length === 0)) {
        changedData.servers = {};
      }
      
      const response = await fetch(`${API_URL}/service/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': `Bearer ${API_KEY}`,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(changedData)
      });
  
      if (!response.ok) throw new Error('Failed to save settings');
  
      const result = await response.json();
      if (!result.error) {
        toast.success("Settings saved", {
          description: "Your configuration has been updated successfully"
        });
        
        // Update original settings to match current
        setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      } else {
        throw new Error(result.msg || 'Failed to save settings');
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsSaving(false);
    }
  };


    const getChangedSettings = () => {
    if (!settings || !originalSettings) return {};
    
    const changedData = {};
    
    // Process top-level fields
    Object.keys(settings).forEach(key => {
      if (typeof settings[key] !== 'object' || settings[key] === null) {
        if (settings[key] !== originalSettings[key]) {
          changedData[key] = settings[key];
        }
      }
    });
    
    // Process nested objects
    ['database', 'smtp', 'discord', 'AuditSecret'].forEach(section => {
      if (settings[section]) {
        const sectionChanges = {};
        let hasChanges = false;
        
        Object.keys(settings[section]).forEach(key => {
          // Special handling for password fields - only include if changed from empty
          if ((key === 'pass' || key === 'Password') && 
              settings[section][key] && 
              settings[section][key] !== originalSettings[section][key]) {
            sectionChanges[key] = settings[section][key];
            hasChanges = true;
          } 
          // For non-password fields
          else if (key !== 'pass' && key !== 'Password' && 
                  settings[section][key] !== originalSettings[section][key]) {
            sectionChanges[key] = settings[section][key];
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          changedData[section] = sectionChanges;
        }
      }
    });
    
    // Handle servers specifically - always include if it has changed
    if (JSON.stringify(settings.servers || {}) !== JSON.stringify(originalSettings.servers || {})) {
      changedData.servers = settings.servers || {};
    }
    
    // Special handling for permissions and logLevel which might need complete replacement
    ['permissions', 'logLevel'].forEach(field => {
      if (JSON.stringify(settings[field]) !== JSON.stringify(originalSettings[field])) {
        changedData[field] = settings[field];
      }
    });
    
    return changedData;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load settings. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="container mx-auto py-6">
        <div className="p-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Settings</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>
        
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Changes to these settings will affect the entire system. Make sure you know what you're doing.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="discord">Discord</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="servers">Servers</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure your site's basic settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input 
                      id="siteName" 
                      value={settings.NameSite} 
                      onChange={(e) => handleInputChange('', 'NameSite', e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain</Label>
                    <Input 
                      id="domain" 
                      value={settings.domain} 
                      onChange={(e) => handleInputChange('', 'domain', e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="secureCode">Secure Code</Label>
                    <Input 
                      id="secureCode" 
                      value={settings.securecode} 
                      onChange={(e) => handleInputChange('', 'securecode', e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serviceApiToken">Service API Token</Label>
                    <Input 
                      id="serviceApiToken" 
                      value={settings.ServiceApiToken} 
                      onChange={(e) => handleInputChange('', 'ServiceApiToken', e.target.value)} 
                    />
                  </div>
                </div>
                
                                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxSavedSkins">Max Saved Skins</Label>
                    <Input 
                      id="maxSavedSkins" 
                      type="number" 
                      value={settings.MaxSavedSkins} 
                      onChange={(e) => handleInputChange('', 'MaxSavedSkins', parseInt(e.target.value))} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="demoMode">Demo Mode</Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="demoMode" 
                        checked={settings.demo === true}
                        onCheckedChange={(checked) => handleInputChange('', 'demo', checked)} 
                      />
                      <span className="text-sm text-muted-foreground">
                        {settings.demo ? "Demo mode enabled" : "Production mode"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      When enabled, demo features will be active and real data operations are limited.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Log Levels</Label>
                  <div className="flex space-x-2">
                    {["info", "warn", "error", "debug"].map(level => (
                      <Badge 
                        key={level}
                        variant={settings.logLevel.includes(level) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newLogLevels = settings.logLevel.includes(level) 
                            ? settings.logLevel.filter(l => l !== level)
                            : [...settings.logLevel, level];
                          setSettings({...settings, logLevel: newLogLevels});
                        }}
                      >
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auditEnabled">Discord Audit Log</Label>
                    <Switch 
                      id="auditEnabled" 
                      checked={settings.AuditSecret.enabled}
                      onCheckedChange={(checked) => handleInputChange('AuditSecret', 'enabled', checked)}
                    />
                  </div>
                  
                  {settings.AuditSecret.enabled && (
                    <div className="pt-2">
                      <Label htmlFor="auditUrl">Webhook URL</Label>
                      <Input 
                        id="auditUrl" 
                        value={settings.AuditSecret.url} 
                        onChange={(e) => handleInputChange('AuditSecret', 'url', e.target.value)} 
                      />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Database Settings */}
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Database Configuration</CardTitle>
                <CardDescription>Configure your database connection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbHost">Host</Label>
                    <Input 
                      id="dbHost" 
                      value={settings.database.host} 
                      onChange={(e) => handleInputChange('database', 'host', e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dbPort">Port</Label>
                    <Input 
                      id="dbPort" 
                      type="number" 
                      value={settings.database.port} 
                      onChange={(e) => handleInputChange('database', 'port', parseInt(e.target.value))} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbName">Database Name</Label>
                    <Input 
                      id="dbName" 
                      value={settings.database.db} 
                      onChange={(e) => handleInputChange('database', 'db', e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbUsername">Username</Label>
                    <Input 
                      id="dbUsername" 
                      value={settings.database.username} 
                      onChange={(e) => handleInputChange('database', 'username', e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dbPassword">Password</Label>
                    <Input 
                      id="dbPassword" 
                      type="password" 
                      value={settings.database.pass} 
                      onChange={(e) => handleInputChange('database', 'pass', e.target.value)} 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Configure your SMTP settings for sending emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input 
                      id="smtpHost" 
                      value={settings.smtp.Host} 
                      onChange={(e) => handleInputChange('smtp', 'Host', e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input 
                      id="smtpPort" 
                      type="number" 
                      value={settings.smtp.Port} 
                      onChange={(e) => handleInputChange('smtp', 'Port', parseInt(e.target.value))} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">Username</Label>
                    <Input 
                      id="smtpUsername" 
                      value={settings.smtp.Username} 
                      onChange={(e) => handleInputChange('smtp', 'Username', e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">Password</Label>
                    <Input 
                      id="smtpPassword" 
                      type="password" 
                      value={settings.smtp.Password} 
                      onChange={(e) => handleInputChange('smtp', 'Password', e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="smtpSecure" 
                    checked={settings.smtp.SMTPSecure}
                    onCheckedChange={(checked) => handleInputChange('smtp', 'SMTPSecure', checked)}
                  />
                  <Label htmlFor="smtpSecure">Use SSL/TLS</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Discord Settings */}
          <TabsContent value="discord">
            <Card>
              <CardHeader>
                <CardTitle>Discord Integration</CardTitle>
                <CardDescription>Configure Discord OAuth and bot integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Switch 
                    id="discordEnabled" 
                    checked={settings.discord.enabled}
                    onCheckedChange={(checked) => handleInputChange('discord', 'enabled', checked)}
                  />
                  <Label htmlFor="discordEnabled">Enable Discord Integration</Label>
                </div>
                
                {settings.discord.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="discordClientId">Client ID</Label>
                        <Input 
                          id="discordClientId" 
                          value={settings.discord.client_id} 
                          onChange={(e) => handleInputChange('discord', 'client_id', e.target.value)} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="discordSecretId">Secret ID</Label>
                        <Input 
                          id="discordSecretId" 
                          value={settings.discord.secret_id} 
                          onChange={(e) => handleInputChange('discord', 'secret_id', e.target.value)} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discordRedirectUrl">Redirect URL</Label>
                      <Input 
                        id="discordRedirectUrl" 
                        value={settings.discord.redirect_url} 
                        onChange={(e) => handleInputChange('discord', 'redirect_url', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>OAuth Scopes</Label>
                      <div className="flex flex-wrap gap-2">
                        {["identify", "email", "guilds", "guilds.join"].map(scope => (
                          <Badge 
                            key={scope}
                            variant={settings.discord.scopes.includes(scope) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const newScopes = settings.discord.scopes.includes(scope) 
                                ? settings.discord.scopes.filter(s => s !== scope)
                                : [...settings.discord.scopes, scope];
                              handleInputChange('discord', 'scopes', newScopes);
                            }}
                          >
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="discordBot">Bot Token</Label>
                      <Input 
                        id="discordBot" 
                        value={settings.discord.bot} 
                        onChange={(e) => handleInputChange('discord', 'bot', e.target.value)} 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="discordGuildId">Guild ID</Label>
                        <Input 
                          id="discordGuildId" 
                          value={settings.discord.guild_id} 
                          onChange={(e) => handleInputChange('discord', 'guild_id', parseInt(e.target.value) || 0)} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="discordRole">Role ID</Label>
                        <Input 
                          id="discordRole" 
                          value={settings.discord.role} 
                          onChange={(e) => handleInputChange('discord', 'role', parseInt(e.target.value) || 0)} 
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Permissions Settings */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>User Permissions</CardTitle>
                <CardDescription>Configure permission levels for user groups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.keys(settings.permissions).map((level) => (
                    <div key={level} className="space-y-2">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium">Level {level} Permissions</h3>
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-destructive" 
                          onClick={() => removePermissionLevel(level)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {settings.permissions[level].map(perm => (
                          <Badge key={perm} variant="default" className="flex items-center gap-1">
                            {perm}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-4 w-4 p-0 ml-1" 
                              onClick={() => handlePermissionChange(level, perm, false)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                        <div className="flex">
                          <Input 
                            placeholder="Add permission" 
                            className="h-8 w-40"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.target.value) {
                                handlePermissionChange(level, e.target.value, true);
                                e.target.value = '';
                              }
                            }}
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="ml-2 h-8"
                            onClick={(e) => {
                              const input = e.currentTarget.previousSibling;
                              if (input && input.value) {
                                handlePermissionChange(level, input.value, true);
                                input.value = '';
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* New Permission Level Creation */}
                  <div className="mt-6 border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="New permission level number"
                        value={newLevelName}
                        onChange={(e) => setNewLevelName(e.target.value)}
                        className="h-10 w-64"
                      />
                      <Button
                        variant="default"
                        size="default"
                        onClick={addNewPermissionLevel}
                        disabled={!newLevelName}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Permission Level
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
                    {/* Servers Settings */}
          <TabsContent value="servers">
            <Card>
              <CardHeader>
                <CardTitle>Game Servers</CardTitle>
                <CardDescription>Configure Minecraft server connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.servers && Object.entries(settings.servers).map(([key, server]) => (
                    <div key={key} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Input 
                          placeholder="Server name" 
                          value={server?.name || ''}
                          onChange={(e) => updateServer(key, 'name', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Input 
                          placeholder="Server IP" 
                          value={server?.ip || ''}
                          onChange={(e) => updateServer(key, 'ip', e.target.value)}
                        />
                      </div>
                      <div className="w-24">
                        <Input 
                          placeholder="Port" 
                          type="number"
                          value={server?.port || 25565}
                          onChange={(e) => updateServer(key, 'port', parseInt(e.target.value) || 25565)}
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeServer(key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={addServer}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Server
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>

  );
}