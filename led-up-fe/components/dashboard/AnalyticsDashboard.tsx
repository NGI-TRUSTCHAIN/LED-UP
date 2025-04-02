'use client';

/**
 * AnalyticsDashboard.tsx
 *
 * Component for displaying healthcare analytics and visualizations
 * to help doctors track patient outcomes and practice metrics.
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Note: In a real project, you would need to install recharts:
// npm install recharts @types/recharts
// or
// yarn add recharts @types/recharts
// For now, we'll use type any to avoid the linter errors
type RechartsComponentProps = any;

// Mock components to simulate recharts functionality
// In a real project, you would import these from 'recharts'
const BarChart = (props: RechartsComponentProps) => <div>{props.children}</div>;
const Bar = (props: RechartsComponentProps) => <div />;
const LineChart = (props: RechartsComponentProps) => <div>{props.children}</div>;
const Line = (props: RechartsComponentProps) => <div />;
const PieChart = (props: RechartsComponentProps) => <div>{props.children}</div>;
const Pie = (props: RechartsComponentProps) => <div>{props.children}</div>;
const Cell = (props: RechartsComponentProps) => <div />;
const XAxis = (props: RechartsComponentProps) => <div />;
const YAxis = (props: RechartsComponentProps) => <div />;
const CartesianGrid = (props: RechartsComponentProps) => <div />;
const Tooltip = (props: RechartsComponentProps) => <div />;
const Legend = (props: RechartsComponentProps) => <div />;
const ResponsiveContainer = (props: RechartsComponentProps) => <div>{props.children}</div>;

// Mock data for patient demographics
const demographicsData = [
  { name: '0-17', value: 42 },
  { name: '18-34', value: 78 },
  { name: '35-50', value: 95 },
  { name: '51-65', value: 87 },
  { name: '65+', value: 55 },
];

// Mock data for diagnoses distribution
const diagnosesData = [
  { name: 'Hypertension', value: 65 },
  { name: 'Diabetes', value: 45 },
  { name: 'Anxiety/Depression', value: 38 },
  { name: 'Asthma', value: 30 },
  { name: 'Arthritis', value: 25 },
  { name: 'Other', value: 55 },
];

// Mock data for monthly patient visits
const patientVisitsData = [
  { month: 'Jan', visits: 120 },
  { month: 'Feb', visits: 135 },
  { month: 'Mar', visits: 142 },
  { month: 'Apr', visits: 125 },
  { month: 'May', visits: 150 },
  { month: 'Jun', visits: 165 },
  { month: 'Jul', visits: 170 },
  { month: 'Aug', visits: 155 },
  { month: 'Sep', visits: 180 },
  { month: 'Oct', visits: 190 },
  { month: 'Nov', visits: 175 },
  { month: 'Dec', visits: 160 },
];

// Mock data for patient outcomes
const patientOutcomesData = [
  { month: 'Jan', improved: 65, stable: 45, worsened: 10 },
  { month: 'Feb', improved: 70, stable: 50, worsened: 15 },
  { month: 'Mar', improved: 75, stable: 55, worsened: 12 },
  { month: 'Apr', improved: 68, stable: 48, worsened: 9 },
  { month: 'May', improved: 80, stable: 60, worsened: 10 },
  { month: 'Jun', improved: 85, stable: 65, worsened: 15 },
  { month: 'Jul', improved: 90, stable: 70, worsened: 10 },
  { month: 'Aug', improved: 82, stable: 63, worsened: 10 },
  { month: 'Sep', improved: 95, stable: 75, worsened: 10 },
  { month: 'Oct', improved: 100, stable: 80, worsened: 10 },
  { month: 'Nov', improved: 92, stable: 73, worsened: 10 },
  { month: 'Dec', improved: 85, stable: 65, worsened: 10 },
];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Type definitions for chart label props
interface PieLabelProps {
  name: string;
  percent: number;
}

// Type definition for tooltip formatter
type TooltipFormatterFunc = (value: number) => [string, string];

/**
 * AnalyticsDashboard component
 *
 * Displays various charts and metrics to help doctors analyze
 * patient data and practice performance.
 */
const AnalyticsDashboard: React.FC = () => {
  // Label formatter for pie charts
  const pieLabelFormatter = ({ name, percent }: PieLabelProps): string => `${name}: ${(percent * 100).toFixed(0)}%`;

  // Tooltip formatter for pie charts
  const tooltipFormatter: TooltipFormatterFunc = (value) => [`${value} patients`, 'Count'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Visualize patient data and practice metrics to improve care outcomes</p>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">357</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Visits per Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2</div>
            <p className="text-xs text-muted-foreground mt-1">+0.3 from last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground mt-1">+5% from last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Treatment Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground mt-1">+2% from last quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Patient Visits</CardTitle>
                <CardDescription>Number of patient visits per month over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={patientVisitsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="visits" fill="#8884d8" name="Patient Visits" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Outcomes</CardTitle>
                <CardDescription>Monthly breakdown of patient outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={patientOutcomesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="improved" stroke="#00C49F" name="Improved" />
                      <Line type="monotone" dataKey="stable" stroke="#0088FE" name="Stable" />
                      <Line type="monotone" dataKey="worsened" stroke="#FF8042" name="Worsened" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demographics tab */}
        <TabsContent value="demographics">
          <Card>
            <CardHeader>
              <CardTitle>Patient Age Distribution</CardTitle>
              <CardDescription>Breakdown of patients by age group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicsData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={pieLabelFormatter}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {demographicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={tooltipFormatter} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diagnoses tab */}
        <TabsContent value="diagnoses">
          <Card>
            <CardHeader>
              <CardTitle>Common Diagnoses</CardTitle>
              <CardDescription>Distribution of diagnoses across patient population</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diagnosesData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={pieLabelFormatter}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {diagnosesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={tooltipFormatter} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outcomes tab */}
        <TabsContent value="outcomes">
          <Card>
            <CardHeader>
              <CardTitle>Patient Outcomes Over Time</CardTitle>
              <CardDescription>Tracking patient improvement metrics over the past year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patientOutcomesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="improved" stroke="#00C49F" name="Improved" strokeWidth={2} />
                    <Line type="monotone" dataKey="stable" stroke="#0088FE" name="Stable" strokeWidth={2} />
                    <Line type="monotone" dataKey="worsened" stroke="#FF8042" name="Worsened" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
