import { useState, useEffect } from "react";
import { differenceInDays } from "date-fns";
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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axiosInstance from "../../services/axiosInstance"; // Adjust the import path based on your project structure

const ManagerLeave = () => {
  const [filter, setFilter] = useState("pending");
  const [leaveRequests, setLeaveRequests] = useState([]);

  // Fetch leave requests on component mount
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/leave", {
          params: { page: 1, limit: 100 }, // Adjust limit as needed
        });
        console.log("Leave requests response:", response.data); // Debug response
        // Ensure response.data.leaves is an array
        const leaves = Array.isArray(response.data.leaves)
          ? response.data.leaves
          : [];
        const mappedRequests = leaves.map((leave) => ({
          id: leave.id,
          name: leave.employeeName,
          email: leave.employeeEmail, // Placeholder; update if Employee join is implemented
          dept: leave.employeeDepartment, // Placeholder; update if Employee join is implemented
          type: leave.leaveType,
          days:
            differenceInDays(new Date(leave.toDate), new Date(leave.fromDate)) +
            1,
          status: leave.status.toLowerCase(),
        }));
        setLeaveRequests(mappedRequests);
      } catch (error) {
        toast.error("Failed to fetch leave requests. Please try again.");
        console.error("Error fetching leave requests:", error);
      }
    };
    fetchLeaveRequests();
  }, []);

  const filteredRequests =
    filter === "all"
      ? leaveRequests
      : leaveRequests.filter((req) => req.status === filter);

  const approveLeave = async (id) => {
    try {
      await axiosInstance.patch(`/api/v1/leave/${id}`, { status: "Approved" });
      setLeaveRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "approved" } : req
        )
      );
      toast.success("Leave request approved successfully.");
    } catch (error) {
      toast.error("Failed to approve leave request. Please try again.");
      console.error("Error approving leave request:", error);
    }
  };

  const rejectLeave = async (id) => {
    try {
      await axiosInstance.delete(`/api/v1/leave/${id}`);
      setLeaveRequests((prev) => prev.filter((req) => req.id !== id));
      toast.success("Leave request rejected and removed successfully.");
    } catch (error) {
      toast.error("Failed to reject leave request. Please try again.");
      console.error("Error rejecting leave request:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Leave Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve employee leave requests
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            size="sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            Pending (
            {leaveRequests.filter((r) => r.status === "pending").length})
          </Button>
          <Button
            variant={filter === "approved" ? "default" : "outline"}
            onClick={() => setFilter("approved")}
            size="sm"
          >
            Approved
          </Button>
          <Button
            variant={filter === "rejected" ? "default" : "outline"}
            onClick={() => setFilter("rejected")}
            size="sm"
          >
            Rejected
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No leave requests found
              </h3>
              <p className="text-muted-foreground">
                No {filter} leave requests to review.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((req) => (
            <Card key={req.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <User className="h-5 w-5" />
                      {req.name}
                      <Badge
                        variant={
                          req.status === "pending"
                            ? "secondary"
                            : req.status === "approved"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {req.status.charAt(0).toUpperCase() +
                          req.status.slice(1)}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {req.email} • {req.dept}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{req.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {req.days} days
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => approveLeave(req.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Leave Request</DialogTitle>
                          <DialogDescription>
                            Confirm rejection of {req.name}'s leave request.
                            This action will remove the request.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="rejection-remarks">Remarks</Label>
                            <Textarea
                              id="rejection-remarks"
                              placeholder="Explain why this leave request is being rejected..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              onClick={() => rejectLeave(req.id)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Rejection
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ManagerLeave;
