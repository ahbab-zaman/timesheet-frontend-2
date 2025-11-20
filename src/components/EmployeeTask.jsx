import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import debounce from "lodash.debounce";
import axiosInstance from "../services/axiosInstance";
import { Button } from "./ui/button";

const EmployeeTask = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const debouncedSetSearchTerm = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  const fetchTasks = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const authToken = localStorage.getItem("authToken");
        const response = await axiosInstance.get("/api/v1/task", {
          signal,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const fetchedTasks = response.data.tasks || [];
        setTasks(fetchedTasks);
        console.log(fetchedTasks);
        setActivities(
          fetchedTasks.map((task) => ({
            id: task.id,
            status: task.status ? task.status.toUpperCase() : "ASSIGNED",
            project: task.project?.name || task.project_id || "N/A",
            project_type: task.project_type || "N/A",
            milestone_recurring: task.milestone_description || "N/A",
            freelancer: task.employee?.name || task.employee_id || "N/A",
            manager: task.manager?.fullName || "N/A",
            task: task.title || "Untitled",
            start_date: task.start_date
              ? format(new Date(task.start_date), "yyyy-MM-dd")
              : format(new Date(task.created_at || Date.now()), "yyyy-MM-dd"),
            due_date: task.due_date
              ? format(new Date(task.due_date), "yyyy-MM-dd")
              : "N/A",
          }))
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching tasks:", error);
          toast({
            title: "Error fetching tasks",
            description:
              error.response?.data?.error || "Failed to load your tasks.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchTasks(controller.signal);
    return () => controller.abort();
  }, [fetchTasks]);

  const uniqueProjects = useMemo(() => {
    return [...new Set(activities.map((activity) => activity.project))].sort();
  }, [activities]);

  const getStatusDisplay = useCallback((status) => {
    const statusVariants = {
      ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
      "IN PROGRESS": "bg-yellow-100 text-yellow-700 border-yellow-200",
      COMPLETED: "bg-green-100 text-green-700 border-green-200",
      ON_HOLD: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      <Badge variant="outline" className={statusVariants[status] || ""}>
        {status}
      </Badge>
    );
  }, []);

  const getProjectTypeBadge = useCallback((type) => {
    const variants = {
      Milestone: { color: "bg-purple-100 text-purple-700 border-purple-200" },
      Fixed: { color: "bg-orange-100 text-orange-700 border-orange-200" },
      Recurring: { color: "bg-green-100 text-green-700 border-green-200" },
    };
    const config = variants[type] || variants.Milestone;
    return (
      <Badge variant="outline" className={config.color}>
        {type}
      </Badge>
    );
  }, []);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        searchTerm === "" ||
        activity.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.manager.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || activity.status === statusFilter;
      const matchesProject =
        projectFilter === "all" || activity.project === projectFilter;
      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [activities, searchTerm, statusFilter, projectFilter]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredActivities.length / itemsPerPage);
  }, [filteredActivities.length]);

  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredActivities.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredActivities, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Assigned Tasks</h2>
          <p className="text-muted-foreground">View tasks assigned to you</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by project, task, or manager"
              onChange={(e) => debouncedSetSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={projectFilter}
            onValueChange={(value) => {
              setProjectFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {uniqueProjects.slice(0, 5).map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="IN PROGRESS">In Progress</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-purple-100 hover:bg-purple-100">
                    <TableHead className="font-semibold text-black">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Project
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Project Type
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Milestone/Recurring
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Manager
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Task
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Start Date
                    </TableHead>
                    <TableHead className="font-semibold text-black">
                      Due Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        <h3 className="text-xl font-semibold text-gray-600">
                          No Tasks Assigned
                        </h3>
                        <p className="text-gray-500">
                          No tasks assigned to you yet.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedActivities.map((activity) => (
                      <TableRow key={activity.id} className="hover:bg-muted/50">
                        <TableCell>
                          {getStatusDisplay(activity.status)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {activity.project}
                        </TableCell>
                        <TableCell>
                          {getProjectTypeBadge(activity.project_type)}
                        </TableCell>
                        <TableCell className="max-w-48">
                          <span className="text-pink-600 font-medium">
                            {activity.milestone_recurring}
                          </span>
                        </TableCell>
                        <TableCell>{activity.manager}</TableCell>
                        <TableCell>{activity.task}</TableCell>
                        <TableCell>{activity.start_date}</TableCell>
                        <TableCell>{activity.due_date}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-muted/50">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredActivities.length
                  )}{" "}
                  of {filteredActivities.length} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeTask;
