"use client";
import Navbar from "@/components/shared/navbar";
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Save, Plus, Trash2 } from 'lucide-react';
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
export default function AdminSettings() {
  
  const [settings, setSettings] = useState({
    siteName: "cookiecms",
    secureCode: "c8ENvF5zD5ThuM9mTwofBqMLGSEutUrztAeca3LFLKr3v9RRXeUnO7j7nskWbL2y",
    serviceApiToken: "2aiajDNUhW95HlSHcRDJK0psCBBGazwGWbnZi99Vcirb82SIEeNvxqKmqAJlwxuQ",
    maxSavedSkins: 1,
    domain: "http://localhost:3000",
    production: "prod",
    logLevel: ["info", "warn", "error"],
    
    auditEnabled: true,
    auditUrl: "https://discord.com/api/webhooks/1343232382773493881/U8gmFOOEL9X83JNv1AIjbDVkL1O2IZGWCmJR8WXRyQq-wcSwgAD1IYFhT_z_EWdDecqe",
    
    databaseHost: "localhost",
    databaseUsername: "cookiecms",
    databasePassword: "cookiecms",
    databaseName: "cookiecms",
    databasePort: 34002,
    
    smtpHost: "mail.coffeedev.dev",
    smtpUsername: "noreply@coffeedev.dev",
    smtpPassword: "",
    smtpSecure: true,
    smtpPort: 465,
    
    discordEnabled: true,
    discordClientId: "1181148727826722816",
    discordSecretId: "",
    discordScopes: ["identify", "email"],
    discordRedirectUrl: "http://localhost:3000/callback",
    discordBot: "",
    discordGuildId: 0,
    discordRole: 0,
    
    permissions: {
      0: ["page.userlist"],
      1: ["profile.changeusername", "profile.changeskin", "profile.changemail", "profile.changepassword", "profile.discord"],
      2: ["profile.changeskinHD"],
      3: ["admin.users", "admin.userskins", "admin.useredit", "admin.user", "admin.mailsend", "admin.capes", "admin.audit"],
      4: ["admin.settings"]
    },
    
    servers: []
  });
  
  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section ? `${section}${field.charAt(0).toUpperCase() + field.slice(1)}` : field]: value
    }));
  };
  
  const handlePermissionChange = (level, perm, add) => {
    setSettings(prev => {
      const newPerms = {...prev.permissions};
      if (add) {
        if (!newPerms[level].includes(perm)) {
          newPerms[level] = [...newPerms[level], perm];
        }
      } else {
        newPerms[level] = newPerms[level].filter(p => p !== perm);
      }
      return {...prev, permissions: newPerms};
    });
  };
  
  const addServer = () => {
    setSettings(prev => ({
      ...prev,
      servers: [...prev.servers, { name: '', ip: '', port: 25565 }]
    }));
  };
  
  const removeServer = (index) => {
    setSettings(prev => ({
      ...prev,
      servers: prev.servers.filter((_, i) => i !== index)
    }));
  };
  
  const updateServer = (index, field, value) => {
    setSettings(prev => {
      const newServers = [...prev.servers];
      newServers[index] = {...newServers[index], [field]: value};
      return {...prev, servers: newServers};
    });
  };
  
  const saveSettings = () => {
    // Here you would implement the API call to save settings
    toast({
      title: "Settings saved",
      description: "Your configuration has been updated successfully",
      duration: 3000
    });
  };

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
                        value={settings.siteName} 
                        onChange={(e) => handleInputChange('', 'siteName', e.target.value)} 
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
                        value={settings.secureCode} 
                        onChange={(e) => handleInputChange('', 'secureCode', e.target.value)} 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="serviceApiToken">Service API Token</Label>
                        <Input 
                        id="serviceApiToken" 
                        value={settings.serviceApiToken} 
                        onChange={(e) => handleInputChange('', 'serviceApiToken', e.target.value)} 
                        />
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="maxSavedSkins">Max Saved Skins</Label>
                        <Input 
                        id="maxSavedSkins" 
                        type="number" 
                        value={settings.maxSavedSkins} 
                        onChange={(e) => handleInputChange('', 'maxSavedSkins', parseInt(e.target.value))} 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="production">Environment</Label>
                        <Input 
                        id="production" 
                        value={settings.production} 
                        onChange={(e) => handleInputChange('', 'production', e.target.value)} 
                        />
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
                        checked={settings.auditEnabled}
                        onCheckedChange={(checked) => handleInputChange('', 'auditEnabled', checked)}
                        />
                    </div>
                    
                    {settings.auditEnabled && (
                        <div className="pt-2">
                        <Label htmlFor="auditUrl">Webhook URL</Label>
                        <Input 
                            id="auditUrl" 
                            value={settings.auditUrl} 
                            onChange={(e) => handleInputChange('', 'auditUrl', e.target.value)} 
                        />
                        </div>
                    )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={saveSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
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
                        value={settings.databaseHost} 
                        onChange={(e) => handleInputChange('database', 'host', e.target.value)} 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="dbPort">Port</Label>
                        <Input 
                        id="dbPort" 
                        type="number" 
                        value={settings.databasePort} 
                        onChange={(e) => handleInputChange('database', 'port', parseInt(e.target.value))} 
                        />
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dbName">Database Name</Label>
                        <Input 
                        id="dbName" 
                        value={settings.databaseName} 
                        onChange={(e) => handleInputChange('database', 'name', e.target.value)} 
                        />
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dbUsername">Username</Label>
                        <Input 
                        id="dbUsername" 
                        value={settings.databaseUsername} 
                        onChange={(e) => handleInputChange('database', 'username', e.target.value)} 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="dbPassword">Password</Label>
                        <Input 
                        id="dbPassword" 
                        type="password" 
                        value={settings.databasePassword} 
                        onChange={(e) => handleInputChange('database', 'password', e.target.value)} 
                        />
                    </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={saveSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
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
                        value={settings.smtpHost} 
                        onChange={(e) => handleInputChange('smtp', 'host', e.target.value)} 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="smtpPort">SMTP Port</Label>
                        <Input 
                        id="smtpPort" 
                        type="number" 
                        value={settings.smtpPort} 
                        onChange={(e) => handleInputChange('smtp', 'port', parseInt(e.target.value))} 
                        />
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="smtpUsername">Username</Label>
                        <Input 
                        id="smtpUsername" 
                        value={settings.smtpUsername} 
                        onChange={(e) => handleInputChange('smtp', 'username', e.target.value)} 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="smtpPassword">Password</Label>
                        <Input 
                        id="smtpPassword" 
                        type="password" 
                        value={settings.smtpPassword} 
                        onChange={(e) => handleInputChange('smtp', 'password', e.target.value)} 
                        />
                    </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                    <Switch 
                        id="smtpSecure" 
                        checked={settings.smtpSecure}
                        onCheckedChange={(checked) => handleInputChange('smtp', 'secure', checked)}
                    />
                    <Label htmlFor="smtpSecure">Use SSL/TLS</Label>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={saveSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
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
                        checked={settings.discordEnabled}
                        onCheckedChange={(checked) => handleInputChange('discord', 'enabled', checked)}
                    />
                    <Label htmlFor="discordEnabled">Enable Discord Integration</Label>
                    </div>
                    
                    {settings.discordEnabled && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="discordClientId">Client ID</Label>
                            <Input 
                            id="discordClientId" 
                            value={settings.discordClientId} 
                            onChange={(e) => handleInputChange('discord', 'clientId', e.target.value)} 
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="discordSecretId">Secret ID</Label>
                            <Input 
                            id="discordSecretId" 
                            value={settings.discordSecretId} 
                            onChange={(e) => handleInputChange('discord', 'secretId', e.target.value)} 
                            />
                        </div>
                        </div>
                        
                        <div className="space-y-2">
                        <Label htmlFor="discordRedirectUrl">Redirect URL</Label>
                        <Input 
                            id="discordRedirectUrl" 
                            value={settings.discordRedirectUrl} 
                            onChange={(e) => handleInputChange('discord', 'redirectUrl', e.target.value)} 
                        />
                        </div>
                        
                        <div className="space-y-2">
                        <Label>OAuth Scopes</Label>
                        <div className="flex flex-wrap gap-2">
                            {["identify", "email", "guilds", "guilds.join"].map(scope => (
                            <Badge 
                                key={scope}
                                variant={settings.discordScopes.includes(scope) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                const newScopes = settings.discordScopes.includes(scope) 
                                    ? settings.discordScopes.filter(s => s !== scope)
                                    : [...settings.discordScopes, scope];
                                setSettings({...settings, discordScopes: newScopes});
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
                            value={settings.discordBot} 
                            onChange={(e) => handleInputChange('discord', 'bot', e.target.value)} 
                        />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="discordGuildId">Guild ID</Label>
                            <Input 
                            id="discordGuildId" 
                            value={settings.discordGuildId} 
                            onChange={(e) => handleInputChange('discord', 'guildId', parseInt(e.target.value) || 0)} 
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="discordRole">Role ID</Label>
                            <Input 
                            id="discordRole" 
                            value={settings.discordRole} 
                            onChange={(e) => handleInputChange('discord', 'role', parseInt(e.target.value) || 0)} 
                            />
                        </div>
                        </div>
                    </>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={saveSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
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
                        <h3 className="text-lg font-medium">Level {level} Permissions</h3>
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
                                const input = e.target.previousSibling;
                                if (input.value) {
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
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={saveSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
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
                    {settings.servers.map((server, index) => (
                        <div key={index} className="flex items-center space-x-4">
                        <div className="flex-1">
                            <Input 
                            placeholder="Server name" 
                            value={server.name}
                            onChange={(e) => updateServer(index, 'name', e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <Input 
                            placeholder="Server IP" 
                            value={server.ip}
                            onChange={(e) => updateServer(index, 'ip', e.target.value)}
                            />
                        </div>
                        <div className="w-24">
                            <Input 
                            placeholder="Port" 
                            type="number"
                            value={server.port}
                            onChange={(e) => updateServer(index, 'port', parseInt(e.target.value) || 25565)}
                            />
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeServer(index)}
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
                    <Button onClick={saveSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                    </Button>
                </CardFooter>
                </Card>
            </TabsContent>
            </Tabs>
        </div>
    </div>
  );
}