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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Users, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isWeekend,
} from "date-fns";

const HolidayLeaveCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState([
    {
      id: "1",
      name: "New Year's Day",
      date: "2025-01-01",
      is_recurring: true,
      description: "Annual holiday",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Independence Day",
      date: "2025-07-04",
      is_recurring: true,
      description: "National holiday",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Thanksgiving",
      date: "2025-11-27",
      is_recurring: true,
      description: "National holiday",
      created_at: new Date().toISOString(),
    },
  ]);
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: "1",
      employee_id: "1",
      employee_name: "John Doe",
      start_date: "2025-08-15",
      end_date: "2025-08-20",
      leave_type: "vacation",
      reason: "Family vacation",
      status: "pending",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      employee_id: "2",
      employee_name: "Jane Smith",
      start_date: "2025-08-10",
      end_date: "2025-08-12",
      leave_type: "sick",
      reason: "Medical appointment",
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [employees] = useState([
    { id: "1", name: "John Doe", email: "john.doe@example.com" },
    { id: "2", name: "Jane Smith", email: "jane.smith@example.com" },
    { id: "3", name: "Mike Johnson", email: "mike.johnson@example.com" },
  ]);
  const { toast } = useToast();

  const [holidayForm, setHolidayForm] = useState({
    name: "",
    date: "",
    description: "",
    is_recurring: false,
  });

  const [leaveForm, setLeaveForm] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
    leave_type: "vacation",
    reason: "",
  });

  useEffect(() => {
    setLoading(false);
  }, [currentDate]);

  const handleCreateHoliday = (e) => {
    e.preventDefault();
    try {
      const newHoliday = {
        id: Math.random().toString(36).substring(7),
        ...holidayForm,
        created_at: new Date().toISOString(),
      };

      setHolidays((prev) => [...prev, newHoliday]);

      toast({
        title: "Success",
        description: "Holiday created successfully",
      });

      setHolidayForm({
        name: "",
        date: "",
        description: "",
        is_recurring: false,
      });
      setIsHolidayDialogOpen(false);
    } catch (error) {
      console.error("Error creating holiday:", error);
      toast({
        title: "Error",
        description: "Failed to create holiday",
        variant: "destructive",
      });
    }
  };

  const handleCreateLeaveRequest = (e) => {
    e.preventDefault();
    try {
      const employee = employees.find(
        (emp) => emp.id === leaveForm.employee_id
      );
      const newRequest = {
        id: Math.random().toString(36).substring(7),
        ...leaveForm,
        employee_name: employee?.name || "Unknown",
        status: "pending",
        created_at: new Date().toISOString(),
      };

      setLeaveRequests((prev) => [...prev, newRequest]);

      toast({
        title: "Success",
        description: "Leave request created successfully",
      });

      setLeaveForm({
        employee_id: "",
        start_date: "",
        end_date: "",
        leave_type: "vacation",
        reason: "",
      });
      setIsLeaveDialogOpen(false);
    } catch (error) {
      console.error("Error creating leave request:", error);
      toast({
        title: "Error",
        description: "Failed to create leave request",
        variant: "destructive",
      });
    }
  };

  const handleLeaveStatusUpdate = (requestId, status) => {
    try {
      setLeaveRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status } : req))
      );

      toast({
        title: "Success",
        description: `Leave request ${status}`,
      });
    } catch (error) {
      console.error("Error updating leave status:", error);
      toast({
        title: "Error",
        description: "Failed to update leave status",
        variant: "destructive",
      });
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");

    const dayHolidays = holidays.filter((h) => h.date === dateStr);
    const dayLeaves = leaveRequests.filter((req) => {
      const start = new Date(req.start_date);
      const end = new Date(req.end_date);
      return date >= start && date <= end;
    });

    return { holidays: dayHolidays, leaves: dayLeaves };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Holiday & Leave Calendar
          </CardTitle>
          <CardDescription>
            Manage company holidays and employee leave requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() - 1
                    )
                  )
                }
              >
                Previous
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() + 1
                    )
                  )
                }
              >
                Next
              </Button>
            </div>

            <div className="flex gap-2">
              <Dialog
                open={isHolidayDialogOpen}
                onOpenChange={setIsHolidayDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Holiday
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Holiday</DialogTitle>
                    <DialogDescription>
                      Create a new company holiday
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateHoliday} className="space-y-4">
                    <div>
                      <Label htmlFor="holiday-name">Holiday Name</Label>
                      <Input
                        id="holiday-name"
                        value={holidayForm.name}
                        onChange={(e) =>
                          setHolidayForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="holiday-date">Date</Label>
                      <Input
                        id="holiday-date"
                        type="date"
                        value={holidayForm.date}
                        onChange={(e) =>
                          setHolidayForm((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="holiday-description">Description</Label>
                      <Textarea
                        id="holiday-description"
                        value={holidayForm.description}
                        onChange={(e) =>
                          setHolidayForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Create Holiday
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isLeaveDialogOpen}
                onOpenChange={setIsLeaveDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Leave Request
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Leave Request</DialogTitle>
                    <DialogDescription>
                      Create a new leave request
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={handleCreateLeaveRequest}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="employee">Employee</Label>
                      <Select
                        value={leaveForm.employee_id}
                        onValueChange={(value) =>
                          setLeaveForm((prev) => ({
                            ...prev,
                            employee_id: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={leaveForm.start_date}
                          onChange={(e) =>
                            setLeaveForm((prev) => ({
                              ...prev,
                              start_date: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={leaveForm.end_date}
                          onChange={(e) =>
                            setLeaveForm((prev) => ({
                              ...prev,
                              end_date: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="leave-type">Leave Type</Label>
                      <Select
                        value={leaveForm.leave_type}
                        onValueChange={(value) =>
                          setLeaveForm((prev) => ({
                            ...prev,
                            leave_type: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vacation">Vacation</SelectItem>
                          <SelectItem value="sick">Sick Leave</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        value={leaveForm.reason}
                        onChange={(e) =>
                          setLeaveForm((prev) => ({
                            ...prev,
                            reason: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Create Request
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((date) => {
              const events = getEventsForDate(date);
              const isToday = isSameDay(date, new Date());
              const isWeekendDay = isWeekend(date);

              return (
                <div
                  key={date.toISOString()}
                  className={`
                    min-h-[80px] p-2 border rounded-lg text-sm
                    ${
                      isToday
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted/50"
                    }
                    ${isWeekendDay ? "bg-muted/30" : ""}
                  `}
                >
                  <div className="font-medium mb-1">{format(date, "d")}</div>

                  {events.holidays.map((holiday) => (
                    <Badge
                      key={holiday.id}
                      variant="outline"
                      className="text-xs mb-1 block"
                    >
                      {holiday.name}
                    </Badge>
                  ))}

                  {events.leaves.map((leave) => (
                    <Badge
                      key={leave.id}
                      variant={
                        leave.status === "approved"
                          ? "default"
                          : leave.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs mb-1 block"
                    >
                      {leave.employee_name} - {leave.leave_type}
                    </Badge>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pending Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaveRequests
              .filter((req) => req.status === "pending")
              .map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{request.employee_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {request.leave_type} •{" "}
                      {format(new Date(request.start_date), "MMM d")} -{" "}
                      {format(new Date(request.end_date), "MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.reason}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleLeaveStatusUpdate(request.id, "approved")
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleLeaveStatusUpdate(request.id, "rejected")
                      }
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}

            {leaveRequests.filter((req) => req.status === "pending").length ===
              0 && (
              <div className="text-center py-8 text-muted-foreground">
                No pending leave requests.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HolidayLeaveCalendar;
