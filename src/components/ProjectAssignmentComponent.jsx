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
import { toast } from "@/hooks/use-toast";
import { Calendar, Users, Target, Clock } from "lucide-react";
import { format } from "date-fns";

const ProjectAssignment = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchProjects(), fetchEmployees()]);
    } catch (error) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    // Mock data
    const mockProjects = [
      {
        id: "1",
        name: "Website Redesign",
        description: "Redesign company website",
        status: "active",
        start_date: "2025-08-01",
        end_date: "2025-09-30",
      },
      {
        id: "2",
        name: "Mobile App Development",
        description: "Develop new mobile app",
        status: "on_hold",
        start_date: "2025-08-15",
      },
      {
        id: "3",
        name: "Marketing Campaign",
        description: "Launch new marketing campaign",
        status: "completed",
        start_date: "2025-07-01",
        end_date: "2025-08-10",
      },
      {
        id: "4",
        name: "Server Upgrade",
        description: "Upgrade server infrastructure",
        status: "cancelled",
        start_date: "2025-08-05",
      },
    ];
    setProjects(mockProjects);
  };

  const fetchEmployees = async () => {
    // Mock data
    const mockEmployees = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        department: "IT",
        position: "Developer",
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        department: "Marketing",
        position: "Manager",
      },
      {
        id: "3",
        name: "Mike Johnson",
        email: "mike@example.com",
        department: "HR",
        position: "Coordinator",
      },
    ];
    setEmployees(mockEmployees);
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: "default", label: "✅ Active" },
      completed: { variant: "default", label: "🎉 Completed" },
      on_hold: { variant: "secondary", label: "⏸️ On Hold" },
      cancelled: { variant: "destructive", label: "❌ Cancelled" },
    };

    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Management</h2>
        <div className="flex gap-2">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by project" />
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
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading projects...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Projects List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No projects found
                  </p>
                ) : (
                  projects
                    .filter(
                      (project) =>
                        selectedProject === "all" ||
                        project.id === selectedProject
                    )
                    .map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-3 bg-muted rounded"
                      >
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {project.description}
                          </div>
                          {project.start_date && (
                            <div className="text-sm text-muted-foreground">
                              Started:{" "}
                              {format(
                                new Date(project.start_date),
                                "MMM dd, yyyy"
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(project.status)}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employee Assignment Quick View */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Available Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employees.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 col-span-2">
                    No active employees found
                  </p>
                ) : (
                  employees.map((employee) => (
                    <div key={employee.id} className="p-3 bg-muted rounded">
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {employee.position} • {employee.department}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {employee.email}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProjectAssignment;
