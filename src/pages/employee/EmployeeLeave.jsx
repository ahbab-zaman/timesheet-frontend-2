import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance"; // Adjust path as needed
import { toast } from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EmployeeLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [editingLeave, setEditingLeave] = useState(null);
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
    attachment: "",
  });
  const [leaveTypes] = useState([
    "Casual Leave",
    "Sick Leave",
    "Earned Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Other",
  ]);
  const [formLoading, setFormLoading] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [holidayLoading, setHolidayLoading] = useState(false);
  const [showHolidayDetailsDialog, setShowHolidayDetailsDialog] =
    useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCurrentEmployee = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/employee/me");
        if (isMounted) {
          const employee = response.data.employee;
          console.log("Current employee", employee);
          setCurrentEmployee(employee);
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to fetch employee details. Please try again.");
          console.error("Error fetching current employee:", error);
        }
      }
    };
    fetchCurrentEmployee();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, []);

  useEffect(() => {
    if (currentEmployee) {
      fetchLeaves();
    }
  }, [currentEmployee, currentPage]);

  const fetchLeaves = async () => {
    if (!currentEmployee) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/v1/leave/", {
        params: {
          page: currentPage,
          limit: pageSize,
          createdBy: currentEmployee.id,
        },
      });
      setLeaves(response.data.leaves || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch leaves");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidays = async () => {
    setHolidayLoading(true);
    try {
      const response = await axiosInstance.get("/api/v1/holiday");
      setHolidays(response.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch holidays");
      console.error(err);
    } finally {
      setHolidayLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "fromDate" && !formData.toDate) {
      setFormData((prev) => ({ ...prev, toDate: value }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      leaveType: "",
      fromDate: "",
      toDate: "",
      reason: "",
      attachment: "",
    });
    setEditingLeave(null);
  };

  const handleOpenForm = (leave = null) => {
    if (leave) {
      setEditingLeave(leave);
      setFormData({
        leaveType: leave.leaveType,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        reason: leave.reason,
        attachment: leave.attachment || "",
      });
    } else {
      resetForm();
    }
    setShowFormDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.leaveType || !formData.fromDate || !formData.reason) {
      toast.error("Please fill all required fields");
      return;
    }
    setFormLoading(true);
    try {
      const submitData = {
        ...formData,
        employeeName: currentEmployee.name,
        createdBy: currentEmployee.id,
        toDate: formData.toDate || formData.fromDate,
      };
      if (editingLeave) {
        await axiosInstance.patch(
          `/api/v1/leave/${editingLeave.id}`,
          submitData
        );
        toast.success("Leave updated successfully");
      } else {
        await axiosInstance.post("/api/v1/leave/create", submitData);
        toast.success("Leave created successfully");
      }
      setShowFormDialog(false);
      fetchLeaves();
    } catch (err) {
      toast.error("Failed to save leave");
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await axiosInstance.delete(`/api/v1/leave/${deletingId}`);
      toast.success("Leave deleted successfully");
      fetchLeaves();
    } catch (err) {
      toast.error("Failed to delete leave");
      console.error(err);
    } finally {
      setShowDeleteDialog(false);
      setDeletingId(null);
    }
  };

  const handleView = (leave) => {
    setSelectedLeave(leave);
    setShowDetailsDialog(true);
  };

  const handleViewHoliday = (holiday) => {
    setSelectedHoliday(holiday);
    setShowHolidayDetailsDialog(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!currentEmployee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading employee details...</div>
      </div>
    );
  }

  const leaveContent = (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>My Leave Requests</span>
            <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenForm()}>Add New Leave</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingLeave ? "Edit Leave" : "Add New Leave"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="employeeName">Employee Name</Label>
                    <Input
                      id="employeeName"
                      name="employeeName"
                      value={currentEmployee.name}
                      readOnly
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select
                      value={formData.leaveType}
                      onValueChange={(value) =>
                        handleSelectChange("leaveType", value)
                      }
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Leave Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fromDate">From Date</Label>
                    <Input
                      id="fromDate"
                      type="date"
                      name="fromDate"
                      value={formData.fromDate}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="toDate">
                      To Date (Optional for single day)
                    </Label>
                    <Input
                      id="toDate"
                      type="date"
                      name="toDate"
                      value={formData.toDate}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder="Reason"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attachment">
                      Attachment (URL or filename)
                    </Label>
                    <Input
                      id="attachment"
                      type="text"
                      name="attachment"
                      value={formData.attachment}
                      onChange={handleInputChange}
                      placeholder="Attachment URL or filename"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={formLoading}>
                      {formLoading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>From Date</TableHead>
                  <TableHead>To Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="text-4xl mb-4">📅</div>
                        <h3 className="text-lg font-semibold mb-1">
                          No Leaves Found
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          You haven't requested any leaves yet. <br />
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleOpenForm()}
                            className="h-auto p-0 font-normal"
                          >
                            Add your first leave request
                          </Button>
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>{leave.employeeName}</TableCell>
                      <TableCell>{leave.leaveType}</TableCell>
                      <TableCell>{leave.fromDate}</TableCell>
                      <TableCell>{leave.toDate}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {leave.reason}
                      </TableCell>
                      <TableCell>{leave.status || "Pending"}</TableCell>
                      <TableCell className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(leave)}
                        >
                          👁️
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenForm(leave)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(leave.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    size="sm"
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Details</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-2">
              <p>
                <strong>Employee:</strong> {selectedLeave.employeeName}
              </p>
              <p>
                <strong>Type:</strong> {selectedLeave.leaveType}
              </p>
              <p>
                <strong>From:</strong> {selectedLeave.fromDate}
              </p>
              <p>
                <strong>To:</strong> {selectedLeave.toDate}
              </p>
              <p>
                <strong>Reason:</strong> {selectedLeave.reason}
              </p>
              <p>
                <strong>Attachment:</strong>{" "}
                {selectedLeave.attachment || "None"}
              </p>
              <p>
                <strong>Status:</strong> {selectedLeave.status || "Pending"}
              </p>
              <p>
                <strong>Created By:</strong> {selectedLeave.createdBy}
              </p>
              <p>
                <strong>Created At:</strong> {selectedLeave.createdAt}
              </p>
              {selectedLeave.remarks && (
                <p>
                  <strong>Remarks:</strong> {selectedLeave.remarks}
                </p>
              )}
              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this leave request? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  const holidayContent = (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Company Holidays</CardTitle>
        </CardHeader>
        <CardContent>
          {holidayLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-lg">Loading holidays...</div>
            </div>
          ) : holidays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold mb-1">No Holidays Found</h3>
              <p className="text-muted-foreground text-sm">
                No company holidays scheduled at the moment. <br />
                Check back later for updates!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell>{holiday.name}</TableCell>
                      <TableCell>{holiday.start_date}</TableCell>
                      <TableCell>{holiday.end_date || "Single Day"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {holiday.description}
                      </TableCell>
                      <TableCell>{holiday.is_paid ? "Yes" : "No"}</TableCell>
                      <TableCell className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewHoliday(holiday)}
                        >
                          👁️
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Holiday Details Dialog */}
      <Dialog
        open={showHolidayDetailsDialog}
        onOpenChange={setShowHolidayDetailsDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Holiday Details</DialogTitle>
          </DialogHeader>
          {selectedHoliday && (
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedHoliday.name}
              </p>
              <p>
                <strong>Start Date:</strong> {selectedHoliday.start_date}
              </p>
              <p>
                <strong>End Date:</strong>{" "}
                {selectedHoliday.end_date || "Single Day"}
              </p>
              <p>
                <strong>Description:</strong> {selectedHoliday.description}
              </p>
              <p>
                <strong>Paid:</strong> {selectedHoliday.is_paid ? "Yes" : "No"}
              </p>
              <p>
                <strong>Created At:</strong> {selectedHoliday.created_at}
              </p>
              <p>
                <strong>Updated At:</strong> {selectedHoliday.updated_at}
              </p>
              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );

  if (loading && leaves.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading leaves...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 space-y-6">
      <Tabs defaultValue="leaves" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leaves">My Leaves</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>
        <TabsContent value="leaves" className="mt-4">
          {leaveContent}
        </TabsContent>
        <TabsContent value="holidays" className="mt-4">
          {holidayContent}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeLeave;
