'use client';

/**
 * DashboardOverview.tsx
 *
 * Main overview component for the doctor dashboard that displays
 * key metrics, upcoming appointments, and recent patient activities.
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, TrendingUp, Users, FileText, AlertCircle, ChevronRight, User } from 'lucide-react';

/**
 * DashboardOverview component
 *
 * Displays a comprehensive overview of the doctor's practice including
 * key metrics, upcoming appointments, and recent patient activities.
 */
const DashboardOverview: React.FC = () => {
  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Patients',
      value: '248',
      change: '+12% from last month',
      icon: Users,
      trend: 'up',
    },
    {
      title: 'Appointments Today',
      value: '8',
      change: '2 remaining',
      icon: Calendar,
      trend: 'neutral',
    },
    {
      title: 'Medical Records',
      value: '1,024',
      change: '+64 this week',
      icon: FileText,
      trend: 'up',
    },
    {
      title: 'Critical Alerts',
      value: '3',
      change: 'Requires attention',
      icon: AlertCircle,
      trend: 'down',
    },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      patientName: 'Sarah Johnson',
      time: '10:30 AM',
      type: 'Follow-up',
      status: 'confirmed',
    },
    {
      id: 2,
      patientName: 'Michael Chen',
      time: '11:45 AM',
      type: 'New Patient',
      status: 'confirmed',
    },
    {
      id: 3,
      patientName: 'Emily Rodriguez',
      time: '2:15 PM',
      type: 'Consultation',
      status: 'pending',
    },
    {
      id: 4,
      patientName: 'David Wilson',
      time: '3:30 PM',
      type: 'Follow-up',
      status: 'confirmed',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      patientName: 'James Smith',
      action: 'Lab results uploaded',
      time: '35 minutes ago',
    },
    {
      id: 2,
      patientName: 'Lisa Brown',
      action: 'Prescription renewed',
      time: '2 hours ago',
    },
    {
      id: 3,
      patientName: 'Robert Taylor',
      action: 'Appointment rescheduled',
      time: '4 hours ago',
    },
    {
      id: 4,
      patientName: 'Maria Garcia',
      action: 'New medical record added',
      time: 'Yesterday',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Dr. Anderson. Here's an overview of your practice today.</p>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {stat.trend === 'up' && <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />}
                {stat.trend === 'down' && <TrendingUp className="mr-1 h-3 w-3 text-rose-500 rotate-180" />}
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for appointments and activities */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Today's Appointments</TabsTrigger>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
        </TabsList>

        {/* Appointments tab */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>
                You have {upcomingAppointments.length} appointments scheduled for today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-9 w-9">
                        <User className="h-5 w-5" />
                      </Avatar>
                      <div>
                        <div className="font-medium">{appointment.patientName}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3" /> {appointment.time} - {appointment.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Badge variant={appointment.status === 'confirmed' ? 'default' : 'outline'}>
                        {appointment.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Patient Activities</CardTitle>
              <CardDescription>Recent updates and activities related to your patients.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-9 w-9">
                        <User className="h-5 w-5" />
                      </Avatar>
                      <div>
                        <div className="font-medium">{activity.patientName}</div>
                        <div className="text-sm text-muted-foreground">{activity.action}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardOverview;
