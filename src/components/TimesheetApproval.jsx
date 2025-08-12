import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Edit3,
  Lock,
  Download,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { format } from "date-fns";

const TimesheetApproval = ({ userRole }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [approvalRules, setApprovalRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("submitted");
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [bulkAction, setBulkAction] = useState("");
  const [selectedTimesheets, setSelectedTimesheets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [duplicateTimesheets, setDuplicateTimesheets] = useState([]);

  useEffect(() => {
    fetchTimesheets();
    fetchApprovalRules();
    if (showDuplicates) {
      detectDuplicates();
    }
  }, [filter, showDuplicates]);

  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockTimesheets = [
        {
          id: "1",
          employee_id: "EMP001",
          status: "submitted",
          total_hours: 35,
          week_start_date: "2025-08-04",
          week_end_date: "2025-08-10",
          submitted_at: "2025-08-11T10:00:00Z",
          employees: { name: "John Doe", email: "john@example.com" },
          time_entries: [
            {
              id: "1",
              date: "2025-08-04",
              hours: 8,
              description: "Development task",
            },
            { id: "2", date: "2025-08-05", hours: 7, description: "Meeting" },
            {
              id: "3",
              date: "2025-08-06",
              hours: 6,
              description: "Bug fixing",
            },
          ],
        },
        {
          id: "2",
          employee_id: "EMP002",
          status: "approved",
          total_hours: 40,
          week_start_date: "2025-08-04",
          week_end_date: "2025-08-10",
          submitted_at: "2025-08-11T11:00:00Z",
          approved_at: "2025-08-12T09:00:00Z",
          approved_by: "Manager1",
          employees: { name: "Jane Smith", email: "jane@example.com" },
          time_entries: [
            { id: "4", date: "2025-08-04", hours: 9, description: "Design" },
            { id: "5", date: "2025-08-05", hours: 8, description: "Review" },
          ],
        },
        {
          id: "3",
          employee_id: "EMP001",
          status: "rejected",
          total_hours: 45,
          week_start_date: "2025-08-04",
          week_end_date: "2025-08-10",
          submitted_at: "2025-08-11T12:00:00Z",
          comments: "Exceeded hours limit",
          employees: { name: "John Doe", email: "john@example.com" },
          time_entries: [
            { id: "6", date: "2025-08-04", hours: 10, description: "Testing" },
            {
              id: "7",
              date: "2025-08-05",
              hours: 9,
              description: "Documentation",
            },
          ],
        },
      ];
      setTimesheets(mockTimesheets);
    } catch (error) {
      toast({
        title: "Error fetching timesheets",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalRules = async () => {
    try {
      // Mock approval rules
      const mockRules = [
        {
          id: "1",
          rule_type: "auto",
          conditions: { max_hours_per_day: 8, max_total_hours: 40 },
          auto_approve_threshold: 40,
        },
        {
          id: "2",
          rule_type: "manual",
          conditions: { requires_manager_review: true },
        },
      ];
      setApprovalRules(mockRules);
    } catch (error) {
      console.log("Approval rules not configured yet");
    }
  };

  const detectDuplicates = async () => {
    try {
      // Mock duplicate detection
      const duplicates = timesheets.filter(
        (t) => t.employee_id === "EMP001" && t.week_start_date === "2025-08-04"
      );
      setDuplicateTimesheets(duplicates);
    } catch (error) {
      toast({
        title: "Error detecting duplicates",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBulkApprove = async () => {
    if (selectedTimesheets.length === 0) return;

    try {
      const updatedTimesheets = timesheets.map((t) =>
        selectedTimesheets.includes(t.id)
          ? { ...t, status: "approved", approved_at: new Date().toISOString() }
          : t
      );
      setTimesheets(updatedTimesheets);
      toast({
        title: "Bulk approval completed",
        description: `${selectedTimesheets.length} timesheets approved`,
      });
      setSelectedTimesheets([]);
      fetchTimesheets();
    } catch (error) {
      toast({
        title: "Error in bulk approval",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const lockTimesheet = async (timesheetId) => {
    try {
      const updatedTimesheets = timesheets.map((t) =>
        t.id === timesheetId
          ? { ...t, status: "locked", locked_at: new Date().toISOString() }
          : t
      );
      setTimesheets(updatedTimesheets);
      toast({
        title: "Timesheet locked",
        description: "Timesheet is now locked for billing",
      });
      fetchTimesheets();
    } catch (error) {
      toast({
        title: "Error locking timesheet",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportTimesheets = async (format) => {
    try {
      // Mock export
      const data = `Timesheet Data for ${
        selectedTimesheets.length > 0
          ? selectedTimesheets.length
          : timesheets.length
      } entries`;
      const blob = new Blob([data], { type: getContentType(format) });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timesheets_${format}_${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Export completed",
        description: `Timesheets exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getContentType = (format) => {
    switch (format) {
      case "csv":
        return "text/csv";
      case "pdf":
        return "application/pdf";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      default:
        return "text/plain";
    }
  };

  const updateTimeEntry = async (entryId, updates) => {
    try {
      const updatedTimesheets = timesheets.map((t) =>
        t.id === selectedTimesheet?.id
          ? {
              ...t,
              time_entries: t.time_entries.map((e) =>
                e.id === entryId ? { ...e, ...updates } : e
              ),
            }
          : t
      );
      setTimesheets(updatedTimesheets);
      toast({
        title: "Time entry updated",
        description: "Changes saved successfully",
      });
      fetchTimesheets();
      setEditingEntry(null);
    } catch (error) {
      toast({
        title: "Error updating entry",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status, isLocked) => {
    if (isLocked) {
      return (
        <Badge variant="outline" className="bg-gray-100">
          <Lock className="h-3 w-3 mr-1" />
          Locked
        </Badge>
      );
    }

    const variants = {
      submitted: { variant: "secondary", label: "🟡 Pending", icon: Clock },
      approved: { variant: "default", label: "✅ Approved", icon: CheckCircle },
      rejected: { variant: "destructive", label: "🔴 Rejected", icon: XCircle },
      draft: { variant: "outline", label: "Draft", icon: Edit3 },
    };

    const config = variants[status] || variants.draft;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredTimesheets = timesheets.filter(
    (timesheet) =>
      timesheet.employees.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      timesheet.employees.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayTimesheets = showDuplicates
    ? duplicateTimesheets
    : filteredTimesheets;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === "submitted" ? "default" : "outline"}
            onClick={() => setFilter("submitted")}
            size="sm"
          >
            Pending ({timesheets.filter((t) => t.status === "submitted").length}
            )
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

        <div className="flex gap-2">
          <Input
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48"
          />
          <Button
            variant={showDuplicates ? "default" : "outline"}
            onClick={() => setShowDuplicates(!showDuplicates)}
            size="sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicates ({duplicateTimesheets.length})
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTimesheets.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedTimesheets.length} timesheet(s) selected
              </span>
              <div className="flex gap-2">
                <Button onClick={handleBulkApprove} size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Bulk Approve
                </Button>
                <Button
                  onClick={() => exportTimesheets("csv")}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  onClick={() => exportTimesheets("pdf")}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timesheets List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading timesheets...</p>
            </CardContent>
          </Card>
        ) : displayTimesheets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No timesheets found</p>
            </CardContent>
          </Card>
        ) : (
          displayTimesheets.map((timesheet) => (
            <Card key={timesheet.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTimesheets.includes(timesheet.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTimesheets([
                            ...selectedTimesheets,
                            timesheet.id,
                          ]);
                        } else {
                          setSelectedTimesheets(
                            selectedTimesheets.filter(
                              (id) => id !== timesheet.id
                            )
                          );
                        }
                      }}
                      className="rounded"
                    />
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {timesheet.employees.name}
                        {showDuplicates && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Duplicate
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {timesheet.employees.email} • Week of{" "}
                        {format(
                          new Date(timesheet.week_start_date),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(timesheet.status, !!timesheet.locked_at)}
                    <Badge variant="outline">
                      {timesheet.total_hours}h total
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Time Entries */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Time Entries</h4>
                    {timesheet.time_entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <div>
                          <span className="font-medium">
                            {format(new Date(entry.date), "MMM dd")}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{entry.hours}h</span>
                          {entry.description && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-muted-foreground">
                                {entry.description}
                              </span>
                            </>
                          )}
                        </div>
                        {userRole === "admin" && !timesheet.locked_at && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingEntry(entry)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    {timesheet.status === "submitted" && (
                      <>
                        <Button
                          onClick={() => {
                            const autoRule = approvalRules.find(
                              (r) => r.rule_type === "auto"
                            );
                            if (
                              autoRule &&
                              timesheet.total_hours <=
                                (autoRule.auto_approve_threshold || 40)
                            ) {
                              handleBulkApprove();
                            }
                          }}
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    {timesheet.status === "approved" &&
                      userRole === "admin" &&
                      !timesheet.locked_at && (
                        <Button
                          onClick={() => lockTimesheet(timesheet.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Lock for Billing
                        </Button>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Entry Dialog */}
      {editingEntry && (
        <Dialog
          open={!!editingEntry}
          onOpenChange={() => setEditingEntry(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Time Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={editingEntry.hours}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      hours: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingEntry.description || ""}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    updateTimeEntry(editingEntry.id, {
                      hours: editingEntry.hours,
                      description: editingEntry.description,
                    })
                  }
                >
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingEntry(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TimesheetApproval;
