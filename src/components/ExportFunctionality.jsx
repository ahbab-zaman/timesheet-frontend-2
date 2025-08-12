import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, FileSpreadsheet, Calendar } from "lucide-react";
import { format } from "date-fns";
import * as XLSX from "xlsx";

const ExportFunctionality = () => {
  const [filters, setFilters] = useState({
    startDate: format(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      "yyyy-MM-dd"
    ),
    endDate: format(new Date(), "yyyy-MM-dd"),
    employeeId: "all",
    projectId: "all",
    status: "all",
    format: "xlsx",
  });
  const [loading, setLoading] = useState(false);
  const [employees] = useState([
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Mike Johnson" },
  ]);
  const [projects] = useState([
    { id: "1", name: "Project Alpha" },
    { id: "2", name: "Project Beta" },
    { id: "3", name: "Project Gamma" },
  ]);
  const { toast } = useToast();

  const fetchTimesheetData = () => {
    const mockData = [
      {
        id: "1",
        employee_id: "1",
        status: "approved",
        created_at: new Date().toISOString(),
        week_ending: new Date().toISOString(),
        total_hours: 40,
        employees: {
          name: "John Doe",
          email: "john.doe@example.com",
          department: "Engineering",
        },
        time_entries: [
          {
            id: "1",
            date: new Date().toISOString(),
            hours: 8,
            description: "Development work",
            task_id: "1",
            billable: true,
            projects: { name: "Project Alpha" },
          },
        ],
      },
      {
        id: "2",
        employee_id: "2",
        status: "submitted",
        created_at: new Date().toISOString(),
        week_ending: new Date().toISOString(),
        total_hours: 32,
        employees: {
          name: "Jane Smith",
          email: "jane.smith@example.com",
          department: "Design",
        },
        time_entries: [
          {
            id: "2",
            date: new Date().toISOString(),
            hours: 6,
            description: "UI Design",
            task_id: "2",
            billable: false,
            projects: { name: "Project Beta" },
          },
        ],
      },
    ];
    return mockData;
  };

  const formatDataForExport = (data) => {
    const formattedData = [];

    data.forEach((timesheet) => {
      timesheet.time_entries?.forEach((entry) => {
        formattedData.push({
          "Employee Name": timesheet.employees?.name || "Unknown",
          "Employee Email": timesheet.employees?.email || "",
          Department: timesheet.employees?.department || "",
          Date: format(new Date(entry.date), "yyyy-MM-dd"),
          Hours: entry.hours,
          Description: entry.description,
          Project: entry.projects?.name || "No Project",
          Billable: entry.billable ? "Yes" : "No",
          "Timesheet Status": timesheet.status,
          "Submitted Date": format(
            new Date(timesheet.created_at),
            "yyyy-MM-dd HH:mm"
          ),
          "Total Hours": timesheet.total_hours || 0,
          "Week Ending": format(new Date(timesheet.week_ending), "yyyy-MM-dd"),
        });
      });
    });

    return formattedData;
  };

  const exportToCSV = (data, filename) => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "No data available for export",
        variant: "destructive",
      });
      return;
    }

    const headers = Object.keys(data[0]).join(",");
    const csvContent = [
      headers,
      ...data.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToXLSX = (data, filename) => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "No data available for export",
        variant: "destructive",
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheets");

    const columnWidths = Object.keys(data[0]).map(() => ({ wch: 20 }));
    worksheet["!cols"] = columnWidths;

    XLSX.writeFile(workbook, filename);
  };

  const exportToPDF = async (data, filename) => {
    try {
      const jsPDF = (await import("jspdf")).default;

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      doc.setFontSize(16);
      doc.text("Timesheet Export Report", 20, 20);

      doc.setFontSize(12);
      doc.text(
        `Export Date: ${format(new Date(), "yyyy-MM-dd HH:mm")}`,
        20,
        30
      );
      doc.text(`Period: ${filters.startDate} to ${filters.endDate}`, 20, 40);

      if (data.length === 0) {
        doc.text("No data available for the selected criteria.", 20, 60);
      } else {
        const totalHours = data.reduce(
          (sum, row) => sum + (parseFloat(row.Hours) || 0),
          0
        );
        const billableHours = data
          .filter((row) => row.Billable === "Yes")
          .reduce((sum, row) => sum + (parseFloat(row.Hours) || 0), 0);

        doc.text(`Total Hours: ${totalHours.toFixed(2)}`, 20, 50);
        doc.text(`Billable Hours: ${billableHours.toFixed(2)}`, 20, 60);
        doc.text(
          `Non-billable Hours: ${(totalHours - billableHours).toFixed(2)}`,
          20,
          70
        );

        let yPosition = 90;
        const pageHeight = doc.internal.pageSize.height;

        doc.setFontSize(10);
        doc.text("Employee", 20, yPosition);
        doc.text("Date", 70, yPosition);
        doc.text("Hours", 110, yPosition);
        doc.text("Project", 140, yPosition);
        doc.text("Billable", 200, yPosition);
        doc.text("Status", 240, yPosition);

        yPosition += 10;

        const limitedData = data.slice(0, 50);
        limitedData.forEach((row) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }

          doc.text(
            String(row["Employee Name"]).substring(0, 20),
            20,
            yPosition
          );
          doc.text(String(row["Date"]), 70, yPosition);
          doc.text(String(row["Hours"]), 110, yPosition);
          doc.text(String(row["Project"]).substring(0, 20), 140, yPosition);
          doc.text(String(row["Billable"]), 200, yPosition);
          doc.text(String(row["Timesheet Status"]), 240, yPosition);

          yPosition += 8;
        });

        if (data.length > 50) {
          doc.text(
            `... and ${data.length - 50} more records`,
            20,
            yPosition + 10
          );
        }
      }

      doc.save(filename);
    } catch (error) {
      console.error("Error creating PDF:", error);
      toast({
        title: "Export Error",
        description: "Failed to create PDF. Please try a different format.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    setLoading(true);

    try {
      const rawData = fetchTimesheetData();
      const formattedData = formatDataForExport(rawData);

      const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
      const filename = `timesheet_export_${timestamp}`;

      switch (filters.format) {
        case "csv":
          exportToCSV(formattedData, `${filename}.csv`);
          break;
        case "xlsx":
          exportToXLSX(formattedData, `${filename}.xlsx`);
          break;
        case "pdf":
          await exportToPDF(formattedData, `${filename}.pdf`);
          break;
      }

      toast({
        title: "Export Successful",
        description: `Data exported successfully as ${filters.format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Functionality
        </CardTitle>
        <CardDescription>
          Export timesheet data in various formats (CSV, Excel, PDF)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="employee">Employee (Optional)</Label>
              <Select
                value={filters.employeeId}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, employeeId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status (Optional)</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="format">Export Format</Label>
              <Select
                value={filters.format}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      CSV (.csv)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF (.pdf)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {loading
                ? "Exporting..."
                : `Export as ${filters.format.toUpperCase()}`}
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  startDate: format(
                    new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1
                    ),
                    "yyyy-MM-dd"
                  ),
                  endDate: format(new Date(), "yyyy-MM-dd"),
                  employeeId: "all",
                  projectId: "all",
                  status: "all",
                  format: "xlsx",
                })
              }
            >
              Reset Filters
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Export Information</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <strong>Excel (.xlsx):</strong> Best for data analysis and
                spreadsheet applications
              </li>
              <li>
                • <strong>CSV (.csv):</strong> Universal format compatible with
                most applications
              </li>
              <li>
                • <strong>PDF (.pdf):</strong> Formatted report suitable for
                printing and sharing
              </li>
              <li>
                • Export includes employee details, time entries, project
                information, and billing status
              </li>
              <li>• Large datasets may take longer to process</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportFunctionality;
