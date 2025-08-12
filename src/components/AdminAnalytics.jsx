import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Target,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalEmployees: 0,
    activeProjects: 0,
    totalHours: 0,
    totalRevenue: 0,
    averageHourlyRate: 0,
    productivityScore: 0,
    unapprovedHours: 0,
    overdueTimesheets: 0,
  });

  const [projectData, setProjectData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [activityLevels, setActivityLevels] = useState([]);
  const [hourlyBreakdown, setHourlyBreakdown] = useState({
    billable: 0,
    nonBillable: 0,
    overhead: 0,
  });

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const [projectFilter, setProjectFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [viewMode, setViewMode] = useState("overview");

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, projectFilter, departmentFilter]);

  const fetchAnalyticsData = () => {
    setLoading(true);

    const now = new Date();
    const dummyEmployees = [
      {
        id: "1",
        name: "John Doe",
        department: "Engineering",
        hourly_rate: 50,
        status: "active",
      },
      {
        id: "2",
        name: "Jane Smith",
        department: "Marketing",
        hourly_rate: 40,
        status: "active",
      },
      {
        id: "3",
        name: "Bob Johnson",
        department: "Sales",
        hourly_rate: 45,
        status: "active",
      },
    ];

    const dummyProjects = [
      { id: "p1", name: "Website Redesign", status: "active" },
      { id: "p2", name: "Mobile App", status: "active" },
      { id: "p3", name: "Marketing Campaign", status: "active" },
    ];

    const dummyTimesheets = [
      {
        employee_id: "1",
        submitted_at: subDays(now, 1).toISOString(),
        status: "approved",
        total_hours: 40,
        time_entries: [
          {
            hours: 8,
            billable: true,
            date: subDays(now, 1).toISOString(),
            description: "Coding",
            task: { project_id: "p1" },
          },
          {
            hours: 8,
            billable: true,
            date: subDays(now, 2).toISOString(),
            description: "Coding",
            task: { project_id: "p1" },
          },
          {
            hours: 8,
            billable: false,
            date: subDays(now, 3).toISOString(),
            description: "Meeting",
            task: { project_id: "p1" },
          },
          {
            hours: 8,
            billable: true,
            date: subDays(now, 4).toISOString(),
            description: "Coding",
            task: { project_id: "p1" },
          },
          {
            hours: 8,
            billable: true,
            date: subDays(now, 5).toISOString(),
            description: "Review",
            task: { project_id: "p1" },
          },
        ],
        employees: dummyEmployees[0],
      },
      {
        employee_id: "2",
        submitted_at: subDays(now, 1).toISOString(),
        status: "submitted",
        total_hours: 35,
        time_entries: [
          {
            hours: 7,
            billable: false,
            date: subDays(now, 1).toISOString(),
            description: "Design",
            task: { project_id: "p2" },
          },
          {
            hours: 7,
            billable: true,
            date: subDays(now, 2).toISOString(),
            description: "Design",
            task: { project_id: "p2" },
          },
          {
            hours: 7,
            billable: true,
            date: subDays(now, 3).toISOString(),
            description: "Meeting",
            task: { project_id: "p2" },
          },
          {
            hours: 7,
            billable: false,
            date: subDays(now, 4).toISOString(),
            description: "Research",
            task: { project_id: "p2" },
          },
          {
            hours: 7,
            billable: true,
            date: subDays(now, 5).toISOString(),
            description: "Design",
            task: { project_id: "p2" },
          },
        ],
        employees: dummyEmployees[1],
      },
      {
        employee_id: "3",
        submitted_at: subDays(now, 8).toISOString(),
        status: "submitted",
        total_hours: 30,
        time_entries: [
          {
            hours: 6,
            billable: true,
            date: subDays(now, 8).toISOString(),
            description: "Sales call",
            task: { project_id: "p3" },
          },
          {
            hours: 6,
            billable: true,
            date: subDays(now, 7).toISOString(),
            description: "Admin",
            task: { project_id: "p3" },
          },
          {
            hours: 6,
            billable: false,
            date: subDays(now, 6).toISOString(),
            description: "Meeting",
            task: { project_id: "p3" },
          },
          {
            hours: 6,
            billable: true,
            date: subDays(now, 5).toISOString(),
            description: "Sales call",
            task: { project_id: "p3" },
          },
          {
            hours: 6,
            billable: true,
            date: subDays(now, 4).toISOString(),
            description: "Follow up",
            task: { project_id: "p3" },
          },
        ],
        employees: dummyEmployees[2],
      },
    ];

    const dummyRates = dummyEmployees.map((e) => ({
      hourly_rate: e.hourly_rate,
    }));

    const employees = dummyEmployees;
    const projects = dummyProjects;
    const timesheets = dummyTimesheets;
    const rates = dummyRates;

    const totalHours = timesheets.reduce(
      (sum, ts) =>
        sum +
        (ts.time_entries?.reduce(
          (entrySum, entry) => entrySum + entry.hours,
          0
        ) || 0),
      0
    );

    const totalRevenue = timesheets.reduce((sum, ts) => {
      const employeeRate = ts.employees?.hourly_rate || 0;
      const hours =
        ts.time_entries?.reduce(
          (entrySum, entry) => entrySum + entry.hours,
          0
        ) || 0;
      return sum + hours * employeeRate;
    }, 0);

    const averageRate =
      rates.length > 0
        ? rates.reduce((sum, rate) => sum + rate.hourly_rate, 0) / rates.length
        : 0;

    const unapprovedHours = timesheets
      .filter((ts) => ts.status === "submitted")
      .reduce((sum, ts) => sum + ts.total_hours, 0);

    const overdueTimesheets = timesheets.filter((ts) => {
      const submittedDate = new Date(ts.submitted_at);
      const daysDiff =
        (new Date().getTime() - submittedDate.getTime()) / (1000 * 3600 * 24);
      return ts.status === "submitted" && daysDiff > 7;
    }).length;

    setAnalyticsData({
      totalEmployees: employees.length,
      activeProjects: projects.length,
      totalHours,
      totalRevenue,
      averageHourlyRate: averageRate,
      productivityScore: Math.round(
        (totalHours / (employees.length * parseInt(dateRange) * 8)) * 100
      ),
      unapprovedHours,
      overdueTimesheets,
    });

    prepareChartData(timesheets, projects, employees);
    calculateActivityLevels(timesheets);
    calculateHourlyBreakdown(timesheets);

    setLoading(false);
  };

  const prepareChartData = (timesheets, projects, employees) => {
    const projectBreakdown = projects.map((project) => {
      const projectTimesheets = timesheets.filter((ts) =>
        ts.time_entries?.some((entry) => entry.task?.project_id === project.id)
      );
      const projectHours = projectTimesheets.reduce(
        (sum, ts) => sum + ts.total_hours,
        0
      );
      const projectRevenue = projectTimesheets.reduce((sum, ts) => {
        const employeeRate = ts.employees?.hourly_rate || 0;
        return sum + ts.total_hours * employeeRate;
      }, 0);

      return {
        name: project.name,
        value: projectHours,
        hours: projectHours,
        revenue: projectRevenue,
      };
    });

    setProjectData(projectBreakdown);

    const employeePerformance = employees.map((employee) => {
      const employeeTimesheets = timesheets.filter(
        (ts) => ts.employee_id === employee.id
      );
      const employeeHours = employeeTimesheets.reduce(
        (sum, ts) => sum + ts.total_hours,
        0
      );
      const expectedHours = parseInt(dateRange) * 8;
      const efficiency = Math.round((employeeHours / expectedHours) * 100);

      return {
        name: employee.name,
        value: employeeHours,
        efficiency: Math.min(efficiency, 100),
      };
    });

    setEmployeeData(
      employeePerformance.sort((a, b) => b.value - a.value).slice(0, 10)
    );

    const timeline = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayTimesheets = timesheets.filter((ts) => {
        return ts.time_entries?.some(
          (entry) =>
            format(new Date(entry.date), "yyyy-MM-dd") ===
            format(date, "yyyy-MM-dd")
        );
      });

      const dayHours = dayTimesheets.reduce((sum, ts) => {
        return (
          sum +
          (ts.time_entries?.reduce((entrySum, entry) => {
            return format(new Date(entry.date), "yyyy-MM-dd") ===
              format(date, "yyyy-MM-dd")
              ? entrySum + entry.hours
              : entrySum;
          }, 0) || 0)
        );
      }, 0);

      timeline.push({
        name: format(date, "MMM dd"),
        value: dayHours,
        hours: dayHours,
      });
    }

    setTimelineData(timeline);
  };

  const calculateActivityLevels = (timesheets) => {
    const activityMap = new Map();

    timesheets.forEach((ts) => {
      if (!activityMap.has(ts.employee_id)) {
        activityMap.set(ts.employee_id, {
          employee_id: ts.employee_id,
          employee_name: ts.employees?.name || "Unknown",
          total_hours: 0,
          active_days: new Set(),
          last_activity: ts.submitted_at,
        });
      }

      const activity = activityMap.get(ts.employee_id);
      activity.total_hours += ts.total_hours;

      ts.time_entries?.forEach((entry) => {
        activity.active_days.add(format(new Date(entry.date), "yyyy-MM-dd"));
      });

      if (new Date(ts.submitted_at) > new Date(activity.last_activity)) {
        activity.last_activity = ts.submitted_at;
      }
    });

    const activities = Array.from(activityMap.values()).map((activity) => ({
      ...activity,
      active_days: activity.active_days.size,
      productivity_score: Math.round(
        (activity.total_hours / (activity.active_days * 8)) * 100
      ),
    }));

    setActivityLevels(
      activities.sort((a, b) => b.productivity_score - a.productivity_score)
    );
  };

  const calculateHourlyBreakdown = (timesheets) => {
    let billable = 0;
    let nonBillable = 0;
    let overhead = 0;

    timesheets.forEach((ts) => {
      ts.time_entries?.forEach((entry) => {
        if (entry.billable) {
          billable += entry.hours;
        } else {
          const description = (entry.description || "").toLowerCase();
          if (
            description.includes("meeting") ||
            description.includes("admin") ||
            description.includes("overhead")
          ) {
            overhead += entry.hours;
          } else {
            nonBillable += entry.hours;
          }
        }
      });
    });

    setHourlyBreakdown({ billable, nonBillable, overhead });
  };

  const exportReport = (format) => {
    try {
      const reportData = {
        analytics: analyticsData,
        projects: projectData,
        employees: employeeData,
        timeline: timelineData,
        activities: activityLevels,
        dateRange,
        filters: { project: projectFilter, department: departmentFilter },
      };

      if (format === "csv") {
        let csv = "Metric,Value\n";
        for (let key in analyticsData) {
          csv += `${key},${analyticsData[key]}\n`;
        }
        csv += "\nProjects\nName,Hours,Revenue\n";
        projectData.forEach((p) => {
          csv += `${p.name},${p.hours},${p.revenue}\n`;
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics_report_${format}_${
          new Date().toISOString().split("T")[0]
        }.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Report exported",
          description: `Analytics report exported as ${format.toUpperCase()}`,
        });
      } else {
        toast({
          title: "PDF export",
          description: "PDF export not implemented in dummy mode",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getActivityBadge = (score) => {
    if (score >= 80)
      return (
        <Badge variant="default" className="bg-green-500">
          High
        </Badge>
      );
    if (score >= 60) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="destructive">Low</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const pieChartData = [
    { name: "Billable", value: hourlyBreakdown.billable },
    { name: "Non-billable", value: hourlyBreakdown.nonBillable },
    { name: "Overhead", value: hourlyBreakdown.overhead },
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "overview" ? "default" : "outline"}
            onClick={() => setViewMode("overview")}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={viewMode === "projects" ? "default" : "outline"}
            onClick={() => setViewMode("projects")}
          >
            <Target className="h-4 w-4 mr-2" />
            Projects
          </Button>
          <Button
            variant={viewMode === "employees" ? "default" : "outline"}
            onClick={() => setViewMode("employees")}
          >
            <Users className="h-4 w-4 mr-2" />
            Employees
          </Button>
          <Button
            variant={viewMode === "activity" ? "default" : "outline"}
            onClick={() => setViewMode("activity")}
          >
            <Clock className="h-4 w-4 mr-2" />
            Activity
          </Button>
        </div>

        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => exportReport("csv")}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            onClick={() => exportReport("pdf")}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Overview Dashboard */}
      {viewMode === "overview" && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Employees
                    </p>
                    <p className="text-2xl font-bold">
                      {analyticsData.totalEmployees}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Hours
                    </p>
                    <p className="text-2xl font-bold">
                      {analyticsData.totalHours}h
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold">
                      ${analyticsData.totalRevenue.toFixed(0)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Productivity
                    </p>
                    <p className="text-2xl font-bold">
                      {analyticsData.productivityScore}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={
                analyticsData.unapprovedHours > 0
                  ? "border-yellow-200 bg-yellow-50"
                  : ""
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Unapproved Hours</p>
                    <p className="text-sm text-muted-foreground">
                      {analyticsData.unapprovedHours}h pending approval
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={
                analyticsData.overdueTimesheets > 0
                  ? "border-red-200 bg-red-50"
                  : ""
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">Overdue Timesheets</p>
                    <p className="text-sm text-muted-foreground">
                      {analyticsData.overdueTimesheets} timesheets overdue
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hours Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}h`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Hours Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Projects View */}
      {viewMode === "projects" && (
        <Card>
          <CardHeader>
            <CardTitle>Project Hours Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#8884d8" name="Hours" />
                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Employees View */}
      {viewMode === "employees" && (
        <Card>
          <CardHeader>
            <CardTitle>Top Employee Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={employeeData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Hours" />
                <Bar dataKey="efficiency" fill="#82ca9d" name="Efficiency %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Activity View */}
      {viewMode === "activity" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Activity Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLevels.map((activity) => (
                  <div
                    key={activity.employee_id}
                    className="flex items-center justify-between p-4 border rounded"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{activity.employee_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.total_hours}h total • {activity.active_days}{" "}
                          active days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getActivityBadge(activity.productivity_score)}
                      <span className="text-sm font-medium">
                        {activity.productivity_score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
