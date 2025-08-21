import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MiscReports = () => {
  const { toast } = useToast();
  const [overtimeData, setOvertimeData] = useState([]);
  const [taxData, setTaxData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Generate sample overtime breakdown
      const overtimeBreakdown = [
        {
          employee_id: "EMP001",
          employee_name: "John Smith",
          regular_hours: 70,
          overtime_hours: 8.5,
          overtime_rate: 1.5,
          overtime_amount: 382.5,
          period: "May 1 - May 15, 2025",
        },
        {
          employee_id: "EMP002",
          employee_name: "Sarah Johnson",
          regular_hours: 70,
          overtime_hours: 10,
          overtime_rate: 1.5,
          overtime_amount: 450.0,
          period: "May 1 - May 15, 2025",
        },
        {
          employee_id: "EMP003",
          employee_name: "Mike Davis",
          regular_hours: 70,
          overtime_hours: 5,
          overtime_rate: 1.5,
          overtime_amount: 225.0,
          period: "May 1 - May 15, 2025",
        },
      ];
      setOvertimeData(overtimeBreakdown);

      // Generate tax summary by country
      const taxByCountry = [
        {
          country: "India",
          total_tax: 481.5,
          employee_count: 2,
          currency: "INR",
        },
        {
          country: "USA",
          total_tax: 360.0,
          employee_count: 1,
          currency: "USD",
        },
        {
          country: "UK",
          total_tax: 450.0,
          employee_count: 1,
          currency: "GBP",
        },
      ];
      setTaxData(taxByCountry);

      // Generate analytics
      setAnalytics({
        average_payment_time: 3.2, // days
        total_payments: 4,
        successful_payments: 2,
        failed_payments: 0,
        pending_payments: 2,
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    const symbols = { INR: "₹", USD: "$", GBP: "£" };
    return `${symbols[currency] || "$"}${amount.toFixed(2)}`;
  };

  const exportData = (type) => {
    try {
      let csvContent = "";
      let filename = "";

      if (type === "overtime") {
        csvContent =
          "Employee,Regular Hours,Overtime Hours,Overtime Rate,Overtime Amount,Period\n";
        csvContent += overtimeData
          .map(
            (item) =>
              `${item.employee_name},${item.regular_hours},${item.overtime_hours},${item.overtime_rate},${item.overtime_amount},${item.period}`
          )
          .join("\n");
        filename = "overtime_report.csv";
      } else if (type === "tax") {
        csvContent = "Country,Total Tax,Employee Count,Currency\n";
        csvContent += taxData
          .map(
            (item) =>
              `${item.country},${item.total_tax},${item.employee_count},${item.currency}`
          )
          .join("\n");
        filename = "tax_report.csv";
      } else if (type === "analytics") {
        csvContent = "Metric,Value\n";
        csvContent += `Average Payment Time (days),${analytics?.average_payment_time}\n`;
        csvContent += `Total Payments,${analytics?.total_payments}\n`;
        csvContent += `Successful Payments,${analytics?.successful_payments}\n`;
        csvContent += `Failed Payments,${analytics?.failed_payments}\n`;
        csvContent += `Pending Payments,${analytics?.pending_payments}\n`;
        filename = "payment_analytics.csv";
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overtime Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Overtime Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overtimeData.map((item) => (
                <div
                  key={item.employee_id}
                  className="flex justify-between items-center p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.employee_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.overtime_hours}h overtime @ {item.overtime_rate}x
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${item.overtime_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => exportData("overtime")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Overtime Report
            </Button>
          </CardContent>
        </Card>

        {/* Tax Summary by Country */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tax Summary by Country
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {taxData.map((country) => (
                <div
                  key={country.country}
                  className="flex justify-between items-center p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{country.country}</p>
                    <p className="text-sm text-muted-foreground">
                      {country.employee_count} employees
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(country.total_tax, country.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => exportData("tax")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Tax Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment Analytics */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {analytics.average_payment_time}
                </p>
                <p className="text-sm text-muted-foreground">
                  Avg. Payment Time (days)
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {analytics.successful_payments}
                </p>
                <p className="text-sm text-muted-foreground">
                  Successful Payments
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {analytics.pending_payments}
                </p>
                <p className="text-sm text-muted-foreground">
                  Pending Payments
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {analytics.failed_payments}
                </p>
                <p className="text-sm text-muted-foreground">Failed Payments</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => exportData("analytics")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Analytics Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MiscReports;
