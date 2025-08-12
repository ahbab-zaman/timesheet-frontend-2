import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Search, Calendar, User, Briefcase, Edit2 } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const TimeLogs = () => {
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [editingEntry, setEditingEntry] = useState(null);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock time logs data
      const mockTimeLogs = [
        {
          id: "1",
          employee_id: "emp1",
          employee_name: "John Doe",
          project_id: "proj1",
          project_name: "Website Development",
          date: "2025-08-01",
          hours: 8,
          description: "Frontend development work",
          billable: true,
          created_at: "2025-08-01T10:00:00Z",
        },
        {
          id: "2",
          employee_id: "emp2",
          employee_name: "Jane Smith",
          project_id: "proj2",
          project_name: "Mobile App",
          date: "2025-08-02",
          hours: 6.5,
          description: "Bug fixes and testing",
          billable: true,
          created_at: "2025-08-02T11:00:00Z",
        },
        {
          id: "3",
          employee_id: "emp1",
          employee_name: "John Doe",
          project_id: "proj1",
          project_name: "Website Development",
          date: "2025-08-03",
          hours: 7.5,
          description: "Backend integration",
          billable: false,
          created_at: "2025-08-03T09:00:00Z",
        },
      ];
      setTimeLogs(mockTimeLogs);

      // Mock projects data
      const mockProjects = [
        { id: "proj1", name: "Website Development" },
        { id: "proj2", name: "Mobile App" },
      ];
      setProjects(mockProjects);

      // Mock employees data
      const mockEmployees = [
        { id: "emp1", name: "John Doe" },
        { id: "emp2", name: "Jane Smith" },
      ];
      setEmployees(mockEmployees);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeEntry = async (updatedEntry) => {
    if (!editingEntry) return;

    try {
      setTimeLogs((prev) =>
        prev.map((log) =>
          log.id === editingEntry.id
            ? {
                ...log,
                hours: updatedEntry.hours,
                description: updatedEntry.description,
              }
            : log
        )
      );

      toast({
        title: "Success",
        description: "Time entry updated successfully",
      });

      setEditingEntry(null);
    } catch (error) {
      console.error("Error updating entry:", error);
      toast({
        title: "Error",
        description: "Failed to update time entry",
        variant: "destructive",
      });
    }
  };

  const filteredLogs = timeLogs.filter((log) => {
    const matchesSearch =
      log.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter || log.date === dateFilter;
    const matchesProject =
      projectFilter === "all" || log.project_id === projectFilter;
    const matchesEmployee =
      employeeFilter === "all" || log.employee_id === employeeFilter;

    return matchesSearch && matchesDate && matchesProject && matchesEmployee;
  });

  const totalHours = filteredLogs.reduce((sum, log) => sum + log.hours, 0);
  const billableHours = filteredLogs
    .filter((log) => log.billable)
    .reduce((sum, log) => sum + log.hours, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Logs Management
        </CardTitle>
        <CardDescription>
          View, filter, and edit time entries across all projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div>
              <Label>Project</Label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Employee</Label>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Clear Filters</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("");
                  setProjectFilter("all");
                  setEmployeeFilter("all");
                }}
                className="w-full"
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {filteredLogs.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {totalHours.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {billableHours.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Billable Hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Logs Table */}
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {log.employee_name}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{log.project_name}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(log.date), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{log.hours}h</span>
                          <Badge
                            variant={log.billable ? "default" : "secondary"}
                          >
                            {log.billable ? "Billable" : "Non-billable"}
                          </Badge>
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        <p className="text-sm text-muted-foreground truncate">
                          {log.description}
                        </p>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingEntry(log)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Time Entry</DialogTitle>
                        </DialogHeader>
                        {editingEntry && (
                          <div className="space-y-4">
                            <div>
                              <Label>Hours</Label>
                              <Input
                                type="number"
                                step="0.5"
                                value={editingEntry.hours}
                                onChange={(e) =>
                                  setEditingEntry({
                                    ...editingEntry,
                                    hours: parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input
                                value={editingEntry.description}
                                onChange={(e) =>
                                  setEditingEntry({
                                    ...editingEntry,
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => updateTimeEntry(editingEntry)}
                                className="flex-1"
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No time logs found matching your filters.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeLogs;
