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
import {
  Clock,
  TrendingUp,
  Target,
  BarChart3,
  Filter,
  Calendar,
  RefreshCw,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";

const COLORS = [
  "#4CAF50", // Replace hsl(var(--chart-1)) with a visible color
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const TimeTrackingDashboard = () => {
  const [metrics, setMetrics] = useState({
    utilized: 92.88,
    estimated: 128.28,
    billable: 54.27,
    nonbillable: 38.6,
    completionRate: 55,
    activeProjects: 20,
  });

  const [selectedProject, setSelectedProject] = useState("all");
  const [loading, setLoading] = useState(false);
  const [projects] = useState([
    { id: 1, name: "Project Alpha" },
    { id: 2, name: "Project Beta" },
    { id: 3, name: "Project Gamma" },
  ]);

  const [projectStats, setProjectStats] = useState([
    { name: "Active", value: 20, color: COLORS[0] },
    { name: "Completed", value: 8, color: COLORS[1] },
    { name: "On Hold", value: 2, color: COLORS[2] },
    { name: "Cancelled", value: 0, color: COLORS[3] },
  ]);

  useEffect(() => {
    fetchData();
  }, [selectedProject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projectResponse = await axiosInstance.get("/api/v1/project");
      console.log("Fetched projects:", projectResponse.data.projects);

      // Filter projects by selectedProject if not "all"
      const filteredProjects =
        selectedProject === "all"
          ? projectResponse.data.projects
          : projectResponse.data.projects.filter(
              (project) => project.name === selectedProject
            );

      // Aggregate projects by status
      const statusCounts = filteredProjects.reduce(
        (acc, project) => {
          const status = project.status || "Unknown";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        { Active: 0, Completed: 0, "On Hold": 0, Cancelled: 0 }
      );

      // Calculate total projects and completion rate
      const totalProjects = Object.values(statusCounts).reduce(
        (sum, count) => sum + count,
        0
      );
      const completionRate =
        totalProjects > 0
          ? (statusCounts["Completed"] / totalProjects) * 100
          : 0;

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
        completionRate: completionRate.toFixed(2), // Round to 2 decimal places
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

  const projectData = [
    { name: "Project_2", percentage: 21.77, color: COLORS[0] },
    { name: "Project_3", percentage: 19.35, color: COLORS[1] },
    { name: "Project_4", percentage: 19.35, color: COLORS[2] },
    { name: "Project_5", percentage: 21.77, color: COLORS[3] },
    { name: "Project_6", percentage: 17.76, color: COLORS[4] },
  ];

  const taskData = [
    { project: "Project_1", planned: 8, completed: 6 },
    { project: "Project_2", planned: 26, completed: 15 },
    { project: "Project_3", planned: 22, completed: 12 },
    { project: "Project_4", planned: 24, completed: 14 },
    { project: "Project_5", planned: 26, completed: 13 },
    { project: "Project_6", planned: 24, completed: 10 },
    { project: "Project_7", planned: 20, completed: 9 },
  ];

  const utilizationData = [
    { purpose: "Work", hours: 87.29, percentage: 65 },
    { purpose: "Project Plan", hours: 91.18, percentage: 68 },
    { purpose: "Meeting", hours: 75.5, percentage: 56 },
    { purpose: "Project Research", hours: 89.26, percentage: 66 },
    { purpose: "Report", hours: 95.4, percentage: 71 },
  ];

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      if (selectedProject === "all") {
        setMetrics((prev) => ({
          ...prev,
          utilized: 92.88,
          estimated: 128.28,
          billable: 54.27,
          nonbillable: 38.6,
        }));
      } else {
        const projectMultiplier = Math.random() * 0.5 + 0.5;
        setMetrics((prev) => ({
          ...prev,
          utilized: Math.round(92.88 * projectMultiplier * 100) / 100,
          estimated: Math.round(128.28 * projectMultiplier * 100) / 100,
          billable: Math.round(54.27 * projectMultiplier * 100) / 100,
          nonbillable: Math.round(38.6 * projectMultiplier * 100) / 100,
        }));
      }
      setLoading(false);
    }, 1000);
  }, [selectedProject]);

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Time Tracking Dashboard</h2>
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.name}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLoading(true)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 border-chart-1/20 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Time (Hours)</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-chart-1">
                    {metrics.utilized}
                  </p>
                  <p className="text-xs text-muted-foreground">Utilized</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-chart-5">
                    {metrics.estimated}
                  </p>
                  <p className="text-xs text-muted-foreground">Estimated</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-2xl font-bold text-chart-2">
                    {metrics.billable}
                  </p>
                  <p className="text-xs text-muted-foreground">Billable</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-chart-3">
                    {metrics.nonbillable}
                  </p>
                  <p className="text-xs text-muted-foreground">Nonbillable</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 border-chart-2/20 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Project Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="relative">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie
                      data={[
                        { value: metrics.completionRate, color: COLORS[0] },
                        {
                          value: 100 - metrics.completionRate,
                          color: "hsl(var(--muted))",
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={50}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      {[0, 1].map((index) => (
                        <Cell
                          key={index}
                          fill={index === 0 && "#4CAF50"}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">
                    {metrics.completionRate}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 border-chart-3/20 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Top 5 Projects Based on Completed Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectData}
                    cx="50%"
                    cy="50%"
                    outerRadius={50}
                    dataKey="percentage"
                  >
                    {projectData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Completion"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-4">
              {projectData.map((project, index) => (
                <div
                  key={project.name}
                  className="flex items-center gap-2 text-xs"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: project.color }}
                  ></div>
                  <span>{project.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-4/5 to-chart-4/10 border-chart-4/20 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Task Cycle Time</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-2">
              <p className="text-3xl font-bold text-chart-4">
                {metrics.utilized}
              </p>
              <p className="text-sm text-muted-foreground">Hour(s)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Planned vs Completed Tasks */}
        <Card className="bg-gradient-to-br from-chart-5/5 to-chart-5/10 border-chart-5/20 shadow-lg">
          <CardHeader>
            <CardTitle>Planned vs. Completed Tasks by Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="project"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="planned"
                    fill="hsl(var(--chart-4))"
                    name="Planned Tasks"
                  />
                  <Bar
                    dataKey="completed"
                    fill="hsl(var(--chart-2))"
                    name="Completed Tasks"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Utilized Hours by Purpose */}
        <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 border-chart-1/20 shadow-lg">
          <CardHeader>
            <CardTitle>Utilized Hours by Purpose</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {utilizationData.map((item, index) => (
                <div key={item.purpose} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.purpose}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.hours} Hour(s)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-chart-1 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">0</span>
                </div>
                <div>
                  <span className="text-muted-foreground">100</span>
                </div>
                <div>
                  <span className="text-muted-foreground">150</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeTrackingDashboard;
