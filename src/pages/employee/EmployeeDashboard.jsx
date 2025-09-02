import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  LogOut,
  Search,
  Edit,
  Trash2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import TimeTracker from "./TimeTracker";
import EmployeeNotification from "./EmployeeNotification";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import axiosInstance from "../../services/axiosInstance";
import { Link } from "react-router-dom";

export default function EmployeeDashboard() {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const dispatch = useDispatch();

  // Fetch employee details once on mount
  useEffect(() => {
    const fetchCurrentEmployee = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/employee", {
          params: { page: 1, limit: 1 },
        });
        const employee = response.data.employees[0];
        setCurrentEmployee(employee);
        console.log("Fetched employee data:", employee);
      } catch (error) {
        toast.error("Failed to fetch employee details. Please try again.");
        console.error("Error fetching current employee:", error);
      }
    };

    fetchCurrentEmployee();
  }, []);

  useEffect(() => {
    if (!currentEmployee) return;

    const fetchLeaveRequests = async () => {
      setIsLoadingLeaves(true);
      try {
        const response = await axiosInstance.get("/api/v1/leave", {
          params: { createdBy: currentEmployee.user_id },
        });
        setLeaveRequests(response.data.leaves || []);
        console.log("Fetched leave requests:", response.data.leaves);
      } catch (error) {
        toast.error("Failed to fetch leave requests. Please try again.");
        console.error("Error fetching leave requests:", error);
      } finally {
        setIsLoadingLeaves(false);
      }
    };

    fetchLeaveRequests();

    const interval = setInterval(fetchLeaveRequests, 100000);
    return () => clearInterval(interval);
  }, [currentEmployee]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const handleDateSelect = (date) => {
    if (date) {
      setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
    }
  };

  const handleLeaveSubmit = async () => {
    if (!currentEmployee) {
      toast.error("Employee details not loaded. Please try again.");
      return;
    }
    if (!leaveType) {
      toast.error("Please select a leave type.");
      return;
    }
    if (!fromDate) {
      toast.error("Please select a start date.");
      return;
    }
    if (!toDate) {
      toast.error("Please select an end date.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason for the leave.");
      return;
    }
    if (new Date(toDate) < new Date(fromDate)) {
      toast.error("End date cannot be before start date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const leaveData = {
        employeeName: currentEmployee.name,
        employeeEmail: currentEmployee.email,
        employeeDepartment: currentEmployee.department,
        leaveType,
        fromDate,
        toDate,
        reason,
        attachment: attachment || null,
        createdBy: parseInt(currentEmployee.user_id, 10),
      };

      console.log("Submitting leave request:", leaveData);

      const response = await axiosInstance.post(
        "/api/v1/leave/create",
        leaveData
      );
      setLeaveRequests((prev) => [...prev, response.data.leave]);

      toast.success("📝 Your request has been sent to manager for approval");

      setLeaveDialogOpen(false);
      setLeaveType("");
      setFromDate(undefined);
      setToDate(undefined);
      setReason("");
      setAttachment(undefined);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err) => err.message)
          .join(", ");
        toast.error(`Failed to submit leave request: ${errorMessages}`);
      } else {
        toast.error("Failed to submit leave request. Please try again.");
      }
      console.error("Error submitting leave request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLeave = (leave) => {
    setSelectedLeave(leave);
    setLeaveType(leave.leaveType);
    setFromDate(leave.fromDate);
    setToDate(leave.toDate);
    setReason(leave.reason);
    setAttachment(leave.attachment || "");
    setEditDialogOpen(true);
  };

  const handleUpdateLeave = async () => {
    if (!selectedLeave) return;
    if (!leaveType) {
      toast.error("Please select a leave type.");
      return;
    }
    if (!fromDate) {
      toast.error("Please select a start date.");
      return;
    }
    if (!toDate) {
      toast.error("Please select an end date.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason for the leave.");
      return;
    }
    if (new Date(toDate) < new Date(fromDate)) {
      toast.error("End date cannot be before start date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const leaveData = {
        employeeName: currentEmployee.name,
        employeeEmail: currentEmployee.email,
        employeeDepartment: currentEmployee.department,
        leaveType,
        fromDate,
        toDate,
        reason,
        attachment: attachment || null,
        createdBy: parseInt(currentEmployee.user_id, 10),
      };

      console.log("Updating leave request:", leaveData);

      const response = await axiosInstance.patch(
        `/api/v1/leave/${selectedLeave.id}`,
        leaveData
      );
      setLeaveRequests((prev) =>
        prev.map((leave) =>
          leave.id === selectedLeave.id ? response.data.leave : leave
        )
      );

      toast.success("📝 Leave request updated successfully");

      setEditDialogOpen(false);
      setSelectedLeave(null);
      setLeaveType("");
      setFromDate(undefined);
      setToDate(undefined);
      setReason("");
      setAttachment(undefined);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(
          (err) => err.message
        ).join;
        toast.error(`Failed to update leave request: ${errorMessages}`);
      } else {
        toast.error("Failed to update leave request. Please try again.");
      }
      console.error("Error updating leave request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLeave = async () => {
    if (!selectedLeave) return;

    setIsSubmitting(true);

    try {
      await axiosInstance.delete(`/api/v1/leave/${selectedLeave.id}`);
      setLeaveRequests((prev) =>
        prev.filter((leave) => leave.id !== selectedLeave.id)
      );

      toast.success("🗑️ Leave request deleted successfully");

      setDeleteDialogOpen(false);
      setSelectedLeave(null);
    } catch (error) {
      toast.error("Failed to delete leave request. Please try again.");
      console.error("Error deleting leave request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  // Filter leave requests that overlap with the current week and match the status filter
  const filteredLeaves = leaveRequests.filter((leave) => {
    const leaveStart = new Date(leave.fromDate);
    const leaveEnd = new Date(leave.toDate);
    const weekStart = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const isInWeek = leaveStart <= weekEnd && leaveEnd >= weekStart;
    const matchesStatus =
      statusFilter === "All" || leave.status === statusFilter;
    return isInWeek && matchesStatus;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to={"/employee/dashboard"}>
            <Button variant="outline">
              <ArrowLeft />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <div>
            <EmployeeNotification />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search current timesheet"
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" /> Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Leave Request</DialogTitle>
                <DialogDescription>
                  Fill in the details for your leave request.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Leave Type *
                  </label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                      <SelectItem value="Maternity Leave">
                        Maternity Leave
                      </SelectItem>
                      <SelectItem value="Paternity Leave">
                        Paternity Leave
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <div className="w-full">
                    <label className="block text-sm font-medium mb-1">
                      From Date *
                    </label>
                    <Input
                      type="date"
                      value={fromDate || ""}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium mb-1">
                      To Date *
                    </label>
                    <Input
                      type="date"
                      value={toDate || ""}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Reason *
                  </label>
                  <Textarea
                    placeholder="Please provide reason for leave..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Photo (Optional)
                  </label>
                  <Input
                    type="url"
                    value={attachment || ""}
                    onChange={(e) => setAttachment(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload medical certificate or supporting documents
                  </p>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setLeaveDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleLeaveSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Leave Request</DialogTitle>
                <DialogDescription>
                  Update the details for your leave request.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Leave Type *
                  </label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                      <SelectItem value="Maternity Leave">
                        Maternity Leave
                      </SelectItem>
                      <SelectItem value="Paternity Leave">
                        Paternity Leave
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <div className="w-full">
                    <label className="block text-sm font-medium mb-1">
                      From Date *
                    </label>
                    <Input
                      type="date"
                      value={fromDate || ""}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium mb-1">
                      To Date *
                    </label>
                    <Input
                      type="date"
                      value={toDate || ""}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Reason *
                  </label>
                  <Textarea
                    placeholder="Please provide reason for leave..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Photo (Optional)
                  </label>
                  <Input
                    type="url"
                    value={attachment || ""}
                    onChange={(e) => setAttachment(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload medical certificate or supporting documents
                  </p>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateLeave} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {isSubmitting ? "Updating..." : "Update Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Leave Request</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this leave request? This
                  action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteLeave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {isSubmitting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>{" "}
        </div>
      </div>

      <div>
        <TimeTracker />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Week
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-48 justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {`${format(weekDates[0], "MMM dd")} - ${format(
                  weekDates[6],
                  "MMM dd, yyyy"
                )}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={currentWeekStart}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="sm" onClick={handleNextWeek}>
            Next Week
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Select defaultValue="billable-first">
            <SelectTrigger className="w-64">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="billable-first">
                Billable first to Non-billable last
              </SelectItem>
              <SelectItem value="non-billable-first">
                Non-billable first to Billable last
              </SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center font-medium border-b pb-2">
        {weekDates.map((date) => (
          <div key={date.toISOString()}>{format(date, "EEE dd")}</div>
        ))}
      </div>

      <Card className="p-6 shadow-lg rounded-lg">
        {isLoadingLeaves ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredLeaves.length > 0 ? (
          <div className="space-y-4">
            {filteredLeaves.map((leave) => (
              <div
                key={leave.id}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium text-base">
                        {leave.leaveType}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(leave.fromDate), "MMM dd, yyyy")} -{" "}
                        {format(new Date(leave.toDate), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        leave.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : leave.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {leave.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditLeave(leave)}
                      disabled={leave.status === "Approved"}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLeave(leave);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={leave.status === "Approved"}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium">Reason:</span> {leave.reason}
                </div>
                {leave.attachment && (
                  <div className="mt-2">
                    <a
                      href={leave.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Attachment
                    </a>
                  </div>
                )}
                {leave.status === "Rejected" && leave.remarks && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium">Remarks:</span>{" "}
                    {leave.remarks}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-4">
            No leave requests for this week.
          </div>
        )}
      </Card>

      <Card className="p-6 shadow-lg rounded-lg">
        <div className="font-semibold text-lg mb-4">Job Group: Billable</div>
        <div className="text-muted-foreground text-center py-4">
          No billable tasks assigned to you this week.
        </div>
      </Card>

      <div className="grid grid-cols-8 font-medium border-t pt-2 bg-muted px-4 py-2 rounded-md">
        <div className="text-left">Total Hours</div>
        {weekDates.map((_, i) => (
          <div key={i} className="text-center">
            0
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="secondary">Submit Timesheet</Button>
      </div>
    </div>
  );
}
