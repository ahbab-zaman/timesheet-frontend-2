import { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  LogOut,
  Plus,
  Search,
  X,
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

export default function EmployeeDashboard() {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
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

  const handleLeaveSubmit = () => {
    setIsSubmitting(true);

    // Simulate async action like API call
    setTimeout(() => {
      toast.success("📝 Your request has been sent to manager for approval");

      setLeaveDialogOpen(false);
      setLeaveType("");
      setFromDate(undefined);
      setToDate(undefined);
      setReason("");
      setAttachment(undefined);
      setIsSubmitting(false);
    }, 1500); // simulate 1.5s delay
  };

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logout successful.");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Timesheet</h1>
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
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="earned">Earned Leave</SelectItem>
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
                    Attachment (Optional)
                  </label>
                  <Input
                    type="file"
                    onChange={(e) => setAttachment(e.target.files?.[0])}
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
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleLogout}>
            <LogOut />
            Sign Out
          </Button>
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
                  "dd, yyyy"
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
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center font-medium border-b pb-2">
        {weekDates.map((date) => (
          <div key={date.toISOString()}>{format(date, "EEE dd")}</div>
        ))}
      </div>

      <Card className="p-4">
        <div className="font-semibold">Absence</div>
        <div className="text-muted-foreground text-center py-2">
          No approved leave for this week.
        </div>
      </Card>

      <Card className="p-4">
        <div className="font-semibold">Job Group: Billable</div>
        <div className="text-muted-foreground text-center py-2">
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
