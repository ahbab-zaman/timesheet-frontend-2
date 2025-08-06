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
} from "@/components/ui/dialog";
import { Nav } from "react-day-picker";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCurrentUser } from "@/redux/features/auth/authSlice";

const EmployeeManagement = () => {
  const user = useSelector(useCurrentUser);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [employeeData, setEmployeeData] = useState({
    empId: "",
    name: "",
    email: "",
    department: "",
    position: "",
    hourlyRate: "",
    manager: "No Manager",
    status: "active",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    setEmployees((prev) => [...prev, { ...employeeData, id: Date.now() }]);
    resetForm();
    setOpen(false);
  };

  const handleEditEmployee = (e) => {
    e.preventDefault();
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === editingEmployeeId ? { ...emp, ...employeeData } : emp
      )
    );
    resetForm();
    setEditOpen(false);
  };

  const resetForm = () => {
    setEmployeeData({
      empId: "",
      name: "",
      email: "",
      department: "",
      position: "",
      hourlyRate: "",
      manager: "No Manager",
      status: "active",
    });
    setEditingEmployeeId(null);
  };

  const handleEditClick = (emp) => {
    setEditingEmployeeId(emp.id);
    setEmployeeData({ ...emp });
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

  const handleDelete = (id) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  const defaultManagers = ["No Manager", "Admin User", "Manager User"];

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, []);

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
            <span className="text-gray-600 font-medium">Back to Dashboard</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "empId",
                  "name",
                  "email",
                  "department",
                  "position",
                  "hourlyRate",
                ].map((field, idx) => (
                  <div key={idx}>
                    <Label
                      htmlFor={field}
                      className="text-gray-700 font-medium capitalize"
                    >
                      {field.replace(/([A-Z])/g, " $1")}
                    </Label>
                    <Input
                      id={field}
                      name={field}
                      type={field === "hourlyRate" ? "number" : "text"}
                      placeholder={field === "hourlyRate" ? "0" : ""}
                      value={employeeData[field]}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                ))}
              </div>
              <Button type="submit" className="w-full text-white">
                Add Employee
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription className="text-gray-500">
              Update the employee details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEmployee} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "empId",
                "name",
                "email",
                "department",
                "position",
                "hourlyRate",
              ].map((field, idx) => (
                <div key={idx}>
                  <Label
                    htmlFor={field}
                    className="text-gray-700 font-medium capitalize"
                  >
                    {field.replace(/([A-Z])/g, " $1")}
                  </Label>
                  <Input
                    id={field}
                    name={field}
                    type={field === "hourlyRate" ? "number" : "text"}
                    placeholder={field === "hourlyRate" ? "0" : ""}
                    value={employeeData[field]}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              ))}
            </div>
            <Button type="submit" className="w-full text-white">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Table Section */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow border">
        <h2 className="text-2xl font-semibold text-gray-800">Employee List</h2>
        <p className="text-gray-500 mb-4">
          Manage your organization&apos;s employees
        </p>

        <div className="relative mb-4 max-w-md">
          <Search className="absolute top-3 left-3 h-5 w-5 text-gray-500" />
          <Input
            placeholder="Search employees..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="py-2 px-4">Employee ID</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Department</th>
                <th className="py-2 px-4">Position</th>
                <th className="py-2 px-4">Manager</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{emp.empId}</td>
                  <td className="py-2 px-4">{emp.name}</td>
                  <td className="py-2 px-4">{emp.email}</td>
                  <td className="py-2 px-4">{emp.department}</td>
                  <td className="py-2 px-4">{emp.position}</td>
                  <td className="py-2 px-4">
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={emp.manager}
                      onChange={(e) =>
                        handleManagerChange(emp.id, e.target.value)
                      }
                    >
                      {defaultManagers.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-4">
                    <button
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        emp.status === "active"
                          ? "bg-black text-white"
                          : "bg-white text-black border-[1px]"
                      }`}
                      onClick={() => handleStatusToggle(emp.id)}
                    >
                      {emp.status}
                    </button>
                  </td>
                  <td className="py-2 px-4 flex gap-3">
                    <Pencil
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                      onClick={() => handleEditClick(emp)}
                    />
                    <Trash2
                      className="w-4 h-4 text-red-600 cursor-pointer"
                      onClick={() => handleDelete(emp.id)}
                    />
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;
