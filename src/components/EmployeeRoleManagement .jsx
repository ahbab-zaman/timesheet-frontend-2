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
import axiosInstance from "../services/axiosInstance";

const EmployeeRoleManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({});
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

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/v1/auth/users");

      let data = res.data;

      if (data && typeof data === "object" && Array.isArray(data.users)) {
        data = data.users;
      } else {
        console.error("Unexpected data format:", data);
        data = [];
      }

      const mapped = data
        .filter((user) => !user.isDeleted)
        .map((user) => {
          const userRole = user.roles?.find((role) => !role.isDeleted);
          return {
            id: user.id.toString(),
            name: user.fullName,
            email: user.email,
            department: user.employee?.department || "N/A",
            role: userRole?.role || "Employee",
            user_id: `user${user.id}`,
            position: user.employee?.position || "N/A",
            hourlyRate: user.employee?.hourly_rate || null,
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

  const updateEmployeeRole = async (employeeId, userId, newRole) => {
    try {
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
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update employee role",
        variant: "destructive",
      });
    }
  };

  const startEditing = (employee) => {
    setEditingEmployee(employee.id);
    setFormData({
      fullName: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      hourlyRate: employee.hourlyRate,
    });
  };

  const cancelEditing = () => {
    setEditingEmployee(null);
    setFormData({});
  };

  const saveEmployee = async (employeeId, userId) => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/auth/users/${parseInt(userId.replace("user", ""))}`,
        formData
      );
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId ? { ...emp, ...formData } : emp
        )
      );
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      setEditingEmployee(null);
      setFormData({});
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update employee",
        variant: "destructive",
      });
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      (roleFilter === "all" || (emp.role || "Employee") === roleFilter) &&
      (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setTableLoading(true);
                setRoleFilter(value);
                setTimeout(() => setTableLoading(false), 500);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchEmployees}>
              Refresh
            </Button>
          </div>

          {tableLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading employees...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredEmployees.map((employee) => {
                const roleInfo = getRoleInfo(employee.role || "Employee");
                const RoleIcon = roleInfo.icon;

                return (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    {editingEmployee === employee.id ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fullName: e.target.value,
                            })
                          }
                          placeholder="Full Name"
                        />
                        <Input
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="Email"
                        />
                        <Input
                          value={formData.department}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              department: e.target.value,
                            })
                          }
                          placeholder="Department"
                        />
                        <Input
                          value={formData.position}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              position: e.target.value,
                            })
                          }
                          placeholder="Position"
                        />
                        <Input
                          type="number"
                          value={formData.hourlyRate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hourlyRate: e.target.value,
                            })
                          }
                          placeholder="Hourly Rate"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              saveEmployee(employee.id, employee.user_id)
                            }
                          >
                            Save
                          </Button>
                          <Button variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
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
                            <p className="text-xs text-muted-foreground">
                              {employee.position}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Hourly Rate: {employee.hourlyRate || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

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

                      {!editingEmployee && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(employee)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!tableLoading && filteredEmployees.length === 0 && (
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
