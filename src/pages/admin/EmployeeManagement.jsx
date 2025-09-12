import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Search,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCurrentUser } from "@/redux/features/auth/authSlice";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "sonner";

const EmployeeManagement = () => {
  const user = useSelector(useCurrentUser);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [tableLoading, setTableLoading] = useState(false);
  // New states for delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const [employeeData, setEmployeeData] = useState({
    employee_id: "",
    name: "",
    email: "",
    department: "",
    position: "",
    hourly_rate: "",
    manager: "No Manager",
    status: "active",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/api/v1/employee", {
        params: { search },
      });
      setEmployees(res.data.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setEmployees([]);
    } finally {
      setTableLoading(false); // End loading
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employeeId: employeeData.employee_id,
        name: employeeData.name,
        email: employeeData.email,
        department: employeeData.department,
        position: employeeData.position,
        hourlyRate: employeeData.hourly_rate,
      };
      const res = await axiosInstance.post("/api/v1/employee/add", payload);
      setEmployees((prev) => [...prev, res.data.employee]);
      resetForm();
      toast("New Employee Added Successfully 👨‍💼");
      setOpen(false);
    } catch (error) {
      console.error("Failed to add employee:", error);
    }
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee_id: employeeData.employee_id,
        name: employeeData.name,
        email: employeeData.email,
        department: employeeData.department,
        position: employeeData.position,
        hourly_rate: employeeData.hourly_rate,
      };
      const res = await axiosInstance.patch(
        `/api/v1/employee/${editingEmployeeId}`,
        payload
      );

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployeeId ? res.data.employee : emp
        )
      );
      toast.success("Employee Updated Successfully");
      resetForm();
      setEditOpen(false);
    } catch (error) {
      console.error("Failed to update employee:", error);
    }
  };

  // Open confirmation dialog for delete
  const confirmDelete = (id) => {
    setEmployeeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // Confirm and perform delete
  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    try {
      await axiosInstance.delete(`/api/v1/employee/${employeeToDelete}`);
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeToDelete));
      toast("Employee Deleted Successfully");
    } catch (error) {
      console.error("Failed to delete employee:", error);
    } finally {
      setDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const resetForm = () => {
    setEmployeeData({
      employee_id: "",
      name: "",
      email: "",
      department: "",
      position: "",
      hourly_rate: "",
      manager: "No Manager",
      status: "active",
    });
    setEditingEmployeeId(null);
  };

  const handleEditClick = (emp) => {
    setEditingEmployeeId(emp.id);
    setEmployeeData({
      employee_id: emp.employee_id || "", // Use employee_id, remove empId fallback
      name: emp.name || "",
      email: emp.email || "",
      department: emp.department || "",
      position: emp.position || "",
      hourly_rate: emp.hourly_rate || "", // Use hourly_rate, remove hourlyRate fallback
      manager: emp.manager || "No Manager",
      status: emp.status || "active",
    });
    setEditOpen(true);
  };

  const handleStatusToggle = (id) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id
          ? { ...emp, status: emp.status === "active" ? "inactive" : "active" }
          : emp
      )
    );
  };

  const handleManagerChange = (id, newManager) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, manager: newManager } : emp))
    );
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  const defaultManagers = ["No Manager", "Admin User", "Manager User"];

  useEffect(() => {
    fetchEmployees();
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [search]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading timesheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <NavLink to={`/${user?.role?.toLowerCase()}/dashboard`}>
            <Button variant="ghost">
              <ArrowLeft />
              <span className="text-gray-600 font-medium">
                Back to Dashboard
              </span>
            </Button>
          </NavLink>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-gray-800">
              Employee Management
            </h3>
            <div className="flex items-center gap-2">
              <Button size="sm">Employee Management</Button>
              <Button size="sm" variant="outline">
                <Calendar />
                My Leaves
              </Button>
            </div>
          </div>
        </div>

        {/* Add Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription className="text-gray-500">
                Enter the employee details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="flex flex-col gap-2">
                <div>
                  <Label
                    htmlFor="employeeId"
                    className="text-gray-700 font-medium capitalize"
                  >
                    Employee ID
                  </Label>
                  <Input
                    name="employee_id"
                    type="text"
                    placeholder="Enter Employee ID"
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="name"
                    className="text-gray-700 font-medium capitalize"
                  >
                    Name
                  </Label>
                  <Input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-gray-700 font-medium capitalize"
                  >
                    Email
                  </Label>
                  <Input
                    name="email"
                    type="text"
                    placeholder="john@gmail.com"
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="department"
                    className="text-gray-700 font-medium capitalize"
                  >
                    Department
                  </Label>
                  <Input
                    name="department"
                    type="text"
                    placeholder="Engineering"
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="position"
                    className="text-gray-700 font-medium capitalize"
                  >
                    Position
                  </Label>
                  <Input
                    name="position"
                    type="text"
                    placeholder="Software Engineer"
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="rate"
                    className="text-gray-700 font-medium capitalize"
                  >
                    Hourly Rate
                  </Label>
                  <Input
                    name="hourly_rate"
                    type="number"
                    placeholder="0"
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full text-white">
                Add Employee
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative mt-6 flex items-center gap-3 max-w-[350px]">
        <Input
          placeholder="Search Employee"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Employees Table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
        {tableLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading timesheets...</p>
            </div>
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3 text-gray-600">Employee ID</th>
                <th className="border p-3 text-gray-600">Name</th>
                <th className="border p-3 text-gray-600">Email</th>
                <th className="border p-3 text-gray-600">Department</th>
                <th className="border p-3 text-gray-600">Position</th>
                <th className="border p-3 text-gray-600">Rate</th>
                <th className="border p-3 text-gray-600">Manager</th>
                <th className="border p-3 text-gray-600">Status</th>
                <th className="border p-3 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center p-6">
                    No Employees Found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="border p-3">
                      {emp.employee_id || emp.empId}
                    </td>
                    <td className="border p-3">{emp.name}</td>
                    <td className="border p-3">{emp.email}</td>
                    <td className="border p-3">{emp.department}</td>
                    <td className="border p-3">{emp.position}</td>
                    <td className="border p-3">
                      {emp.hourly_rate || emp.hourlyRate}
                    </td>
                    <td className="border p-3">
                      <select
                        value={emp.manager || "No Manager"}
                        onChange={(e) =>
                          handleManagerChange(emp.id, e.target.value)
                        }
                        className="bg-white border border-gray-300 rounded px-2 py-1"
                      >
                        {defaultManagers.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border p-3 capitalize">
                      <Button
                        size="sm"
                        variant={
                          emp.status === "active" ? "outline" : "secondary"
                        }
                        onClick={() => handleStatusToggle(emp.id)}
                      >
                        {emp.status}
                      </Button>
                    </td>
                    <td className="border p-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(emp)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => confirmDelete(emp.id)} // <-- open confirm dialog
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Employee Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription className="text-gray-500">
              Update employee details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEmployee} className="space-y-4">
            <div className="flex flex-col gap-2">
              <div>
                <Label
                  htmlFor="employee_id"
                  className="text-gray-700 font-medium capitalize"
                >
                  Employee ID
                </Label>
                <Input
                  name="employee_id"
                  type="text"
                  placeholder="Enter Employee ID"
                  value={employeeData.employee_id}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="name"
                  className="text-gray-700 font-medium capitalize"
                >
                  Name
                </Label>
                <Input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={employeeData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-gray-700 font-medium capitalize"
                >
                  Email
                </Label>
                <Input
                  name="email"
                  type="text"
                  placeholder="john@gmail.com"
                  value={employeeData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="department"
                  className="text-gray-700 font-medium capitalize"
                >
                  Department
                </Label>
                <Input
                  name="department"
                  type="text"
                  placeholder="Engineering"
                  value={employeeData.department}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="position"
                  className="text-gray-700 font-medium capitalize"
                >
                  Position
                </Label>
                <Input
                  name="position"
                  type="text"
                  placeholder="Software Engineer"
                  value={employeeData.position}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="hourlyRate"
                  className="text-gray-700 font-medium capitalize"
                >
                  Hourly Rate
                </Label>
                <Input
                  name="hourly_rate"
                  type="number"
                  placeholder="0"
                  value={employeeData.hourly_rate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full text-white">
              Update Employee
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteEmployee}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;
