import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { RotateCcw, Mail, RefreshCw, Clock, Calendar } from "lucide-react";

const APPROVAL_COLORS = {
  approved: "hsl(var(--chart-2))",
  unapproved: "hsl(var(--chart-3))",
  partial: "hsl(var(--chart-4))",
};

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const TimeTrackingReport = () => {
  const [timeEntries, setTimeEntries] = useState([
    {
      id: "1",
      employee_name: "John Doe",
      employee_id: "EMP001",
      branch: "KC - Tech",
      start_time: new Date(2025, 7, 10, 9, 0).toISOString(),
      end_time: new Date(2025, 7, 10, 17, 0).toISOString(),
      duration: 8,
      overtime_hours: 0,
      approval_status: "approved",
      note: "Completed project tasks",
      job_name: "Project Work",
      work_order_id: "TS-1",
      asset: "",
    },
    {
      id: "2",
      employee_name: "Jane Smith",
      employee_id: "EMP002",
      branch: "KC - Sales",
      start_time: new Date(2025, 7, 11, 8, 0).toISOString(),
      end_time: new Date(2025, 7, 11, 18, 0).toISOString(),
      duration: 10,
      overtime_hours: 2,
      approval_status: "partial",
      note: "Client meeting",
      job_name: "Client Presentation",
      work_order_id: "TS-2",
      asset: "",
    },
    {
      id: "3",
      employee_name: "Bob Johnson",
      employee_id: "EMP003",
      branch: "KC - Tech",
      start_time: new Date(2025, 7, 12, 9, 0).toISOString(),
      end_time: new Date(2025, 7, 12, 16, 0).toISOString(),
      duration: 7,
      overtime_hours: 0,
      approval_status: "unapproved",
      note: "",
      job_name: "Testing",
      work_order_id: "TS-3",
      asset: "",
    },
  ]);
  const [filteredEntries, setFilteredEntries] = useState(timeEntries);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    dateFilter: "last7days",
    branch: "any",
    groups: "any",
    name: "any",
    job: "any",
    approvalStatus: "any",
    durationSelection: "daily",
  });

  // Metrics
  const [totalRegularHours, setTotalRegularHours] = useState(0);
  const [totalOvertimeHours, setTotalOvertimeHours] = useState(0);
  const [approvalStats, setApprovalStats] = useState([]);
  const [dailyHours, setDailyHours] = useState([]);

  useEffect(() => {
    applyFilters();
  }, [filters, timeEntries]);

  useEffect(() => {
    calculateMetrics();
  }, [filteredEntries]);

  const applyFilters = () => {
    let filtered = [...timeEntries];

    // Apply date filter
    if (filters.dateFilter === "last7days") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(
        (entry) => new Date(entry.start_time) >= weekAgo
      );
    } else if (filters.dateFilter === "last30days") {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      filtered = filtered.filter(
        (entry) => new Date(entry.start_time) >= monthAgo
      );
    }

    // Apply branch filter
    if (filters.branch !== "any") {
      filtered = filtered.filter((entry) =>
        entry.branch.includes(filters.branch)
      );
    }

    // Apply name filter
    if (filters.name !== "any") {
      filtered = filtered.filter((entry) =>
        entry.employee_name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Apply job filter
    if (filters.job !== "any") {
      filtered = filtered.filter((entry) =>
        entry.job_name?.toLowerCase().includes(filters.job.toLowerCase())
      );
    }

    // Apply approval status filter
    if (filters.approvalStatus !== "any") {
      filtered = filtered.filter(
        (entry) => entry.approval_status === filters.approvalStatus
      );
    }

    setFilteredEntries(filtered);
  };

  const calculateMetrics = () => {
    const totalRegular = filteredEntries.reduce(
      (sum, entry) => sum + (entry.duration - entry.overtime_hours),
      0
    );
    const totalOvertime = filteredEntries.reduce(
      (sum, entry) => sum + entry.overtime_hours,
      0
    );

    setTotalRegularHours(totalRegular);
    setTotalOvertimeHours(totalOvertime);

    // Calculate approval stats
    const approvedCount = filteredEntries.filter(
      (e) => e.approval_status === "approved"
    ).length;
    const unapprovedCount = filteredEntries.filter(
      (e) => e.approval_status === "unapproved"
    ).length;
    const partialCount = filteredEntries.filter(
      (e) => e.approval_status === "partial"
    ).length;
    const total = filteredEntries.length;

    setApprovalStats([
      {
        name: "Approved",
        value: total > 0 ? (approvedCount / total) * 100 : 0,
        color: APPROVAL_COLORS.approved,
      },
      {
        name: "Unapproved",
        value: total > 0 ? (unapprovedCount / total) * 100 : 0,
        color: APPROVAL_COLORS.unapproved,
      },
      {
        name: "Partial",
        value: total > 0 ? (partialCount / total) * 100 : 0,
        color: APPROVAL_COLORS.partial,
      },
    ]);

    // Calculate daily hours for chart
    const dailyData = {};

    filteredEntries.forEach((entry) => {
      const date = new Date(entry.start_time).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = { regular: 0, overtime: 0 };
      }
      dailyData[date].regular += entry.duration - entry.overtime_hours;
      dailyData[date].overtime += entry.overtime_hours;
    });

    const chartData = Object.entries(dailyData).map(([date, hours]) => ({
      date,
      regularHours: hours.regular,
      overtimeHours: hours.overtime,
    }));

    setDailyHours(chartData);
  };

  const resetFilters = () => {
    setFilters({
      dateFilter: "last7days",
      branch: "any",
      groups: "any",
      name: "any",
      job: "any",
      approvalStatus: "any",
      durationSelection: "daily",
    });
  };

  const getApprovalBadgeVariant = (status) => {
    switch (status) {
      case "approved":
        return "default";
      case "unapproved":
        return "destructive";
      case "partial":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Time Tracking Report</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset filters
          </Button>
          <Button variant="outline" onClick={() => setLoading(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh data
          </Button>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Schedule delivery
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Date Filter *
              </label>
              <Select
                value={filters.dateFilter}
                onValueChange={(value) =>
                  setFilters({ ...filters, dateFilter: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">
                    is in the last 7 days
                  </SelectItem>
                  <SelectItem value="last30days">
                    is in the last 30 days
                  </SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Branch
              </label>
              <Select
                value={filters.branch}
                onValueChange={(value) =>
                  setFilters({ ...filters, branch: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">is any value</SelectItem>
                  <SelectItem value="KC - Tech">KC - Tech</SelectItem>
                  <SelectItem value="KC - Sales">KC - Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Groups
              </label>
              <Select
                value={filters.groups}
                onValueChange={(value) =>
                  setFilters({ ...filters, groups: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">is any value</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <Select
                value={filters.name}
                onValueChange={(value) =>
                  setFilters({ ...filters, name: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">is any value</SelectItem>
                  {[
                    ...new Set(timeEntries.map((entry) => entry.employee_name)),
                  ].map((name) => (
                    <SelectItem key={name} value={name.toLowerCase()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Job
              </label>
              <Select
                value={filters.job}
                onValueChange={(value) =>
                  setFilters({ ...filters, job: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">is any value</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Approval Status
              </label>
              <Select
                value={filters.approvalStatus}
                onValueChange={(value) =>
                  setFilters({ ...filters, approvalStatus: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">is any value</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="unapproved">Unapproved</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Duration Selection
              </label>
              <Select
                value={filters.durationSelection}
                onValueChange={(value) =>
                  setFilters({ ...filters, durationSelection: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" size="sm">
              More • 3
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>just now</span>
              <RefreshCw className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Hours Card */}
        <Card className="bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-chart-1">
                  {totalRegularHours.toFixed(1)} hrs.
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Regular Hours
                </p>
              </div>
              <div>
                <p className="text-xl text-chart-2">
                  {totalOvertimeHours.toFixed(1)} Total Overtime Hours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval Status Pie Chart */}
        <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-48">
              <div className="relative">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={approvalStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {approvalStats.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">100%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                <span>Total Approved Hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-chart-3"></div>
                <span>Total Unapproved Hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-chart-4"></div>
                <span>Total Partial Hours</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Hours Chart */}
        <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20 shadow-lg">
          <CardHeader>
            <CardTitle>Total Daily Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="regularHours"
                    stackId="a"
                    fill="hsl(var(--chart-1))"
                    name="Regular Hours"
                  />
                  <Bar
                    dataKey="overtimeHours"
                    stackId="a"
                    fill="hsl(var(--chart-5))"
                    name="Overtime Hours"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-1"></div>
                <span>Total Regular Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-5"></div>
                <span>Total Overtime Hours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Tracking Entry Details */}
      <Card className="bg-gradient-to-br from-chart-4/5 to-chart-4/10 border-chart-4/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-chart-4" />
            Time Tracking Entry Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Overtime Hours</TableHead>
                  <TableHead>Approval Status</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Job Name</TableHead>
                  <TableHead>Work Order ID</TableHead>
                  <TableHead>Asset</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry, index) => (
                  <TableRow key={entry.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {entry.employee_name}
                    </TableCell>
                    <TableCell>{entry.employee_id}</TableCell>
                    <TableCell>{entry.branch}</TableCell>
                    <TableCell>
                      {new Date(entry.start_time).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(entry.end_time).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div
                          className="h-2 rounded-full bg-chart-4"
                          style={{
                            width: `${Math.min(entry.duration * 10, 100)}px`,
                          }}
                        ></div>
                        <span className="text-sm">
                          {entry.duration.toFixed(1)} hrs
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.overtime_hours.toFixed(1)} hrs.
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getApprovalBadgeVariant(entry.approval_status)}
                      >
                        {entry.approval_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.note || "-"}</TableCell>
                    <TableCell>{entry.job_name || "No Job or Task"}</TableCell>
                    <TableCell>{entry.work_order_id || "-"}</TableCell>
                    <TableCell>{entry.asset || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackingReport;
