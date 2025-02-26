"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/shared/navbar";
import { TrendingUp, Users, Palette, Settings, FileText, BarChart, Calendar } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState(14);
  const [chartType, setChartType] = useState("registrations");
  
  // Generate a 30-day dataset
  const generateFullData = () => {
    const data = [];
    for (let i = 1; i <= 30; i++) {
      // Generate slightly randomized but realistic data
      const registrations = Math.floor(15 + Math.random() * 25);
      const desktop = Math.floor(150 + Math.random() * 200);
      const mobile = Math.floor(100 + Math.random() * 100);
      
      data.push({
        day: `Day ${i}`,
        registrations,
        desktop,
        mobile
      });
    }
    return data;
  };
  
  const fullDataset = generateFullData();
  
  // Get a subset of data based on the dateRange
  const getFilteredData = () => {
    return fullDataset.slice(0, dateRange);
  };
  
  const chartData = getFilteredData();
  
  // Calculate total registrations for the selected period
  const totalRegistrations = chartData.reduce((sum, day) => sum + day.registrations, 0);
  
  // Calculate percentage change by comparing the first and second half of the period
  const calculateChange = () => {
    const halfPoint = Math.floor(dateRange / 2);
    const firstHalf = chartData.slice(0, halfPoint).reduce((sum, day) => sum + day.registrations, 0);
    const secondHalf = chartData.slice(halfPoint).reduce((sum, day) => sum + day.registrations, 0);
    
    if (firstHalf === 0) return 0;
    return ((secondHalf - firstHalf) / firstHalf * 100).toFixed(1);
  };
  
  const percentChange = calculateChange();
  
  const pages = [
    {
      title: "User management",
      description: "View and manage user accounts, permissions and roles",
      path: "/admin/users",
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Skin management",
      description: "Customize themes and visual appearances",
      path: "/admin/skins",
      icon: <Palette className="h-6 w-6" />
    },
    {
      title: "Settings",
      description: "Configure system parameters and preferences",
      path: "/admin/settings",
      icon: <Settings className="h-6 w-6" />
    },
    {
      title: "Audit",
      description: "View system logs and user activity history",
      path: "/admin/audit",
      icon: <FileText className="h-6 w-6" />
    },
  ];

  // Summary statistics for the admin overview
  const summaryStats = [
    { title: "Total Users", value: "2,845", change: "+12%", icon: <Users className="h-5 w-5" /> },
    { 
      title: "New Registrations", 
      value: totalRegistrations, 
      change: `${percentChange > 0 ? '+' : ''}${percentChange}%`, 
      positive: percentChange >= 0,
      icon: <Users className="h-5 w-5" /> 
    },
    { title: "Active Skins", value: "18", change: "+3", icon: <Palette className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          
          {/* Quick stats overview */}
          <div className="flex flex-wrap gap-4">
            {summaryStats.map((stat, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold">{stat.value}</p>
                      <span className={`text-xs ${stat.positive === false ? 'text-red-500' : 'text-green-500'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Navigation Cards */}
          <div className="lg:col-span-1 space-y-4">
            {pages.map((page, index) => (
              <Card key={index} className="overflow-hidden border border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                <CardHeader className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {page.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{page.title}</CardTitle>
                      <CardDescription className="mt-1">{page.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-5 px-5">
                  <Button 
                    onClick={() => router.push(page.path)} 
                    className="w-full bg-primary/90 hover:bg-primary transition-colors"
                  >
                    Go to
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Right Column - Chart with date range selector */}
          <div className="lg:col-span-2">
            <Card className="border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-primary" />
                      User Activity
                    </CardTitle>
                    <CardDescription>View registrations and site traffic</CardDescription>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Chart type selector */}
                    <Select value={chartType} onValueChange={setChartType}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registrations">Registrations</SelectItem>
                        <SelectItem value="traffic">Site Traffic</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Period display */}
                    <div className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-md text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Last {dateRange} days</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              {/* Date range slider */}
              <CardContent className="pt-0 pb-2">
                <div className="mt-4 mb-2 px-2">
                  <div className="flex justify-between mb-2 text-xs text-muted-foreground">
                    <span>14 days</span>
                    <span>30 days</span>
                  </div>
                  <Slider
                    value={[dateRange]}
                    min={14}
                    max={30}
                    step={1}
                    onValueChange={(values) => setDateRange(values[0])}
                    className="mb-6"
                  />
                </div>
                
                {/* Chart legend */}
                <div className="flex gap-4 mb-2 px-2">
                  {chartType === "registrations" ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-xs">New registrations</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-xs">Desktop</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        <span className="text-xs">Mobile</span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Chart */}
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis 
                        dataKey="day" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8}
                        tickFormatter={(value) => value.replace("Day ", "")}
                        style={{ fontSize: '0.75rem' }}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => {
                          const label = name === 'registrations' ? 'users' : 'visits';
                          return [`${value} ${label}`, undefined];
                        }}
                        labelFormatter={(label) => `Day ${label.replace("Day ", "")}`}
                      />
                      
                      {chartType === "registrations" ? (
                        <Area 
                          type="monotone" 
                          dataKey="registrations" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRegistrations)"
                        />
                      ) : (
                        <>
                          <Area 
                            type="monotone" 
                            dataKey="desktop" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorDesktop)"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="mobile" 
                            stroke="#60a5fa" 
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorMobile)"
                          />
                        </>
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              
              <CardFooter className="border-t border-border/50 bg-muted/20">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`flex items-center gap-1 font-medium ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      <TrendingUp className="h-4 w-4" />
                      {percentChange}%
                    </div>
                    <div className="text-muted-foreground">
                      {percentChange >= 0 ? 'growth' : 'decline'} in second half of period
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push('/admin/users')}
                    className="text-xs"
                  >
                    View Details
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}