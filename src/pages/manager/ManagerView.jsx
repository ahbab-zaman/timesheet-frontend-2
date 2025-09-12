import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Clock,
  BarChart3,
  Filter,
  TrendingUp,
  Calendar,
  FileText,
  DollarSign,
  Search,
  Download,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfWeek, endOfWeek } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import axiosInstance from "../../services/axiosInstance";

const ManagerView = () => {
  const { toast } = useToast();
  const [timesheets, setTimesheets] = useState([]);
  const [teamProductivity, setTeamProductivity] = useState([]);
  const [projectSummaries, setProjectSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timesheets");
  const [filterProject, setFilterProject] = useState("all");
  const [filterFreelancer, setFilterFreelancer] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch timesheets
        await fetchTimesheets(isMounted);

        // Fetch projects
        const projectResponse = await axiosInstance.get("/api/v1/project");
        const projectData = projectResponse.data.projects || [];

        const formattedProjects = projectData.map((project) => ({
          project_id: project.id,
          project_name: project.name,
          client: project.client || "Unknown Client",
          freelancers_assigned: project.freelancers_assigned || 0,
          total_hours_logged: project.total_hours_logged || 0,
          budget_utilization: project.budget_utilization || 0,
          completion_percentage: project.completion_percentage || 0,
          status: project.status || "active",
        }));

        // Mock team productivity data
        const mockTeamProductivity = [
          {
            team_name: "Frontend Development",
            members_count: 5,
            total_hours: 180,
            completed_tasks: 42,
            productivity_score: 92,
            efficiency_rating: "excellent",
            key_metrics: {
              on_time_delivery: 95,
              quality_score: 88,
              client_satisfaction: 94,
            },
          },
          {
            team_name: "Backend Development",
            members_count: 4,
            total_hours: 150,
            completed_tasks: 38,
            productivity_score: 87,
            efficiency_rating: "good",
            key_metrics: {
              on_time_delivery: 90,
              quality_score: 85,
              client_satisfaction: 89,
            },
          },
          {
            team_name: "UI/UX Design",
            members_count: 3,
            total_hours: 105,
            completed_tasks: 25,
            productivity_score: 85,
            efficiency_rating: "good",
            key_metrics: {
              on_time_delivery: 88,
              quality_score: 92,
              client_satisfaction: 91,
            },
          },
          {
            team_name: "Quality Assurance",
            members_count: 2,
            total_hours: 70,
            completed_tasks: 18,
            productivity_score: 75,
            efficiency_rating: "needs_improvement",
            key_metrics: {
              on_time_delivery: 82,
              quality_score: 78,
              client_satisfaction: 85,
            },
          },
        ];

        if (isMounted) {
          setProjectSummaries(formattedProjects);
          setTeamProductivity(mockTeamProductivity);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching data:", error);
          toast({
            title: "Error",
            description: "Failed to load manager dashboard data",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchTimesheets = async (isMounted) => {
      try {
        const response = await axiosInstance.get(
          "/api/v1/time/timesheets/all",
          {
            params: {
              week_start: format(dateRange.start, "yyyy-MM-dd"),
              week_end: format(dateRange.end, "yyyy-MM-dd"),
              status: filter === "all" ? undefined : filter,
            },
          }
        );

        const allTimesheets = Array.isArray(response.data)
          ? response.data.map((timesheet) => ({
              id: timesheet.id,
              employee_id: timesheet.employee_id,
              employee_name: timesheet.employee?.name || "Unknown",
              project_name:
                timesheet.entries?.[0]?.project?.name || "Unknown Project",
              freelancer_type: timesheet.employee?.freelancer_type || "Unknown",
              week_start: timesheet.week_start_date,
              week_end: timesheet.week_end_date,
              total_hours: timesheet.total_hours || 0,
              status: timesheet.status,
              submitted_at: timesheet.submitted_at || null,
              project_details: {
                client:
                  timesheet.entries?.[0]?.project?.client || "Unknown Client",
                deadline: timesheet.entries?.[0]?.project?.deadline || null,
                priority: timesheet.entries?.[0]?.project?.priority || "low",
              },
              employees: {
                id:
                  timesheet.employee?.id || timesheet.employee_id || "Unknown",
                name: timesheet.employee?.name || "Unknown",
                email: timesheet.employee?.email || "Unknown",
              },
              entries: timesheet.entries || [],
            }))
          : [];

        if (isMounted) {
          setTimesheets(allTimesheets);
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to fetch timesheets. Please try again.");
          console.error("Error fetching timesheets:", error);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [dateRange, filter]);

  const filteredTimesheets = timesheets.filter((timesheet) => {
    const matchesProject =
      filterProject === "all" || timesheet.project_name === filterProject;
    const matchesFreelancer =
      filterFreelancer === "all" ||
      timesheet.freelancer_type === filterFreelancer;
    const matchesSearch =
      searchTerm === "" ||
      timesheet.employee_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      timesheet.project_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesProject && matchesFreelancer && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const variants = {
      submitted: { variant: "secondary", label: "🟡 Pending" },
      approved: { variant: "default", label: "✅ Approved" },
      rejected: { variant: "destructive", label: "🔴 Rejected" },
    };

    const config = variants[status] || variants.submitted;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      high: { variant: "destructive", label: "🔥 High" },
      medium: { variant: "secondary", label: "⚡ Medium" },
      low: { variant: "outline", label: "📌 Low" },
    };

    const config = variants[priority] || variants.low;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getEfficiencyBadge = (rating) => {
    const variants = {
      excellent: { variant: "default", label: "🌟 Excellent" },
      good: { variant: "secondary", label: "👍 Good" },
      needs_improvement: {
        variant: "destructive",
        label: "⚠️ Needs Improvement",
      },
    };

    const config = variants[rating] || variants.needs_improvement;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const exportData = (type) => {
    let csvContent = "";
    let filename = "";

    if (type === "timesheets") {
      csvContent =
        "Employee,Project,Freelancer Type,Hours,Status,Client,Priority\n";
      csvContent += filteredTimesheets
        .map(
          (t) =>
            `${t.employee_name},${t.project_name},${t.freelancer_type},${t.total_hours},${t.status},${t.project_details.client},${t.project_details.priority}`
        )
        .join("\n");
      filename = "timesheets_report.csv";
    } else if (type === "productivity") {
      csvContent =
        "Team,Members,Hours,Tasks,Score,Rating,On-Time,Quality,Satisfaction\n";
      csvContent += teamProductivity
        .map(
          (t) =>
            `${t.team_name},${t.members_count},${t.total_hours},${t.completed_tasks},${t.productivity_score},${t.efficiency_rating},${t.key_metrics.on_time_delivery},${t.key_metrics.quality_score},${t.key_metrics.client_satisfaction}`
        )
        .join("\n");
      filename = "team_productivity_report.csv";
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `${type} report exported successfully`,
    });
  };

  const handleDateSelect = (range) => {
    if (range) {
      setDateRange({
        start: startOfWeek(range, { weekStartsOn: 1 }),
        end: endOfWeek(range, { weekStartsOn: 1 }),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Manager Dashboard - Enhanced View
          </h2>
          <p className="text-muted-foreground">
            Comprehensive timesheet and team management
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timesheets">📋 Timesheets by Project</TabsTrigger>
          <TabsTrigger value="productivity">📊 Team Productivity</TabsTrigger>
          <TabsTrigger value="projects">🎯 Project Overview</TabsTrigger>
          <TabsTrigger value="personalization">
            ⚙️ Role Customization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timesheets" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center p-4 bg-muted/50 rounded-lg flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {[...new Set(timesheets.map((t) => t.project_name))].map(
                    (project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <Select
              value={filterFreelancer}
              onValueChange={setFilterFreelancer}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Freelancer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Freelancer">Freelancer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-64 justify-start text-left"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(dateRange.start, "MMM dd")} -{" "}
                    {format(dateRange.end, "MMM dd, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateRange.start}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees or projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Button
              onClick={() => exportData("timesheets")}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Timesheets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Timesheets by Project & Freelancer</CardTitle>
              <CardDescription>
                View and manage all submitted timesheets with project and
                freelancer details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTimesheets.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-semibold text-gray-600">
                    No Data Available
                  </h3>
                  <p className="text-gray-500">
                    It seems there are no timesheets to display. Try adjusting
                    your filters or check back later!
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTimesheets.map((timesheet) => (
                      <TableRow key={timesheet.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {timesheet.employee_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {timesheet.employee_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {timesheet.project_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(timesheet.week_start), "MMM dd")}{" "}
                              - {format(new Date(timesheet.week_end), "MMM dd")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {timesheet.freelancer_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {timesheet.project_details.client}
                        </TableCell>
                        <TableCell className="font-medium">
                          {timesheet.total_hours}h
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(timesheet.project_details.priority)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(timesheet.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {timesheet.status === "submitted" && (
                              <>
                                <Button size="sm" variant="default">
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline">
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="ghost">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Team-wise Productivity Reports
            </h3>
            <Button
              onClick={() => exportData("productivity")}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamProductivity.length === 0 ? (
              <div className="col-span-full text-center py-10">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold text-gray-600">
                  No Data Available
                </h3>
                <p className="text-gray-500">
                  No productivity data to display. Check back later!
                </p>
              </div>
            ) : (
              teamProductivity.map((team) => (
                <Card key={team.team_name}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{team.team_name}</CardTitle>
                    <CardDescription>
                      {team.members_count} members
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Productivity Score
                        </span>
                        <span className="font-bold text-lg">
                          {team.productivity_score}%
                        </span>
                      </div>
                      {getEfficiencyBadge(team.efficiency_rating)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Hours</span>
                        <span className="font-medium">{team.total_hours}h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Completed Tasks</span>
                        <span className="font-medium">
                          {team.completed_tasks}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium mb-2">
                        Key Metrics
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>On-time Delivery</span>
                          <span>{team.key_metrics.on_time_delivery}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quality Score</span>
                          <span>{team.key_metrics.quality_score}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Client Satisfaction</span>
                          <span>{team.key_metrics.client_satisfaction}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview & Status</CardTitle>
              <CardDescription>
                Monitor all active projects with freelancer assignments and
                progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectSummaries.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-semibold text-gray-600">
                    No Data Available
                  </h3>
                  <p className="text-gray-500">
                    No project data to display. Check back later!
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Freelancers</TableHead>
                      <TableHead>Hours Logged</TableHead>
                      <TableHead>Budget Used</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectSummaries.map((project) => (
                      <TableRow key={project.project_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {project.project_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {project.project_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{project.client}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {project.freelancers_assigned}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {project.total_hours_logged}h
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            {project.budget_utilization}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: `${project.completion_percentage}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm">
                              {project.completion_percentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              project.status === "completed"
                                ? "default"
                                : project.status === "delayed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {project.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personalization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role-based Dashboard Personalization</CardTitle>
              <CardDescription>
                Customize your dashboard based on your management role and team
                responsibilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <BarChart3 className="h-4 w-4" />
                    Dashboard Widgets
                  </h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      Team productivity metrics
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      Pending timesheet approvals
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      Budget utilization alerts
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      Project deadline reminders
                    </label>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4" />
                    Notification Preferences
                  </h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      New timesheet submissions
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      Leave request notifications
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      Weekly productivity reports
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      Budget threshold alerts
                    </label>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4" />
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Team Report
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Assign New Project
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Team Meeting
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerView;
