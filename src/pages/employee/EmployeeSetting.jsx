import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const EmployeeSettings = () => {
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentEmployee();
  }, []);

  const fetchCurrentEmployee = async () => {
    try {
      const response = await axiosInstance.get("/api/v1/employee/me");
      const employee = response.data.employee;
      if (employee) {
        setCurrentEmployee(employee);
      } else {
        toast.error("No employee profile found");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to fetch employee details"
      );
      console.error("Error fetching current employee:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordForm.oldPassword)
      newErrors.oldPassword = "Old password is required";
    if (!passwordForm.newPassword)
      newErrors.newPassword = "New password is required";
    else if (passwordForm.newPassword.length < 8)
      newErrors.newPassword = "New password must be at least 8 characters";
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenChangePassword = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please log in to change your password");
      return;
    }
    setOpenChangePassword(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.patch("/api/v1/auth/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setOpenChangePassword(false);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to change password";
      if (
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("Invalid or expired token")
      ) {
        toast.error("Session expired. Redirecting to login...");
        localStorage.removeItem("authToken");
        setOpenChangePassword(false);
        setTimeout(() => {
          try {
            navigate("/"); // Attempt navigation
            console.log("Navigation to / executed (error case)");
          } catch (navError) {
            console.error("Navigation error:", navError);
            window.location.href = "/";
          }
        }, 1000);
      } else {
        toast.error(errorMessage);
      }
      console.error("Error changing password:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentEmployee) {
    return (
      <div className="text-center text-red-500 py-8">
        No employee profile found. Please contact support.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Collapsible Sidebar */}
      <div
        className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-48"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          {!isSidebarCollapsed && (
            <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
          )}
          <Button
            variant="ghost"
            className="p-2 hover:bg-gray-100"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <ArrowRight className="h-6 w-6 text-gray-600" />
            ) : (
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            )}
          </Button>
        </div>
        {!isSidebarCollapsed && (
          <div className="flex flex-col p-4 space-y-2">
            <Button
              variant="ghost"
              className="justify-start text-gray-700 hover:bg-gray-100"
              onClick={handleOpenChangePassword}
            >
              Change Password
            </Button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <Card className="mx-auto shadow-sm bg-white">
          <CardHeader className="rounded-t-lg border-b border-gray-200">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Employee Settings
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <dl className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">Employee ID:</dt>
                <dd className="text-gray-900">{currentEmployee.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">Name:</dt>
                <dd className="text-gray-900">{currentEmployee.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">Email:</dt>
                <dd className="text-gray-900">{currentEmployee.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">Contact Number:</dt>
                <dd className="text-gray-900">
                  {currentEmployee.contact_number || "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">Hourly Rate:</dt>
                <dd className="text-gray-900">
                  {currentEmployee.hourly_rate || "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">Position:</dt>
                <dd className="text-gray-900">
                  {currentEmployee.position || "-"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog
        open={openChangePassword}
        onOpenChange={(open) => {
          setOpenChangePassword(open);
          if (!open) {
            setPasswordForm({
              oldPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
            setErrors({});
          }
        }}
      >
        <DialogContent className="w-full max-w-md bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Change Password
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="oldPassword"
                className="text-sm font-medium text-gray-600"
              >
                Old Password
              </Label>
              <Input
                id="oldPassword"
                name="oldPassword"
                type="password"
                value={passwordForm.oldPassword}
                onChange={handlePasswordInputChange}
                className={`mt-1 w-full text-sm py-2 px-3 rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 ${
                  errors.oldPassword ? "border-red-500" : ""
                }`}
                placeholder="Enter old password"
              />
              {errors.oldPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.oldPassword}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="newPassword"
                className="text-sm font-medium text-gray-600"
              >
                New Password
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordInputChange}
                className={`mt-1 w-full text-sm py-2 px-3 rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 ${
                  errors.newPassword ? "border-red-500" : ""
                }`}
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-600"
              >
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordInputChange}
                className={`mt-1 w-full text-sm py-2 px-3 rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? "border-red-500" : ""
                }`}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenChangePassword(false);
                }}
                className="w-full sm:w-auto text-sm py-2 px-4 border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto text-sm py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeSettings;
