import { useState, useEffect } from "react";
import { differenceInDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Filter,
  MessageSquare,
  User,
  RefreshCw,
  SortAsc,
  SortDesc,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "../../services/axiosInstance";

const ManagerLeave = () => {
  const [filter, setFilter] = useState("pending");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [sortBy, setSortBy] = useState("fromDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Fetch leave requests
  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/v1/leave", {
        params: { page: 1, limit: 100 },
      });
      const leaves = Array.isArray(response.data.leaves)
        ? response.data.leaves
        : [];
      const mappedRequests = leaves.map((leave) => ({
        id: leave.id,
        name: leave.employeeName || "Unknown",
        email: leave.employeeEmail || "Unknown",
        dept: leave.employeeDepartment || "Unknown",
        type: leave.leaveType || "Unknown",
        fromDate: leave.fromDate,
        toDate: leave.toDate || leave.fromDate, // Handle single-day leaves
        days:
          differenceInDays(
            new Date(leave.toDate || leave.fromDate),
            new Date(leave.fromDate)
          ) + 1,
        status: leave.status ? leave.status.toLowerCase() : "pending",
        remarks: leave.remarks || "",
        reason: leave.reason || "No reason provided",
      }));
      setLeaveRequests(mappedRequests);
      toast.success("Leave requests fetched successfully.");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to fetch leave requests. Please try again.";
      toast.error(message);
      console.error("Error fetching leave requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const filteredRequests =
    filter === "all"
      ? leaveRequests
      : leaveRequests.filter((req) => req.status === filter);

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const order = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "name") {
      return order * a.name.localeCompare(b.name);
    } else if (sortBy === "fromDate") {
      return order * (new Date(a.fromDate) - new Date(b.fromDate));
    } else if (sortBy === "status") {
      return order * a.status.localeCompare(b.status);
    }
    return 0;
  });

  const approveLeave = async (id) => {
    try {
      await axiosInstance.patch(`/api/v1/leave/${id}`, { status: "Approved" });
      setLeaveRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "approved" } : req
        )
      );
      toast.success("Leave request approved successfully.");
      setApproveDialogOpen(false);
      setSelectedRequestId(null);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to approve leave request.";
      toast.error(message);
      console.error("Error approving leave request:", error);
    }
  };

  const rejectLeave = async (id, remarks) => {
    if (!remarks.trim()) {
      toast.error("Please provide remarks for rejection.");
      return;
    }
    try {
      await axiosInstance.patch(`/api/v1/leave/${id}`, {
        status: "Rejected",
        remarks,
      });
      setLeaveRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "rejected", remarks } : req
        )
      );
      toast.success("Leave request rejected successfully.");
      setRejectDialogOpen(false);
      setSelectedRequestId(null);
      setRemarks("");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to reject leave request.";
      toast.error(message);
      console.error("Error rejecting leave request:", error);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      "Sick Leave":
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Casual Leave":
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Earned Leave":
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "Maternity Leave":
        "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      "Paternity Leave":
        "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      Other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };
    return colors[type] || colors["Other"];
  };

  const getStatusGradient = (status) => {
    const gradients = {
      pending:
        "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800",
      approved:
        "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800",
      rejected:
        "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800",
    };
    return gradients[status] || gradients.pending;
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-blue-50 via-gray-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-900 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Leave Approvals
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Review and manage employee leave requests with ease
          </p>
        </div>
        <div className="flex items-center gap-4">
         
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="text-sm bg-white dark:bg-gray-800"
          >
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4 mr-2" />
            ) : (
              <SortDesc className="h-4 w-4 mr-2" />
            )}
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </Button>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48 bg-white dark:bg-gray-800 shadow-sm text-sm">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter requests" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">
                Pending (
                {leaveRequests.filter((r) => r.status === "pending").length})
              </SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchLeaveRequests}
                  className="text-sm bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh leave requests</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              className="border-none shadow-lg bg-white dark:bg-gray-800"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="space-y-3 mt-4">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedRequests.length === 0 ? (
        <Card className="border-none shadow-lg bg-white dark:bg-gray-800">
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              No Leave Requests Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No {filter} leave requests to review at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedRequests.map((req, index) => (
            <Card
              key={req.id}
              className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 ${getStatusGradient(
                req.status
              )} motion-safe:animate-slideUp`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {getInitials(req.name)}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                        {req.name}
                        <Badge
                          variant={
                            req.status === "pending"
                              ? "secondary"
                              : req.status === "approved"
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs font-semibold"
                        >
                          {req.status.charAt(0).toUpperCase() +
                            req.status.slice(1)}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                        {req.email} • {req.dept}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`text-md font-semibold ${getLeaveTypeColor(
                        req.type
                      )}`}
                    >
                      {req.type}
                    </Badge>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {req.days} {req.days === 1 ? "day" : "days"}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">From:</span>{" "}
                    {format(new Date(req.fromDate), "MMM dd, yyyy")}
                    <br />
                    <span className="font-medium">To:</span>{" "}
                    {format(new Date(req.toDate), "MMM dd, yyyy")}
                    <br />
                    <span className="font-medium">Reason:</span> {req.reason}
                  </div>
                  {req.remarks && req.status === "rejected" && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Remarks:</span>{" "}
                      {req.remarks}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => {
                              setSelectedRequestId(req.id);
                              setApproveDialogOpen(true);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 transition-colors text-white"
                            disabled={req.status !== "pending"}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Approve this leave request
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            className="flex-1 bg-red-600 hover:bg-red-700 transition-colors"
                            disabled={req.status !== "pending"}
                            onClick={() => {
                              setSelectedRequestId(req.id);
                              setRejectDialogOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Reject this leave request
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Confirmation Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900 dark:text-white">
              Confirm Leave Approval
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to approve this leave request for{" "}
              {leaveRequests.find((r) => r.id === selectedRequestId)?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              className="text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => approveLeave(selectedRequestId)}
              className="bg-green-600 text-white hover:bg-green-700 text-sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900 dark:text-white">
              Reject Leave Request
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Confirm rejection of{" "}
              {leaveRequests.find((r) => r.id === selectedRequestId)?.name}'s
              leave request. Please provide remarks to explain the decision.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="rejection-remarks"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Remarks
              </Label>
              <Textarea
                id="rejection-remarks"
                placeholder="Explain why this leave request is being rejected..."
                className="mt-1 bg-white dark:bg-gray-800"
                onChange={(e) => setRemarks(e.target.value)}
                value={remarks}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRemarks("");
                }}
                className="flex-1 text-sm"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => rejectLeave(selectedRequestId, remarks)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-sm"
                disabled={!remarks.trim()}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ManagerLeave;
