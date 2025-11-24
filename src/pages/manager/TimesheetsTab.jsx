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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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
import axiosInstance from "@/services/axiosInstance"; // Adjust path
import {
  Filter,
  Calendar as CalendarIcon,
  Search,
  Download,
  ChevronRight,
  Clock,
} from "lucide-react";

const TimesheetsTab = () => {
  const { toast } = useToast();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const fetchTimesheets = async () => {
      setLoading(true);
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

        if (isMounted) setTimesheets(allTimesheets);
      } catch (error) {
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to fetch timesheets. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTimesheets();
    return () => {
      isMounted = false;
    };
  }, [dateRange, filter, toast]);

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

  const exportData = () => {
    const csvContent =
      "Employee,Project,Freelancer Type,Hours,Status,Client,Priority\n" +
      filteredTimesheets
        .map(
          (t) =>
            `${t.employee_name},${t.project_name},${t.freelancer_type},${t.total_hours},${t.status},${t.project_details.client},${t.project_details.priority}`
        )
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timesheets_report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Success",
      description: "Timesheets report exported successfully",
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
      <h2 className="text-2xl font-bold">Timesheets by Project</h2>
      {/* Filters and Table JSX from original TimesheetsTab */}
      <div className="flex gap-4 items-center p-4 bg-muted/50 rounded-lg flex-wrap">
        {/* ... (Selects, Popover, Input, Export Button - same as original) */}
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
        {/* Add other Selects, Popover for date, Search Input, Export Button similarly */}
        <Button onClick={exportData} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Timesheets by Project & Freelancer</CardTitle>
          <CardDescription>
            View and manage all submitted timesheets with project and freelancer
            details
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
                It seems there are no timesheets to display. Try adjusting your
                filters or check back later!
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
                          {format(new Date(timesheet.week_start), "MMM dd")} -{" "}
                          {format(new Date(timesheet.week_end), "MMM dd")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {timesheet.freelancer_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{timesheet.project_details.client}</TableCell>
                    <TableCell className="font-medium">
                      {timesheet.total_hours}h
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(timesheet.project_details.priority)}
                    </TableCell>
                    <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
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
    </div>
  );
};

export default TimesheetsTab;
