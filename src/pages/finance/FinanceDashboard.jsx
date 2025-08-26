import React, { useState, useEffect } from "react";
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
  Ban,
  CreditCard,
  DownloadIcon,
  Gift,
  History,
  LogOut,
  Receipt,
  Shield,
  Trash,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit2, FileText, DollarSign, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import axiosInstance from "../../services/axiosInstance";
import PaymentTracker from "../../components/PaymentTracker";

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
  const [editBankModalOpen, setEditBankModalOpen] = useState(false);
  const [editingBankDetails, setEditingBankDetails] = useState(null);
  const [filteredSummary, setFilteredSummary] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [paymentFailures, setPaymentFailures] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);
  const [blockedEmployees, setBlockedEmployees] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bonusesLoading, setBonusesLoading] = useState(false);
  const [failuresLoading, setFailuresLoading] = useState(false);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
  const [blockedLoading, setBlockedLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentEmployee, setCurrentEmployee] = useState([]);
  const [employees, setEmployees] = useState([]);
  const dispatch = useDispatch();
  const [isAllocatingBonus, setIsAllocatingBonus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSummaries();
    fetchBankDetails();
  }, [searchQuery, statusFilter]);

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.employee_name = searchQuery;
      if (statusFilter !== "all") params.status = statusFilter;
      const response = await axiosInstance.get("api/v1/summary/data", {
        params,
      });
      setFilteredSummary(response.data);
    } catch (error) {
      console.error("Error fetching summaries:", error);
      toast.error("Failed to load summaries");
    } finally {
      setLoading(false);
    }
  };

  const fetchBankDetails = async () => {
    setBankDetailsLoading(true);
    try {
      const response = await axiosInstance.get("api/v1/bank-details/");
      setBankDetails(response.data.bankDetails || []);
      console.log(response.data.bankDetails);
    } catch (error) {
      console.error("Error fetching bank details:", error);
      toast.error("Failed to load bank details");
    } finally {
      setBankDetailsLoading(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", file);
    setImporting(true);
    try {
      await axiosInstance.post("api/v1/summary/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Data imported successfully");
      fetchSummaries();
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error("Failed to import data");
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (searchQuery) params.employee_name = searchQuery;
      if (statusFilter !== "all") params.status = statusFilter;
      const response = await axiosInstance.get("api/v1/summary/export", {
        params,
        responseType: "blob",
      });

      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payroll_summary_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Payroll summary exported successfully!");
    } catch (error) {
      console.error("Error exporting summary:", error);
      toast.error("Failed to export summary");
    }
  };

  const handleRetryPayment = async (id) => {
    try {
      await axiosInstance.post(`api/v1/payment-failures/retry/${id}`);
      toast.success("Payment retry initiated");
      fetchFailedPayments();
    } catch (error) {
      console.error("Error retrying payment:", error);
      toast.error("Failed to retry payment");
    }
  };

  useEffect(() => {
    fetchBonuses();
  }, []);

  const fetchBonuses = async () => {
    setBonusesLoading(true);
    try {
      const response = await axiosInstance.get("api/v1/bonus/");
      setBonuses(response.data.bonuses || []);
      console.log(response.data.bonuses);
    } catch (error) {
      console.error("Error fetching bonuses:", error);
      toast.error("Failed to load bonuses");
    } finally {
      setBonusesLoading(false);
    }
  };

  useEffect(() => {
    const fetchCurrentEmployee = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/employee");
        const employeesList = response.data.employees || [];
        setEmployees(employeesList);
        if (employeesList.length > 0) {
          setCurrentEmployee(employeesList[0]);
        }
        console.log("Fetched employee data:", employeesList);
      } catch (error) {
        toast.error("Failed to fetch employee details. Please try again.");
        console.error("Error fetching current employee:", error);
      }
    };
    fetchCurrentEmployee();
  }, []);

  const handleAddBankDetails = async () => {
    if (isSubmitting) return; // Prevent multiple clicks
    setIsSubmitting(true); // Disable button
    try {
      await axiosInstance.post("api/v1/bank-details/add", bankForm);
      toast.success("Bank details added successfully");
      setBankForm({
        employee_id: "",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        account_holder_name: "",
        upi_id: "",
      });
      fetchBankDetails();
    } catch (error) {
      console.error("Error adding bank details:", error);
      toast.error("Failed to add bank details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBankDetails = async () => {
    try {
      await axiosInstance.put(
        `api/v1/bank-details/update/${editingBankDetails.employee_id}`,
        editingBankDetails
      );
      toast.success("Bank details updated successfully");
      setEditBankModalOpen(false);
      setEditingBankDetails(null);
      fetchBankDetails();
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast.error("Failed to update bank details");
    }
  };

  const handleOpenEditBankModal = (bank) => {
    setEditingBankDetails({
      employee_id: bank.employee_id,
      bank_name: bank.bank_name,
      account_number: bank.account_number,
      ifsc_code: bank.ifsc_code,
      account_holder_name: bank.account_holder_name,
      upi_id: bank.upi_id,
    });
    setEditBankModalOpen(true);
  };

  const handleDeleteBankDetails = async (employee_id) => {
    try {
      await axiosInstance.delete(`api/v1/bank-details/delete/${employee_id}`);
      toast.success("Bank details deleted successfully");
      fetchBankDetails();
    } catch (error) {
      console.error("Error deleting bank details:", error);
      toast.error("Failed to delete bank details");
    }
  };

  const handleUnblockEmployee = async (employee_id) => {
    try {
      await axiosInstance.post(
        `api/v1/blocked-employees/unblock/${employee_id}`
      );
      toast.success("Employee unblocked successfully");
      fetchBlockedEmployees();
    } catch (error) {
      console.error("Error unblocking employee:", error);
      toast.error("Failed to unblock employee");
    }
  };

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

  const handleUpdateRate = async (employeeId, rate) => {
    try {
      await axiosInstance.put(`api/v1/summary/update-rate/${employeeId}`, {
        rate,
      });
      setFilteredSummary((prevSummary) =>
        prevSummary.map((summary) =>
          summary.employee_id === employeeId
            ? {
                ...summary,
                rate: rate,
                amount: summary.hours * rate,
              }
            : summary
        )
      );
      setEditingRate(null);
      toast.success(`Rate updated to ₹${rate}/hr for employee ${employeeId}`);
    } catch (error) {
      console.error("Error updating rate:", error);
      toast.error("Failed to update rate");
    }
  };

  const generateInvoice = (summary) => {
    setSelectedSummary(summary);
    setIsInvoiceModalOpen(true);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(20);
      doc.text("Invoice", 20, 20);
      doc.setFontSize(12);
      doc.text(
        `Date: ${new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "2-digit",
          year: "numeric",
        })}`,
        20,
        30
      );
      doc.setFontSize(14);
      doc.text("Employee Details", 20, 50);
      doc.setFontSize(12);
      doc.text(`Employee ID: ${selectedSummary.employee_id}`, 20, 60);
      doc.text(`Name: ${selectedSummary.employee_name}`, 20, 70);
      doc.text(`Email: ${selectedSummary.email}`, 20, 80);
      doc.text(`Project: ${selectedSummary.project}`, 20, 90);
      doc.setFontSize(14);
      doc.text("Payment Details", 20, 110);
      doc.setFontSize(12);
      doc.text(`Hours Worked: ${selectedSummary.hours}h`, 20, 120);
      doc.text(`Rate: ₹${selectedSummary.rate}/hr`, 20, 130);
      doc.text(`Total Amount: ₹${selectedSummary.amount}`, 20, 140);
      doc.text(`Status: ${selectedSummary.status}`, 20, 150);
      doc.save(
        `invoice_${selectedSummary.employee_id}_${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      );
      toast.success("Invoice exported successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export invoice as PDF");
    }
  };

  const handleReleasePayment = async (summary) => {
    try {
      if (!summary.employee_id || typeof summary.employee_id !== "string") {
        console.error("Invalid or missing employee_id:", summary.employee_id);
        toast.error("Invalid employee ID");
        return;
      }
      console.log("Releasing payment for employee_id:", summary.employee_id);
      const response = await axiosInstance.post(
        `api/v1/summary/release-payment/${summary.employee_id}`
      );
      console.log("API Response:", response.data);
      toast.success(`Payment released for ${summary.employee_name}`);
      setFilteredSummary((prevSummary) =>
        prevSummary.map((item) =>
          item.employee_id === summary.employee_id
            ? { ...item, status: "Paid" }
            : item
        )
      );
    } catch (error) {
      console.error("Error releasing payment:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });
      toast.error(
        `Failed to release payment: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleAllocateBonus = async () => {
    try {
      if (
        !bonusForm.employee_id ||
        !bonusForm.amount ||
        !bonusForm.month ||
        bonusForm.amount <= 0
      ) {
        toast.error("Please fill in all required fields with valid values");
        return;
      }

      setIsAllocatingBonus(true); // Disable the button
      await axiosInstance.post("api/v1/bonus/allocate", bonusForm);
      toast.success("Bonus allocated successfully");
      setBonusForm({
        employee_id: "",
        amount: 0,
        month: "",
        reason: "",
      });
      fetchBonuses();
    } catch (error) {
      console.error("Error allocating bonus:", error);
      toast.error("Failed to allocate bonus");
    } finally {
      setIsAllocatingBonus(false); // Re-enable the button after completion
    }
  };

  const generateMonthOptions = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const options = [];

    for (let month = 0; month <= currentMonth; month++) {
      const monthValue = `${currentYear}-${String(month + 1).padStart(
        2,
        "0"
      )}-01`;
      const monthLabel = `${monthNames[month]} ${currentYear}`;
      options.push({ value: monthValue, label: monthLabel });
    }

    return options;
  };

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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Unpaid">Unpaid</SelectItem>
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
        <Input
          placeholder="Search employees by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center justify-center gap-2">
          <Button className="flex items-center gap-2" onClick={handleExport}>
            <DownloadIcon className="w-4 h-4" /> Export
          </Button>
          <label htmlFor="import-file" className="cursor-pointer">
            <Button variant="secondary" asChild disabled={importing}>
              <span>
                {importing ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
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
                    Importing...
                  </span>
                ) : (
                  "Import"
                )}
              </span>
            </Button>
          </label>
          <input
            id="import-file"
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
            disabled={importing}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Payments</p>
            <p className="text-xl font-semibold">₹ 0.00</p>
            <p className="text-sm text-muted-foreground">
              {filteredSummary.filter((s) => s.status === "Unpaid").length}{" "}
              employees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Paid This Period</p>
            <p className="text-xl font-semibold">₹ 0.00</p>
            <p className="text-sm text-muted-foreground">
              {filteredSummary.filter((s) => s.status === "Paid").length}{" "}
              payments completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Employees</p>
            <p className="text-xl font-semibold">{employees.length}</p>
            <p className="text-sm text-muted-foreground">Aug 2025</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Hours</p>
            <p className="text-xl font-semibold">
              {filteredSummary.reduce((sum, s) => sum + s.hours, 0)}h
            </p>
            <p className="text-sm text-muted-foreground">Approved hours</p>
          </CardContent>
        </Card>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment-tracker">Payment Tracker</TabsTrigger>
          <TabsTrigger value="bonus">Bonus</TabsTrigger>
          <TabsTrigger value="failures">Failed Payments</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-6">
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
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-muted-foreground"
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
              ) : filteredSummary.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No payroll data available
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedEmployees.size ===
                              filteredSummary.filter(
                                (s) => s.status === "Unpaid"
                              ).length &&
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
                      <TableRow key={summary.id}>
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
                            <div className="font-medium">
                              {summary.employee_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {summary.employee_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {summary.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {summary.project}
                          </Badge>
                        </TableCell>
                        <TableCell>{summary.hours}h</TableCell>
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
                                    handleUpdateRate(
                                      summary.employee_id,
                                      newRate
                                    )
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
                                <span>₹{summary.rate}/hr</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingRate(summary.employee_id);
                                    setNewRate(summary.rate);
                                  }}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{summary.amount}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              summary.status === "Paid"
                                ? "default"
                                : "secondary"
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
                            <Button
                              size="sm"
                              onClick={() => handleReleasePayment(summary)}
                              disabled={
                                summary.status === "Paid" || summary.hours === 0
                              }
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Release Payment
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bonus Tab */}
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
                      {employees.length > 0 ? (
                        employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} ({emp.id})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-employees" disabled>
                          No employees available
                        </SelectItem>
                      )}
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
                      <SelectValue placeholder="Select month" />
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
                <Button
                  className="w-full"
                  onClick={handleAllocateBonus}
                  disabled={isAllocatingBonus}
                >
                  {isAllocatingBonus ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
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
                      Allocating...
                    </span>
                  ) : (
                    <>
                      <Gift className="h-4 w-4 mr-2" />
                      Allocate Bonus
                    </>
                  )}
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
                {bonusesLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <svg
                      className="animate-spin h-8 w-8 text-muted-foreground"
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
                ) : bonuses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No bonuses available
                    </p>
                  </div>
                ) : (
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
                                {bonus.employee_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {bonus.employee_id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{bonus.amount}
                          </TableCell>
                          <TableCell>
                            {format(new Date(bonus.month), "MMM yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge>Pending</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment failure Tab */}
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
              {failuresLoading ? (
                <div className="flex justify-center items-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-muted-foreground"
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
              ) : paymentFailures.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No failed payments available
                  </p>
                </div>
              ) : (
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
                              {failure.employee_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {failure.employee_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{failure.amount}
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetryPayment(failure.id)}
                            >
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Retry Payment
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
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
              {invoicesLoading ? (
                <div className="flex justify-center items-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-muted-foreground"
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
              ) : invoices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No payment history available
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {invoice.employee_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {invoice.employee_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{invoice.amount}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.month), "MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "Paid"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateInvoice(invoice)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment disputes Tab */}
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
              {disputesLoading ? (
                <div className="flex justify-center items-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-muted-foreground"
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
              ) : disputes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No disputes available</p>
                </div>
              ) : (
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
                              {dispute.employee_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {dispute.employee_id}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank Details Tab */}
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
                      setBankForm((prev) => ({
                        ...prev,
                        employee_id: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.length > 0 ? (
                        employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} ({emp.id})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-employees" disabled>
                          No employees available
                        </SelectItem>
                      )}
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
                  <Label>IFSC Code (Optional)</Label>
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
                <Button
                  onClick={handleAddBankDetails}
                  className="w-full"
                  disabled={isSubmitting} // Disable button when submitting
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Adding..." : "Add Bank Details"}
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
                {bankDetailsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <svg
                      className="animate-spin h-8 w-8 text-muted-foreground"
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
                ) : bankDetails.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No bank details available
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankDetails.slice(0, 10).map((bank) => (
                        <TableRow key={bank.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {bank.account_holder_name}
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
                          <TableCell className="flex items-center gap-2 lg:flex-row flex-col">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditBankModal(bank)}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDeleteBankDetails(bank.employee_id)
                              }
                              className="ml-2"
                            >
                              <Trash />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
          {editingBankDetails && (
            <Dialog
              open={editBankModalOpen}
              onOpenChange={setEditBankModalOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Edit Bank Details for {editingBankDetails.employee_name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      value={editingBankDetails.bank_name}
                      onChange={(e) =>
                        setEditingBankDetails((prev) => ({
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
                      value={editingBankDetails.account_number}
                      onChange={(e) =>
                        setEditingBankDetails((prev) => ({
                          ...prev,
                          account_number: e.target.value,
                        }))
                      }
                      placeholder="Enter account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC Code (Optional)</Label>
                    <Input
                      value={editingBankDetails.ifsc_code}
                      onChange={(e) =>
                        setEditingBankDetails((prev) => ({
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
                      value={editingBankDetails.account_holder_name}
                      onChange={(e) =>
                        setEditingBankDetails((prev) => ({
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
                      value={editingBankDetails.upi_id}
                      onChange={(e) =>
                        setEditingBankDetails((prev) => ({
                          ...prev,
                          upi_id: e.target.value,
                        }))
                      }
                      placeholder="Enter UPI ID"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditBankModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateBankDetails}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
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
              {blockedLoading ? (
                <div className="flex justify-center items-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-muted-foreground"
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
              ) : blockedEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No blocked employees available
                  </p>
                </div>
              ) : (
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
                    {blockedEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {employee.employee_name}
                            </div>
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUnblockEmployee(employee.employee_id)
                            }
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Unblock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employees Invoices Tab */}
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
              {invoicesLoading ? (
                <div className="flex justify-center items-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-muted-foreground"
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
              ) : invoices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No invoices available</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {invoice.employee_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {invoice.employee_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{invoice.amount}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.month), "MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "Paid"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateInvoice(invoice)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tracker Tab */}
        <TabsContent value="payment-tracker" className="space-y-6">
          <PaymentTracker />
        </TabsContent>
      </Tabs>

      {/* Invoice Modal */}
      {selectedSummary && (
        <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Invoice for {selectedSummary.employee_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Employee Information</h3>
                <p className="text-sm text-muted-foreground">
                  ID: {selectedSummary.employee_id}
                </p>
                <p className="text-sm text-muted-foreground">
                  Name: {selectedSummary.employee_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Email: {selectedSummary.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  Project: {selectedSummary.project}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Payment Details</h3>
                <p className="text-sm text-muted-foreground">
                  Hours Worked: {selectedSummary.hours}h
                </p>
                <p className="text-sm text-muted-foreground">
                  Rate: ₹{selectedSummary.rate}/hr
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Amount: ₹{selectedSummary.amount}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {selectedSummary.status}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsInvoiceModalOpen(false)}
              >
                Close
              </Button>
              <Button
                className="flex items-center gap-2"
                onClick={handleExportPDF}
              >
                <DownloadIcon className="h-4 w-4" />
                Export as PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FinanceDashboard;
