import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { DownloadIcon } from "lucide-react";

const FinanceDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="text-sm text-muted-foreground cursor-pointer">
        ← Back to Home
      </div>
      <h1 className="text-2xl font-bold">AIREPRO Finance Dashboard</h1>
      <p className="text-muted-foreground">
        Manage employee payments and payroll
      </p>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Monthly Summary" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly Summary</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="august-2025">August 2025</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
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

      {/* Timesheet Summary */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold">Monthly Timesheet Summary</h2>
          <p className="text-sm text-muted-foreground">
            Employee timesheet summary for August 2025
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">
                    <Checkbox />
                  </th>
                  <th className="text-left py-2">Employee</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Hours</th>
                  <th className="text-left py-2">Rate</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-10 text-muted-foreground"
                  >
                    <div className="text-3xl">$</div>
                    <div className="font-semibold">No timesheet data found</div>
                    <div>No approved timesheets found for August 2025</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceDashboard;
