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
import axiosInstance from "../services/axiosInstance";

const ProjectAssignment = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState("all");
  const [search, setSearch] = useState(""); // Added search state

  useEffect(() => {
    fetchData();
  }, [search, selectedProject]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const projectResponse = await axiosInstance.get("/api/v1/project");
      const filteredProjects =
        selectedProject === "all"
          ? projectResponse.data.projects
          : projectResponse.data.projects.filter(
              (project) => project.name === selectedProject
            );
      setProjects(filteredProjects || []);

      const employeeResponse = await axiosInstance.get("/api/v1/employee", {
        params: { search },
      });
      setEmployees(employeeResponse.data.employees || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
      setProjects([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Active: { variant: "default", label: "✅ Active" },
      Completed: { variant: "default", label: "🎉 Completed" },
      "On Hold": { variant: "secondary", label: "⏸️ On Hold" },
      Cancelled: { variant: "destructive", label: "❌ Cancelled" },
    };

    const config = variants[status] || variants.Active;
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
                <SelectItem key={project.id} value={project.name}>
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
          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.filter(
                  (project) =>
                    (selectedProject === "all" ||
                      project.name === selectedProject) &&
                    project.status === "Active"
                ).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No projects found
                  </p>
                ) : (
                  projects
                    .filter(
                      (project) =>
                        (selectedProject === "all" ||
                          project.name === selectedProject) &&
                        project.status === "Active"
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

          {/* No Active Projects */}
          {projects.filter(
            (project) =>
              project.status === "Active" &&
              (selectedProject === "all" || project.name === selectedProject)
          ).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No active projects found
                </p>
              </CardContent>
            </Card>
          )}

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
                {employees.filter(
                  (employee) => employee.status.toLowerCase() === "active"
                ).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 col-span-2">
                    No active employees found
                  </p>
                ) : (
                  employees
                    .filter(
                      (employee) => employee.status.toLowerCase() === "active"
                    )
                    .map((employee) => (
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
