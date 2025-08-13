import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, UserCog, Shield, Briefcase, DollarSign } from "lucide-react";
import axiosInstance from "../services/axiosInstance"; // using your axios setup

const EmployeeRoleManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const roles = [
    {
      value: "Admin",
      label: "Admin",
      icon: Shield,
      color: "bg-red-100 text-red-800",
    },
    {
      value: "Manager",
      label: "Manager",
      icon: UserCog,
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "Finance",
      label: "Finance",
      icon: DollarSign,
      color: "bg-green-100 text-green-800",
    },
    {
      value: "Employee",
      label: "Employee",
      icon: Briefcase,
      color: "bg-gray-100 text-gray-800",
    },
  ];

  // Fetch employees from backend
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/v1/auth/users");
      let data = res.data;

      // Check if data is an object with a users property, otherwise use data directly
      if (data && typeof data === "object" && Array.isArray(data.users)) {
        data = data.users;
      } else if (!Array.isArray(data)) {
        console.error("Unexpected data format:", data);
        data = []; // Fallback to empty array if data is not usable
      }

      // Map backend data to match the dummy data structure
      const mapped = data
        .filter((user) => !user.isDeleted)
        .map((user) => {
          const userRole = user.UserRoles?.find((role) => !role.isDeleted);
          return {
            id: user.id.toString(),
            name: user.fullName,
            email: user.email,
            department: user.department || "N/A",
            role: userRole?.role || "Employee",
            user_id: `user${user.id}`,
          };
        });

      setEmployees(mapped);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Update role in backend
  const updateEmployeeRole = async (employeeId, userId, newRole) => {
    try {
      console.log({ userId, newRole }); // Debug payload
      await axiosInstance.post("/api/v1/auth/assign-role", {
        userId: parseInt(userId.replace("user", "")),
        role: newRole,
      });

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId ? { ...emp, role: newRole } : emp
        )
      );

      toast({
        title: "Success",
        description: `Role updated to ${newRole}`,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      console.log("Server response:", error.response?.data); // Debug server response
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update employee role",
        variant: "destructive",
      });
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleInfo = (role) => {
    return roles.find((r) => r.value === role) || roles[3];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Employee Role Management
        </CardTitle>
        <CardDescription>
          Manage user roles and permissions across the organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={fetchEmployees}>
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredEmployees.map((employee) => {
              const roleInfo = getRoleInfo(employee.role || "Employee");
              const RoleIcon = roleInfo.icon;

              return (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {employee.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {employee.department}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={roleInfo.color}>
                      <RoleIcon className="h-3 w-3 mr-1" />
                      {roleInfo.label}
                    </Badge>

                    {employee.user_id && (
                      <Select
                        value={employee.role || "Employee"}
                        onValueChange={(value) =>
                          updateEmployeeRole(
                            employee.id,
                            employee.user_id,
                            value
                          )
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div className="flex items-center gap-2">
                                <role.icon className="h-4 w-4" />
                                {role.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No employees found matching your search.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeRoleManagement;
