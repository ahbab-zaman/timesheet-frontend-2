import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/services/axiosInstance";

const ManagerProjectsTab = () => {
  const [projectSummaries, setProjectSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/project");
        const projectData = response.data.projects || [];

        const formattedProjects = projectData.map((project) => {
          let completion_percentage = 0;
          switch (project.status?.toLowerCase()) {
            case "completed":
              completion_percentage = 100;
              break;
            case "in progress":
              completion_percentage = 50;
              break;
            case "pending":
              completion_percentage = 0;
              break;
            case "delayed":
              completion_percentage = 75;
              break;
            default:
              completion_percentage = 25;
          }

          return {
            project_id: project.id,
            project_name: project.name,
            project_type: project.project_type || "billable",
            completion_percentage,
            status: project.status || "active",
          };
        });

        setProjectSummaries(formattedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projectSummaries.filter((project) => {
    const matchesSearch =
      !searchTerm ||
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" ||
      project.project_type.toLowerCase() === selectedType.toLowerCase();
    const matchesStatus =
      selectedStatus === "all" ||
      project.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Project Overview</h2>
      <Card>
        <CardHeader>
          <CardTitle>Project Overview & Status</CardTitle>
          <CardDescription>
            Monitor all active projects with freelancer assignments and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Input
              placeholder="Search projects by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="billable">Billable</SelectItem>
                <SelectItem value="non-billable">Non-Billable</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filteredProjects.length === 0 ? (
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
                  <TableHead>Project Type</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
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
                    <TableCell>
                      <Badge
                        variant={
                          project.project_type === "billable"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {project.project_type}
                      </Badge>
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
    </div>
  );
};

export default ManagerProjectsTab;
