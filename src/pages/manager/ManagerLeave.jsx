import { useState, useEffect, useMemo } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  Filter,
  MessageSquare,
  User,
  Eye,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
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
import axiosInstance from "../../services/axiosInstance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format as dateFormat } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ManagerLeave = () => {
  const [activeTab, setActiveTab] = useState("leave");
  const [filter, setFilter] = useState("pending");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openReasonDialog, setOpenReasonDialog] = useState(false);
  const [currentRejectId, setCurrentRejectId] = useState(null);
  const [currentReason, setCurrentReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Holidays state
  const [holidays, setHolidays] = useState([]);
  const [holidaysLoading, setHolidaysLoading] = useState(false);
  const [holidayFilter, setHolidayFilter] = useState("all");
  const [openAddHolidayDialog, setOpenAddHolidayDialog] = useState(false);
  const [openEditHolidayDialog, setOpenEditHolidayDialog] = useState(false);
  const [openDeleteHolidayDialog, setOpenDeleteHolidayDialog] = useState(false);
  const [openViewHolidayDialog, setOpenViewHolidayDialog] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState(null);
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    startDate: new Date(),
    endDate: null,
    description: "",
    isPaid: true,
  });
  const [addHolidayLoading, setAddHolidayLoading] = useState(false);
  const [updateHolidayLoading, setUpdateHolidayLoading] = useState(false);
  const [deleteHolidayId, setDeleteHolidayId] = useState(null);

  // Fetch leave requests on component mount
  useEffect(() => {
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
          name: leave.employeeName,
          email: leave.employeeEmail,
          dept: leave.employeeDepartment,
          type: leave.leaveType,
          reason: leave.reason || "No reason provided", // Assuming API provides reason
          fromDate: leave.fromDate,
          toDate: leave.toDate,
          days:
            differenceInDays(new Date(leave.toDate), new Date(leave.fromDate)) +
            1,
          status: leave.status.toLowerCase(),
        }));
        setLeaveRequests(mappedRequests);
      } catch (error) {
        toast.error("Failed to fetch leave requests. Please try again.");
        console.error("Error fetching leave requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequests();
  }, []);

  // Fetch holidays when tab changes to holidays
  useEffect(() => {
    if (activeTab === "holidays") {
      fetchHolidays();
    }
  }, [activeTab]);

  const fetchHolidays = async () => {
    setHolidaysLoading(true);
    try {
      const response = await axiosInstance.get("/api/v1/holiday");
      if (response.data.success) {
        // Filter out any null or invalid entries
        const validHolidays = response.data.data.filter(
          (holiday) => holiday && holiday.id && holiday.start_date
        );
        setHolidays(validHolidays);
      } else {
        toast.error("Failed to fetch holidays.");
      }
    } catch (error) {
      toast.error("Failed to fetch holidays. Please try again.");
      console.error("Error fetching holidays:", error);
    } finally {
      setHolidaysLoading(false);
    }
  };

  const filteredRequests =
    filter === "all"
      ? leaveRequests
      : leaveRequests.filter((req) => req.status === filter);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

  const rejectLeaveRequest = async (id, rejectionRemarks) => {
    try {
      await axiosInstance.patch(`/api/v1/leave/${id}`, {
        status: "Rejected",
        remarks: rejectionRemarks,
      });
      setLeaveRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "rejected" } : req
        )
      );
      toast.success("Leave request rejected successfully.");
    } catch (error) {
      toast.error("Failed to reject leave request. Please try again.");
      console.error("Error rejecting leave request:", error);
    }
  };

  const handleRejectConfirm = async () => {
    if (!remarks.trim()) {
      toast.error("Please provide remarks for the rejection.");
      return;
    }
    setLoading(true);
    try {
      await rejectLeaveRequest(currentRejectId, remarks);
      setOpenRejectDialog(false);
      setRemarks("");
      setCurrentRejectId(null);
    } catch (error) {
      // Error handled in rejectLeaveRequest
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReject = () => {
    setOpenRejectDialog(false);
    setRemarks("");
    setCurrentRejectId(null);
  };

  const handleViewReason = (reason) => {
    setCurrentReason(reason);
    setOpenReasonDialog(true);
  };

  const isPending = (req) => req.status === "pending";

  // Holidays handlers
  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const holidayCounts = useMemo(() => {
    const allCount = holidays.length;
    const upcomingCount = holidays.filter(
      (h) => h.start_date >= todayStr
    ).length;
    const pastCount = allCount - upcomingCount;
    const paidCount = holidays.filter((h) => h.is_paid).length;
    const unpaidCount = allCount - paidCount;
    return { allCount, upcomingCount, pastCount, paidCount, unpaidCount };
  }, [holidays, todayStr]);

  const filteredHolidays = useMemo(() => {
    return holidays.filter((holiday) => {
      const startDate = holiday.start_date;
      switch (holidayFilter) {
        case "upcoming":
          return startDate >= todayStr;
        case "past":
          return startDate < todayStr;
        case "paid":
          return holiday.is_paid;
        case "unpaid":
          return !holiday.is_paid;
        default:
          return true;
      }
    });
  }, [holidays, holidayFilter, todayStr]);

  const handleHolidayInputChange = (field, value) => {
    setHolidayForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateInputChange = (field, date) => {
    setHolidayForm((prev) => ({ ...prev, [field]: date }));
  };

  const resetHolidayForm = () => {
    setHolidayForm({
      name: "",
      startDate: new Date(),
      endDate: null,
      description: "",
      isPaid: true,
    });
  };

  const handleAddHoliday = async () => {
    if (!holidayForm.name.trim() || !holidayForm.description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!holidayForm.startDate) {
      toast.error("Please select a start date.");
      return;
    }
    if (holidayForm.endDate && holidayForm.endDate < holidayForm.startDate) {
      toast.error("End date cannot be before start date.");
      return;
    }
    setAddHolidayLoading(true);
    try {
      const payload = {
        name: holidayForm.name,
        start_date: dateFormat(holidayForm.startDate, "yyyy-MM-dd"),
        description: holidayForm.description,
        is_paid: holidayForm.isPaid,
      };
      if (holidayForm.endDate) {
        payload.end_date = dateFormat(holidayForm.endDate, "yyyy-MM-dd");
      }
      const response = await axiosInstance.post("/api/v1/holiday", payload);
      if (response.data.success) {
        toast.success("Holiday added successfully.");
        fetchHolidays(); // Refetch to update list
        setOpenAddHolidayDialog(false);
        resetHolidayForm();
      } else {
        toast.error("Failed to add holiday.");
      }
    } catch (error) {
      toast.error("Failed to add holiday. Please try again.");
      console.error("Error adding holiday:", error);
    } finally {
      setAddHolidayLoading(false);
    }
  };

  const handleEditHoliday = async (holiday) => {
    setCurrentHoliday(holiday);
    setHolidayForm({
      name: holiday.name,
      startDate: new Date(holiday.start_date),
      endDate: holiday.end_date ? new Date(holiday.end_date) : null,
      description: holiday.description,
      isPaid: holiday.is_paid,
    });
    setOpenEditHolidayDialog(true);
  };

  const handleUpdateHoliday = async () => {
    if (!holidayForm.name.trim() || !holidayForm.description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!holidayForm.startDate) {
      toast.error("Please select a start date.");
      return;
    }
    if (holidayForm.endDate && holidayForm.endDate < holidayForm.startDate) {
      toast.error("End date cannot be before start date.");
      return;
    }
    setUpdateHolidayLoading(true);
    try {
      const payload = {
        name: holidayForm.name,
        start_date: dateFormat(holidayForm.startDate, "yyyy-MM-dd"),
        description: holidayForm.description,
        is_paid: holidayForm.isPaid,
      };
      if (holidayForm.endDate) {
        payload.end_date = dateFormat(holidayForm.endDate, "yyyy-MM-dd");
      } else {
        payload.end_date = null;
      }
      const response = await axiosInstance.put(
        `/api/v1/holiday/${currentHoliday.id}`,
        payload
      );
      if (response.data.success) {
        toast.success("Holiday updated successfully.");
        fetchHolidays(); // Refetch to update list
        setOpenEditHolidayDialog(false);
        resetHolidayForm();
        setCurrentHoliday(null);
      } else {
        toast.error("Failed to update holiday.");
      }
    } catch (error) {
      toast.error("Failed to update holiday. Please try again.");
      console.error("Error updating holiday:", error);
    } finally {
      setUpdateHolidayLoading(false);
    }
  };

  const handleDeleteHoliday = async () => {
    try {
      const response = await axiosInstance.delete(
        `/api/v1/holiday/${deleteHolidayId}`
      );
      if (response.data.success) {
        toast.success("Holiday deleted successfully.");
        fetchHolidays(); // Refetch to update list
        setOpenDeleteHolidayDialog(false);
        setDeleteHolidayId(null);
      } else {
        toast.error("Failed to delete holiday.");
      }
    } catch (error) {
      toast.error("Failed to delete holiday. Please try again.");
      console.error("Error deleting holiday:", error);
    }
  };

  const handleViewHoliday = (holiday) => {
    setCurrentHoliday(holiday);
    setOpenViewHolidayDialog(true);
  };

  const formatHolidayDates = (holiday) => {
    if (!holiday || !holiday.start_date) {
      return "No date available";
    }
    const start = format(new Date(holiday.start_date), "MMM dd, yyyy");
    if (holiday.end_date) {
      const end = format(new Date(holiday.end_date), "MMM dd, yyyy");
      return `${start} - ${end}`;
    }
    return start;
  };

  const DateButton = ({ date, placeholder, className = "", onClick }) => {
    let buttonText = placeholder || "Pick a date";
    if (date) {
      buttonText = dateFormat(date, "PPP");
    }
    return (
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal mt-1",
          !date && "text-muted-foreground",
          className
        )}
        onClick={onClick}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>
    );
  };

  const Spinner = () => (
    <svg
      className="animate-spin h-4 w-4 mr-2 text-primary"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leave">Leave Approvals</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>

        <TabsContent value="leave" className="mt-0 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Leave Approvals
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage and review employee leave requests with ease
              </p>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 shadow-sm">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter requests" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  Pending (
                  {leaveRequests.filter((r) => r.status === "pending").length})
                </SelectItem>
                <SelectItem value="approved">
                  Approved (
                  {leaveRequests.filter((r) => r.status === "approved").length})
                </SelectItem>
                <SelectItem value="rejected">
                  Rejected (
                  {leaveRequests.filter((r) => r.status === "rejected").length})
                </SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <Card className="border-none shadow-lg">
              <CardContent className="flex justify-center items-center py-12">
                <svg
                  className="animate-spin h-8 w-8 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </CardContent>
            </Card>
          ) : filteredRequests.length === 0 ? (
            <Card className="border-none shadow-lg bg-white dark:bg-gray-800">
              <CardContent className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  No Leave Requests Found
                </h3>
                <p className="text-muted-foreground">
                  No {filter} leave requests to review at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Leave Type (Days)</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">
                            {req.name}
                            <div className="text-sm text-muted-foreground">
                              {req.email} {req.dept}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{req.type}</div>
                            <div className="text-sm text-muted-foreground">
                              {req.days} days
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewReason(req.reason)}
                              className="h-auto p-0 justify-start text-left"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Reason
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {format(new Date(req.fromDate), "MMM dd, yyyy")}
                              </div>
                              <div className="text-muted-foreground">
                                {format(new Date(req.toDate), "MMM dd, yyyy")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>
                            {!isPending(req) ? (
                              <div className="text-center py-2 text-sm text-muted-foreground">
                                {req.status === "approved"
                                  ? "✓ Approved"
                                  : "✗ Rejected"}
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => approveLeave(req.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 h-8"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Dialog
                                  open={openRejectDialog}
                                  onOpenChange={setOpenRejectDialog}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-8 bg-red-600 hover:bg-red-700"
                                      onClick={() => setCurrentRejectId(req.id)}
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Reject
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
                                    <DialogHeader>
                                      <DialogTitle className="text-xl">
                                        Reject Leave Request
                                      </DialogTitle>
                                      <DialogDescription>
                                        Confirm rejection of{" "}
                                        {leaveRequests.find(
                                          (r) => r.id === currentRejectId
                                        )?.name || req.name}
                                        's leave request. Provide remarks to
                                        explain the decision.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label
                                          htmlFor="rejection-remarks"
                                          className="text-sm font-medium"
                                        >
                                          Remarks
                                        </Label>
                                        <Textarea
                                          id="rejection-remarks"
                                          value={remarks}
                                          onChange={(e) =>
                                            setRemarks(e.target.value)
                                          }
                                          placeholder="Explain why this leave request is being rejected..."
                                          className="mt-1"
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="destructive"
                                          onClick={handleRejectConfirm}
                                          className="flex-1"
                                          disabled={loading}
                                        >
                                          <MessageSquare className="h-4 w-4 mr-2" />
                                          Send Rejection
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={handleCancelReject}
                                          className="flex-1"
                                          disabled={loading}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {indexOfFirstItem + 1} to{" "}
                      {Math.min(indexOfLastItem, filteredRequests.length)} of{" "}
                      {filteredRequests.length} results
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
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => paginate(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
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
          )}

          {/* Reason Modal */}
          <Dialog open={openReasonDialog} onOpenChange={setOpenReasonDialog}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="text-xl">Leave Reason</DialogTitle>
                <DialogDescription>
                  Full reason for the leave request.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{currentReason}</p>
                </div>
                <Button
                  onClick={() => setOpenReasonDialog(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="holidays" className="mt-0 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Holidays
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage company holidays
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Select value={holidayFilter} onValueChange={setHolidayFilter}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 shadow-sm">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter holidays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All ({holidayCounts.allCount})
                  </SelectItem>
                  <SelectItem value="upcoming">
                    Upcoming ({holidayCounts.upcomingCount})
                  </SelectItem>
                  <SelectItem value="past">
                    Past ({holidayCounts.pastCount})
                  </SelectItem>
                  <SelectItem value="paid">
                    Paid ({holidayCounts.paidCount})
                  </SelectItem>
                  <SelectItem value="unpaid">
                    Unpaid ({holidayCounts.unpaidCount})
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  resetHolidayForm();
                  setOpenAddHolidayDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Holiday
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Company Holidays</CardTitle>
              <CardDescription>
                View and manage upcoming company holidays
              </CardDescription>
            </CardHeader>
            <CardContent>
              {holidaysLoading ? (
                <div className="flex justify-center items-center py-12">
                  <svg
                    className="animate-spin h-8 w-8 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : filteredHolidays.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    No Holidays Found
                  </h3>
                  <p className="text-muted-foreground">
                    No {holidayFilter} holidays match your filter.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Holiday Name</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHolidays.map((holiday) => (
                        <TableRow key={holiday.id}>
                          <TableCell className="font-medium">
                            {holiday.name}
                          </TableCell>
                          <TableCell>{formatHolidayDates(holiday)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {holiday.description}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                holiday.is_paid ? "default" : "secondary"
                              }
                            >
                              {holiday.is_paid ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewHoliday(holiday)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditHoliday(holiday)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Dialog
                                open={openDeleteHolidayDialog}
                                onOpenChange={setOpenDeleteHolidayDialog}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setDeleteHolidayId(holiday.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Holiday</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete "
                                      {holiday.name}"? This action cannot be
                                      undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        setOpenDeleteHolidayDialog(false)
                                      }
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={handleDeleteHoliday}
                                    >
                                      Delete
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Holiday Dialog */}
      <Dialog
        open={openAddHolidayDialog}
        onOpenChange={setOpenAddHolidayDialog}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Holiday</DialogTitle>
            <DialogDescription>
              Enter details for the company holiday. End date is optional for
              single-day holidays.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="holiday-name" className="text-sm font-medium">
                Holiday Name *
              </Label>
              <Input
                id="holiday-name"
                value={holidayForm.name}
                onChange={(e) =>
                  handleHolidayInputChange("name", e.target.value)
                }
                placeholder="e.g., Christmas Day"
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="holiday-start-date"
                className="text-sm font-medium"
              >
                Start Date *
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !holidayForm.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {holidayForm.startDate
                      ? dateFormat(holidayForm.startDate, "PPP")
                      : "Select start date"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={holidayForm.startDate}
                    onSelect={(date) =>
                      handleDateInputChange("startDate", date)
                    }
                    initialFocus
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <Label htmlFor="holiday-end-date" className="text-sm font-medium">
                End Date (optional)
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !holidayForm.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {holidayForm.endDate
                      ? dateFormat(holidayForm.endDate, "PPP")
                      : "Select end date"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={holidayForm.endDate}
                    onSelect={(date) => handleDateInputChange("endDate", date)}
                    initialFocus
                    disabled={(date) =>
                      holidayForm.startDate && date < holidayForm.startDate
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <Label
                htmlFor="holiday-description"
                className="text-sm font-medium"
              >
                Description *
              </Label>
              <Textarea
                id="holiday-description"
                value={holidayForm.description}
                onChange={(e) =>
                  handleHolidayInputChange("description", e.target.value)
                }
                placeholder="Brief description of the holiday..."
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="holiday-paid"
                checked={holidayForm.isPaid}
                onCheckedChange={(checked) =>
                  handleHolidayInputChange("isPaid", checked)
                }
              />
              <Label
                htmlFor="holiday-paid"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Paid Holiday
              </Label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddHoliday}
                className="flex-1"
                disabled={addHolidayLoading}
              >
                {addHolidayLoading ? <Spinner /> : null}
                {addHolidayLoading ? "Adding..." : "Add Holiday"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenAddHolidayDialog(false);
                  resetHolidayForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Holiday Dialog */}
      <Dialog
        open={openEditHolidayDialog}
        onOpenChange={setOpenEditHolidayDialog}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Holiday</DialogTitle>
            <DialogDescription>
              Update details for the company holiday. End date is optional for
              single-day holidays.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="edit-holiday-name"
                className="text-sm font-medium"
              >
                Holiday Name *
              </Label>
              <Input
                id="edit-holiday-name"
                value={holidayForm.name}
                onChange={(e) =>
                  handleHolidayInputChange("name", e.target.value)
                }
                placeholder="e.g., Christmas Day"
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="edit-holiday-start-date"
                className="text-sm font-medium"
              >
                Start Date *
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !holidayForm.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {holidayForm.startDate
                      ? dateFormat(holidayForm.startDate, "PPP")
                      : "Select start date"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={holidayForm.startDate}
                    onSelect={(date) =>
                      handleDateInputChange("startDate", date)
                    }
                    initialFocus
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <Label
                htmlFor="edit-holiday-end-date"
                className="text-sm font-medium"
              >
                End Date (optional)
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !holidayForm.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {holidayForm.endDate
                      ? dateFormat(holidayForm.endDate, "PPP")
                      : "Select end date"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={holidayForm.endDate}
                    onSelect={(date) => handleDateInputChange("endDate", date)}
                    initialFocus
                    disabled={(date) =>
                      holidayForm.startDate && date < holidayForm.startDate
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <Label
                htmlFor="edit-holiday-description"
                className="text-sm font-medium"
              >
                Description *
              </Label>
              <Textarea
                id="edit-holiday-description"
                value={holidayForm.description}
                onChange={(e) =>
                  handleHolidayInputChange("description", e.target.value)
                }
                placeholder="Brief description of the holiday..."
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-holiday-paid"
                checked={holidayForm.isPaid}
                onCheckedChange={(checked) =>
                  handleHolidayInputChange("isPaid", checked)
                }
              />
              <Label
                htmlFor="edit-holiday-paid"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Paid Holiday
              </Label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateHoliday}
                className="flex-1"
                disabled={updateHolidayLoading}
              >
                {updateHolidayLoading ? <Spinner /> : null}
                {updateHolidayLoading ? "Updating..." : "Update Holiday"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenEditHolidayDialog(false);
                  resetHolidayForm();
                  setCurrentHoliday(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Holiday Dialog */}
      <Dialog
        open={openViewHolidayDialog}
        onOpenChange={setOpenViewHolidayDialog}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {currentHoliday?.name}
            </DialogTitle>
            <DialogDescription>Holiday details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Dates</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {formatHolidayDates(currentHoliday)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {currentHoliday?.description}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Paid</Label>
              <Badge
                variant={currentHoliday?.is_paid ? "default" : "secondary"}
                className="mt-1"
              >
                {currentHoliday?.is_paid ? "Yes" : "No"}
              </Badge>
            </div>
            <Button
              onClick={() => setOpenViewHolidayDialog(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerLeave;
