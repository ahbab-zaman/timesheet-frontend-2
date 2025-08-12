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

const EmployeeRoleManagement = () => {
  const [employees, setEmployees] = useState([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      department: "Administration",
      role: "admin",
      user_id: "user1",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      department: "Management",
      role: "manager",
      user_id: "user2",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      department: "Finance",
      role: "finance",
      user_id: "user3",
    },
    {
      id: "4",
      name: "Sarah Williams",
      email: "sarah.williams@example.com",
      department: "Development",
      role: "employee",
      user_id: "user4",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const roles = [
    {
      value: "admin",
      label: "Admin",
      icon: Shield,
      color: "bg-red-100 text-red-800",
    },
    {
      value: "manager",
      label: "Manager",
      icon: UserCog,
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "finance",
      label: "Finance",
      icon: DollarSign,
      color: "bg-green-100 text-green-800",
    },
    {
      value: "employee",
      label: "Employee",
      icon: Briefcase,
      color: "bg-gray-100 text-gray-800",
    },
  ];

  useEffect(() => {
    setLoading(false);
  }, []);

  const updateEmployeeRole = (employeeId, userId, newRole) => {
    try {
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
        description: "Failed to update employee role",
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
            <Button variant="outline">Refresh</Button>
          </div>

          <div className="grid gap-4">
            {filteredEmployees.map((employee) => {
              const roleInfo = getRoleInfo(employee.role || "employee");
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
                        value={employee.role || "employee"}
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
