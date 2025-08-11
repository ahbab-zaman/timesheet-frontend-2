import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CreditCard,
  DownloadIcon,
  Gift,
  History,
  LogOut,
  Receipt,
  Shield,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit2, FileText, DollarSign, AlertCircle } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";

const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [editingRate, setEditingRate] = useState(null);
  const [newRate, setNewRate] = useState(0);
  const [bonusForm, setBonusForm] = useState({
    employee_id: "",
    amount: 0,
    month: "",
    reason: "",
  });
  const [bankForm, setBankForm] = useState({
    employee_id: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder_name: "",
    upi_id: "",
  });
  const dispatch = useDispatch();

  const tabs = [
    "Overview",
    "Bonus",
    "Failed Payments",
    "Payment History",
    "Disputes",
    "Bank Details",
    "Blocked",
    "Invoices",
  ];

  // Dummy data for employees
  const employees = [
    {
      id: "1",
      name: "John Doe",
      employee_id: "EMP001",
      email: "john.doe@example.com",
    },
    {
      id: "2",
      name: "Jane Smith",
      employee_id: "EMP002",
      email: "jane.smith@example.com",
    },
    {
      id: "3",
      name: "Alice Johnson",
      employee_id: "EMP003",
      email: "alice.johnson@example.com",
    },
  ];

  // Dummy data for filteredSummary
  const filteredSummary = [
    {
      employee_id: "1",
      name: "John Doe",
      employee_number: "EMP001",
      email: "john.doe@example.com",
      project_name: "Project Alpha",
      approved_hours: 160,
      hourly_rate: 500,
      payment_amount: 80000,
      status: "Unpaid",
    },
    {
      employee_id: "2",
      name: "Jane Smith",
      employee_number: "EMP002",
      email: "jane.smith@example.com",
      project_name: "Project Beta",
      approved_hours: 140,
      hourly_rate: 600,
      payment_amount: 84000,
      status: "Paid",
    },
    {
      employee_id: "3",
      name: "Alice Johnson",
      employee_number: "EMP003",
      email: "alice.johnson@example.com",
      project_name: "Project Gamma",
      approved_hours: 120,
      hourly_rate: 550,
      payment_amount: 66000,
      status: "Unpaid",
    },
  ];

  // Dummy data for bonuses
  const bonuses = [
    {
      id: "1",
      employee: { name: "John Doe", employee_id: "EMP001" },
      amount: 5000,
      month: "2025-08-01",
      status: "approved",
    },
    {
      id: "2",
      employee: { name: "Jane Smith", employee_id: "EMP002" },
      amount: 3000,
      month: "2025-08-01",
      status: "pending",
    },
  ];

  // Dummy data for payment failures
  const paymentFailures = [
    {
      id: "1",
      employee: { name: "John Doe", employee_id: "EMP001" },
      amount: 80000,
      reason: "Invalid bank details",
      retry_count: 2,
      retry_status: "pending",
    },
    {
      id: "2",
      employee: { name: "Alice Johnson", employee_id: "EMP003" },
      amount: 66000,
      reason: "Insufficient funds",
      retry_count: 1,
      retry_status: "pending",
    },
  ];

  // Dummy data for disputes
  const disputes = [
    {
      id: "1",
      employee: { name: "Jane Smith", employee_id: "EMP002" },
      title: "Incorrect Hours",
      category: "Payroll",
      priority: "high",
      status: "open",
      created_at: "2025-08-01",
    },
    {
      id: "2",
      employee: { name: "John Doe", employee_id: "EMP001" },
      title: "Bonus Dispute",
      category: "Bonus",
      priority: "medium",
      status: "resolved",
      created_at: "2025-07-15",
    },
  ];

  // Dummy data for bank details
  const bankDetails = [
    {
      id: "1",
      employee: { name: "John Doe", employee_id: "EMP001" },
      bank_name: "State Bank of India",
      account_number: "1234567890",
      is_verified: true,
      is_blocked: false,
    },
    {
      id: "2",
      employee: { name: "Jane Smith", employee_id: "EMP002" },
      bank_name: "HDFC Bank",
      account_number: "9876543210",
      is_verified: false,
      is_blocked: false,
    },
  ];

  // Dummy data for blocked employees
  const blockedEmployees = [
    {
      id: "3",
      name: "Alice Johnson",
      employee_id: "EMP003",
      department: "Engineering",
      block_reason: "Incomplete documentation",
      payroll_blocked: true,
    },
  ];

  // Helper functions
  const selectAllUnpaid = () => {
    const unpaidIds = filteredSummary
      .filter((s) => s.status === "Unpaid")
      .map((s) => s.employee_id);
    setSelectedEmployees(new Set(unpaidIds));
  };

  const toggleEmployeeSelection = (employeeId) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleUpdateRate = (employeeId, rate) => {
    console.log(`Updating rate for employee ${employeeId} to ₹${rate}/hr`);
    setEditingRate(null);
  };

  const generateInvoice = (summary) => {
    console.log(`Generating invoice for employee ${summary.name}`);
  };

  const handleReleasePayment = (summary) => {
    console.log(`Releasing payment for employee ${summary.name}`);
  };

  const handleAddBankDetails = () => {
    console.log("Adding bank details:", bankForm);
  };

  // Dummy month options
  const generateMonthOptions = () => [
    { value: "2025-08-01", label: "August 2025" },
    { value: "2025-07-01", label: "July 2025" },
  ];

  // Dummy format function
  const format = (date, formatString) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: formatString.includes("MMM") ? "short" : "long",
      day: formatString.includes("dd") ? "2-digit" : undefined,
      year: "numeric",
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logout successful.");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        {/* <NavLink to="/finance/dashboard">
        <Button variant="ghost" className="text-sm cursor-pointer">
          <ArrowLeft />
          Back to Home
        </Button>
        </NavLink> */}
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-2xl font-bold">AIREPRO Finance Dashboard</h1>
            <p className="text-muted-foreground">
              Manage employee payments and payroll
            </p>
          </div>
          <div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Monthly Summary" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly-aug-2025">August 2025</SelectItem>
            <SelectItem value="monthly-jul-2025">July 2025</SelectItem>
            <SelectItem value="monthly-jun-2025">June 2025</SelectItem>
            <SelectItem value="monthly-may-2025">May 2025</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger>
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-projects">All Projects</SelectItem>
          </SelectContent>
        </Select>

        <Input placeholder="Search employees..." />

        <Button className="flex items-center gap-2">
          <DownloadIcon className="w-4 h-4" /> Export
        </Button>
      </div>
      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline">Select All Unpaid</Button>
        <Button variant="outline">Clear Selection</Button>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Payments</p>
            <p className="text-xl font-semibold">₹0</p>
            <p className="text-sm text-muted-foreground">0 employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Paid This Period</p>
            <p className="text-xl font-semibold">₹0</p>
            <p className="text-sm text-muted-foreground">
              0 payments completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Employees</p>
            <p className="text-xl font-semibold">0</p>
            <p className="text-sm text-muted-foreground">Aug 2025</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Hours</p>
            <p className="text-xl font-semibold">0h</p>
            <p className="text-sm text-muted-foreground">Approved hours</p>
          </CardContent>
        </Card>
      </div>
      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bonus">Bonus</TabsTrigger>
          <TabsTrigger value="failures">Failed Payments</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Bulk Actions */}
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <Button variant="outline" size="sm" onClick={selectAllUnpaid}>
              Select All Unpaid
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedEmployees(new Set())}
            >
              Clear Selection
            </Button>
            {selectedEmployees.size > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedEmployees.size} employee(s) selected
              </span>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Payroll Summary</CardTitle>
              <CardDescription>
                Employee payroll summary for{" "}
                {format(new Date("2025-08-01"), "MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedEmployees.size ===
                            filteredSummary.filter((s) => s.status === "Unpaid")
                              .length &&
                          filteredSummary.filter((s) => s.status === "Unpaid")
                            .length > 0
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            selectAllUnpaid();
                          } else {
                            setSelectedEmployees(new Set());
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSummary.map((summary) => (
                    <TableRow key={summary.employee_id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEmployees.has(summary.employee_id)}
                          onCheckedChange={() =>
                            toggleEmployeeSelection(summary.employee_id)
                          }
                          disabled={summary.status === "Paid"}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{summary.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {summary.employee_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {summary.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {summary.project_name}
                        </Badge>
                      </TableCell>
                      <TableCell>{summary.approved_hours}h</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {editingRate === summary.employee_id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={newRate}
                                onChange={(e) =>
                                  setNewRate(Number(e.target.value))
                                }
                                className="w-20 h-8"
                              />
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateRate(summary.employee_id, newRate)
                                }
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingRate(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>₹{summary.hourly_rate}/hr</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingRate(summary.employee_id);
                                  setNewRate(summary.hourly_rate);
                                }}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{summary.payment_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            summary.status === "Paid" ? "default" : "secondary"
                          }
                        >
                          {summary.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateInvoice(summary)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Invoice
                          </Button>
                          {summary.status === "Unpaid" &&
                            summary.approved_hours > 0 && (
                              <Button
                                size="sm"
                                onClick={() => handleReleasePayment(summary)}
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Release Payment
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bonus" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Allocate Bonus
                </CardTitle>
                <CardDescription>
                  Allocate bonus amounts to employees for specific months
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select
                    value={bonusForm.employee_id}
                    onValueChange={(value) =>
                      setBonusForm((prev) => ({
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
                          {emp.name} ({emp.employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bonus Amount (₹)</Label>
                  <Input
                    type="number"
                    value={bonusForm.amount}
                    onChange={(e) =>
                      setBonusForm((prev) => ({
                        ...prev,
                        amount: Number(e.target.value),
                      }))
                    }
                    placeholder="Enter bonus amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select
                    value={bonusForm.month}
                    onValueChange={(value) =>
                      setBonusForm((prev) => ({ ...prev, month: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateMonthOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    value={bonusForm.reason}
                    onChange={(e) =>
                      setBonusForm((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    placeholder="Enter reason for bonus allocation"
                  />
                </div>
                <Button className="w-full">
                  <Gift className="h-4 w-4 mr-2" />
                  Allocate Bonus
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Bonuses</CardTitle>
                <CardDescription>
                  Recently allocated bonuses to employees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bonuses.slice(0, 10).map((bonus) => (
                      <TableRow key={bonus.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {bonus.employee.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {bonus.employee.employee_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{bonus.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {format(new Date(bonus.month), "MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              bonus.status === "approved"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {bonus.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="failures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Failed Payments
              </CardTitle>
              <CardDescription>
                Track and retry failed payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Retry Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentFailures.map((failure) => (
                    <TableRow key={failure.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {failure.employee.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {failure.employee.employee_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{failure.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{failure.reason}</TableCell>
                      <TableCell>{failure.retry_count}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            failure.retry_status === "resolved"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {failure.retry_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {failure.retry_status !== "resolved" && (
                          <Button size="sm" variant="outline">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Retry Payment
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription>
                Complete payment history with filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Payment History</h3>
                <p className="text-muted-foreground">
                  Advanced payment history tracking will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Dispute Center
              </CardTitle>
              <CardDescription>
                Manage employee disputes and grievances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {dispute.employee.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {dispute.employee.employee_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {dispute.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{dispute.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            dispute.priority === "high"
                              ? "destructive"
                              : dispute.priority === "medium"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {dispute.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            dispute.status === "resolved"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {dispute.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(dispute.created_at), "MMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank-details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Add Bank Details
                </CardTitle>
                <CardDescription>
                  Add or update employee bank account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select
                    value={bankForm.employee_id}
                    onValueChange={(value) =>
                      setBankForm((prev) => ({ ...prev, employee_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} ({emp.employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    value={bankForm.bank_name}
                    onChange={(e) =>
                      setBankForm((prev) => ({
                        ...prev,
                        bank_name: e.target.value,
                      }))
                    }
                    placeholder="Enter bank name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    value={bankForm.account_number}
                    onChange={(e) =>
                      setBankForm((prev) => ({
                        ...prev,
                        account_number: e.target.value,
                      }))
                    }
                    placeholder="Enter account number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code</Label>
                  <Input
                    value={bankForm.ifsc_code}
                    onChange={(e) =>
                      setBankForm((prev) => ({
                        ...prev,
                        ifsc_code: e.target.value,
                      }))
                    }
                    placeholder="Enter IFSC code"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Holder Name</Label>
                  <Input
                    value={bankForm.account_holder_name}
                    onChange={(e) =>
                      setBankForm((prev) => ({
                        ...prev,
                        account_holder_name: e.target.value,
                      }))
                    }
                    placeholder="Enter account holder name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>UPI ID (Optional)</Label>
                  <Input
                    value={bankForm.upi_id}
                    onChange={(e) =>
                      setBankForm((prev) => ({
                        ...prev,
                        upi_id: e.target.value,
                      }))
                    }
                    placeholder="Enter UPI ID"
                  />
                </div>
                <Button onClick={handleAddBankDetails} className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Bank Details
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bank Details List</CardTitle>
                <CardDescription>
                  Employee bank account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankDetails.slice(0, 10).map((bank) => (
                      <TableRow key={bank.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {bank.employee.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {bank.employee.employee_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{bank.bank_name}</TableCell>
                        <TableCell>
                          ***{bank.account_number.slice(-4)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                bank.is_verified ? "default" : "secondary"
                              }
                            >
                              {bank.is_verified ? "Verified" : "Pending"}
                            </Badge>
                            {bank.is_blocked && (
                              <Badge variant="destructive">Blocked</Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-destructive" />
                Blocked Employees
              </CardTitle>
              <CardDescription>
                Manage employees blocked from payroll processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Block Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedEmployees
                    .filter((emp) => emp.payroll_blocked)
                    .map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {employee.employee_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.block_reason}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">Blocked</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Shield className="h-4 w-4 mr-1" />
                            Unblock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Invoice Management
              </CardTitle>
              <CardDescription>
                Generate and manage employee invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Invoice Generation</h3>
                <p className="text-muted-foreground">
                  Automated invoice generation system will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceDashboard;
