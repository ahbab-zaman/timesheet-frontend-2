import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
} from "recharts";
import {
  Calendar as CalendarIcon,
  Clock,
  TrendingUp,
  Users,
  Target,
  CheckCircle,
  AlertCircle,
  BarChart3,
  DollarSign,
  Settings,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";
import axiosInstance from "../services/axiosInstance";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const [metrics, setMetrics] = useState({
    totalEmployees: 50,
    activeEmployees: 45,
    totalProjects: 30,
    activeProjects: 20,
    totalHoursThisMonth: 3200,
    averageDailyHours: 6.5,
    approvedTimesheets: 180,
    pendingTimesheets: 20,
    totalRevenue: 125000,
    billableHours: 2560,
    employeeUtilization: 85,
    clientSatisfaction: 4.5,
    avgTurnaroundTime: 8.2,
  });

  const [projectStats, setProjectStats] = useState([
    { name: "Active", value: 20, color: COLORS[0] },
    { name: "Completed", value: 8, color: COLORS[1] },
    { name: "On Hold", value: 2, color: COLORS[2] },
    { name: "Cancelled", value: 0, color: COLORS[3] }, // Added Cancelled with initial value 0
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projectResponse = await axiosInstance.get("/api/v1/project");
      console.log("Fetched projects:", projectResponse.data.projects);

      // Aggregate projects by status
      const statusCounts = projectResponse.data.projects.reduce(
        (acc, project) => {
          const status = project.status || "Unknown";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        { Active: 0, Completed: 0, "On Hold": 0, Cancelled: 0 } // Initialize all statuses
      );

      // Transform aggregated data into projectStats format
      const transformedProjects = Object.entries(statusCounts).map(
        ([status, count], index) => ({
          name: status,
          value: count,
          color: COLORS[index % COLORS.length],
        })
      );

      setProjectStats(transformedProjects);
      setMetrics((prev) => ({
        ...prev,
        activeProjects: statusCounts["Active"] || 0,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [topEmployees, setTopEmployees] = useState([
    { name: "John Doe", hours: 160, utilization: 95 },
    { name: "Jane Smith", hours: 145, utilization: 90 },
    { name: "Bob Johnson", hours: 130, utilization: 85 },
  ]);

  const [monthlyStats, setMonthlyStats] = useState([
    { month: "Jul", revenue: 110000, hours: 2800 },
    { month: "Aug", revenue: 125000, hours: 3200 },
    { month: "Sep", revenue: 115000, hours: 3000 },
  ]);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [dateRange]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Row - Main Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timesheets Section */}
        <Card className="bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-chart-1" />
              Timesheets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range Selector */}
            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {format(dateRange.from, "MMM dd")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => {
                        if (date) {
                          setDateRange((prev) => ({ ...prev, from: date }));
                        }
                      }}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-sm text-muted-foreground self-center">
                  to
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {format(dateRange.to, "MMM dd")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => {
                        if (date) {
                          setDateRange((prev) => ({ ...prev, to: date }));
                        }
                      }}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs text-center mb-4">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                <div key={day} className="text-muted-foreground">
                  {day}
                </div>
              ))}
              {[...Array(31)].map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded text-xs flex items-center justify-center
                     ${
                       i < new Date().getDate()
                         ? "bg-chart-2/30 text-chart-2 font-medium"
                         : "text-muted-foreground"
                     }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-1">
                  {metrics.totalHoursThisMonth}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total hours logged
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-2">
                  {metrics.averageDailyHours}
                </div>
                <div className="text-sm text-muted-foreground">
                  Average daily hours
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Badge
                variant={
                  metrics.approvedTimesheets > 0 ? "default" : "secondary"
                }
              >
                {metrics.approvedTimesheets} Approved
              </Badge>
              <Badge
                variant={
                  metrics.pendingTimesheets > 5 ? "destructive" : "outline"
                }
              >
                {metrics.pendingTimesheets} Pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-chart-3" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-32 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStats.filter((item) => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={50}
                    dataKey="value"
                  >
                    {projectStats
                      .filter((item) => item.value > 0)
                      .map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-1"></div>
                  <span>Active</span>
                </div>
                <span className="font-medium">{metrics.activeProjects}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                  <span>Completed</span>
                </div>
                <span className="font-medium">
                  {projectStats.find((p) => p.name === "Completed")?.value || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-3"></div>
                  <span>On Hold</span>
                </div>
                <span className="font-medium">
                  {projectStats.find((p) => p.name === "On Hold")?.value || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-4"></div>
                  <span>Cancelled</span>
                </div>
                <span className="font-medium">
                  {projectStats.find((p) => p.name === "Cancelled")?.value || 0}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t">
              <div className="text-sm text-muted-foreground mb-2">
                High priority projects
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Project A</span>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-chart-4 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Project B</span>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-chart-1 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Project C</span>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-chart-2 rounded-full"></div>
                  </div>
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                className="w-full mt-3 text-chart-3"
              >
                View Projects
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assignments Section */}
        <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-chart-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-chart-1/20 rounded-lg p-3 border border-chart-1/30">
                <div className="text-sm text-muted-foreground">Utilization</div>
                <div className="text-xl font-bold text-chart-1">
                  {metrics.employeeUtilization}%
                </div>
              </div>
              <div className="bg-chart-2/20 rounded-lg p-3 border border-chart-2/30">
                <div className="text-sm text-muted-foreground">Avg. Rating</div>
                <div className="text-xl font-bold text-chart-2">
                  {metrics.clientSatisfaction}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Employee Utilization</span>
                <Progress
                  value={metrics.employeeUtilization}
                  className="w-20 h-2"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Billable Hours</span>
                <span className="text-sm font-medium">
                  {metrics.billableHours}h
                </span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-2">
                Monthly Revenue
              </div>
              <div className="text-2xl font-bold text-chart-4">
                ${metrics.totalRevenue}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employees Section */}
        <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 border-chart-2/20 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-chart-2" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {metrics.activeEmployees}
              </div>
              <div className="text-sm text-muted-foreground">
                Active employees
              </div>
            </div>
            <div className="space-y-3">
              {topEmployees.length > 0 ? (
                topEmployees.map((emp, index) => (
                  <div
                    key={emp.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-chart-2/20 rounded-full flex items-center justify-center text-xs font-medium text-chart-2 border border-chart-2/30">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{emp.name}</span>
                        <div className="text-xs text-muted-foreground">
                          {emp.hours.toFixed(1)}h
                        </div>
                      </div>
                    </div>
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div
                        className="bg-chart-2 h-2 rounded-full"
                        style={{ width: `${Math.min(emp.utilization, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Section */}
        <Card className="bg-gradient-to-br from-chart-5/5 to-chart-5/10 border-chart-5/20 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-chart-5" />
              Revenue Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-5">
                  ${metrics.totalRevenue}
                </div>
                <div className="text-xs text-muted-foreground">This month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-4">
                  {metrics.billableHours}
                </div>
                <div className="text-xs text-muted-foreground">
                  Billable hours
                </div>
              </div>
            </div>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStats}>
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--chart-5))"
                    radius={[2, 2, 0, 0]}
                  />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              {monthlyStats.map((stat, index) => (
                <div key={stat.month}>
                  <div className="font-medium">{stat.month}</div>
                  <div className="text-muted-foreground">
                    ${(stat.revenue / 1000).toFixed(0)}k
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admin Tools Section */}
        <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 border-chart-1/20 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5 text-chart-1" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Approve timesheets
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <Target className="h-4 w-4 mr-2" />
                Assign projects
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate reports
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Process payroll
              </Button>
            </div>
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-green-600">
                    {metrics.approvedTimesheets}
                  </div>
                  <div className="text-muted-foreground">Approved</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-amber-600">
                    {metrics.pendingTimesheets}
                  </div>
                  <div className="text-muted-foreground">Pending</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
