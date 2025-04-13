"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { insuranceDetailsApi } from '@/lib/supabase';
import { InsuranceDetail } from '@/lib/types';
import { format, parseISO, eachMonthOfInterval, subMonths } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, PieChart as PieChartIcon, CalendarRange, Award } from 'lucide-react';

// Color palette that works for both light and dark themes
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF', '#4BC0C0', '#E84D8A', '#B52B65'];
const CALL_STATUS_COLORS = {
  'not called': '#6c757d',
  'call failed': '#dc3545',
  'call succeeded': '#28a745'
};

export default function Analytics() {
  const [data, setData] = useState<InsuranceDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'30days' | '90days' | '6months' | '1year'>('90days');

  useEffect(() => {
    const fetchAllRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        // This is a simplified version - in production, you'd need to paginate through all records
        const { data } = await insuranceDetailsApi.getAll(1, 1000, '');
        setData(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllRecords();
  }, []);

  // Prepare data for insurance company distribution chart
  const insuranceCompanyData = useMemo(() => {
    if (!data.length) return [];
    
    const companies: Record<string, number> = {};
    data.forEach(record => {
      const company = record.insurance_company || 'Unknown';
      companies[company] = (companies[company] || 0) + 1;
    });
    
    return Object.entries(companies)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Show top 8 companies
  }, [data]);

  // Prepare data for eligibility status chart
  const eligibilityStatusData = useMemo(() => {
    if (!data.length) return [];
    
    const statuses: Record<string, number> = {};
    data.forEach(record => {
      const status = record.eligibility_status || 'Unknown';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    
    return Object.entries(statuses)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  // Prepare data for call status chart
  const callStatusData = useMemo(() => {
    if (!data.length) return [];
    
    const statuses: Record<string, number> = {};
    data.forEach(record => {
      const status = record.called_status || 'not called';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    
    return Object.entries(statuses)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  // Prepare data for appointments by month
  const appointmentsByMonthData = useMemo(() => {
    if (!data.length) return [];
    
    // Determine date range based on selected time range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '30days':
        startDate = subMonths(now, 1);
        break;
      case '90days':
        startDate = subMonths(now, 3);
        break;
      case '6months':
        startDate = subMonths(now, 6);
        break;
      case '1year':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 3);
    }
    
    // Generate all months in the range
    const months = eachMonthOfInterval({ start: startDate, end: now });
    
    // Initialize counts for each month
    const monthlyCounts: Record<string, { month: string, count: number, pastCount: number }> = {};
    
    months.forEach(month => {
      const monthKey = format(month, 'MMM yyyy');
      monthlyCounts[monthKey] = { month: monthKey, count: 0, pastCount: 0 };
    });
    
    // Count appointments per month
    data.forEach(record => {
      if (record.appointment_date) {
        try {
          const apptDate = parseISO(record.appointment_date);
          
          // Check if appointment is within our range
          if (apptDate >= startDate && apptDate <= now) {
            const monthKey = format(apptDate, 'MMM yyyy');
            if (monthlyCounts[monthKey]) {
              monthlyCounts[monthKey].count += 1;
            }
          }
          
          // For past appointments, if they exist
          if (record.last_appointment) {
            const lastApptDate = parseISO(record.last_appointment);
            if (lastApptDate >= startDate && lastApptDate <= now) {
              const monthKey = format(lastApptDate, 'MMM yyyy');
              if (monthlyCounts[monthKey]) {
                monthlyCounts[monthKey].pastCount += 1;
              }
            }
          }
        } catch {
          // Skip invalid date
        }
      }
    });
    
    // Convert to array and sort by date
    return Object.values(monthlyCounts).sort((a, b) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
  }, [data, timeRange]);

  // Prepare data for coverage status
  const coverageStatusData = useMemo(() => {
    if (!data.length) return [];
    
    const statuses: Record<string, number> = {};
    data.forEach(record => {
      const status = record.coverage_status || 'Unknown';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    
    return Object.entries(statuses)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  // Calculate summary metrics
  const metrics = useMemo(() => {
    if (!data.length) return {
      totalRecords: 0,
      scheduledAppointments: 0,
      activeInsurance: 0,
      averageDeductible: 0,
      callsNeeded: 0,
    };

    const today = new Date();
    
    const scheduledAppointments = data.filter(record => {
      if (!record.appointment_date) return false;
      try {
        const apptDate = parseISO(record.appointment_date);
        return apptDate >= today;
      } catch {
        // Skip invalid date
        return false;
      }
    }).length;
    
    const activeInsurance = data.filter(record => 
      record.eligibility_status === 'Active'
    ).length;
    
    const deductibles = data
      .filter(record => record.deductible !== undefined && record.deductible !== null)
      .map(record => {
        // Safely convert to number, handling both string and number types
        const deductible = typeof record.deductible === 'string' 
          ? parseFloat(record.deductible) 
          : Number(record.deductible);
        return isNaN(deductible) ? 0 : deductible;
      });
      
    const averageDeductible = deductibles.length 
      ? deductibles.reduce((sum, val) => sum + val, 0) / deductibles.length 
      : 0;
    
    const callsNeeded = data.filter(record => 
      record.called_status === 'not called'
    ).length;
    
    return {
      totalRecords: data.length,
      scheduledAppointments,
      activeInsurance,
      averageDeductible,
      callsNeeded,
    };
  }, [data]);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await insuranceDetailsApi.getAll(1, 1000, '');
      setData(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTimeRange: '30days' | '90days' | '6months' | '1year') => {
    setTimeRange(newTimeRange);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Insurance Analytics Dashboard</h2>
        <Button onClick={refreshData} disabled={loading} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>
      
      {error && (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Summary Metrics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary transition-all hover:shadow-md dark:bg-black/40">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full mr-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none text-muted-foreground">Total Records</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{metrics.totalRecords}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-cyan-500 transition-all hover:shadow-md dark:bg-black/40">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-cyan-500/10 p-3 rounded-full mr-3">
                <CalendarRange className="h-6 w-6 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none text-muted-foreground">Upcoming Appointments</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{metrics.scheduledAppointments}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-emerald-500 transition-all hover:shadow-md dark:bg-black/40">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-emerald-500/10 p-3 rounded-full mr-3">
                <Award className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none text-muted-foreground">Active Insurance</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{metrics.activeInsurance}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500 transition-all hover:shadow-md dark:bg-black/40">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-amber-500/10 p-3 rounded-full mr-3">
                <PieChartIcon className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none text-muted-foreground">Avg. Deductible</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">${metrics.averageDeductible.toFixed(2)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="appointments">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="calls">Call Status</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
        </TabsList>
        
        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Appointments by Month</CardTitle>
                  <CardDescription>Monthly distribution of scheduled appointments</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant={timeRange === '30days' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleTabChange('30days')}
                  >
                    30 Days
                  </Button>
                  <Button 
                    variant={timeRange === '90days' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleTabChange('90days')}
                  >
                    90 Days
                  </Button>
                  <Button 
                    variant={timeRange === '6months' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleTabChange('6months')}
                  >
                    6 Months
                  </Button>
                  <Button 
                    variant={timeRange === '1year' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleTabChange('1year')}
                  >
                    1 Year
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[400px]">
              {loading ? (
                <div className="w-full h-full grid place-items-center">
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-[350px] w-full" />
                  </div>
                </div>
              ) : appointmentsByMonthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={appointmentsByMonthData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'var(--background)', 
                        borderColor: 'var(--border)',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="count" name="Current Appointments" stackId="1" stroke="#0088FE" fill="#0088FE" />
                    <Area type="monotone" dataKey="pastCount" name="Previous Appointments" stackId="2" stroke="#00C49F" fill="#00C49F" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <p className="text-muted-foreground">No appointment data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Insurance Tab */}
        <TabsContent value="insurance" className="space-y-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Company Distribution</CardTitle>
              <CardDescription>Breakdown by insurance provider</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : insuranceCompanyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={insuranceCompanyData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {insuranceCompanyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} patients`, 'Count']}
                      contentStyle={{ 
                        backgroundColor: 'var(--background)', 
                        borderColor: 'var(--border)',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <p className="text-muted-foreground">No insurance company data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Status</CardTitle>
              <CardDescription>Active vs. inactive insurance policies</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : eligibilityStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={eligibilityStatusData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'var(--background)', 
                        borderColor: 'var(--border)',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Count" fill="#0088FE" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <p className="text-muted-foreground">No eligibility status data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Call Status Tab */}
        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Status Overview</CardTitle>
              <CardDescription>Status of insurance verification calls</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : callStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={callStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={140}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {callStatusData.map((entry, index) => {
                        const statusColor = CALL_STATUS_COLORS[entry.name as keyof typeof CALL_STATUS_COLORS] || COLORS[index % COLORS.length];
                        return <Cell key={`cell-${index}`} fill={statusColor} />;
                      })}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} records`, 'Count']}
                      contentStyle={{ 
                        backgroundColor: 'var(--background)', 
                        borderColor: 'var(--border)',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <p className="text-muted-foreground">No call status data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {metrics.callsNeeded > 0 && (
            <Card className="bg-amber-500/5 border-amber-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Calls Needed</h3>
                    <p className="text-muted-foreground">You have {metrics.callsNeeded} records that need insurance verification calls</p>
                  </div>
                  <Button variant="outline" className="border-amber-500/50 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950">
                    View Records
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Coverage Tab */}
        <TabsContent value="coverage" className="space-y-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Status</CardTitle>
              <CardDescription>Insurance coverage status distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : coverageStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={coverageStatusData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'var(--background)', 
                        borderColor: 'var(--border)',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Count" fill="#00C49F" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <p className="text-muted-foreground">No coverage status data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Deductible Analysis</CardTitle>
              <CardDescription>Distribution of deductible amounts</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={
                      data
                        .filter(record => record.deductible !== undefined && record.deductible !== null)
                        .map(record => ({
                          name: record.insurance_company || 'Unknown',
                          value: record.deductible
                        }))
                        .sort((a, b) => Number(a.value ?? 0) - Number(b.value ?? 0))
                        .map((item, index) => ({ ...item, id: index }))
                    }
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" label={{ value: 'Patient Records', position: 'insideBottomRight', offset: -10 }} />
                    <YAxis label={{ value: 'Deductible ($)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      formatter={(value) => [`$${value}`, 'Deductible']}
                      labelFormatter={(value) => `Record ${value}`}
                      contentStyle={{ 
                        backgroundColor: 'var(--background)', 
                        borderColor: 'var(--border)',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Line type="monotone" dataKey="value" name="Deductible" stroke="#FF8042" dot={{ r: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <p className="text-muted-foreground">No deductible data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}