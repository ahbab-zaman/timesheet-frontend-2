import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Download,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import MiscReports from "./MiscReports";

const PaymentTracker = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [viewMode, setViewMode] = useState("table");
  const [activeTab, setActiveTab] = useState("tracker");

  useEffect(() => {
    fetchPaymentData();
  }, [selectedMonth]);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter]);

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      // Generate sample payment data
      const samplePayments = [
        {
          id: "1",
          employee_id: "EMP001",
          employee_name: "John Smith",
          payment_id: "P001",
          pay_period: "May 1 - May 15, 2025",
          hours: 78.5,
          amount: 2355.0,
          status: "paid",
          payment_date: "May 18, 2025",
          created_at: "2025-05-01",
          overtime_hours: 8.5,
          country: "India",
          tax_amount: 235.5,
          currency: "INR",
        },
        {
          id: "2",
          employee_id: "EMP002",
          employee_name: "Sarah Johnson",
          payment_id: "P002",
          pay_period: "May 1 - May 15, 2025",
          hours: 80,
          amount: 2400.0,
          status: "pending",
          created_at: "2025-05-01",
          overtime_hours: 10,
          country: "USA",
          tax_amount: 360.0,
          currency: "USD",
        },
        {
          id: "3",
          employee_id: "EMP003",
          employee_name: "Mike Davis",
          payment_id: "P003",
          pay_period: "May 1 - May 15, 2025",
          hours: 75,
          amount: 2250.0,
          status: "processing",
          created_at: "2025-05-01",
          overtime_hours: 5,
          country: "UK",
          tax_amount: 450.0,
          currency: "GBP",
        },
        {
          id: "4",
          employee_id: "EMP004",
          employee_name: "Lisa Chen",
          payment_id: "P004",
          pay_period: "April 16 - April 30, 2025",
          hours: 82,
          amount: 2460.0,
          status: "paid",
          payment_date: "May 3, 2025",
          created_at: "2025-04-16",
          overtime_hours: 12,
          country: "India",
          tax_amount: 246.0,
          currency: "INR",
        },
      ];

      setPayments(samplePayments);
    } catch (error) {
      console.error("Error fetching payment data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.employee_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.payment_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const getStatusBadge = (status) => {
    const variants = {
      paid: { variant: "default", color: "bg-green-500" },
      pending: { variant: "secondary", color: "bg-yellow-500" },
      processing: { variant: "secondary", color: "bg-blue-500" },
      failed: { variant: "destructive", color: "bg-red-500" },
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="capitalize">
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount, currency) => {
    const symbols = { INR: "₹", USD: "$", GBP: "£" };
    return `${symbols[currency] || "$"}${amount.toFixed(2)}`;
  };

  const exportData = (type) => {
    try {
      let csvContent = "";
      let filename = "";

      if (type === "payments") {
        csvContent =
          "Employee,Payment ID,Pay Period,Hours,Amount,Status,Payment Date\n";
        csvContent += filteredPayments
          .map(
            (payment) =>
              `${payment.employee_name},${payment.payment_id},${
                payment.pay_period
              },${payment.hours},${payment.amount},${payment.status},${
                payment.payment_date || ""
              }`
          )
          .join("\n");
        filename = `payment_tracker_${selectedMonth}.csv`;
      }

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `${type} report exported successfully`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  const totalPayouts = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPayouts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              For current pay period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paidAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((paidAmount / totalPayouts) * 100)}% of total payouts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${pendingAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((pendingAmount / totalPayouts) * 100)}% of total
              payouts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment History</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025-08">August 2025</SelectItem>
                  <SelectItem value="2025-07">July 2025</SelectItem>
                  <SelectItem value="2025-06">June 2025</SelectItem>
                  <SelectItem value="2025-05">May 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={statusFilter === "paid" ? "default" : "outline"}
              onClick={() => setStatusFilter("paid")}
              size="sm"
            >
              Paid
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => setStatusFilter("pending")}
              size="sm"
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "processing" ? "default" : "outline"}
              onClick={() => setStatusFilter("processing")}
              size="sm"
            >
              Processing
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                onClick={() => setViewMode("table")}
                size="sm"
              >
                Table View
              </Button>
              <Button
                variant={viewMode === "detail" ? "default" : "outline"}
                onClick={() => setViewMode("detail")}
                size="sm"
              >
                Detail View
              </Button>
            </div>
          </div>

          {/* Payment Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.employee_name}
                    </TableCell>
                    <TableCell>{payment.payment_id}</TableCell>
                    <TableCell>{payment.pay_period}</TableCell>
                    <TableCell>{payment.hours}</TableCell>
                    <TableCell>
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{payment.payment_date || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Export Button */}
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => exportData("payments")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Payment Report
          </Button>
        </CardContent>
      </Card>


      <MiscReports />
    </div>
  );
};

export default PaymentTracker;
